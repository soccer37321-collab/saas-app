# SaaS App

Next.js + Supabase + Tailwind CSS で構築した SaaS ボイラープレートです。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 15 (App Router) / TypeScript |
| スタイリング | Tailwind CSS v4 |
| バックエンド / DB | Supabase (PostgreSQL + Auth + RLS) |
| ホスティング | Vercel |

---

## セットアップ

### 1. 環境変数

```bash
cp .env.local.example .env.local
```

`.env.local` に Supabase の URL と anon key を設定します。

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase マイグレーション

[Supabase ダッシュボード](https://app.supabase.com) → SQL Editor で `supabase/migrations/20240001_init.sql` を実行します。

### 3. ローカル起動

```bash
npm install
npm run dev
```

### 4. Vercel デプロイ

```bash
vercel
```

または GitHub リポジトリを Vercel に接続し、環境変数を設定するだけで自動デプロイされます。

---

## DB 設計

### ER 図

```
auth.users (Supabase 管理)
    │
    │ 1:1
    ▼
┌─────────────────────────────────┐
│ profiles                        │
│─────────────────────────────────│
│ id          UUID  PK (= auth.users.id) │
│ email       TEXT  NOT NULL      │
│ full_name   TEXT                │
│ avatar_url  TEXT                │
│ created_at  TIMESTAMPTZ         │
│ updated_at  TIMESTAMPTZ         │
└──────────────┬──────────────────┘
               │ 1:N (owner)
               │
               ▼
┌─────────────────────────────────┐
│ organizations                   │
│─────────────────────────────────│
│ id          UUID  PK            │
│ name        TEXT  NOT NULL      │
│ slug        TEXT  UNIQUE        │
│ owner_id    UUID  FK → profiles │
│ created_at  TIMESTAMPTZ         │
│ updated_at  TIMESTAMPTZ         │
└──────────────┬──────────────────┘
               │ 1:N
               │
               ▼
┌─────────────────────────────────┐
│ memberships                     │
│─────────────────────────────────│
│ id              UUID  PK        │
│ user_id         UUID  FK → profiles     │
│ organization_id UUID  FK → organizations│
│ role            TEXT  (owner/admin/member) │
│ created_at      TIMESTAMPTZ     │
│ UNIQUE(user_id, organization_id)│
└─────────────────────────────────┘
```

### テーブル説明

| テーブル | 用途 |
|---|---|
| `profiles` | `auth.users` の拡張。ユーザーの表示名・アバターを管理 |
| `organizations` | チーム・組織の単位。SaaS のテナントに相当 |
| `memberships` | ユーザーと組織の多対多の中間テーブル。ロールも持つ |

### ロール定義

| ロール | 権限 |
|---|---|
| `owner` | 組織の作成者。全操作が可能 |
| `admin` | メンバー管理・設定変更が可能 |
| `member` | 閲覧・基本操作のみ |

### Row Level Security (RLS)

- `profiles`: 本人のみ読み書き可
- `organizations`: メンバーのみ閲覧可、owner のみ更新可
- `memberships`: 本人または同組織のメンバーが閲覧可

---

## 画面遷移図

```
                    ┌──────────────────┐
                    │   / (Landing)    │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
 ┌────────────────────┐       ┌──────────────────────┐
 │  /auth/login       │       │  /auth/register      │
 │  メールアドレス      │◄─────►│  名前・メール・PW     │
 │  + パスワード       │       │  → 確認メール送信     │
 └────────┬───────────┘       └──────────────────────┘
          │ 認証成功
          ▼
 ┌─────────────────────────────────────────────────┐
 │                  /dashboard                     │
 │  ・統計カード（プロジェクト数、メンバー数、タスク）  │
 │  ・組織一覧                                      │
 └────┬────────────────────┬────────────────────────┘
      │                    │
      ▼                    ▼
 ┌──────────┐        ┌──────────────┐
 │ /settings│        │ /org/[slug]  │
 │ プロフィール│        │ 組織詳細・    │
 │ パスワード │        │ メンバー管理  │
 └──────────┘        └──────────────┘
```

### 画面一覧

| パス | 認証 | 説明 |
|---|---|---|
| `/` | 不要 | ランディングページ |
| `/auth/login` | 不要 (未認証のみ) | ログインフォーム |
| `/auth/register` | 不要 (未認証のみ) | 新規登録フォーム |
| `/dashboard` | 必須 | ダッシュボード（統計・組織一覧） |
| `/settings` | 必須 | プロフィール・パスワード設定 |
| `/org/[slug]` | 必須 | 組織詳細・メンバー管理 |

---

## ディレクトリ構成

```
saas-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── settings/page.tsx
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts         # ブラウザクライアント
│   │       └── server.ts         # サーバーコンポーネント用クライアント
│   └── middleware.ts             # 認証ルートガード
├── supabase/
│   └── migrations/
│       └── 20240001_init.sql     # 初期スキーマ
├── .env.local.example
└── README.md
```
