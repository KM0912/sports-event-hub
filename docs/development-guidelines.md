# 開発ガイドライン (Development Guidelines)

## コーディング規約

### 命名規則

#### 変数・関数

```typescript
// 変数: camelCase、名詞または名詞句
const eventList = await getEvents();
const approvedCount = applications.filter(a => a.status === 'approved').length;

// 関数: camelCase、動詞で始める
function createEvent(data: CreateEventData): Promise<Event> { }
function formatEventDate(date: Date): string { }
function validateApplicationConstraints(eventId: string, userId: string): Promise<void> { }

// Boolean: is, has, should, canで始める
const isExpired = event.endDatetime < new Date();
const hasApproved = application.status === 'approved';
const canApply = !isBlocked && !isFull && !isPastDeadline;
```

#### 定数

```typescript
// UPPER_SNAKE_CASE
const MAX_DISPLAY_NAME_LENGTH = 20;
const MIN_DISPLAY_NAME_LENGTH = 2;
const CHAT_EXPIRY_HOURS = 48;
const MAX_MESSAGE_LENGTH = 500;

// 設定オブジェクト: as constで定義
const EVENT_LEVELS = {
  beginner: { label: '初心者', color: 'green' },
  elementary: { label: '初級', color: 'blue' },
  intermediate: { label: '中級', color: 'yellow' },
  advanced: { label: '上級', color: 'red' },
  all: { label: 'すべてのレベル', color: 'gray' },
} as const;
```

#### コンポーネント・型

```typescript
// コンポーネント: PascalCase
function EventCard({ event }: EventCardProps) { }
function ApplicationBadge({ status }: ApplicationBadgeProps) { }

// 型・インターフェース: PascalCase
interface Event { }
type EventLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'all';
type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// Props型: コンポーネント名 + Props
interface EventCardProps {
  event: Event;
}
```

#### ファイル名

```
// コンポーネント: kebab-case.tsx
event-card.tsx
application-badge.tsx

// Server Actions: kebab-case + -actions.ts
event-actions.ts
application-actions.ts

// バリデーション: kebab-case + -schema.ts
event-schema.ts
profile-schema.ts

// ユーティリティ: kebab-case + -utils.ts
date-utils.ts
format-utils.ts

// 型定義: kebab-case.ts
event.ts
application.ts

// 定数: kebab-case.ts
municipalities.ts
levels.ts
```

### コードフォーマット

**インデント**: 2スペース

**行の長さ**: 最大100文字

**ツール設定**:
- Prettier: 自動フォーマット
- ESLint: 静的解析

### コメント規約

```typescript
// ✅ 良い例: なぜそうするかを説明
// 募集締切はイベント開始時刻から逆算して判定する
const deadline = subHours(event.startDatetime, event.deadlineHoursBefore);

// ✅ 良い例: 複雑なビジネスルールの説明
// ブロックされたユーザーはその主催者の全イベントに申請不可
const isBlocked = await checkBlock(organizerId, applicantId);

// ❌ 悪い例: コードの内容を繰り返すだけ
// イベントを作成する
const event = await createEvent(data);
```

**TSDocは公開ユーティリティ関数にのみ記載**:
```typescript
/**
 * イベントの残り枠数を計算する
 *
 * @param capacity - イベント定員
 * @param approvedCount - 承認済み参加者数
 * @returns 残り枠数（0未満にはならない）
 */
function calculateRemainingSlots(capacity: number, approvedCount: number): number {
  return Math.max(0, capacity - approvedCount);
}
```

### エラーハンドリング

#### Server Actionsでのエラー処理

```typescript
// Server Actionの戻り値型
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Server Actionの実装パターン
export async function createEvent(
  formData: FormData
): Promise<ActionResult<Event>> {
  // バリデーション
  const parsed = eventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // DB操作
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return { success: false, error: 'イベントの作成に失敗しました' };
  }

  revalidatePath('/dashboard');
  return { success: true, data };
}
```

#### クライアントでのエラー表示

```typescript
// フォーム送信時のエラーハンドリング
const result = await createEvent(formData);
if (!result.success) {
  toast.error(result.error);
  return;
}
toast.success('イベントを作成しました');
redirect('/dashboard');
```

### バリデーション

Zodスキーマでクライアント・サーバー両方のバリデーションを共通化:

```typescript
// src/lib/validations/event-schema.ts
import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内です'),
  startDatetime: z.coerce.date(),
  endDatetime: z.coerce.date(),
  venueName: z.string().min(1, '会場名は必須です'),
  venueAddress: z.string().min(1, '住所は必須です'),
  municipality: z.string().min(1, '市区町村を選択してください'),
  level: z.enum(['beginner', 'elementary', 'intermediate', 'advanced', 'all']),
  levelNote: z.string().max(200).optional(),
  capacity: z.number().int().min(1, '定員は1人以上です'),
  fee: z.number().int().min(0, '参加費は0円以上です'),
  description: z.string().optional(),
  rules: z.string().optional(),
  equipment: z.string().optional(),
  notes: z.string().optional(),
  deadlineHoursBefore: z.number().int().min(1).max(72).optional(),
}).refine(
  data => data.endDatetime > data.startDatetime,
  { message: '終了日時は開始日時より後にしてください', path: ['endDatetime'] }
);

export type CreateEventData = z.infer<typeof eventSchema>;
```

## Git運用ルール

### ブランチ戦略（Git Flow）

```
main (本番環境)
└── develop (開発・統合環境)
    ├── feature/* (新機能開発)
    ├── fix/* (バグ修正)
    └── refactor/* (リファクタリング)
```

**運用ルール**:
- **main**: 本番リリース済みの安定版。タグでバージョン管理
- **develop**: 次期リリースに向けた開発コード統合
- **feature/\*、fix/\***: developから分岐し、PRでdevelopへマージ
- **直接コミット禁止**: main, developへの直接コミットは禁止
- **マージ方針**: feature→develop は squash merge

### コミットメッセージ規約

**Conventional Commits形式**:
```
<type>(<scope>): <subject>

<body>
```

**Type**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードフォーマット
- `refactor`: リファクタリング
- `perf`: パフォーマンス改善
- `test`: テスト追加・修正
- `chore`: ビルド、補助ツール等

**Scope（主なもの）**:
- `event`: イベント関連
- `application`: 申請関連
- `chat`: チャット関連
- `auth`: 認証関連
- `profile`: プロフィール関連
- `ui`: UI全般
- `db`: データベース

**例**:
```
feat(event): イベント作成フォームを実装

- 全入力項目のフォームを作成
- Zodスキーマによるバリデーションを実装
- Server Actionでのイベント作成処理を実装

Closes #12
```

### プルリクエストプロセス

**PR作成前チェック**:
- [ ] 全テストがパス (`npm test`)
- [ ] Lintエラーがない (`npm run lint`)
- [ ] 型チェックがパス (`npm run typecheck`)
- [ ] 競合が解決されている

**PRテンプレート**:
```markdown
## 変更の種類
- [ ] 新機能 (feat)
- [ ] バグ修正 (fix)
- [ ] リファクタリング (refactor)
- [ ] ドキュメント (docs)
- [ ] その他 (chore)

## 変更内容
### 何を変更したか
[簡潔な説明]

### なぜ変更したか
[背景・理由]

### どのように変更したか
- [変更点1]
- [変更点2]

## テスト
- [ ] ユニットテスト追加
- [ ] 手動テスト実施

## 関連Issue
Closes #[番号]
```

**小さなPRを心がける**:
- 1PR = 1機能
- 変更ファイル数: 10ファイル以内を推奨
- 変更行数: 300行以内を推奨

## テスト戦略

### テストピラミッド

```
       /\
      /E2E\       少 (遅い、高コスト)
     /------\
    / 統合   \     中
   /----------\
  / ユニット   \   多 (速い、低コスト)
 /--------------\
```

### テストの種類と対象

#### ユニットテスト（Vitest）

**対象**: バリデーションスキーマ、ユーティリティ関数、日時計算ロジック

**カバレッジ目標**: ビジネスロジック80%以上

```typescript
describe('eventSchema', () => {
  it('正常なデータでバリデーションが通る', () => {
    const validData = {
      title: '練習会',
      startDatetime: new Date('2026-03-01T09:00:00'),
      endDatetime: new Date('2026-03-01T12:00:00'),
      venueName: '仙台市体育館',
      venueAddress: '仙台市青葉区...',
      municipality: '仙台市青葉区',
      level: 'intermediate',
      capacity: 10,
      fee: 500,
    };

    const result = eventSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('終了日時が開始日時より前の場合エラーになる', () => {
    const invalidData = {
      title: '練習会',
      startDatetime: new Date('2026-03-01T12:00:00'),
      endDatetime: new Date('2026-03-01T09:00:00'),
      // ...
    };

    const result = eventSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

#### 統合テスト（Vitest + Supabaseローカル）

**対象**: Server Actions、RLSポリシー

```typescript
describe('RLS: events', () => {
  it('認証済みユーザーがイベントを作成できる', async () => {
    const supabase = createAuthenticatedClient(testUser);
    const { data, error } = await supabase
      .from('events')
      .insert(validEventData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('他ユーザーのイベントを編集できない', async () => {
    const supabase = createAuthenticatedClient(otherUser);
    const { error } = await supabase
      .from('events')
      .update({ title: '不正な編集' })
      .eq('id', existingEventId);

    expect(error).toBeDefined();
  });
});
```

#### E2Eテスト（Playwright）

**対象**: 主要ユーザーフロー

```typescript
test('イベント作成〜申請〜承認フロー', async ({ page }) => {
  // 主催者がログインしてイベントを作成
  await loginAs(page, organizer);
  await page.goto('/events/new');
  await fillEventForm(page, eventData);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');

  // 参加者がログインして申請
  await loginAs(page, applicant);
  await page.goto(`/events/${eventId}`);
  await page.click('[data-testid="apply-button"]');
  await expect(page.locator('[data-testid="status-badge"]')).toHaveText('保留中');

  // 主催者が申請を承認
  await loginAs(page, organizer);
  await page.goto(`/dashboard/events/${eventId}/applications`);
  await page.click('[data-testid="approve-button"]');
  await expect(page.locator('[data-testid="status-badge"]')).toHaveText('承認済み');
});
```

### テスト命名規則

**パターン**: 日本語で具体的に記述

```typescript
// ✅ 良い例
it('定員に達している場合、申請が拒否される', () => { });
it('ブロックされたユーザーは申請できない', () => { });
it('イベント開始後は編集不可になる', () => { });

// ❌ 悪い例
it('test1', () => { });
it('works', () => { });
```

## コードレビュー基準

### レビューポイント

**機能性**:
- [ ] PRDの要件を満たしているか
- [ ] エッジケースが考慮されているか（定員0、期限切れ、ブロック済み等）
- [ ] エラーハンドリングが適切か

**セキュリティ**:
- [ ] RLSポリシーが正しく設定されているか
- [ ] 入力バリデーションが実装されているか
- [ ] 機密情報がハードコードされていないか

**パフォーマンス**:
- [ ] 不要なデータ取得がないか（必要なカラムのみSELECT）
- [ ] N+1クエリが発生していないか
- [ ] クライアントに不要なデータを送っていないか

**可読性**:
- [ ] 命名規則に従っているか
- [ ] 複雑なロジックにコメントがあるか

### レビューコメントの優先度

- `[必須]`: 修正必須（セキュリティ、バグ）
- `[推奨]`: 修正推奨（パフォーマンス、可読性）
- `[提案]`: 検討してほしい
- `[質問]`: 理解のための質問

## 開発環境セットアップ

### 必要なツール

| ツール | バージョン | インストール方法 |
|--------|-----------|-----------------|
| Node.js | v24.11.0 | devcontainerに含まれる |
| npm | 11.x | Node.jsに付属 |
| Supabase CLI | 最新 | `npm install -g supabase` |
| Docker | 最新 | devcontainerの前提 |

### セットアップ手順

```bash
# 1. リポジトリのクローン
git clone <repository-url>
cd badminton-event-hub

# 2. devcontainerを起動（VS Code）
# Ctrl+Shift+P → "Dev Containers: Reopen in Container"

# 3. 依存関係のインストール
npm install

# 4. 環境変数の設定
cp .env.example .env.local
# .env.localを編集してSupabaseのキーを設定

# 5. Supabaseローカル環境の起動
supabase start

# 6. データベースマイグレーション
supabase db push

# 7. 開発サーバーの起動
npm run dev
```

### 主要npmスクリプト

```bash
npm run dev           # 開発サーバー起動
npm run build         # プロダクションビルド
npm run lint          # ESLintチェック
npm run format        # Prettierフォーマット
npm run typecheck     # 型チェック
npm test              # ユニットテスト実行
npm run test:watch    # テストのウォッチモード
npm run test:coverage # カバレッジレポート
```

## 品質自動化

### Pre-commit フック（Husky + lint-staged）

コミット前にステージされたファイルに対して自動チェック:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### CI/CD（GitHub Actions）

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```
