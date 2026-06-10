interface Props {
  errorDetail?: string;
}

export function SetupGuide({ errorDetail }: Props) {
  const steps = [
    {
      num: 1,
      title: "Supabase プロジェクトを作成",
      body: (
        <>
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
            supabase.com
          </a>{" "}
          でアカウントを作成し、新しいプロジェクトを作成します。
        </>
      ),
    },
    {
      num: 2,
      title: "データベーススキーマを実行",
      body: (
        <>
          Supabase ダッシュボードの <strong>SQL Editor</strong> を開き、
          リポジトリの <code>supabase/schema.sql</code> の内容を貼り付けて実行します。
        </>
      ),
    },
    {
      num: 3,
      title: ".env.local に Supabase の情報を設定",
      body: (
        <>
          Supabase の <strong>Settings &gt; API</strong> から以下を取得して{" "}
          <code>.env.local</code> に設定します：
          <pre
            style={{
              marginBlockStart: "0.75rem",
              padding: "0.875rem 1rem",
              background: "var(--color-surface-2)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8125rem",
              fontFamily: "var(--font-mono)",
              overflowX: "auto",
            }}
          >
            {`SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...（service_role キー）`}
          </pre>
        </>
      ),
    },
    {
      num: 4,
      title: "Gemini API キーを設定",
      body: (
        <>
          <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer">
            Google AI Studio
          </a>{" "}
          で API キーを作成し、<code>.env.local</code> に設定します：
          <pre
            style={{
              marginBlockStart: "0.75rem",
              padding: "0.875rem 1rem",
              background: "var(--color-surface-2)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8125rem",
              fontFamily: "var(--font-mono)",
              overflowX: "auto",
            }}
          >
            {`GEMINI_API_KEY=AIza...`}
          </pre>
        </>
      ),
    },
    {
      num: 5,
      title: "dev server を再起動",
      body: (
        <>
          <code>.env.local</code> を保存したら、ターミナルで dev server を再起動します：
          <pre
            style={{
              marginBlockStart: "0.75rem",
              padding: "0.875rem 1rem",
              background: "var(--color-surface-2)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8125rem",
              fontFamily: "var(--font-mono)",
            }}
          >
            {`npm run dev`}
          </pre>
        </>
      ),
    },
  ];

  return (
    <div style={{ maxInlineSize: "42rem", marginInline: "auto" }}>
      {/* ヘッダー */}
      <div
        className="card"
        style={{
          marginBlockEnd: "1.5rem",
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 12%, var(--color-surface)), var(--color-surface))",
          borderColor: "color-mix(in oklab, var(--color-accent) 30%, var(--color-border))",
        }}
      >
        <p style={{ fontSize: "2rem", marginBlockEnd: "0.5rem" }} aria-hidden="true">
          🛠️
        </p>
        <h1
          style={{
            fontSize: "1.375rem",
            fontWeight: 700,
            marginBlockEnd: "0.5rem",
          }}
        >
          セットアップが必要です
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
          Supabase の接続情報が未設定です。以下の手順で設定を完了してください。
        </p>

        {errorDetail && (
          <details
            style={{
              marginBlockStart: "1rem",
              padding: "0.75rem 1rem",
              background: "color-mix(in oklab, var(--color-danger-500) 8%, transparent)",
              borderRadius: "var(--radius-md)",
              border: "1px solid color-mix(in oklab, var(--color-danger-500) 30%, transparent)",
              fontSize: "0.8125rem",
            }}
          >
            <summary style={{ cursor: "pointer", color: "var(--color-danger-500)", fontWeight: 600 }}>
              エラー詳細を表示
            </summary>
            <pre
              style={{
                marginBlockStart: "0.5rem",
                fontFamily: "var(--font-mono)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                color: "var(--color-text-muted)",
              }}
            >
              {errorDetail}
            </pre>
          </details>
        )}
      </div>

      {/* ステップ */}
      <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {steps.map(({ num, title, body }) => (
          <li key={num} className="card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <span
              aria-hidden="true"
              style={{
                flexShrink: 0,
                inlineSize: "2rem",
                blockSize: "2rem",
                borderRadius: "50%",
                background: "var(--color-accent)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            >
              {num}
            </span>
            <div style={{ flex: 1, minInlineSize: 0 }}>
              <p style={{ fontWeight: 600, marginBlockEnd: "0.375rem" }}>{title}</p>
              <div style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                {body}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p
        style={{
          marginBlockStart: "1.5rem",
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
          textAlign: "center",
        }}
      >
        設定が完了したら、このページを再読み込みしてください。
      </p>
    </div>
  );
}
