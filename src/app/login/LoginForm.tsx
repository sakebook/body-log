"use client";

import { useState, useId } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
    } else {
      router.push("/");
      router.refresh();
    }
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
          aria-describedby={error ? "login-error" : undefined}
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
          aria-describedby={error ? "login-error" : undefined}
        />
      </div>

      {error && (
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
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !email || !password}
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
    </form>
  );
}
