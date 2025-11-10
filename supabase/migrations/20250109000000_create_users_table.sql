-- Users 테이블 생성
-- Clerk 사용자와 동기화되는 사용자 정보를 저장

-- 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 비활성화 (개발 환경)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 인덱스 생성 (clerk_id로 자주 조회)
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE public.users IS 'Clerk 사용자와 동기화되는 사용자 정보';
COMMENT ON COLUMN public.users.clerk_id IS 'Clerk User ID (고유 식별자)';
COMMENT ON COLUMN public.users.name IS '사용자 표시 이름';

