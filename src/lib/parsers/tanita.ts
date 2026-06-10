/**
 * TANITAブランド用パーサー
 * brand_data に TANITA固有のフィールドを格納する
 */
export function parseTanita(raw: Record<string, unknown>): Record<string, unknown> {
  const brandData: Record<string, unknown> = {};

  // TANITA固有: 内臓脂肪レベル
  if (raw["visceral_fat_level"] != null) {
    brandData["visceral_fat_level"] = raw["visceral_fat_level"];
  }
  // brand_dataにすでに値がある場合はマージ
  if (raw["brand_data"] && typeof raw["brand_data"] === "object") {
    Object.assign(brandData, raw["brand_data"]);
  }

  return brandData;
}
