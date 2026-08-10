# ラジオ体操スタンプカード

Discordコミュニティで開催する「ラジオ体操スタンプラリー」用のWebアプリです。
参加者はログイン名のみで参加し、7日間の参加記録に応じてスタンプカードにスタンプが増えていきます。

- フレームワーク: Next.js (App Router) + TypeScript + Tailwind CSS
- データベース/ストレージ: Supabase (Postgres + Storage)

現在の実装状況は `docs/PROGRESS.md` 等ではなく、開発時のやり取りを参照してください。
今はPhase 1(プロジェクト・DB・参加者識別の基盤)が完了しています。

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの作成

1. https://supabase.com でアカウントを作成し、新規プロジェクトを作成する
2. プロジェクトの `Settings > API` から以下をメモする
   - `Project URL`
   - `service_role` key (**anon keyではない点に注意。他人に共有しないこと**)

### 3. マイグレーションの適用

Supabaseダッシュボードの `SQL Editor` を開き、`supabase/migrations/0001_init.sql` の内容をそのまま貼り付けて実行してください。
(参加者・スタンプ・参加記録・スタンプカード配置などのテーブルが作成されます)

### 4. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、値を設定してください。

```bash
cp .env.local.example .env.local
```

| 変数名 | 説明 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseのProject URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseのservice_role key (サーバー専用・非公開) |
| `SESSION_SECRET` | 参加者セッションのトークンハッシュ化に使う秘密文字列。`openssl rand -hex 32` などで生成 |
| `ADMIN_PASSWORD` | 管理画面ログイン用の簡易パスワード |

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 で確認できます。
環境変数を正しく設定した状態で http://localhost:3000/api/health にアクセスし、
`{"status":"ok", ...}` が返ればSupabaseへの接続に成功しています。

## ディレクトリ構成 (Phase 1時点)

```
src/
  app/
    api/health/route.ts   -- Supabase接続確認用(検証後は参加者用機能に置き換え予定)
  lib/
    date.ts                -- 日本時間(Asia/Tokyo)基準の日付ユーティリティ
    participants.ts        -- 参加者の取得/新規登録
    session.ts              -- 参加者セッション(Cookie)の発行・検証
    supabase/admin.ts       -- Supabase service role クライアント(サーバー専用)
supabase/
  migrations/0001_init.sql  -- DBスキーマ
```

## 実装フェーズ

1. ✅ プロジェクト・DB・参加者識別の整理
2. ログイン名だけの参加者登録・ログインUI
3. 参加者ホーム画面
4. 「今日やったよ！」と7日間の参加記録
5. スタンプ情報・一覧・詳細画面
6. スタンプカード
7. 皆勤賞
8. 管理画面
9. 参加者統計
10. スタンプ編集・画像アップロード
11. スタンプカードのドラッグ&ドロップ配置編集
12. 全体のレスポンシブ調整
13. 本番環境への公開
