-- astro_request 테이블 생성
-- 만세력 계산 요청 로그를 저장하는 테이블

BEGIN;

-- 테이블 생성
CREATE TABLE IF NOT EXISTS public.astro_request (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_iso TEXT NOT NULL,
  tzid TEXT,
  tz_offset_min SMALLINT,
  lon NUMERIC,
  lat NUMERIC,
  options_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 위경도 범위 CHECK 제약
ALTER TABLE public.astro_request
  ADD CONSTRAINT chk_astro_request_lon 
  CHECK (lon IS NULL OR (lon >= -180 AND lon <= 180));

ALTER TABLE public.astro_request
  ADD CONSTRAINT chk_astro_request_lat 
  CHECK (lat IS NULL OR (lat >= -90 AND lat <= 90));

-- RLS 비활성화 (개발 환경)
ALTER TABLE public.astro_request DISABLE ROW LEVEL SECURITY;

-- 인덱스 생성 (created_at으로 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_astro_request_created_at 
  ON public.astro_request(created_at DESC);

-- 코멘트 추가
COMMENT ON TABLE public.astro_request IS '만세력 계산 요청 로그';
COMMENT ON COLUMN public.astro_request.request_id IS '요청 고유 ID';
COMMENT ON COLUMN public.astro_request.local_iso IS '입력 날짜시각 (ISO 형식)';
COMMENT ON COLUMN public.astro_request.tzid IS '타임존 ID (예: Asia/Seoul)';
COMMENT ON COLUMN public.astro_request.tz_offset_min IS '타임존 오프셋 (분 단위)';
COMMENT ON COLUMN public.astro_request.lon IS '경도 (-180 ~ 180)';
COMMENT ON COLUMN public.astro_request.lat IS '위도 (-90 ~ 90)';
COMMENT ON COLUMN public.astro_request.options_json IS '추가 옵션 (JSON)';

COMMIT;

