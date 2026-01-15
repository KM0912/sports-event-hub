This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 環境変数の設定

このプロジェクトでは開発環境と本番環境で異なるSupabaseプロジェクトを使用します。

### Supabase環境分離の選択肢

開発環境と本番環境を分ける方法は以下の3つがあります：

#### 1. 2つのプロジェクトを作成する方法（推奨・最もシンプル）

**メリット:**
- 設定が簡単
- データが完全に分離される
- 本番データに影響を与えない
- 無料プランでも利用可能

**手順:**
1. Supabaseダッシュボードで開発用プロジェクトを作成
2. 本番用プロジェクトを作成
3. それぞれの環境変数を設定

#### 2. Supabase CLIでローカル開発環境を使う方法

**メリット:**
- 完全に無料でローカル開発可能
- インターネット接続が不要
- 高速な開発サイクル

**デメリット:**
- 初期設定が必要
- Dockerが必要

**手順:**
```bash
# Supabase CLIをインストール
npm install supabase --save-dev

# ローカル開発環境を起動
npx supabase start
```

#### 3. Supabase Branch機能を使う方法（有料プラン）

**メリット:**
- GitブランチのようにDBスキーマを管理できる
- 本番プロジェクト内で開発ブランチを作成

**デメリット:**
- Proプラン以上が必要（有料）

### 開発環境

**方法1（2つのプロジェクト）を使用する場合:**

1. `.env.example` を `.env.local` にコピーします：
   ```bash
   cp .env.example .env.local
   ```

2. `.env.local` を開き、開発環境用のSupabaseプロジェクトのURLとAnon Keyを設定します：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_development_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_development_supabase_anon_key
   ```

### 本番環境

本番環境では、デプロイプラットフォーム（Vercelなど）で環境変数を設定してください。

#### Vercelの場合

1. Vercelダッシュボードでプロジェクトを開く
2. Settings → Environment Variables に移動
3. 以下の環境変数を追加：
   - `NEXT_PUBLIC_SUPABASE_URL`: 本番環境用のSupabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 本番環境用のSupabase Anon Key

#### ローカルで本番ビルドをテストする場合

`.env.production` ファイルを作成し、本番環境用の値を設定してください。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
