"use client";

import { useState, useId } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailId = useId();
  const passwordId = useId();

  // URLのクエリパラメータにエラーがある場合はそちらを表示、なければフォームのエラーを表示
  const errorParam = searchParams.get("error");
  const displayError =
    formError ||
    (errorParam === "AccessDenied"
      ? "このGoogleアカウントでのログインは許可されていません"
      : errorParam
      ? "ログイン中にエラーが発生しました。もう一度お試しください。"
      : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setFormError("メールアドレスまたはパスワードが正しくありません");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setFormError("");
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="field">
        <label htmlFor={emailId}>メールアドレス</label>
        <input
          id={emailId}
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          autoComplete="email"
          autoFocus
          aria-describedby={displayError ? "login-error" : undefined}
        />
      </div>

      <div className="field">
        <label htmlFor={passwordId}>パスワード</label>
        <input
          id={passwordId}
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          aria-describedby={displayError ? "login-error" : undefined}
        />
      </div>

      {displayError && (
        <p
          id="login-error"
          role="alert"
          style={{
            color: "var(--color-danger-500)",
            fontSize: "0.875rem",
            padding: "0.75rem",
            background: "color-mix(in oklab, var(--color-danger-500) 10%, transparent)",
            borderRadius: "var(--radius-md)",
          }}
        >
          {displayError}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || googleLoading || !email || !password}
        style={{ inlineSize: "100%" }}
      >
        {loading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            ログイン中...
          </>
        ) : (
          "ログイン"
        )}
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBlock: "0.25rem",
          color: "var(--color-text-muted)",
          fontSize: "0.8125rem",
        }}
      >
        <hr style={{ flexGrow: 1, border: "none", borderTop: "1px solid var(--color-border, #ccc)" }} />
        <span style={{ paddingInline: "0.75rem" }}>または</span>
        <hr style={{ flexGrow: 1, border: "none", borderTop: "1px solid var(--color-border, #ccc)" }} />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="btn"
        disabled={loading || googleLoading}
        style={{
          inlineSize: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          backgroundColor: "#fff",
          color: "#1f2937",
          border: "1px solid var(--color-border, #d1d5db)",
          fontWeight: 500,
          cursor: "pointer",
          paddingBlock: "0.625rem",
        }}
      >
        {googleLoading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Googleと連携中...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google でサインイン
          </>
        )}
      </button>
    </form>
  );
}

