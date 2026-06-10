import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NewBodyRecord } from "./storage";
import { detectBrand, parseByBrand } from "./parsers";

const OCR_PROMPT = `
あなたは体組成計のディスプレイ写真を解析するアシスタントです。
写真から以下の情報を読み取り、JSONで返してください。
値が読み取れない場合は null にしてください。

返すJSONのフォーマット:
{
  "measured_at": "YYYY-MM-DDTHH:mm:ss" (計測日時、不明な場合は今日の日付),
  "brand": "体組成計のブランド名（例: TANITA, OMRON, INBODY など）",
  "model": "型番（読み取れる場合のみ）",
  "weight_kg": 体重(kg) の数値,
  "body_fat_pct": 体脂肪率(%) の数値,
  "muscle_mass_kg": 筋肉量(kg) の数値,
  "bmi": BMI の数値,
  "basal_metabolic_rate_kcal": 基礎代謝(kcal) の整数,
  "body_water_pct": 体水分率(%) の数値（あれば）,
  "brand_data": { ブランド固有の追加データ（内臓脂肪レベルなど）}
}

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
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
