-- astro_result 테이블 생성
-- 만세력 계산 결과를 저장하는 테이블

BEGIN;

-- 테이블 생성
CREATE TABLE IF NOT EXISTS public.astro_result (
  result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  year_pillar TEXT,
  month_pillar TEXT,
  day_pillar TEXT,
  hour_pillar TEXT,
  result_json JSONB DEFAULT '{}'::jsonb,
  log_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- status 제약: queued, ok, error만 허용
ALTER TABLE public.astro_result
  ADD CONSTRAINT ck_astro_result_status 
  CHECK (status IN ('queued', 'ok', 'error'));

-- UNIQUE 인덱스 (request_id는 하나의 결과만 가짐)
CREATE UNIQUE INDEX IF NOT EXISTS idx_astro_result_request_unique
  ON public.astro_result (request_id);

-- RLS 비활성화 (개발 환경)
ALTER TABLE public.astro_result DISABLE ROW LEVEL SECURITY;

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_astro_result_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_astro_result_updated_at 
  BEFORE UPDATE ON public.astro_result
  FOR EACH ROW
  EXECUTE FUNCTION update_astro_result_updated_at();

-- 코멘트 추가
COMMENT ON TABLE public.astro_result IS '만세력 계산 결과';
COMMENT ON COLUMN public.astro_result.result_id IS '결과 고유 ID';
COMMENT ON COLUMN public.astro_result.request_id IS '요청 ID (astro_request 참조)';
COMMENT ON COLUMN public.astro_result.status IS '상태: queued, ok, error';
COMMENT ON COLUMN public.astro_result.year_pillar IS '연주 (간지)';
COMMENT ON COLUMN public.astro_result.month_pillar IS '월주 (간지)';
COMMENT ON COLUMN public.astro_result.day_pillar IS '일주 (간지)';
COMMENT ON COLUMN public.astro_result.hour_pillar IS '시주 (간지)';
COMMENT ON COLUMN public.astro_result.result_json IS '전체 결과 데이터 (JSON)';
COMMENT ON COLUMN public.astro_result.log_json IS '디버그 로그 (JSON)';

COMMIT;

