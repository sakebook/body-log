"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import type { BodyRecord } from "@/lib/storage";

interface Props {
  records: BodyRecord[];
}

export function HistoryClient({ records: initialRecords }: Props) {
  const [records, setRecords] = useState(initialRecords);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleDelete(id: string) {
    if (!confirm("このレコードを削除しますか？")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/records/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast("削除しました", "success");
    } catch {
      showToast("削除に失敗しました", "error");
    } finally {
      setDeletingId(null);
    }
  }

  if (records.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon" aria-hidden="true">📋</div>
        <h2>記録がありません</h2>
        <p>まだデータが登録されていません。</p>
      </div>
    );
  }

  return (
    <>
      <div className="card" style={{ overflowX: "auto" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBlockEnd: "1rem" }}>
          {records.length} 件の記録
        </p>

        <table className="data-table" aria-label="体組成記録履歴">
          <thead>
            <tr>
              <th scope="col">計測日</th>
              <th scope="col">体重</th>
              <th scope="col">体脂肪率</th>
              <th scope="col">筋肉量</th>
              <th scope="col">BMI</th>
              <th scope="col">基礎代謝</th>
              <th scope="col">ブランド</th>
              <th scope="col">
                <span className="visually-hidden">操作</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>
                  <time dateTime={r.measured_at}>
                    {format(parseISO(r.measured_at), "yyyy/M/d (E)", { locale: ja })}
                  </time>
                </td>
                <td>{r.weight_kg != null ? `${r.weight_kg} kg` : "—"}</td>
                <td>{r.body_fat_pct != null ? `${r.body_fat_pct}%` : "—"}</td>
                <td>{r.muscle_mass_kg != null ? `${r.muscle_mass_kg} kg` : "—"}</td>
                <td>{r.bmi ?? "—"}</td>
                <td>{r.basal_metabolic_rate_kcal != null ? `${r.basal_metabolic_rate_kcal} kcal` : "—"}</td>
                <td>
                  {r.brand !== "unknown" && (
                    <span className="badge badge-brand">{r.brand}</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-icon btn-danger"
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id}
                    aria-label={`${format(parseISO(r.measured_at), "M月d日")}のレコードを削除`}
                    title="削除"
                    style={{ fontSize: "0.875rem" }}
                  >
                    {deletingId === r.id ? (
                      <span className="spinner" aria-hidden="true" />
                    ) : (
                      "🗑"
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* トースト */}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toast && (
          <div className={`toast ${toast.type}`} role="status">
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
