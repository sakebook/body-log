# BodyLog

体組成計のレシート・ディスプレイを📸撮影するだけで、AI が数値を自動読み取り＆記録する**パーソナル体組成トラッカー**です。

## ✨ 特徴

- **📸 写真を撮るだけ** — Gemini AI がレシートの数値を自動 OCR
- **📊 グラフで可視化** — 体重・体脂肪率・筋肉量の推移をひと目で確認
- **🔬 詳細データ対応** — 内臓脂肪レベル、体内年齢、部位別データなどブランド固有の項目も記録
- **📱 モバイルフレンドリー** — スマホから直接撮影→記録が可能
- **🌙 ダークモード対応** — システム設定に自動追従
- **🔒 パスワード認証** — シンプルなパスワードで個人データを保護

## 🏗️ アーキテクチャ

```
ユーザー（ブラウザ）
    │
    ▼
┌─────────────────────────────┐
│  Vercel（Next.js アプリ）    │
│  - ページ表示（SSR）         │
│  - API Routes               │
│  - NextAuth 認証             │
└────┬──────────┬─────────────┘
     │          │
     ▼          ▼
┌─────────┐ ┌──────────────────┐
│ Gemini  │ │ Supabase         │
│ AI API  │ │ - PostgreSQL DB  │
│ (OCR)   │ │ - Storage (画像) │
└─────────┘ └──────────────────┘
```

| サービス | 役割 |
|---------|------|
| **[Vercel](https://vercel.com)** | Next.js アプリのホスティング。GitHub push で自動デプロイ |
| **[Supabase](https://supabase.com)** | PostgreSQL データベースと画像ストレージ |
| **[Gemini AI](https://aistudio.google.com)** | 体組成計レシートの OCR 解析 |

## 📁 ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx                 # ダッシュボード（サマリー + グラフ）
│   ├── DashboardClient.tsx      # ダッシュボード Client Component
│   ├── upload/
│   │   ├── page.tsx             # アップロードページ
│   │   └── UploadClient.tsx     # 写真選択 → OCR → 確認・保存
│   ├── history/
│   │   ├── page.tsx             # 履歴ページ
│   │   └── HistoryClient.tsx    # 履歴一覧・削除
│   ├── login/
│   │   ├── page.tsx             # ログインページ
│   │   └── LoginForm.tsx        # パスワード入力フォーム
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth エンドポイント
│   │   ├── ocr/                 # Gemini AI による OCR API
│   │   └── records/             # CRUD API（一覧・作成・削除）
│   ├── layout.tsx               # ルートレイアウト
│   └── globals.css              # デザイントークン + グローバルCSS
├── components/
│   ├── NavBar.tsx               # ナビゲーションバー
│   ├── Providers.tsx            # SessionProvider ラッパー
│   └── SetupGuide.tsx           # 初期セットアップ案内
├── lib/
│   ├── auth.ts                  # NextAuth 設定
│   ├── ocr.ts                   # Gemini OCR プロンプト + パース
│   ├── parsers/
│   │   ├── index.ts             # ブランド検出 + 共通パーサー
│   │   └── tanita.ts            # TANITA 固有フィールド処理
│   └── storage/
│       ├── types.ts             # StorageAdapter インターフェース
│       ├── supabase.ts          # Supabase 実装
│       └── index.ts             # アダプター ファクトリー
├── proxy.ts                     # Next.js 16 ミドルウェア（認証ガード）
supabase/
└── schema.sql                   # DB スキーマ（テーブル + RLS + Storage）
```

## 🚀 セットアップ

### 前提条件

- Node.js 18+
- npm
- [Supabase](https://supabase.com) アカウント
- [Google AI Studio](https://aistudio.google.com) アカウント（Gemini API キー）

### 1. Supabase プロジェクト作成

1. [supabase.com](https://supabase.com) で新しいプロジェクトを作成
2. **SQL Editor** で [`supabase/schema.sql`](supabase/schema.sql) の内容を貼り付けて実行
3. **Settings > API Keys** >「Publishable and secret API keys」タブから以下を控える:
   - **Project URL** （`https://xxxx.supabase.co`）
   - **Secret** キー（`sb_secret_...` で始まるもの）

> ⚠️ Legacy タブの `service_role` ではなく、新しい「Secret」キーを使用してください。

### 2. Gemini API キー取得

1. [Google AI Studio](https://aistudio.google.com) で API キーを作成

### 3. ローカル開発

```bash
# クローン
git clone https://github.com/sakebook/body-log
cd body-log

# 依存パッケージインストール
npm install

# 環境変数設定
cp .env.example .env.local
```

`.env.local` を編集:

```env
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxx

# Gemini AI（OCR用）
GEMINI_API_KEY=AIza...

# 認証
APP_PASSWORD=your-strong-password
NEXTAUTH_SECRET=your-random-secret   # openssl rand -base64 32 で生成
```

```bash
# 開発サーバー起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、`APP_PASSWORD` に設定したパスワードでログインします。

### 4. Vercel デプロイ

1. [vercel.com/new](https://vercel.com/new) でこのリポジトリをインポート
2. **Environment Variables** に上記の環境変数を設定（`NEXTAUTH_URL` は不要、Vercel が自動検出）
3. 「Deploy」をクリック → 完了 🎉

以降は `git push` するだけで自動デプロイされます。

## ⚙️ 環境変数一覧

| 変数名 | 必須 | 説明 |
|--------|:----:|------|
| `SUPABASE_URL` | ✅ | Supabase プロジェクト URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase Secret キー（RLS バイパス、サーバー専用） |
| `GEMINI_API_KEY` | ✅ | Google AI Studio の API キー |
| `APP_PASSWORD` | ✅ | ログインパスワード |
| `NEXTAUTH_SECRET` | ✅ | JWT 署名用シークレット（`openssl rand -base64 32` で生成） |
| `NEXTAUTH_URL` | — | アプリの URL（Vercel では自動設定、ローカルでは不要） |

## 🔧 対応ブランド

| ブランド | 基本項目 | 固有項目 |
|---------|:-------:|---------|
| **TANITA** | ✅ | 内臓脂肪レベル、推定骨量、体内年齢、部位別データ、判定値 etc. |
| **OMRON** | ✅ | 共通フィールドで記録 |
| **INBODY** | ✅ | 共通フィールドで記録 |
| **その他** | ✅ | Gemini AI が読み取れる範囲で記録 |

> 共通フィールド: 体重、体脂肪率、筋肉量、BMI、基礎代謝、体水分率
>
> ブランド固有データは `brand_data`（JSONB）カラムに柔軟に保存されます。

## 💰 ランニングコスト

| サービス | 無料枠 |
|---------|--------|
| Vercel | Hobby プラン: 無料 |
| Supabase | Free プラン: 500MB DB / 1GB Storage（7日間未使用で一時停止） |
| Gemini AI | 無料枠あり（個人利用には十分） |

**個人利用であれば基本的に無料**で運用できます。

## 🔌 ストレージバックエンドの拡張

`StorageAdapter` インターフェースを実装することで、Supabase 以外のバックエンドも利用できます:

1. `src/lib/storage/` に新しいアダプタークラスを作成
2. `src/lib/storage/index.ts` の `getStorage()` に分岐を追加

## 📝 既知の制限事項

- **認証**: パスワードは平文比較（将来的に bcrypt ハッシュ化 or OAuth への移行を検討）
- **OCR 精度**: レシートの印刷品質や撮影角度により読み取り精度が変わる場合があります。確認画面で手動修正が可能です
- **タイムゾーン**: OCR で読み取った時刻は日本時間（JST）として処理されます

## ライセンス

MIT
