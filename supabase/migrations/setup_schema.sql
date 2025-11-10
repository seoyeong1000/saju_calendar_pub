-- Supabase용 통합 패치 스크립트 v1.1.1
-- 목적: 위·경도 CHECK 정정, astro_result.status 제약/기본값, on conflict용 유니크 인덱스, RPC 권한 축소(서비스 롤 전용)
-- 사용 방법: Supabase 콘솔 → SQL Editor → New query → 본문 전체 붙여넣기 → Run

begin;

-- 안전망: 확장
create extension if not exists pgcrypto;

-- ===============================
-- 1) astro_request: 위·경도 CHECK 제약 정리
-- ===============================
alter table if exists public.astro_request
  drop constraint if exists "chk_lon range between -180 and 180",
  drop constraint if exists "chk_lat range between -90 and 90",
  drop constraint if exists chk_lon,
  drop constraint if exists chk_lat;

do $$
begin
    if not exists (
        select 1 from pg_constraint c
        join pg_class t on t.oid = c.conrelid
        join pg_namespace n on n.oid = t.relnamespace
        where n.nspname='public' and t.relname='astro_request' and c.conname='chk_astro_request_lon'
    ) then
        execute 'alter table public.astro_request add constraint chk_astro_request_lon check (lon_deg is null or lon_deg between -180 and 180)';
    end if;

    if not exists (
        select 1 from pg_constraint c
        join pg_class t on t.oid = c.conrelid
        join pg_namespace n on n.oid = t.relnamespace
        where n.nspname='public' and t.relname='astro_request' and c.conname='chk_astro_request_lat'
    ) then
        execute 'alter table public.astro_request add constraint chk_astro_request_lat check (lat_deg is null or lat_deg between -90 and 90)';
    end if;
end $$;

-- ===============================
-- 2) astro_result: status 제약/기본값 정합성
-- ===============================
alter table if exists public.astro_result
  alter column status drop default;

alter table if exists public.astro_result
  drop constraint if exists astro_result_status_check,
  drop constraint if exists status_check,
  drop constraint if exists ck_astro_result_status;

do $$
begin
    if not exists (
        select 1 from pg_constraint c
        join pg_class t on t.oid = c.conrelid
        join pg_namespace n on n.oid = t.relnamespace
        where n.nspname='public' and t.relname='astro_result' and c.conname='ck_astro_result_status'
    ) then
        execute $$alter table public.astro_result
                 add constraint ck_astro_result_status
                 check (status in ('queued','ok','error'))$$;
    end if;
end $$;

alter table if exists public.astro_result
  alter column status set default 'queued';

-- ===============================
-- 3) on conflict(request_id)용 유니크 인덱스
-- ===============================
create unique index if not exists idx_astro_result_request_unique
  on public.astro_result (request_id);

-- ===============================
-- 4) RPC 권한: 클라이언트(authenticated) 차단, 서버(service_role)만 허용
--    함수가 아직 없다면 에러 없이 건너뛰도록 처리
-- ===============================

do $$
begin
    -- api_begin_request(text, text, text, smallint, numeric, numeric, jsonb, jsonb)
    begin
        revoke execute on function public.api_begin_request(text, text, text, smallint, numeric, numeric, jsonb, jsonb) from authenticated;
    exception when undefined_function then
        raise notice 'api_begin_request() not found, skip revoke';
    end;
    begin
        grant execute on function public.api_begin_request(text, text, text, smallint, numeric, numeric, jsonb, jsonb) to service_role;
    exception when undefined_function then
        raise notice 'api_begin_request() not found, skip grant';
    end;

    -- api_result_placeholder(text, uuid, text, text)
    begin
        revoke execute on function public.api_result_placeholder(text, uuid, text, text) from authenticated;
    exception when undefined_function then
        raise notice 'api_result_placeholder() not found, skip revoke';
    end;
    begin
        grant execute on function public.api_result_placeholder(text, uuid, text, text) to service_role;
    exception when undefined_function then
        raise notice 'api_result_placeholder() not found, skip grant';
    end;

    -- api_finish_result(text, uuid, text, text, text, text, text, jsonb, jsonb)
    begin
        revoke execute on function public.api_finish_result(text, uuid, text, text, text, text, text, jsonb, jsonb) from authenticated;
    exception when undefined_function then
        raise notice 'api_finish_result() not found, skip revoke';
    end;
    begin
        grant execute on function public.api_finish_result(text, uuid, text, text, text, text, text, jsonb, jsonb) to service_role;
    exception when undefined_function then
        raise notice 'api_finish_result() not found, skip grant';
    end;

    -- api_add_swe_log(text, uuid, text, text, integer, integer)
    begin
        revoke execute on function public.api_add_swe_log(text, uuid, text, text, integer, integer) from authenticated;
    exception when undefined_function then
        raise notice 'api_add_swe_log() not found, skip revoke';
    end;
    begin
        grant execute on function public.api_add_swe_log(text, uuid, text, text, integer, integer) to service_role;
    exception when undefined_function then
        raise notice 'api_add_swe_log() not found, skip grant';
    end;
end $$;

commit;
