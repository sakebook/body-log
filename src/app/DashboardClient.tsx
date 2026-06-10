"use client";

import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import type { BodyRecord } from "@/lib/storage";

interface Props {
  records: BodyRecord[];
}

const METRICS = [
  { key: "weight_kg",             label: "体重",     unit: "kg",   color: "var(--color-chart-weight)",  yAxisId: "weight" },
  { key: "body_fat_pct",          label: "体脂肪率", unit: "%",    color: "var(--color-chart-fat)",     yAxisId: "pct" },
  { key: "muscle_mass_kg",        label: "筋肉量",   unit: "kg",   color: "var(--color-chart-muscle)",  yAxisId: "weight" },
] as const;

export function DashboardClient({ records }: Props) {
  const sorted = [...records].sort(
    (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  );

  const chartData = sorted.map((r) => ({
    date: format(parseISO(r.measured_at), "M/d", { locale: ja }),
    weight_kg: r.weight_kg,
    body_fat_pct: r.body_fat_pct,
    muscle_mass_kg: r.muscle_mass_kg,
    bmi: r.bmi,
  }));

  const latest = records[0] ?? null;
  const prev = records[1] ?? null;

  function diff(key: keyof BodyRecord): string {
    if (!latest || !prev) return "—";
    const a = latest[key] as number | null;
    const b = prev[key] as number | null;
    if (a == null || b == null) return "—";
    const d = a - b;
    return (d >= 0 ? "+" : "") + d.toFixed(1);
  }

  function diffClass(key: keyof BodyRecord, lowerIsBetter = true): string {
    if (!latest || !prev) return "neutral";
    const a = latest[key] as number | null;
    const b = prev[key] as number | null;
    if (a == null || b == null) return "neutral";
    const d = a - b;
    if (d === 0) return "neutral";
    return (d < 0) === lowerIsBetter ? "negative" : "positive";
  }

  const stats = [
    { label: "体重",     key: "weight_kg" as const,            unit: "kg", lowerIsBetter: true  },
    { label: "体脂肪率", key: "body_fat_pct" as const,          unit: "%",  lowerIsBetter: true  },
    { label: "筋肉量",   key: "muscle_mass_kg" as const,        unit: "kg", lowerIsBetter: false },
    { label: "BMI",      key: "bmi" as const,                   unit: "",   lowerIsBetter: true  },
    { label: "基礎代謝", key: "basal_metabolic_rate_kcal" as const, unit: "kcal", lowerIsBetter: false },
  ];

  if (records.length === 0) {
    return (
      <div className="container" style={{ paddingBlockStart: "4rem", paddingBlockEnd: "4rem" }}>
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">📊</div>
          <h1>まだデータがありません</h1>
          <p style={{ marginBlockEnd: "2rem" }}>
            体組成計の写真を撮影して記録を始めましょう
          </p>
          <Link href="/upload" className="btn btn-primary btn-lg">
            最初の記録を追加する
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container animate-fade-in"
      style={{ paddingBlock: "2rem" }}
    >
      {/* ヘッダー */}
      <header className="page-header">
        <h1 className="page-title">ダッシュボード</h1>
        <Link href="/upload" className="btn btn-primary">
          + 記録する
        </Link>
      </header>

      {/* 最新データ概要 */}
      {latest && (
        <section aria-labelledby="latest-heading" style={{ marginBlockEnd: "2rem" }}>
          <h2 id="latest-heading" style={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBlockEnd: "0.75rem" }}>
            最新計測 —{" "}
            {format(parseISO(latest.measured_at), "yyyy年M月d日", { locale: ja })}
          </h2>
          <div className="stats-grid">
            {stats.map(({ label, key, unit, lowerIsBetter }) => {
              const val = latest[key] as number | null;
              return (
                <div key={key} className="stat-card">
                  <p className="stat-label">{label}</p>
                  <p className="stat-value">
                    {val != null ? val.toLocaleString() : "—"}
                    {val != null && <span className="stat-unit">{unit}</span>}
                  </p>
                  <p className={`stat-diff ${diffClass(key, lowerIsBetter)}`}>
                    {diff(key)} {unit && `${unit}`} (前回比)
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* グラフ */}
      <section aria-labelledby="chart-heading">
        <div className="card">
          <h2 id="chart-heading" style={{ fontSize: "1.0625rem", fontWeight: 600, marginBlockEnd: "1.5rem" }}>
            推移グラフ（直近{records.length}件）
          </h2>

          {/* アクセシビリティ: グラフのテキスト代替 */}
          <p className="visually-hidden">
            体重・体脂肪率・筋肉量の時系列グラフ。
            最新値: 体重 {latest?.weight_kg ?? "—"}kg、体脂肪率 {latest?.body_fat_pct ?? "—"}%、筋肉量 {latest?.muscle_mass_kg ?? "—"}kg。
          </p>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="weight"
                orientation="left"
                tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                unit="kg"
              />
              <YAxis
                yAxisId="pct"
                orientation="right"
                tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                  color: "var(--color-text)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}
              />
              {METRICS.map((m) => (
                <Line
                  key={m.key}
                  yAxisId={m.yAxisId}
                  type="monotone"
                  dataKey={m.key}
                  name={m.label}
                  stroke={m.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: m.color }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 最近の記録リスト */}
      <section aria-labelledby="recent-heading" style={{ marginBlockStart: "2rem" }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBlockEnd: "1rem" }}>
            <h2 id="recent-heading" style={{ fontSize: "1.0625rem", fontWeight: 600 }}>
              最近の記録
            </h2>
            <Link href="/history" style={{ fontSize: "0.875rem" }}>
              すべて見る →
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table" aria-label="体組成記録一覧">
              <thead>
                <tr>
                  <th scope="col">計測日</th>
                  <th scope="col">体重</th>
                  <th scope="col">体脂肪率</th>
                  <th scope="col">筋肉量</th>
                  <th scope="col">BMI</th>
                  <th scope="col">ブランド</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 10).map((r) => (
                  <tr key={r.id}>
                    <td>
                      <time dateTime={r.measured_at}>
                        {format(parseISO(r.measured_at), "M月d日(E)", { locale: ja })}
                      </time>
                    </td>
                    <td>{r.weight_kg != null ? `${r.weight_kg} kg` : "—"}</td>
                    <td>{r.body_fat_pct != null ? `${r.body_fat_pct}%` : "—"}</td>
                    <td>{r.muscle_mass_kg != null ? `${r.muscle_mass_kg} kg` : "—"}</td>
                    <td>{r.bmi ?? "—"}</td>
                    <td>
                      {r.brand !== "unknown" && (
                        <span className="badge badge-brand">{r.brand}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
