import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { SetupGuide } from "@/components/SetupGuide";

export const metadata: Metadata = {
  title: "ログイン",
};

export default function LoginPage() {
  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const isSupabaseConfigured =
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project") &&
    supabaseKey.length > 20;

  if (!isSupabaseConfigured) {
    return (
      <div
        style={{
          minBlockSize: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "var(--color-bg)",
        }}
      >
        <div style={{ inlineSize: "100%", maxInlineSize: "26rem" }}>
          {/* ロゴ */}
          <div style={{ textAlign: "center", marginBlockEnd: "2.5rem" }}>
            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "var(--color-accent)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                marginBlockEnd: "0.5rem",
              }}
            >
              BodyLog
            </p>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
              体組成トラッカー
            </p>
          </div>
          <SetupGuide />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minBlockSize: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ inlineSize: "100%", maxInlineSize: "26rem" }}>
        {/* ロゴ */}
        <div style={{ textAlign: "center", marginBlockEnd: "2.5rem" }}>
          <p
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "var(--color-accent)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginBlockEnd: "0.5rem",
            }}
          >
            BodyLog
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
            体組成トラッカー
          </p>
        </div>

        <div className="card">
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBlockEnd: "1.5rem",
              textAlign: "center",
            }}
          >
            ログイン
          </h1>
          <LoginForm />
          <p
            style={{
              textAlign: "center",
              marginBlockStart: "1.25rem",
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.5,
            }}
          >
            ※ パスワードを忘れた場合は、Supabase ダッシュボードの <br />
            <strong>Authentication &gt; Users</strong> から再設定（Change password）を行ってください。
          </p>
        </div>
      </div>
    </div>
  );
}
