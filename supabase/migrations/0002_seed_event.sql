-- 7日間イベントのデフォルト設定を1件だけ投入する (既にイベントが存在する場合は何もしない)
-- 開始日・終了日は暫定値。将来の管理画面 (Phase 8以降) から変更できるようにする想定。

insert into events (name, description, start_date, end_date, num_days)
select
  'ラジオ体操スタンプラリー',
  '7日間毎日ラジオ体操をしてスタンプを集めよう',
  date '2026-08-10',
  date '2026-08-16',
  7
where not exists (select 1 from events);
