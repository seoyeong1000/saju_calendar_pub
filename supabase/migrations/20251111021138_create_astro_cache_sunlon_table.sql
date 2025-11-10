-- astro_cache_sunlon 테이블 생성
-- 태양 황경 캐시 테이블 (UTC 시간 기준)

BEGIN;

-- 테이블 생성
CREATE TABLE IF NOT EXISTS public.astro_cache_sunlon (
  ut_min BIGINT PRIMARY KEY,
  lon_deg NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 비활성화 (개발 환경, 공유 캐시)
ALTER TABLE public.astro_cache_sunlon DISABLE ROW LEVEL SECURITY;

-- 코멘트 추가
COMMENT ON TABLE public.astro_cache_sunlon IS '태양 황경 캐시 (UTC 분 단위 타임스탬프 기준)';
COMMENT ON COLUMN public.astro_cache_sunlon.ut_min IS 'UTC 분 단위 타임스탬프 (PRIMARY KEY)';
COMMENT ON COLUMN public.astro_cache_sunlon.lon_deg IS '태양 황경 (도)';
COMMENT ON COLUMN public.astro_cache_sunlon.created_at IS '캐시 생성 시각';

COMMIT;

