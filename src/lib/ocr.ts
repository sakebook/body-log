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
    "visceral_fat_level": 内臓脂肪レベル（数値）,
    "bone_mass_kg": 推定骨量(kg),
    "metabolic_age": 体内年齢（歳）,
    "physique_rating": 体型判定（数値 1-9）,
    "subcutaneous_fat_pct": 皮下脂肪率(%),
    "trunk_fat_pct": 体幹部脂肪率(%),
    "arm_fat_pct": 腕部脂肪率(%),
    "leg_fat_pct": 脚部脂肪率(%),
    "trunk_muscle_kg": 体幹部筋肉量(kg),
    "arm_muscle_kg": 腕部筋肉量(kg),
    "leg_muscle_kg": 脚部筋肉量(kg),
    "muscle_quality_score": 筋質点数,
    "left_right_balance": 左右バランス,
    ... その他レシートに記載されている項目すべて
  }
}

brand_data にはレシートに記載されているすべての追加情報を含めてください。
上記に列挙していない項目があっても、適切なキー名（snake_case英語）で追加してください。
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
