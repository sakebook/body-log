import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NewBodyRecord } from "./storage";
import { detectBrand, parseByBrand } from "./parsers";

const OCR_PROMPT = `
あなたは体組成計のレシート・ディスプレイ写真を解析するエキスパートです。
写真に印刷/表示されている数値をすべて正確に読み取り、JSONで返してください。
値が読み取れない・存在しない場合は null にしてください。

【重要な注意】
- 日時: レシートに印字されている日付と時刻を正確に読み取ってください。
  AM/PM表記や24時間表記に注意し、午後の時刻（例: 8:46 PM → 20:46）を正しく変換してください。
  日付が「2026/06/09」、時刻が「20:46」なら "2026-06-09T20:46:00" です。
- 数値: 小数点以下も正確に読み取ってください。

返すJSONのフォーマット:
{
  "measured_at": "YYYY-MM-DDTHH:mm:ss" (レシート上の計測日時。時刻を正確に),
  "brand": "体組成計のブランド名（例: TANITA, OMRON, INBODY など）",
  "model": "型番（読み取れる場合のみ）",
  "weight_kg": 体重(kg),
  "body_fat_pct": 体脂肪率(%),
  "muscle_mass_kg": 筋肉量(kg),
  "bmi": BMI,
  "basal_metabolic_rate_kcal": 基礎代謝(kcal),
  "body_water_pct": 体水分率(%),
  "brand_data": {
    "内臓脂肪レベル": 数値,
    "推定骨量 (kg)": 数値,
    "体内年齢 (歳)": 数値,
    "体型判定": "テキスト",
    "皮下脂肪率 (%)": 数値,
    "体幹部 脂肪率 (%)": 数値,
    "腕部 脂肪率 (%)": 数値,
    "脚部 脂肪率 (%)": 数値,
    "体幹部 筋肉量 (kg)": 数値,
    "腕部 筋肉量 (kg)": 数値,
    "脚部 筋肉量 (kg)": 数値,
    "筋質点数": 数値,
    "性別": "テキスト",
    "年齢 (歳)": 数値,
    "身長 (cm)": 数値,
    "脂肪量 (kg)": 数値,
    "除脂肪体重 (kg)": 数値,
    "体水分量 (kg)": 数値,
    "筋肉率 (%)": 数値,
    "標準体重 (kg)": 数値,
    "肥満度 (%)": 数値,
    "体脂肪率 標準範囲下限 (%)": 数値,
    "体脂肪率 標準範囲上限 (%)": 数値,
    "体脂肪量 標準範囲下限 (kg)": 数値,
    "体脂肪量 標準範囲上限 (kg)": 数値,
    "体脂肪 判定": "テキスト",
    "BMI 判定": "テキスト",
    "内臓脂肪 判定": "テキスト",
    "筋肉量 判定": "テキスト",
    "基礎代謝 判定": "テキスト",
    "着衣重量 (kg)": 数値,
    "体型モード": "テキスト",
    ... その他の項目もすべて日本語キーで追加
  }
}

【キー名のルール】
- brand_data 内のキー名は必ず日本語で記述してください。
- 単位がある場合はキー名の末尾に半角括弧で「(kg)」「(%)」「(kcal)」「(cm)」「(歳)」のように付けてください。
- 上記に列挙していない項目がレシートにあれば、日本語で適切なキー名を付けて追加してください。
JSONのみを返してください。説明文は不要です。
`.trim();

export interface OcrResult {
  record: Partial<Omit<NewBodyRecord, "image_url" | "raw_ocr_text">>;
  rawText: string;
}

export async function extractBodyData(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<OcrResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY が設定されていません");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

  const result = await model.generateContent([
    OCR_PROMPT,
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
  ]);

  const rawText = result.response.text();

  // JSON部分を抽出（```json ... ``` で囲まれている場合も対応）
  const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) ??
    rawText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error(`OCRの結果からJSONを抽出できませんでした。\n応答: ${rawText}`);
  }

  const jsonStr = jsonMatch[1] ?? jsonMatch[0];
  const parsed = JSON.parse(jsonStr);

  // ブランド検出・パース補正
  const brand = detectBrand(parsed.brand ?? "");
  const refined = parseByBrand(brand, parsed);

  return {
    record: {
      ...refined,
      brand,
    },
    rawText,
  };
}
