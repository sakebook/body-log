import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BodyRecord, NewBodyRecord, StorageAdapter } from "./types";

const TABLE_NAME = "body_records";
const BUCKET_NAME = "body-images";

export class SupabaseAdapter implements StorageAdapter {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        "SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY（または SUPABASE_ANON_KEY）を環境変数に設定してください"
      );
    }

    this.client = createClient(url, key);
  }

  async saveRecord(record: NewBodyRecord): Promise<BodyRecord> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .insert(record)
      .select()
      .single();

    if (error) throw new Error(`レコードの保存に失敗しました: ${error.message}`);
    return data as BodyRecord;
  }

  async getRecords(
    options?: { limit?: number; offset?: number }
  ): Promise<BodyRecord[]> {
    const limit = options?.limit ?? 365;
    const offset = options?.offset ?? 0;

    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select("*")
      .order("measured_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`レコードの取得に失敗しました: ${error.message}`);
    return (data ?? []) as BodyRecord[];
  }

  async getRecord(id: string): Promise<BodyRecord | null> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(`レコードの取得に失敗しました: ${error.message}`);
    }

    return data as BodyRecord;
  }

  async deleteRecord(id: string): Promise<void> {
    const { error } = await this.client
      .from(TABLE_NAME)
      .delete()
      .eq("id", id);

    if (error) throw new Error(`レコードの削除に失敗しました: ${error.message}`);
  }

  async saveImage(file: Blob, filename: string): Promise<string> {
    const ext = filename.split(".").pop() ?? "jpg";
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await this.client.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) throw new Error(`画像のアップロードに失敗しました: ${error.message}`);

    const { data } = this.client.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}
