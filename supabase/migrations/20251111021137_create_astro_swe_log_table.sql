-- astro_swe_log 테이블 생성
-- Swiss Ephemeris 실행 로그를 저장하는 테이블

BEGIN;

-- 테이블 생성
CREATE TABLE IF NOT EXISTS public.astro_swe_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  cmd TEXT,
  stdout TEXT,
  stderr TEXT,
  exit_code INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- request_id 인덱스 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_astro_swe_log_request_id
  ON public.astro_swe_log(request_id);

-- RLS 비활성화 (개발 환경)
ALTER TABLE public.astro_swe_log DISABLE ROW LEVEL SECURITY;

-- 코멘트 추가
COMMENT ON TABLE public.astro_swe_log IS 'Swiss Ephemeris 실행 로그';
COMMENT ON COLUMN public.astro_swe_log.log_id IS '로그 고유 ID';
COMMENT ON COLUMN public.astro_swe_log.request_id IS '요청 ID (astro_request 참조)';
COMMENT ON COLUMN public.astro_swe_log.cmd IS 'swetest 명령어';
COMMENT ON COLUMN public.astro_swe_log.stdout IS '표준 출력';
COMMENT ON COLUMN public.astro_swe_log.stderr IS '표준 에러';
COMMENT ON COLUMN public.astro_swe_log.exit_code IS '종료 코드';

COMMIT;

