# 技術仕様書 (Architecture Design Document)

## テクノロジースタック

### 言語・ランタイム

| 技術 | バージョン |
|------|-----------|
| Node.js | v24.11.0 |
| TypeScript | 5.x |
| npm | 11.x |

### フレームワーク・ライブラリ

| 技術 | バージョン | 用途 | 選定理由 |
|------|-----------|------|----------|
| Next.js | 15.x (App Router) | フロントエンド + SSR | SSR/SSG/ISR対応でSEO要件を満たす。Server ActionsによりAPI層を別途構築する必要がない |
| React | 19.x | UIライブラリ | Next.jsの基盤。Server Componentsによるパフォーマンス最適化 |
| Tailwind CSS | 4.x | スタイリング | ユーティリティファーストでモバイルファースト設計が容易。ビルド時に未使用CSSを除去 |
| shadcn/ui | 最新 | UIコンポーネント | Radix UIベースでアクセシビリティ対応済み。コピー&ペースト方式でカスタマイズ性が高い |
| Supabase JS | 2.x | Supabaseクライアント | 認証・DB・Realtimeを統一的に操作できるSDK |
| Zod | 3.x | スキーマバリデーション | TypeScriptとの型推論が優秀。クライアント/サーバー両方で使用可能 |
| date-fns | 4.x | 日時操作 | 軽量でTree-shaking対応。JST表示に対応 |
| React Hook Form | 7.x | フォーム管理 | パフォーマンスが高く、Zodとの統合が容易 |

### バックエンド・インフラ

| 技術 | 用途 | 選定理由 |
|------|------|----------|
| Supabase | BaaS (認証・DB・Realtime・Edge Functions) | PostgreSQL + RLSにより堅牢なアクセス制御。Realtime機能でチャットを実現。Edge FunctionsでWebhook処理 |
| PostgreSQL | データベース | Supabaseの標準DB。RLS、トリガー、関数によるサーバーサイドロジック |
| Supabase Auth | 認証 | メール/パスワード + Google OAuth対応。JWTベースのセッション管理 |
| Supabase Realtime | リアルタイム通信 | チャット機能のWebSocket通信。PostgreSQL変更通知ベース |
| Supabase Edge Functions | サーバーレス関数 | メール通知のトリガー処理。Deno Runtime |
| Resend | メール送信 | 開発者フレンドリーなAPI。Edge Functionsから呼び出し |
| Vercel | ホスティング | Next.jsとの最適な統合。エッジ配信、自動プレビューデプロイ |

### 開発ツール

| 技術 | バージョン | 用途 | 選定理由 |
|------|-----------|------|----------|
| TypeScript | ~5.3.0 | 型チェック | 静的型付けによる安全性。IDEサポートの充実 |
| ESLint | ^9.0.0 | 静的解析 | コード品質の維持、一貫したコーディングスタイル |
| Prettier | ^3.2.0 | コードフォーマット | 自動フォーマットによるスタイル統一 |
| Vitest | ^2.0.0 | ユニットテスト | Viteベースで高速。TypeScriptネイティブ対応 |
| Playwright | 最新 | E2Eテスト | マルチブラウザ対応。Next.jsとの統合が容易 |
| Supabase CLI | 最新 | ローカル開発 | ローカルでSupabase環境を再現。マイグレーション管理 |
| Husky | ^9.0.0 | Git hooks | コミット前のlint/format自動実行 |
| lint-staged | ^15.2.0 | ステージファイルのlint | コミット対象ファイルのみlint実行で高速化 |

## アーキテクチャパターン

### レイヤードアーキテクチャ

```
┌──────────────────────────────────────────┐
│   UIレイヤー (React Server/Client Components) │
│   - ページ表示、フォーム、ユーザー操作      │
├──────────────────────────────────────────┤
│   アクションレイヤー (Server Actions)       │
│   - バリデーション、ビジネスロジック         │
├──────────────────────────────────────────┤
│   データレイヤー (Supabase Client + RLS)    │
│   - データアクセス、アクセス制御            │
├──────────────────────────────────────────┤
│   データベース (PostgreSQL)                │
│   - テーブル、RLSポリシー、トリガー         │
└──────────────────────────────────────────┘
```

#### UIレイヤー
- **責務**: ページレンダリング、ユーザー入力の受付、状態管理、結果の表示
- **許可される操作**: Server Actionsの呼び出し、Supabase Clientによるデータ取得（読み取り）
- **禁止される操作**: 直接的なデータ書き込み操作

#### アクションレイヤー（Server Actions）
- **責務**: 入力バリデーション、ビジネスロジック実行、Supabase操作
- **許可される操作**: Supabase Clientによるデータ読み書き、Edge Functions呼び出し
- **禁止される操作**: UIの直接操作

#### データレイヤー
- **責務**: Supabase Clientを介したデータアクセス、RLSによるアクセス制御
- **許可される操作**: PostgreSQLへのCRUD操作
- **禁止される操作**: ビジネスロジックの実装（RLSポリシーとトリガーによる制約のみ）

#### データベース
- **責務**: データ永続化、RLSによるセキュリティ、トリガーによる自動処理
- **主要機能**: RLSポリシー、Database Functions、Triggers

## データ永続化戦略

### ストレージ方式

| データ種別 | ストレージ | 理由 |
|-----------|----------|------|
| ユーザーデータ | PostgreSQL (Supabase) | RLSによるアクセス制御、リレーション管理 |
| 認証データ | Supabase Auth (auth スキーマ) | JWTトークン管理、OAuth統合 |
| チャットメッセージ | PostgreSQL + Realtime | リアルタイム配信とデータ永続化の両立 |
| セッション | Supabase Auth (JWT) | ステートレスなセッション管理 |

### データベース構成

- **データベース名**: `portfolio_db`
- **スキーマ名**: `sports_event_hub`
- 1つのDBに複数プロジェクトを同居させる運用

### データベース設計

#### テーブル一覧

| テーブル名 | 説明 | 主要カラム |
|-----------|------|-----------|
| profiles | ユーザープロフィール | id (PK), display_name |
| events | イベント情報 | id (PK), organizer_id (FK), status |
| applications | 参加申請 | id (PK), event_id (FK), applicant_id (FK), status |
| chat_messages | チャットメッセージ | id (PK), event_id (FK), sender_id (FK), receiver_id (FK) |
| blocks | ブロック情報 | id (PK), organizer_id (FK), blocked_user_id (FK) |

#### 主要な外部キー制約

- `events.organizer_id` → `profiles.id`
- `applications.event_id` → `events.id`
- `applications.applicant_id` → `profiles.id`
- `chat_messages.event_id` → `events.id`
- `chat_messages.sender_id` → `profiles.id`
- `chat_messages.receiver_id` → `profiles.id`
- `blocks.organizer_id` → `profiles.id`
- `blocks.blocked_user_id` → `profiles.id`

詳細なデータモデル定義（フィールド、制約、ER図）は `functional-design.md` を参照。

### バックアップ戦略

- **頻度**: Supabaseの自動バックアップ（日次）
- **保持期間**: Pro Plan: 7日間
- **Point-in-Time Recovery**: Pro Planで利用可能
- **手動バックアップ**: `pg_dump`によるオンデマンドバックアップ

## パフォーマンス要件

### レスポンスタイム

| 操作 | 目標時間 | 測定環境 | 測定条件 |
|------|---------|---------|---------|
| 初回ページロード（トップ） | 3秒以内 | 3G回線 | Chrome DevTools Throttling (Regular 3G: 750ms RTT, 1.6Mbps down, 750kbps up) |
| ページ遷移（SPA内） | 1秒以内 | 4G回線 | Chrome DevTools Throttling (Regular 4G: 150ms RTT, 9Mbps down, 9Mbps up) |
| イベント一覧表示（20件） | 500ms以内 | 4G回線 | サーバー処理時間（ネットワーク時間を除く） |
| イベント検索（フィルタ適用） | 1秒以内 | 4G回線 | サーバー処理時間（ネットワーク時間を除く） |
| 申請操作（送信〜表示更新） | 1秒以内 | 4G回線 | エンドツーエンド時間（送信ボタン押下〜UI更新完了） |
| チャットメッセージ配信 | 500ms以内 | 4G回線 | 送信者送信完了〜受信者画面表示まで |

### 最適化手法

| 手法 | 対象 | 効果 |
|------|------|------|
| SSR / SSG | トップページ、イベント詳細 | 初回ロード高速化、SEO対応 |
| ISR | イベント詳細ページ | 静的生成のキャッシュ + オンデマンド再生成 |
| React Server Components | データ取得を含むコンポーネント | クライアントへのJS送信量削減 |
| ページネーション | イベント一覧 | 1回のクエリで取得するデータ量を制限（20件/ページ） |
| Database Index | 検索・フィルタ対象カラム | クエリ実行速度の向上 |
| Realtime Subscription | チャット | ポーリング不要でサーバー負荷軽減 |

## セキュリティアーキテクチャ

### 認証・認可

- **認証方式**: Supabase Auth（JWT）
  - メール/パスワード認証
  - Google OAuth 2.0
  - メール確認（サインアップ時）
- **セッション管理**: JWTトークン（httpOnly Cookie）
  - アクセストークン有効期限: 1時間
  - リフレッシュトークンによる自動更新
- **認可**: Row Level Security (RLS)
  - テーブルごとにSELECT/INSERT/UPDATE/DELETEポリシーを定義
  - `auth.uid()`によるユーザー識別

### データ保護

- **通信暗号化**: HTTPS強制（Vercel + Supabaseで標準対応）
- **データベース暗号化**: Supabaseによる保存時暗号化（AES-256）
- **機密情報管理**: 環境変数で管理（`.env.local`、Vercel Environment Variables）
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`（サーバーサイドのみ）
  - `RESEND_API_KEY`（Edge Functionsのみ）

### 入力検証

- **クライアントサイド**: React Hook Form + Zod スキーマ
- **サーバーサイド**: Server Actions内でZodスキーマによるバリデーション
- **データベース**: PostgreSQL制約（NOT NULL, CHECK, UNIQUE）+ RLSポリシー
- **XSS対策**: Reactの自動エスケープ。ユーザー入力のHTML表示が必要な場合はDOMPurify使用
- **SQLインジェクション対策**: Supabase Clientのパラメータバインディング（直接SQLを書かない）

## スケーラビリティ設計

### データ増加への対応

- **想定データ量**:
  - ユーザー: 5,000人
  - イベント: 10,000件
  - 申請: 50,000件
  - チャットメッセージ: 500,000件
- **パフォーマンス劣化対策**:
  - イベント一覧: ページネーション（20件/ページ）
  - インデックス: `events.start_datetime`, `events.municipality`, `events.level`, `applications.event_id`, `applications.applicant_id`
  - チャット: イベント+ユーザーペア単位での取得
- **アーカイブ戦略**: 終了後90日経過したイベントのチャットメッセージを削除（DB Function + pg_cronで自動化）

### モニタリング戦略

**監視指標**:
- データベースサイズ: 週次チェック（Supabase Dashboard）
- クエリ実行時間: スロークエリ検出（1秒以上）
- 同時接続数: Realtime接続数を監視

**アラート基準**:
- データベースサイズが400MB超過時（Free Plan 500MBの80%）
- イベント一覧表示が1秒を超えた場合
- Realtime同時接続数が160を超えた場合（Free Plan 200の80%）

**対応フロー**:
1. スロークエリ特定 → インデックス追加検討
2. データ量増加 → アーカイブ実行前倒し
3. 同時接続数上限接近 → Pro Planへのアップグレード検討

### 機能拡張性

- **コンポーネント設計**: shadcn/uiベースの再利用可能なコンポーネント
- **Server Actions分離**: 機能ごとにファイル分割し、新機能追加が容易
- **データベースマイグレーション**: Supabase CLIによるバージョン管理

## テスト戦略

### ユニットテスト
- **フレームワーク**: Vitest
- **対象**: バリデーションロジック、日時計算、ステータス遷移ロジック、ユーティリティ関数
- **カバレッジ目標**:
  - `src/lib/validations/`: 100%
  - `src/lib/utils/`: 90%以上
  - `src/actions/` のビジネスロジック部分: 80%以上

### 統合テスト
- **方法**: Vitest + Supabase ローカル環境（`supabase start`）
- **対象**: Server Actions（`src/actions/`）、RLSポリシー、Database Functions
- **実行タイミング**: PR作成時、devマージ前

### E2Eテスト
- **ツール**: Playwright
- **シナリオ**:
  - ユーザー登録〜プロフィール設定
  - イベント作成〜公開〜検索
  - 参加申請〜承認〜チャット
  - イベントキャンセル〜通知
- **実行タイミング**: devマージ前、本番デプロイ前

詳細なテスト実装例は `development-guidelines.md` の「テスト戦略」を参照。

## 技術的制約

### 環境要件

**クライアント環境**:
- ブラウザ: Chrome/Edge/Safari/Firefox 最新2バージョン
- モバイル: iOS Safari 16+、Android Chrome 最新

**開発環境**:
- Docker Desktop: 4.0以上
- ホストマシン: メモリ8GB以上、空きディスク容量10GB以上
- devcontainer構成: Node.js v24.11.0、PostgreSQL（Supabase CLI経由）

詳細なセットアップ手順は `development-guidelines.md` の「開発環境セットアップ」を参照。

### パフォーマンス制約
- Supabase Free Plan: 500MB データベース、1GB ファイルストレージ
- Vercel Free Plan: 100GB 帯域幅/月
- Supabase Realtime: 200 同時接続（Free Plan）

### セキュリティ制約
- Supabase Anon Keyはクライアントに公開される（RLSで保護）
- **Service Role Keyは絶対にクライアントに公開しない**
  - `.env.local`のみに配置（`.gitignore`で管理外）
  - クライアントサイドコードでは`NEXT_PUBLIC_`プレフィックスを付けない
  - プリコミットフックで`SUPABASE_SERVICE_ROLE_KEY`の値を含むファイルを検知・拒否
  - 本番環境ではVercel Environment Variables / GitHub Secretsでのみ提供
- Edge Functionsの環境変数はSupabase Dashboardで管理（コードに含めない）

## 依存関係管理

| ライブラリ | 用途 | バージョン管理方針 |
|-----------|------|-------------------|
| next | フレームワーク | ^15.0.0（メジャーは手動更新） |
| react | UIライブラリ | ^19.0.0（Next.jsに合わせる） |
| @supabase/supabase-js | Supabase SDK | ^2.0.0（メジャーは手動更新） |
| tailwindcss | スタイリング | ^4.0.0 |
| zod | バリデーション | ^3.0.0 |
| date-fns | 日時操作 | ^4.0.0 |
| react-hook-form | フォーム管理 | ^7.0.0 |
| typescript | 型チェック | ~5.3.0（パッチのみ自動） |
| vitest | テスト | ^2.0.0 |
| eslint | 静的解析 | ^9.0.0 |
| prettier | フォーマッター | ^3.2.0 |
| playwright | E2Eテスト | 最新（テストツールは常に最新推奨） |

## デプロイメント構成

### 環境構成

| 環境 | ホスティング | データベース | 用途 |
|------|-------------|-------------|------|
| ローカル | localhost:3000 | Supabase Local (Docker) | 開発 |
| プレビュー | Vercel Preview Deploy | Supabase Staging | PR確認 |
| 本番 | Vercel Production | Supabase Production | 本番運用 |

### デプロイフロー

1. **開発環境**: feature/* ブランチで開発 → ローカルでテスト
2. **PRレビュー**: dev へPR → Vercel Preview Deployで確認
3. **ステージング**: dev マージ → Supabase Stagingで統合テスト
4. **本番リリース**: main マージ → Vercel Production + Supabase Production

### 環境変数管理

| 変数 | ローカル | Vercel Preview | Vercel Production | Edge Functions |
|------|---------|---------------|-------------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | Environment Variables | Environment Variables | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Environment Variables | Environment Variables | - |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` | Environment Variables | Environment Variables | - |
| `RESEND_API_KEY` | - | - | - | Supabase Dashboard |
