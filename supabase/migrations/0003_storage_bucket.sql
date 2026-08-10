-- スタンプ画像用の公開Storageバケットを作成する
-- public: true のため、書き込みはservice role経由のみ行い、
-- 読み取りは署名なしの公開URLで誰でもアクセスできる (画像自体に機密性はないため)

insert into storage.buckets (id, name, public)
values ('stamp-images', 'stamp-images', true)
on conflict (id) do nothing;
