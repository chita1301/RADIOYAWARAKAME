-- ラジオ体操スタンプカード: 初期スキーマ (Phase 1)
--
-- 設計方針:
-- * すべてのテーブルはアプリのサーバー側 (Route Handler / Server Action) から
--   Supabase の service_role key 経由でのみ読み書きする。
-- * RLS を有効化し、anon/authenticated ロール向けのポリシーは一切定義しない
--   (= デフォルト拒否)。service_role は RLS を常にバイパスするため、
--   サーバー経由のアクセスには影響しない。

create extension if not exists pgcrypto;

-- ============================================================
-- events: イベント設定 (今回は7日間イベントを1行のみ使用する想定)
-- ============================================================
create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  num_days integer not null check (num_days > 0),
  created_at timestamptz not null default now()
);

-- ============================================================
-- participants: 参加者 (ログイン名のみで識別。パスワードなし)
-- ============================================================
create table participants (
  id uuid primary key default gen_random_uuid(),
  login_name text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- sessions: 参加者のログインセッション (httpOnly Cookieと対応するトークン)
-- ============================================================
create table sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index sessions_participant_id_idx on sessions(participant_id);

-- ============================================================
-- stamps: 各日のスタンプ情報
-- ============================================================
create table stamps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  name text not null,
  image_url text,
  author_name text,
  author_comment text,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (event_id, day_number)
);

-- ============================================================
-- participation_records: 参加者の日ごとの参加記録 (「今日やったよ！」)
-- ============================================================
create table participation_records (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  participated_date date not null,
  created_at timestamptz not null default now(),
  unique (participant_id, event_id, day_number)
);

create index participation_records_participant_id_idx on participation_records(participant_id);

-- ============================================================
-- stamp_positions: スタンプカード上の各スタンプの配置 (カードに対する割合で保存)
-- ============================================================
create table stamp_positions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  stamp_id uuid not null references stamps(id) on delete cascade,
  x_pct numeric(6, 3) not null default 0,
  y_pct numeric(6, 3) not null default 0,
  size_pct numeric(6, 3) not null default 10,
  rotation numeric(6, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (event_id, stamp_id)
);

-- ============================================================
-- name_position_config: スタンプカード上のログイン名表示位置・スタイル
-- ============================================================
create table name_position_config (
  event_id uuid primary key references events(id) on delete cascade,
  x_pct numeric(6, 3) not null default 50,
  y_pct numeric(6, 3) not null default 5,
  font_size integer not null default 16,
  color text not null default '#000000'
);

-- ============================================================
-- card_settings: スタンプカードの背景画像などカード全体の設定
-- ============================================================
create table card_settings (
  event_id uuid primary key references events(id) on delete cascade,
  background_image_url text
);

-- ============================================================
-- perfect_attendance_award: 皆勤賞ページの内容
-- ============================================================
create table perfect_attendance_award (
  event_id uuid primary key references events(id) on delete cascade,
  image_url text,
  title text,
  comment text,
  extra_text text
);

-- ============================================================
-- RLS: 全テーブルで有効化。ポリシーは定義しない (= 全ロール拒否)。
-- サーバーは service_role key を使うため、RLSの影響を受けない。
-- ============================================================
alter table events enable row level security;
alter table participants enable row level security;
alter table sessions enable row level security;
alter table stamps enable row level security;
alter table participation_records enable row level security;
alter table stamp_positions enable row level security;
alter table name_position_config enable row level security;
alter table card_settings enable row level security;
alter table perfect_attendance_award enable row level security;
