export interface BodyRecord {
  id: string;
  measured_at: string; // ISO 8601
  brand: string;
  model: string | null;
  weight_kg: number | null;
  body_fat_pct: number | null;
  muscle_mass_kg: number | null;
  bmi: number | null;
  basal_metabolic_rate_kcal: number | null;
  body_water_pct: number | null;
  brand_data: Record<string, unknown>;
  image_url: string | null;
  raw_ocr_text: string | null;
  created_at: string;
}

export type NewBodyRecord = Omit<BodyRecord, "id" | "created_at">;

export interface StorageAdapter {
  /** 新しい体組成データを保存する */
  saveRecord(record: NewBodyRecord): Promise<BodyRecord>;
  /** 体組成データ一覧を取得する（新しい順） */
  getRecords(options?: { limit?: number; offset?: number }): Promise<BodyRecord[]>;
  /** 特定のレコードを取得する */
  getRecord(id: string): Promise<BodyRecord | null>;
  /** レコードを削除する */
  deleteRecord(id: string): Promise<void>;
  /** 画像ファイルをアップロードしてURLを返す */
  saveImage(file: Blob, filename: string): Promise<string>;
}
