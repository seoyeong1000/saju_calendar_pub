flowchart TD
  %% =========================================
  %% 만세력 시스템 한눈에(유저플로우 + 엔진 + 보안 + DB)
  %% =========================================

  %% ---------- Client ----------
  subgraph Client["Client (Browser)"]
    U[사용자]
    UI[/bazi-test 입력 폼<br/>localISO, tzid, tzMinutes, lon, lat/]
    U --> UI
  end

  %% ---------- Next.js Server ----------
  subgraph NextJS["Next.js App Router (Server)"]
    API["POST <code>/api/bazi</code><br/><code>route.ts</code><br/>- Zod 입력검증<br/>- swetest execFile 호출<br/>- pillars + meta.debug 생성"]
    LOGIC["KR 보정 로직(핵심)<br/>• 월주: 태양황경 30° 구간(입춘 315° 시작)<br/>• 시주: 진태양시 TST = 표준시 + 4분×Δ경도 − EoT<br/>• 자시 경계: 23:00–01:00(전통)"]
    API --> LOGIC
  end

  %% ---------- Swiss Ephemeris ----------
  subgraph Swiss["Swiss Ephemeris (Local CLI)"]
    SWE["swetest64.exe"]
    EPHE["ephe 데이터 폴더<br/>C:\\saju-calendar\\ephe"]
    SWE --> EPHE
  end

  %% ---------- Auth ----------
  subgraph Auth["Auth"]
    Clerk["Clerk (JWT 발급)"]
  end

  %% ---------- Supabase ----------
  subgraph Supabase["Supabase (Postgres + RLS)"]
    direction TB

    USERS["**users**<br/>id uuid PK<br/>owner_id text unique<br/>created_at timestamptz"]

    AREQ["**astro_request**<br/>id uuid PK<br/>owner_id text<br/>created_at timestamptz<br/>req_json jsonb<br/>tzid text<br/>lon float8, lat float8<br/>elapsed_ms int"]

    ARES["**astro_result**<br/>id uuid PK<br/>owner_id text<br/>created_at timestamptz<br/>year_pillar text<br/>month_pillar text<br/>day_pillar text<br/>hour_pillar text<br/>meta jsonb"]

    ASWE["**astro_swe_log**<br/>id uuid PK<br/>owner_id text<br/>created_at timestamptz<br/>cmd text<br/>stdout text<br/>stderr text<br/>exit_code int"]

    ACACHE["**astro_cache_sunlon**<br/>ut_min bigint PK<br/>lon_deg float8<br/>created_at timestamptz<br/>(공유 캐시: 보통 RLS 미적용)"]

    USERS -->|"1 : N (owner_id)"| AREQ
    USERS -->|"1 : N (owner_id)"| ARES
    USERS -->|"1 : N (owner_id)"| ASWE
  end

  %% ---------- 유저 요청 흐름 ----------
  UI -->|"JSON POST"| API
  API -->|"execFile(SWE_EXE, -edir ephe …)"| SWE
  SWE -->|"stdout: 태양 황경 등"| API

  %% ---------- 로깅/저장(서버 전용 키) ----------
  API -->|"Service Role로 INSERT"| AREQ
  API -->|"Service Role로 INSERT"| ARES
  API -->|"Service Role로 INSERT"| ASWE

  %% ---------- 응답 ----------
  API -->|"200 {pillars, meta.debug}"| UI

  %% ---------- 보안/JWT/RLS ----------
  UI -->|"로그인 후 JWT"| Clerk
  Clerk -->|"Issuer/JWKS 등록"| Supabase
  Supabase -->|"RLS: owner_id = jwt.sub"| AREQ
  Supabase -->|"RLS: owner_id = jwt.sub"| ARES
  Supabase -->|"RLS: owner_id = jwt.sub"| ASWE
