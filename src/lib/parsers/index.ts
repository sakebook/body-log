import { parseTanita } from "./tanita";
import type { NewBodyRecord } from "../storage";

type ParsedOcr = Record<string, unknown>;

const BRAND_ALIASES: Record<string, string> = {
  tanita: "TANITA",
  タニタ: "TANITA",
  omron: "OMRON",
  オムロン: "OMRON",
  inbody: "INBODY",
  インボディ: "INBODY",
  withings: "WITHINGS",
  fitbit: "FITBIT",
};

/**
 * OCRで得たブランド文字列を正規化する
 */
export function detectBrand(raw: string): string {
  const lower = raw.toLowerCase().trim();
  for (const [alias, canonical] of Object.entries(BRAND_ALIASES)) {
    if (lower.includes(alias.toLowerCase())) return canonical;
  }
  return raw.trim() || "unknown";
}

/**
 * ブランドごとのパーサーを適用してレコードを補正する
 */
export function parseByBrand(
  brand: string,
  raw: ParsedOcr
): Partial<Omit<NewBodyRecord, "brand" | "image_url" | "raw_ocr_text">> {
  const base = {
    measured_at: toIso(raw["measured_at"] as string | undefined),
    model: toStr(raw["model"]),
    weight_kg: toNum(raw["weight_kg"]),
    body_fat_pct: toNum(raw["body_fat_pct"]),
    muscle_mass_kg: toNum(raw["muscle_mass_kg"]),
    bmi: toNum(raw["bmi"]),
    basal_metabolic_rate_kcal: toInt(raw["basal_metabolic_rate_kcal"]),
    body_water_pct: toNum(raw["body_water_pct"]),
    brand_data: {} as Record<string, unknown>,
  };

  switch (brand) {
    case "TANITA":
      base.brand_data = parseTanita(raw);
      break;
    default:
      if (raw["brand_data"] && typeof raw["brand_data"] === "object") {
        base.brand_data = raw["brand_data"] as Record<string, unknown>;
      }
  }

  return base;
}

// ---- ユーティリティ ----

function toNum(v: unknown): number | null {
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
}

function toInt(v: unknown): number | null {
  const n = parseInt(String(v), 10);
  return isNaN(n) ? null : n;
}

function toStr(v: unknown): string | null {
  return v == null || v === "" ? null : String(v);
}

function toIso(v: string | undefined): string {
  if (!v) return new Date().toISOString();
  // "YYYY/MM/DD HH:mm" → "YYYY-MM-DDTHH:mm" に正規化
  const normalized = v.replace(/\//g, "-").replace(" ", "T");

  // タイムゾーン情報がない場合、日本時間（+09:00）として扱う
  // OCRが読み取るレシートの時刻は日本のローカル時刻のため
  const hasTimezone = /[Zz]|[+-]\d{2}:\d{2}$/.test(normalized);
  const withTz = hasTimezone ? normalized : `${normalized}+09:00`;

  const d = new Date(withTz);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
