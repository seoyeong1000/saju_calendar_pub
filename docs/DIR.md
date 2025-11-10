# 프로젝트 디렉토리 구조

이 문서는 프로젝트의 디렉토리 구조와 각 파일의 역할을 설명합니다.

## 전체 구조

```
nextjs-supabase-boilerplate-main/
├── app/                    # Next.js App Router (라우팅 전용)
│   ├── api/               # API Routes
│   │   ├── bazi/          # 만세력 계산 API
│   │   ├── users/         # 사용자 관련 API
│   │   └── sync-user/     # 사용자 동기화 (레거시)
│   ├── auth-test/         # 인증 테스트 페이지
│   ├── bazi-test/         # 만세력 계산 테스트 페이지
│   ├── storage-test/      # 스토리지 테스트 페이지
│   ├── layout.tsx         # Root Layout (ClerkProvider + SyncUserProvider)
│   ├── page.tsx           # 홈페이지
│   └── globals.css        # 전역 스타일 (Tailwind CSS v4 설정)
│
├── components/             # React 컴포넌트
│   ├── ui/                # shadcn/ui 컴포넌트 (자동 생성, 수정 금지)
│   │   ├── accordion.tsx
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   ├── providers/         # React Context 프로바이더
│   │   └── sync-user-provider.tsx  # Clerk → Supabase 사용자 자동 동기화
│   └── Navbar.tsx         # 네비게이션 바 컴포넌트
│
├── lib/                    # 유틸리티 함수 및 클라이언트 설정
│   ├── supabase/          # Supabase 클라이언트들 (환경별로 분리)
│   │   ├── clerk-client.ts    # Client Component용 (useClerkSupabaseClient)
│   │   ├── server.ts           # Server Component/Server Action용
│   │   ├── service-role.ts     # 관리자 권한용 (RLS 우회)
│   │   ├── client.ts           # 공개 데이터용 (anon key만 사용)
│   │   └── env.server.ts       # 서버 환경 변수 유틸리티
│   ├── supabase-admin.ts  # 관리자 클라이언트 (레거시, 사용 지양)
│   ├── supabase.ts        # 레거시 Supabase 클라이언트 (사용 지양)
│   └── utils.ts           # 공통 유틸리티 (cn 함수 등)
│
├── hooks/                  # 커스텀 React Hook들
│   └── use-sync-user.ts   # Clerk 사용자를 Supabase에 동기화하는 훅
│
├── engine/                 # 만세력 계산 엔진
│   ├── index.ts           # 엔진 팩토리 (ENGINE 환경 변수로 선택)
│   ├── engine.swiss.ts    # Swiss Ephemeris 기반 엔진
│   ├── engine.date.ts     # date-chinese 기반 엔진
│   └── engine.types.ts    # 엔진 타입 정의
│
├── supabase/              # 데이터베이스 마이그레이션 및 설정
│   ├── migrations/        # SQL 마이그레이션 파일들
│   │   ├── 20250109000000_create_users_table.sql
│   │   ├── setup_schema.sql
│   │   └── setup_storage.sql
│   └── config.toml        # Supabase 프로젝트 설정
│
├── docs/                  # 프로젝트 문서
│   ├── DIR.md            # 이 파일 (디렉토리 구조 설명)
│   ├── PRD.md            # 제품 요구사항 문서
│   ├── TODO.md           # 작업 체크리스트
│   └── mermaid.md        # 다이어그램 문서
│
├── scripts/               # 빌드/개발 스크립트
│   └── check-env.mjs      # 환경 변수 검증 스크립트
│
├── public/                # 정적 파일
│   ├── icons/             # PWA 아이콘들
│   ├── logo.png
│   └── og-image.png
│
├── middleware.ts          # Next.js 미들웨어 (Clerk 인증 라우트 보호)
├── components.json        # shadcn/ui 설정
├── tsconfig.json          # TypeScript 설정
├── next.config.ts         # Next.js 설정
├── postcss.config.mjs     # PostCSS 설정
├── eslint.config.mjs      # ESLint 설정
├── package.json           # 프로젝트 의존성 및 스크립트
├── AGENTS.md              # AI 에이전트용 프로젝트 가이드
├── README.md              # 프로젝트 소개 및 시작 가이드
└── CLAUDE.md              # Claude Code를 위한 프로젝트 가이드
```

## 주요 디렉토리 상세 설명

### `app/` - Next.js App Router

Next.js 15의 App Router를 사용하는 라우팅 디렉토리입니다. 이 디렉토리에는 **라우팅 관련 파일만** 포함됩니다.

**규칙**: 비즈니스 로직이나 재사용 가능한 컴포넌트는 `app/` 외부에 저장합니다.

#### `app/api/` - API Routes

- **`bazi/`**: 만세력 계산 API
  - `route.ts`: POST 요청으로 만세력 계산 요청을 받아 Supabase에 저장
  - `finish/route.ts`: 계산 완료 처리
- **`users/sync/`**: Clerk → Supabase 사용자 동기화 API
- **`sync-user/`**: 레거시 동기화 엔드포인트 (사용 지양)

#### 테스트 페이지

- **`auth-test/`**: Clerk + Supabase 인증 통합 테스트
- **`bazi-test/`**: 만세력 계산 결과 및 디버그 정보 확인
- **`storage-test/`**: Supabase Storage 업로드 테스트

#### 루트 파일

- **`layout.tsx`**:
  - `ClerkProvider`로 Clerk 인증 설정 (한국어 로컬라이제이션)
  - `SyncUserProvider`로 사용자 자동 동기화
  - `Navbar` 컴포넌트 포함
- **`page.tsx`**: 홈페이지
- **`globals.css`**: Tailwind CSS v4 설정 (다크/라이트 모드 포함)

### `components/` - React 컴포넌트

재사용 가능한 React 컴포넌트를 저장합니다.

#### `components/ui/` - shadcn/ui 컴포넌트

shadcn/ui CLI로 자동 생성된 컴포넌트들입니다. **직접 수정하지 마세요.** 필요시 `pnpx shadcn@latest add [component-name]`로 재생성합니다.

#### `components/providers/` - Context Providers

- **`sync-user-provider.tsx`**:
  - Clerk 사용자가 로그인하면 자동으로 Supabase `users` 테이블에 동기화
  - `app/layout.tsx`에서 루트 레벨에 적용

#### 기타 컴포넌트

- **`Navbar.tsx`**: 네비게이션 바 (로그인/로그아웃 버튼 포함)

### `lib/` - 유틸리티 및 클라이언트

공통 유틸리티 함수와 외부 서비스 클라이언트를 저장합니다.

#### `lib/supabase/` - Supabase 클라이언트 (환경별 분리)

**중요**: 각 파일은 사용 환경에 따라 다르게 동작합니다.

- **`clerk-client.ts`**:

  - Client Component용
  - `useClerkSupabaseClient()` 훅 제공
  - Clerk 세션 토큰으로 인증된 사용자의 데이터 접근
  - RLS 정책이 `auth.jwt()->>'sub'`로 Clerk user ID 확인

- **`server.ts`**:

  - Server Component / Server Action용
  - `createClerkSupabaseClient()` 함수 제공
  - 서버 사이드에서 Clerk 인증 사용

- **`service-role.ts`**:

  - 관리자 권한 작업용
  - `SUPABASE_SERVICE_ROLE_KEY` 사용
  - RLS 우회, 서버 사이드 전용
  - **절대 클라이언트에서 사용하지 마세요**

- **`client.ts`**:

  - 인증 불필요한 공개 데이터용
  - anon key만 사용
  - RLS 정책이 `to anon`인 데이터만 접근 가능

- **`env.server.ts`**:
  - 서버 환경 변수 유틸리티
  - 타입 안전한 환경 변수 접근

#### 기타 파일

- **`supabase-admin.ts`**: 레거시 관리자 클라이언트 (사용 지양, `lib/supabase/service-role.ts` 사용 권장)
- **`supabase.ts`**: 레거시 Supabase 클라이언트 (사용 지양)
- **`utils.ts`**:
  - `cn()` 함수: Tailwind 클래스 병합 유틸리티
  - 기타 공통 유틸리티 함수

### `hooks/` - 커스텀 React Hooks

재사용 가능한 React Hook들을 저장합니다.

- **`use-sync-user.ts`**:
  - Clerk 사용자를 Supabase에 동기화하는 로직
  - `SyncUserProvider`에서 내부적으로 사용

### `engine/` - 만세력 계산 엔진

만세력(사주) 계산을 위한 엔진 모듈입니다.

- **`index.ts`**:

  - 엔진 팩토리 함수
  - `ENGINE` 환경 변수로 엔진 선택 (`swissEph` 또는 `dateChinese`)
  - 기본값: `swissEph`

- **`engine.swiss.ts`**:

  - Swiss Ephemeris 기반 엔진
  - 천문 정확도 높음
  - 절입 월주, 진태양시 시주 보정 지원

- **`engine.date.ts`**:

  - `date-chinese` 라이브러리 기반 엔진
  - 빠른 계산 속도
  - 기본적인 만세력 계산

- **`engine.types.ts`**:
  - 엔진 인터페이스 및 타입 정의
  - `Engine` 인터페이스

### `supabase/` - 데이터베이스

Supabase 관련 파일들을 저장합니다.

#### `supabase/migrations/` - SQL 마이그레이션

데이터베이스 스키마 변경을 관리하는 SQL 파일들입니다.

**명명 규칙**: `YYYYMMDDHHmmss_description.sql`

- **`20250109000000_create_users_table.sql`**:

  - `users` 테이블 생성
  - Clerk 사용자와 동기화되는 사용자 정보

- **`setup_schema.sql`**:

  - 만세력 관련 테이블 스키마
  - `astro_request`, `astro_result`, `astro_swe_log`, `astro_cache_sunlon` 등

- **`setup_storage.sql`**:
  - Storage 버킷 및 RLS 정책 설정
  - `uploads` 버킷 생성

#### `supabase/config.toml`

Supabase 프로젝트 설정 파일 (로컬 개발용)

### `docs/` - 프로젝트 문서

프로젝트 관련 문서들을 저장합니다.

- **`DIR.md`**: 이 파일 (디렉토리 구조 설명)
- **`PRD.md`**: 제품 요구사항 문서 (만세력 제작 PRD)
- **`TODO.md`**: 작업 체크리스트
- **`mermaid.md`**: 다이어그램 문서

### `scripts/` - 스크립트

빌드 및 개발에 사용되는 스크립트들입니다.

- **`check-env.mjs`**:
  - 환경 변수 검증
  - `predev`, `prebuild` 훅에서 자동 실행
  - 필수 환경 변수 누락 시 빌드 중단

### `public/` - 정적 파일

브라우저에서 직접 접근 가능한 정적 파일들입니다.

- **`icons/`**: PWA 아이콘들 (192x192, 256x256, 384x384, 512x512)
- **`logo.png`**: 프로젝트 로고
- **`og-image.png`**: Open Graph 이미지

## 주요 파일 간의 관계

### 인증 흐름

```
app/layout.tsx
  └── SyncUserProvider (components/providers/sync-user-provider.tsx)
      └── use-sync-user.ts (hooks/)
          └── /api/users/sync (app/api/users/sync/route.ts)
              └── lib/supabase/service-role.ts (관리자 권한으로 사용자 생성)
```

### 만세력 계산 흐름

```
app/api/bazi/route.ts
  └── engine/index.ts
      ├── engine.swiss.ts (ENGINE=swissEph)
      └── engine.date.ts (ENGINE=dateChinese)
```

### Supabase 클라이언트 사용

```
Client Component:
  └── lib/supabase/clerk-client.ts (useClerkSupabaseClient)

Server Component/Action:
  └── lib/supabase/server.ts (createClerkSupabaseClient)

관리자 작업:
  └── lib/supabase/service-role.ts (createServiceRoleClient)
```

## 디렉토리 컨벤션

프로젝트 파일은 `app` 외부에 저장하는 것을 원칙으로 합니다:

- **`app/`**: 라우팅 전용 (page.tsx, layout.tsx, route.ts 등만)
- **`components/`**: 재사용 가능한 컴포넌트
- **`lib/`**: 유틸리티 함수 및 클라이언트 설정
- **`hooks/`**: 커스텀 React Hook들
- **`actions/`**: Server Actions (예정, API 대신 우선 사용)
- **`types/`**: TypeScript 타입 정의 (예정)
- **`constants/`**: 상수 값들 (예정)
- **`states/`**: 전역 상태 (jotai 사용, 최소화, 예정)

## 네이밍 컨벤션

- **파일명**: kebab-case (예: `use-sync-user.ts`, `sync-user-provider.tsx`)
- **컴포넌트**: PascalCase (파일명은 여전히 kebab-case)
- **함수/변수**: camelCase
- **타입/인터페이스**: PascalCase

자세한 내용은 [AGENTS.md](../AGENTS.md)의 "Directory Convention" 섹션을 참고하세요.
