import type { StorageAdapter } from "./types";
import { SupabaseAdapter } from "./supabase";

export type { StorageAdapter, BodyRecord, NewBodyRecord } from "./types";

let _instance: StorageAdapter | null = null;

/**
 * StorageAdapter のシングルトンインスタンスを返す。
 * STORAGE_BACKEND 環境変数に応じたアダプターを返す（将来の拡張用）。
 * 現在は "supabase" のみサポート。
 */
export function getStorage(): StorageAdapter {
  if (!_instance) {
    const backend = process.env.STORAGE_BACKEND ?? "supabase";

    switch (backend) {
      case "supabase":
        _instance = new SupabaseAdapter();
        break;
      default:
        throw new Error(
          `未知のストレージバックエンド: "${backend}"。サポート済み: "supabase"`
        );
    }
  }

  return _instance;
}
