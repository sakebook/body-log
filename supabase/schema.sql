-- BodyLog: Supabase スキーマ
-- Supabaseダッシュボードの SQL Editor で実行してください

-- 体組成レコードテーブル
CREATE TABLE IF NOT EXISTS body_records (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  measured_at               TIMESTAMPTZ NOT NULL,
  brand                     TEXT NOT NULL DEFAULT 'unknown',
  model                     TEXT,
  weight_kg                 NUMERIC(5,2),
  body_fat_pct              NUMERIC(4,1),
  muscle_mass_kg            NUMERIC(5,2),
  bmi                       NUMERIC(4,1),
  basal_metabolic_rate_kcal INTEGER,
  body_water_pct            NUMERIC(4,1),
  brand_data                JSONB NOT NULL DEFAULT '{}',
  image_url                 TEXT,
  raw_ocr_text              TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス: 計測日で絞り込み・並び替えを高速化
CREATE INDEX IF NOT EXISTS body_records_measured_at_idx
  ON body_records (measured_at DESC);

-- Row Level Security を有効化
ALTER TABLE body_records ENABLE ROW LEVEL SECURITY;

-- ポリシー: service_role は全操作可能（サーバー側APIがこのロールを使用）
CREATE POLICY "service_role_all" ON body_records
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Supabase Storage バケット: 体組成計の写真を保存
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'body-images',
  'body-images',
  true,                                         -- 公開バケット（URLで直接参照）
  10485760,                                     -- 10MB 制限
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- ストレージポリシー: service_role はすべての操作が可能
CREATE POLICY "service_role_storage_all" ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'body-images')
  WITH CHECK (bucket_id = 'body-images');
