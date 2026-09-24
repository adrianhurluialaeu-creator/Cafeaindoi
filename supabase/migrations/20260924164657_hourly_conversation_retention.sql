create extension if not exists pg_cron;

select cron.schedule(
  'cafeaindoi-purge-expired-conversations-hourly',
  '17 * * * *',
  $$ select public.purge_expired_conversations(); $$
);
