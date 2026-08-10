# ラジオ体操スタンプカード

Discordコミュニティで開催する「ラジオ体操スタンプラリー」用のWebアプリです。
参加者はログイン名のみで参加し、7日間の参加記録に応じてスタンプカードにスタンプが増えていきます。

- フレームワーク: Next.js (App Router) + TypeScript + Tailwind CSS
- データベース/ストレージ: Supabase (Postgres + Storage)
- ホスティング: Vercel

Phase 1〜13(本番公開)まで実装済みです。詳細は下記「実装フェーズ」を参照してください。

## セットアップ手順 (ローカル開発)

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

Supabaseダッシュボードの `SQL Editor` を開き、`supabase/migrations/` 配下のSQLファイルを
**番号順に (0001 → 0002 → 0003)** 貼り付けて実行してください。

- `0001_init.sql` — 参加者・スタンプ・参加記録・スタンプカード配置などのテーブル
- `0002_seed_event.sql` — 7日間イベントのデフォルト設定を1件投入
- `0003_storage_bucket.sql` — スタンプ画像用の公開Storageバケット作成

### 4. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、値を設定してください。

```bash
cp .env.local.example .env.local
```

| 変数名 | 説明 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseのProject URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseのservice_role key (サーバー専用・非公開) |
| `SESSION_SECRET` | セッションのトークンハッシュ化・署名に使う秘密文字列。`openssl rand -hex 32` などで生成 |
| `ADMIN_PASSWORD` | 管理画面ログイン用の簡易パスワード |

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 で確認できます。

## 本番環境へのデプロイ (Vercel)

1. GitHubリポジトリと連携してVercelにインポート (Framework Presetは自動でNext.jsになる)
2. 上記4つの環境変数をVercelの Project Settings > Environment Variables に設定
3. Deploy
4. **Settings > Deployment Protection** で「Vercel Authentication」が有効になっている場合は無効にする
   (有効なままだと参加者がVercelログインを求められ、アプリにアクセスできない)

## ディレクトリ構成

```
src/
  app/
    page.tsx                  -- ログイン画面
    home/                      -- 参加者ホーム(今日やったよ！ボタンなど)
    stamps/, stamps/[day]/     -- スタンプ一覧・詳細(未獲得日はロック)
    stamp-card/                -- スタンプカード(管理画面で配置編集可能)
    perfect-attendance/        -- 皆勤賞
    admin/                     -- 管理画面 (認証・ダッシュボード・スタンプ/カード/皆勤賞管理・参加者一覧)
    api/health/route.ts        -- Supabase接続確認用
  lib/                         -- サーバー専用のデータアクセス/認証ロジック
supabase/
  migrations/                  -- DBスキーマ (番号順に適用)
```

## 実装フェーズ

1. ✅ プロジェクト・DB・参加者識別の整理
2. ✅ ログイン名だけの参加者登録・ログインUI
3. ✅ 参加者ホーム画面
4. ✅ 「今日やったよ！」と7日間の参加記録
5. ✅ スタンプ情報・一覧・詳細画面
6. ✅ スタンプカード
7. ✅ 皆勤賞
8. ✅ 管理画面 (ダッシュボード)
9. ✅ 参加者統計 (参加者一覧)
10. ✅ スタンプ編集・画像アップロード
11. ✅ スタンプカードのドラッグ&ドロップ配置編集
12. ✅ 全体のレスポンシブ調整
13. ✅ 本番環境への公開
