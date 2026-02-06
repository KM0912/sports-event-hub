# リポジトリ構造定義書 (Repository Structure Document)

## プロジェクト構造

```
badminton-event-hub/
├── src/
│   ├── app/                    # Next.js App Router (ページ・レイアウト)
│   ├── components/             # UIコンポーネント
│   ├── actions/                # Server Actions (ビジネスロジック)
│   ├── lib/                    # ライブラリ・ユーティリティ
│   ├── types/                  # 型定義
│   └── constants/              # 定数定義
├── supabase/
│   ├── migrations/             # DBマイグレーション
│   ├── functions/              # Edge Functions
│   └── seed.sql                # シードデータ
├── tests/
│   ├── unit/                   # ユニットテスト
│   ├── integration/            # 統合テスト
│   └── e2e/                    # E2Eテスト
├── public/                     # 静的ファイル
├── docs/                       # プロジェクトドキュメント
├── .steering/                  # 作業単位ドキュメント
└── .claude/                    # Claude Code設定
```

## ディレクトリ詳細

### src/app/ (App Router)

**役割**: Next.js App Routerによるページ定義、レイアウト、ルーティング

**配置ファイル**:
- `page.tsx`: ページコンポーネント
- `layout.tsx`: レイアウトコンポーネント
- `loading.tsx`: ローディングUI
- `error.tsx`: エラーUI
- `not-found.tsx`: 404 UI

**命名規則**:
- ディレクトリ名: kebab-case（URLパスに対応）
- ファイル名: Next.jsの規約に従う（`page.tsx`, `layout.tsx`等）

**構造**:
```
src/app/
├── layout.tsx                  # ルートレイアウト (ヘッダー、フッター)
├── page.tsx                    # トップページ (イベント一覧)
├── login/
│   └── page.tsx                # ログイン/サインアップ
├── profile/
│   └── setup/
│       └── page.tsx            # プロフィール設定
├── events/
│   ├── new/
│   │   └── page.tsx            # イベント作成
│   └── [id]/
│       ├── page.tsx            # イベント詳細
│       └── edit/
│           └── page.tsx        # イベント編集
├── dashboard/
│   ├── page.tsx                # ダッシュボード
│   └── events/
│       └── [id]/
│           └── applications/
│               └── page.tsx    # 申請管理
├── mypage/
│   └── page.tsx                # マイページ
└── chat/
    └── [eventId]/
        └── [userId]/
            └── page.tsx        # チャット
```

**依存関係**:
- 依存可能: `components/`, `actions/`, `lib/`, `types/`, `constants/`
- 依存禁止: なし（最上位レイヤー）

### src/components/ (UIコンポーネント)

**役割**: 再利用可能なUIコンポーネント

**配置ファイル**:
- `*.tsx`: Reactコンポーネント

**命名規則**:
- ディレクトリ名: kebab-case（機能単位）
- ファイル名: kebab-case（`event-card.tsx`, `application-badge.tsx`）

**構造**:
```
src/components/
├── ui/                         # shadcn/ui ベースコンポーネント
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── badge.tsx
│   └── ...
├── layout/                     # レイアウト関連
│   ├── header.tsx
│   ├── footer.tsx
│   └── navigation.tsx
├── event/                      # イベント関連
│   ├── event-card.tsx
│   ├── event-form.tsx
│   ├── event-filter.tsx
│   └── event-list.tsx
├── application/                # 申請関連
│   ├── application-button.tsx
│   ├── application-list.tsx
│   └── application-badge.tsx
├── chat/                       # チャット関連
│   ├── chat-message.tsx
│   ├── chat-input.tsx
│   └── quick-message.tsx
└── auth/                       # 認証関連
    ├── login-form.tsx
    └── profile-form.tsx
```

**依存関係**:
- 依存可能: `ui/`（同ディレクトリ内）, `lib/`, `types/`, `constants/`
- 依存禁止: `app/`, `actions/`（Server Actionsはページ側で呼び出す）

### src/actions/ (Server Actions)

**役割**: サーバーサイドのビジネスロジック。バリデーション、DB操作、通知トリガー

**配置ファイル**:
- `*.ts`: Server Action関数群

**命名規則**:
- ファイル名: kebab-case、機能単位（`event-actions.ts`, `application-actions.ts`）
- 関数名: camelCase、動詞で始める（`createEvent`, `approveApplication`）

**構造**:
```
src/actions/
├── event-actions.ts            # イベントCRUD
├── application-actions.ts      # 申請管理
├── chat-actions.ts             # チャット操作
├── auth-actions.ts             # 認証関連
├── profile-actions.ts          # プロフィール操作
└── block-actions.ts            # ブロック操作
```

**依存関係**:
- 依存可能: `lib/`, `types/`, `constants/`
- 依存禁止: `app/`, `components/`

### src/lib/ (ライブラリ・ユーティリティ)

**役割**: Supabaseクライアント初期化、ユーティリティ関数、バリデーションスキーマ

**配置ファイル**:
- `*.ts`: ユーティリティ関数、設定

**命名規則**:
- ファイル名: kebab-case（`supabase-client.ts`, `date-utils.ts`）

**構造**:
```
src/lib/
├── supabase/
│   ├── client.ts               # ブラウザ用Supabaseクライアント
│   ├── server.ts               # Server Actions用Supabaseクライアント
│   └── middleware.ts            # 認証ミドルウェア用
├── validations/
│   ├── event-schema.ts         # イベントバリデーションスキーマ (Zod)
│   ├── application-schema.ts   # 申請バリデーションスキーマ
│   ├── chat-schema.ts          # チャットバリデーションスキーマ
│   └── profile-schema.ts       # プロフィールバリデーションスキーマ
└── utils/
    ├── date-utils.ts            # 日時ユーティリティ (JST変換等)
    └── format-utils.ts          # フォーマットユーティリティ (金額表示等)
```

**依存関係**:
- 依存可能: `types/`, `constants/`
- 依存禁止: `app/`, `components/`, `actions/`

### src/types/ (型定義)

**役割**: プロジェクト共通の型定義

**配置ファイル**:
- `*.ts`: TypeScript型定義

**命名規則**:
- ファイル名: kebab-case（`event.ts`, `application.ts`）

**構造**:
```
src/types/
├── event.ts                    # Event, EventLevel, EventStatus
├── application.ts              # Application, ApplicationStatus
├── chat.ts                     # ChatMessage
├── profile.ts                  # Profile
├── block.ts                    # Block
└── database.ts                 # Supabase生成型 (supabase gen types)
```

**依存関係**:
- 依存可能: なし（最下位レイヤー）
- 依存禁止: 他のすべてのディレクトリ

### src/constants/ (定数定義)

**役割**: アプリケーション全体で使用する定数

**配置ファイル**:
- `*.ts`: 定数定義

**命名規則**:
- ファイル名: kebab-case（`municipalities.ts`, `levels.ts`）

**構造**:
```
src/constants/
├── municipalities.ts           # 宮城県内38市区町村リスト
├── levels.ts                   # レベル定義 (表示名、色)
├── application-status.ts       # 申請ステータス定義 (表示名、色)
├── quick-messages.ts           # クイックメッセージテンプレート
└── routes.ts                   # ルーティングパス定数
```

**依存関係**:
- 依存可能: `types/`
- 依存禁止: 他のすべてのディレクトリ

### supabase/ (Supabase関連)

**役割**: データベースマイグレーション、Edge Functions、シードデータ

**構造**:
```
supabase/
├── config.toml                 # Supabase CLI設定
├── migrations/                 # DBマイグレーション
│   ├── 00001_create_schema.sql
│   ├── 00002_create_profiles.sql
│   ├── 00003_create_events.sql
│   ├── 00004_create_applications.sql
│   ├── 00005_create_chat_messages.sql
│   ├── 00006_create_blocks.sql
│   └── 00007_create_rls_policies.sql
├── functions/                  # Edge Functions
│   ├── send-email/
│   │   └── index.ts            # メール送信関数
│   └── _shared/
│       └── email-templates.ts  # メールテンプレート
└── seed.sql                    # 開発用シードデータ
```

**命名規則**:
- マイグレーション: `NNNNN_description.sql`（連番 + 説明）
- Edge Functions: kebab-case ディレクトリ

### tests/ (テストディレクトリ)

#### unit/

**役割**: ユニットテストの配置

**構造**:
```
tests/unit/
├── actions/
│   ├── event-actions.test.ts
│   └── application-actions.test.ts
├── lib/
│   ├── validations/
│   │   ├── event-schema.test.ts
│   │   └── application-schema.test.ts
│   └── utils/
│       └── date-utils.test.ts
└── constants/
    └── municipalities.test.ts
```

**命名規則**:
- パターン: `[テスト対象ファイル名].test.ts`
- srcディレクトリと同じ構造を反映

#### integration/

**役割**: 統合テストの配置

**構造**:
```
tests/integration/
├── event/
│   └── event-crud.test.ts
├── application/
│   └── application-flow.test.ts
└── rls/
    └── rls-policies.test.ts
```

#### e2e/

**役割**: E2Eテストの配置

**構造**:
```
tests/e2e/
├── auth-flow.test.ts
├── event-management.test.ts
├── application-flow.test.ts
└── chat-flow.test.ts
```

### docs/ (ドキュメントディレクトリ)

**配置ドキュメント**:
- `product-requirements.md`: プロダクト要求定義書
- `functional-design.md`: 機能設計書
- `architecture.md`: アーキテクチャ設計書
- `repository-structure.md`: リポジトリ構造定義書（本ドキュメント）
- `development-guidelines.md`: 開発ガイドライン
- `glossary.md`: 用語集

**サブディレクトリ**:
- `ideas/`: 壁打ち・ブレインストーミング成果物

## ファイル配置規則

### ソースファイル

| ファイル種別 | 配置先 | 命名規則 | 例 |
|------------|--------|---------|-----|
| ページ | `src/app/[route]/` | `page.tsx` | `src/app/events/[id]/page.tsx` |
| レイアウト | `src/app/[route]/` | `layout.tsx` | `src/app/layout.tsx` |
| UIコンポーネント | `src/components/[feature]/` | kebab-case.tsx | `event-card.tsx` |
| shadcn/uiコンポーネント | `src/components/ui/` | kebab-case.tsx | `button.tsx` |
| Server Actions | `src/actions/` | kebab-case.ts | `event-actions.ts` |
| バリデーション | `src/lib/validations/` | kebab-case.ts | `event-schema.ts` |
| ユーティリティ | `src/lib/utils/` | kebab-case.ts | `date-utils.ts` |
| 型定義 | `src/types/` | kebab-case.ts | `event.ts` |
| 定数 | `src/constants/` | kebab-case.ts | `municipalities.ts` |
| マイグレーション | `supabase/migrations/` | `NNNNN_*.sql` | `00001_create_schema.sql` |
| Edge Functions | `supabase/functions/[name]/` | `index.ts` | `send-email/index.ts` |

### テストファイル

| テスト種別 | 配置先 | 命名規則 | 例 |
|-----------|--------|---------|-----|
| ユニットテスト | `tests/unit/` | `[対象].test.ts` | `event-schema.test.ts` |
| 統合テスト | `tests/integration/` | `[機能].test.ts` | `event-crud.test.ts` |
| E2Eテスト | `tests/e2e/` | `[シナリオ].test.ts` | `auth-flow.test.ts` |

### 設定ファイル

| ファイル | 配置先 | 説明 |
|---------|--------|------|
| `next.config.ts` | ルート | Next.js設定 |
| `tailwind.config.ts` | ルート | Tailwind CSS設定 |
| `tsconfig.json` | ルート | TypeScript設定 |
| `vitest.config.ts` | ルート | Vitest設定 |
| `playwright.config.ts` | ルート | Playwright設定 |
| `eslint.config.js` | ルート | ESLint設定 |
| `.env.local` | ルート | 環境変数（git管理外） |
| `supabase/config.toml` | supabase/ | Supabase CLI設定 |
| `components.json` | ルート | shadcn/ui設定 |
| `middleware.ts` | `src/` | Next.js認証ミドルウェア |

## 命名規則

### ディレクトリ名
- **App Routerルート**: kebab-case（`events/`, `my-page/`）
- **コンポーネントグループ**: kebab-case、単数形（`event/`, `auth/`）
- **レイヤーディレクトリ**: kebab-case、複数形（`actions/`, `components/`）

### ファイル名
- **コンポーネント**: kebab-case（`event-card.tsx`）
- **Server Actions**: kebab-case + `-actions` 接尾辞（`event-actions.ts`）
- **バリデーション**: kebab-case + `-schema` 接尾辞（`event-schema.ts`）
- **ユーティリティ**: kebab-case + `-utils` 接尾辞（`date-utils.ts`）
- **型定義**: kebab-case（`event.ts`）
- **定数**: kebab-case（`municipalities.ts`）
- **テスト**: `[対象].test.ts`（`event-actions.test.ts`）

### 変数・関数名
- **コンポーネント名**: PascalCase（`EventCard`, `ApplicationBadge`）
- **関数名**: camelCase、動詞で始める（`createEvent`, `formatDate`）
- **型名**: PascalCase（`Event`, `ApplicationStatus`）
- **定数**: UPPER_SNAKE_CASE（`EVENT_LEVELS`）またはcamelCase（`municipalities`）

## 依存関係のルール

### レイヤー間の依存

```
app/ (ページ)
  ↓ (OK)
components/ (UIコンポーネント)     actions/ (Server Actions)
  ↓ (OK)                            ↓ (OK)
lib/ (ユーティリティ・バリデーション)
  ↓ (OK)
types/ , constants/ (型定義・定数)
```

**禁止される依存**:
- `types/` → 他のすべてのディレクトリ（❌）
- `constants/` → `lib/`, `actions/`, `components/`, `app/`（❌）
- `lib/` → `actions/`, `components/`, `app/`（❌）
- `actions/` → `components/`, `app/`（❌）
- `components/` → `actions/`（❌ Server Actionsはページ側で呼び出す）

## スケーリング戦略

### コンポーネントの追加

新しい機能のコンポーネントを追加する場合:
1. `src/components/` 配下に機能名のディレクトリを作成
2. 関連するコンポーネントをグループ化
3. 1ファイル300行以下を目安に分割

### Server Actionsの追加

新しいServer Actionsを追加する場合:
1. `src/actions/` に `[機能名]-actions.ts` を作成
2. 対応するバリデーションスキーマを `src/lib/validations/` に作成
3. 必要に応じて型定義を `src/types/` に追加

### DBマイグレーションの追加

テーブルやカラムを追加する場合:
1. `supabase/migrations/` に連番でSQLファイルを作成
2. `supabase db push` でローカルに適用
3. 型定義を `supabase gen types` で再生成

## 除外設定

### .gitignore

```
node_modules/
.next/
dist/
.env
.env.local
.env.*.local
.steering/
*.log
.DS_Store
coverage/
playwright-report/
```

### .prettierignore

```
.next/
node_modules/
dist/
.steering/
coverage/
supabase/migrations/
```

### .eslintignore

```
.next/
node_modules/
dist/
.steering/
coverage/
```
