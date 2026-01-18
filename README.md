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

## サンプルデータの投入

開発環境でサンプルデータを投入する方法は2つあります。

### 方法1: TypeScript seedスクリプト（推奨）

この方法では、テストユーザー、イベント、申請データなどを自動的に作成します。

**前提条件:**
- Supabaseローカル環境が起動している（`npx supabase start`）
- または、リモートSupabaseプロジェクトのService Role Keyが必要

**手順:**

1. 環境変数を設定します（`.env.local`に追加）:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   **ローカル開発環境の場合:**
   - Service Role Keyは Supabase Studio (http://127.0.0.1:54323) の「Settings」→「API」→「service_role key」から取得できます
   - ローカル環境のデフォルト値: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU`
   - 注意: ローカル環境を再起動すると、Service Role Keyが変わる可能性があります

   **リモートプロジェクトの場合:**
   - Supabaseダッシュボードの「Settings」→「API」→「service_role key」から取得できます
   - 注意: Service Role Keyは機密情報です。Gitにコミットしないでください

2. seedスクリプトを実行:
   ```bash
   npm run seed
   ```

   **注意:** seedスクリプトは`.env.local`ファイルを自動的に読み込みます

**作成されるデータ:**
- テストユーザー4名:
  - test1@example.com / password123 (テストユーザー1)
  - test2@example.com / password123 (テストユーザー2)
  - test3@example.com / password123 (テストユーザー3)
  - test4@example.com / password123 (テストユーザー4)
- イベント5件（初心者向け、中級者向け、上級者向け、全レベル、過去のイベント）
- 申請データ（一部のイベントへの申請）

### 方法2: SQL seedファイル

Supabase CLIを使用している場合、`supabase db reset` を実行すると、マイグレーションと一緒に `supabase/seed.sql` が実行されます。

**注意:** この方法は `auth.users` にユーザーが既に存在することを前提としています。

**手順:**

1. まず、アプリケーションまたはSupabase Studioでユーザーを作成します
2. データベースをリセットしてseedデータを投入:
   ```bash
   npx supabase db reset
   ```

**注意:** `db reset` は既存のデータをすべて削除します。開発環境でのみ使用してください。

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
