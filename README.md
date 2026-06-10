# BodyLog

体組成計の写真を撮るだけで自動記録できる、パーソナル体組成トラッカーです。

## 機能

- 📸 **写真を撮るだけ** — Gemini Flash AI が体組成計の数値を自動読み取り
- 📊 **グラフで可視化** — 体重・体脂肪率・筋肉量の推移をひと目で確認
- 🔒 **シングルユーザー認証** — パスワード1つで安全にアクセス管理
- 📱 **モバイルフレンドリー** — スマホから直接撮影→記録が可能
- 🌙 **ダークモード対応** — システム設定に自動追従

## 対応ブランド

- TANITA（内臓脂肪レベルなど固有フィールドも記録）
- OMRON
- INBODY
- その他多くのブランド（共通フィールドで記録）

---

## セットアップ（Vercel + Supabase）

### 1. Supabase セットアップ

1. [supabase.com](https://supabase.com) でプロジェクト作成
2. **SQL Editor** で `supabase/schema.sql` の内容を実行
3. **Settings > API** で以下を控える:
   - `Project URL`
   - `service_role` キー

### 2. Gemini API キー取得

1. [Google AI Studio](https://aistudio.google.com) でAPIキーを作成

### 3. ローカル開発

```bash
# クローン
git clone https://github.com/<あなたのID>/body-log
cd body-log

# 環境変数設定
cp .env.example .env.local
# .env.local を編集して各値を設定

# 依存パッケージインストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、`.env.local` の `APP_PASSWORD` でログインします。

### 4. Vercel デプロイ

1. [vercel.com](https://vercel.com) でこのリポジトリをインポート
2. **Environment Variables** に `.env.example` の各変数を設定
   - `NEXTAUTH_URL` を本番URLに変更（例: `https://bodylog.vercel.app`）
3. デプロイ完了 🎉

---

## 環境変数一覧

| 変数名 | 説明 |
|--------|------|
| `APP_PASSWORD` | ログインパスワード |
| `NEXTAUTH_SECRET` | JWT署名用シークレット（`openssl rand -base64 32`で生成） |
| `NEXTAUTH_URL` | アプリのURL（本番は実際のURL） |
| `GEMINI_API_KEY` | Google AI Studio で取得したAPIキー |
| `SUPABASE_URL` | SupabaseプロジェクトURL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Roleキー（サーバー専用） |

---

## デプロイオプション別コスト

| 構成 | 月額 | 備考 |
|------|------|------|
| **Vercel + Supabase（推奨）** | **$0** | Supabase無料プランは7日間未使用で一時停止 |
| Fly.io + Supabase | $0 | より柔軟なコンテナ環境 |
| VPS（Hetzner等） | ~€4 | 完全自己管理、Docker Compose対応 |

---

## ストレージバックエンドの変更

現在は Supabase のみサポートしています。別のバックエンドに変更したい場合:

1. `src/lib/storage/` に新しいアダプタークラスを追加（`StorageAdapter` インターフェースを実装）
2. `src/lib/storage/index.ts` の `getStorage()` 関数に `switch` ケースを追加
3. `STORAGE_BACKEND` 環境変数に新しいバックエンド名を設定

## ライセンス

MIT
