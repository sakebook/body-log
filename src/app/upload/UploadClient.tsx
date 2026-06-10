"use client";

import { useState, useCallback, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { NewBodyRecord } from "@/lib/storage";

type Step = "upload" | "confirm" | "done";

interface OcrResult {
  record: Partial<Omit<NewBodyRecord, "image_url" | "raw_ocr_text">>;
  rawText: string;
}

export function UploadClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [formData, setFormData] = useState<Partial<NewBodyRecord>>({});
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleFileSelect(selected: File) {
    if (!selected.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("ファイルサイズは10MB以下にしてください");
      return;
    }
    setError(null);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOcr() {
    if (!file) return;
    setOcrLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "OCRに失敗しました");
      }
      const data: OcrResult = await res.json();
      setOcrResult(data);
      setFormData(data.record);
      setStep("confirm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "OCR処理中にエラーが発生しました");
    } finally {
      setOcrLoading(false);
    }
  }

  async function handleSave() {
    if (!file) return;
    setSaveLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("data", JSON.stringify({
        ...formData,
        raw_ocr_text: ocrResult?.rawText ?? null,
      }));

      const res = await fetch("/api/records", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "保存に失敗しました");
      }

      setStep("done");
      showToast("記録を保存しました 🎉", "success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存中にエラーが発生しました");
      showToast("保存に失敗しました", "error");
    } finally {
      setSaveLoading(false);
    }
  }

  function handleFieldChange(key: keyof NewBodyRecord, value: string) {
    const num = parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [key]: value === "" ? null : isNaN(num) ? value : num,
    }));
  }

  function handleBrandDataChange(key: string, value: string) {
    setFormData((prev) => {
      const bd = { ...(prev.brand_data as Record<string, unknown> ?? {}) };
      const num = parseFloat(value);
      bd[key] = value === "" ? null : isNaN(num) ? value : num;
      return { ...prev, brand_data: bd };
    });
  }

  const numFields = [
    { key: "weight_kg" as const,               label: "体重",       unit: "kg"   },
    { key: "body_fat_pct" as const,             label: "体脂肪率",   unit: "%"    },
    { key: "muscle_mass_kg" as const,           label: "筋肉量",     unit: "kg"   },
    { key: "bmi" as const,                      label: "BMI",        unit: ""     },
    { key: "basal_metabolic_rate_kcal" as const, label: "基礎代謝",  unit: "kcal" },
    { key: "body_water_pct" as const,           label: "体水分率",   unit: "%"    },
  ];

  const BRAND_DATA_LABELS: Record<string, string> = {
    visceral_fat_level: "内臓脂肪レベル",
    bone_mass_kg: "推定骨量 (kg)",
    metabolic_age: "体内年齢 (歳)",
    physique_rating: "体型判定",
    subcutaneous_fat_pct: "皮下脂肪率 (%)",
    trunk_fat_pct: "体幹部脂肪率 (%)",
    arm_fat_pct: "腕部脂肪率 (%)",
    leg_fat_pct: "脚部脂肪率 (%)",
    trunk_muscle_kg: "体幹部筋肉量 (kg)",
    arm_muscle_kg: "腕部筋肉量 (kg)",
    leg_muscle_kg: "脚部筋肉量 (kg)",
    muscle_quality_score: "筋質点数",
    left_right_balance: "左右バランス",
  };

  function labelForBrandKey(key: string): string {
    return BRAND_DATA_LABELS[key] ?? key.replace(/_/g, " ");
  }

  const brandData = (formData.brand_data ?? {}) as Record<string, unknown>;
  const brandDataEntries = Object.entries(brandData).filter(
    ([, v]) => v != null && v !== ""
  );

  return (
    <>
      {/* ステップ: アップロード */}
      {step === "upload" && (
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "1fr",
            maxInlineSize: "42rem",
            marginInline: "auto",
          }}
        >
          {/* ドロップゾーン */}
          <div
            className={`upload-zone${dragging ? " dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="画像をアップロード"
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleInputChange}
              className="visually-hidden"
              aria-label="体組成計の写真を選択"
            />

            {preview ? (
              <figure style={{ margin: 0 }}>
                <Image
                  src={preview}
                  alt="選択した体組成計の写真"
                  width={320}
                  height={240}
                  style={{
                    maxBlockSize: "240px",
                    objectFit: "contain",
                    marginInline: "auto",
                    borderRadius: "var(--radius-md)",
                  }}
                />
                <figcaption style={{ marginBlockStart: "0.75rem", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                  {file?.name}
                </figcaption>
              </figure>
            ) : (
              <div>
                <p style={{ fontSize: "3rem", marginBlockEnd: "0.75rem" }} aria-hidden="true">📸</p>
                <p style={{ fontWeight: 600, marginBlockEnd: "0.375rem" }}>
                  写真をドラッグ＆ドロップ
                </p>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                  または クリックして選択（スマホでは直接撮影も可）
                </p>
              </div>
            )}
          </div>

          {error && (
            <p role="alert" style={{ color: "var(--color-danger-500)", fontSize: "0.875rem" }}>
              {error}
            </p>
          )}

          {file && (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleOcr}
              disabled={ocrLoading}
              style={{ inlineSize: "100%" }}
            >
              {ocrLoading ? (
                <><span className="spinner" aria-hidden="true" /> AIで解析中...</>
              ) : (
                "🤖 AIで自動解析する"
              )}
            </button>
          )}
        </div>
      )}

      {/* ステップ: 確認・編集 */}
      {step === "confirm" && ocrResult && (
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: preview ? "1fr 1fr" : "1fr",
            maxInlineSize: "56rem",
            marginInline: "auto",
          }}
        >
          {preview && (
            <aside>
              <figure style={{ margin: 0 }}>
                <Image
                  src={preview}
                  alt="アップロードした体組成計の写真"
                  width={400}
                  height={300}
                  style={{
                    inlineSize: "100%",
                    objectFit: "contain",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-border)",
                  }}
                />
              </figure>
            </aside>
          )}

          <section aria-labelledby="confirm-heading">
            <div className="card">
              <h2 id="confirm-heading" style={{ fontSize: "1.0625rem", fontWeight: 600, marginBlockEnd: "1.25rem" }}>
                解析結果を確認・修正
              </h2>

              <form
                onSubmit={(e) => { e.preventDefault(); handleSave(); }}
                style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                noValidate
              >
                <div className="field">
                  <label htmlFor="measured_at">計測日時</label>
                  <input
                    id="measured_at"
                    type="datetime-local"
                    className="input"
                    value={formData.measured_at
                      ? new Date(formData.measured_at).toISOString().slice(0, 16)
                      : ""}
                    onChange={(e) => handleFieldChange("measured_at", e.target.value
                      ? new Date(e.target.value).toISOString() : "")}
                  />
                </div>

                <div className="field">
                  <label htmlFor="brand">ブランド</label>
                  <input
                    id="brand"
                    type="text"
                    className="input"
                    value={formData.brand ?? ""}
                    onChange={(e) => handleFieldChange("brand", e.target.value)}
                    placeholder="例: TANITA"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {numFields.map(({ key, label, unit }) => (
                    <div key={key} className="field">
                      <label htmlFor={`field-${key}`}>
                        {label}{unit && ` (${unit})`}
                      </label>
                      <input
                        id={`field-${key}`}
                        type="number"
                        step="0.1"
                        className="input"
                        value={formData[key] != null ? String(formData[key]) : ""}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        inputMode="decimal"
                      />
                    </div>
                  ))}
                </div>

                {/* ブランド固有データ */}
                {brandDataEntries.length > 0 && (
                  <fieldset
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "1rem",
                      marginBlockStart: "0.25rem",
                    }}
                  >
                    <legend
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        padding: "0 0.5rem",
                      }}
                    >
                      詳細データ（{formData.brand ?? "ブランド"}固有）
                    </legend>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      {brandDataEntries.map(([key, val]) => (
                        <div key={key} className="field">
                          <label htmlFor={`bd-${key}`}>{labelForBrandKey(key)}</label>
                          <input
                            id={`bd-${key}`}
                            type={typeof val === "number" ? "number" : "text"}
                            step="0.1"
                            className="input"
                            value={val != null ? String(val) : ""}
                            onChange={(e) => handleBrandDataChange(key, e.target.value)}
                            inputMode={typeof val === "number" ? "decimal" : "text"}
                          />
                        </div>
                      ))}
                    </div>
                  </fieldset>
                )}

                {error && (
                  <p role="alert" style={{ color: "var(--color-danger-500)", fontSize: "0.875rem" }}>
                    {error}
                  </p>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginBlockStart: "0.5rem" }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setStep("upload")}
                    style={{ flex: 1 }}
                  >
                    ← 撮り直す
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saveLoading}
                    style={{ flex: 2 }}
                  >
                    {saveLoading ? (
                      <><span className="spinner" aria-hidden="true" /> 保存中...</>
                    ) : (
                      "保存する"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}

      {/* ステップ: 完了 */}
      {step === "done" && (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">✅</div>
          <h2>記録しました！</h2>
          <p style={{ marginBlockEnd: "2rem" }}>
            体組成データが正常に保存されました。
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setStep("upload");
                setFile(null);
                setPreview(null);
                setOcrResult(null);
                setFormData({});
              }}
            >
              続けて記録する
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => router.push("/")}
            >
              ダッシュボードへ
            </button>
          </div>
        </div>
      )}

      {/* トースト通知 */}
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
