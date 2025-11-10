# 만세력 제작 PRD (v1.1) — 초보자 단계별 가이드 + Git/Supabase 보안 강화

## 0) TL;DR
- 엔진: Swiss Ephemeris + 한국식 보정(절입 월주, 진태양시 시주)
- API: POST /api/bazi (JSON 입/출력 + debug)
- UI: /bazi-test 에서 결과와 디버그 즉시 확인
- 저장: Supabase에 요청/응답/스웨 로그/캐시 저장
- 보안: Clerk↔Supabase 네이티브 통합(RLS), Service Role 키 서버 전용, .env 분리, Git 비밀 관리, n8n Webhook 보호

## 1) 배경 & 비전
- 왜: 사주 서비스와 Vibe Echo 등 다수 프로젝트에서 신뢰 가능한 공용 만세력이 필요.
- 무엇: Swiss Ephemeris 천문 정확도 + 한국식 보정(절입·진태양시) 적용 엔진/API + 로그·캐시 저장 파이프라인.
- 가치: 정확도(절입/진태양시), 재사용성(엔진 스위치), 운영성(로그/리트라이/캐시), 접근성(초보자 절차)

## 2) 범위 (v1.0 → v1.1)
### In-Scope
- 월주: 태양 황경 기반 절입(입춘=315°) 한국식 판정
- 시주: 진태양시(TST) 보정 후 전통 자시(23–01) 경계
- 연/일주: v1은 date-chinese, v1.1에서 Swiss로 통합
- 엔진 스위치: .env.local의 ENGINE=swiss|dateChinese
- API/테스트: /api/bazi(POST), /bazi-test(공개/토큰 옵션)
- 저장: Supabase에 요청/응답/디버그/스웨 로그/캐시
- 보안: Clerk↔Supabase 네이티브 통합, RLS 필수, Git/환경변수/키 관리

### Out-of-Scope
- 음력/윤달 자동 파싱, 지명→좌표 DB, 고급 소행성 리포트, 요금제/다국어 UI

## 3) 사용자 & 유즈케이스
- 내부 운영자: 벤치마크 검증/데이터 적재
- 개발 팀: API 재사용(웹/배치/n8n)
- 플로우: 입력 → /api/bazi → JSON → /bazi-test 검증 → n8n/DB 운영

## 4) 기능 요구사항
### F-1. 입력(JSON)
```json
{
  "localISO": "YYYY-MM-DDTHH:mm[:ss]",
  "tzid": "Asia/Seoul",
  "tzMinutes": 540,
  "lon": 126.9780,
  "lat": 37.5665,
  "options": {
    "useTrueSolarTime": true,
    "zishiSplit": "traditional",
    "asteroids": { "chiron": true, "ceres": false }
  }
}
```

### F-2. 출력(JSON)
```json
{
  "yearPillar": "간지",
  "monthPillar": "간지",
  "dayPillar": "간지",
  "hourPillar": "간지",
  "meta": {
    "engine": "swissEph | dateChinese",
    "note": "월지=태양황경(절기), 시주=진태양시(경도+EoT)",
    "debug": {
      "tzid": "Asia/Seoul",
      "tzOffsetMin": 540,
      "lon": 126.978,
      "localWallISO": "...",
      "tstLocal": "...",
      "sweCmd": "swetest 호출 문자열",
      "sweOut": "스니펫",
      "longOnlyMin": -32.1,
      "eotMin": -1.3
    }
  }
}
```

### F-3. 월주(월지/월간)
- 월지: 태양 황경 λ☉ → 30° 구간 매핑(입춘 315° = 寅월 시작)  
  예: [315°,345°)=寅, [345°,15°)=卯, [15°,45°)=辰 …
- 월간: 연간별 寅월 천간 시작표에서 시작 → 월지 오프셋만큼 순환

### F-4. 시주(진태양시)
- TST = 표준시 + 4분×(경도−표준자오선) − EoT
- 경계: 전통 자시(23–01)
- 서울(126.98E) vs 부산(129.08E) +8~9분 차 → 경계 부근 변동 유의

### F-5. 소행성 옵션
- Ceres, Pallas, Juno, Vesta, Chiron 토글(메타 기록). v1.1+에서 좌표 리포트

### F-6. API
- POST /api/bazi (상기 스키마)  
- 에러: 400(JSON), 422(유효성), 500(천문계산) — meta.debug 포함

### F-7. 테스트 페이지
- /bazi-test : 최소 필드(날짜시각, tzid, lon)로 실행, 결과+debug 표출  
- 옵션: 공개/토큰 보호

### F-8. n8n Webhook(선택)
- POST https://<n8n>/webhook/bazi : 동일 스키마 → 결과 그대로 응답  
- 필요 시 Next.js → n8n 프록시

## 5) 비기능 요구사항(NFR)
- 정확도: 샘플 50건 기준 월주/시주 ≥98% 일치(경계 포함)
- 성능: 단건 <300ms(로컬), 배치 5천건/시간
- 안정성: swetest 실패 리트라이 2회 + 에러로그
- 운영: 요청/결과/명령 스니펫 저장, 재현 가능
- 보안: 본문 9장 보안 준수

## 6) 시스템 개요
- Next.js(App Router): /api/bazi, /bazi-test
- Swiss Eph: C:\sweph\bin\swetest64.exe + C:\sweph\ephe
- Supabase: 로그·캐시·사용자
- n8n: 배치·리트라이·일괄 적재
- 엔진 스위치: .env.local → ENGINE=swiss|dateChinese

## 7) 환경 & 설치(체크리스트)
### 7-1. Swiss Eph 확인 (PowerShell)
```
& "C:\sweph\bin\swetest64.exe" -h
& "C:\sweph\bin\swetest64.exe" -edirC:\sweph\ephe -b01.02.2024 -ut15:00 -p0 -fl -g,
```
### 7-2. .env.local
```
ENGINE=swiss
SWE_EXE=C:\sweph\bin\swetest64.exe
SE_EPHE_PATH=C:\sweph\ephe
```
### 7-3. 개발 서버
```
pnpm i
pnpm dev
# http://localhost:3000/bazi-test
```

## 8) 데이터 모델(개요)
- users (Clerk sub)
- astro_request (입력/트레이스/소요시간)
- astro_result (pillars/meta/debug)
- astro_swe_log (swetest 커맨드/출력/exit code)
- astro_cache_sunlon (UTC→태양황경)

## 9) 보안·컴플라이언스
### 9-1. Git 보안
- 저장소: Private, 2FA, main 브랜치 보호(직접 push 금지, PR 필수)
- SSH 키 등록(Windows): ssh-agent 시작 → ssh-keygen(ed25519) → 공개키를 GitHub에 등록
- .gitignore에 .env* / .next / node_modules 등 추가
- .env.local은 절대 커밋 금지, .env.example만 커밋
- 유출 시 즉시 키 회전(Clerk/Supabase)

### 9-2. Supabase 보안
- Clerk 네이티브 통합(JWKS, Issuer 등록). JWT 템플릿 불필요
- 키 관리: ANON은 클라 가능, SERVICE_ROLE은 **서버 전용**
- 전 테이블 RLS 활성화 + 정책: owner_id=auth.jwt()->>'sub'
- 스토리지 정책: 내 파일만 접근 가능하도록 경로/매핑 설계
- PII 최소화, 좌표 정밀도 축약, 필요 시 pgsodium/pgcrypto 고려

### 9-3. Next.js 보안
- Supabase 클라이언트 **분리**(client/server/service-role)
- /bazi-test는 공개 또는 토큰/로그인 보호 전환
- 공개 API면 Rate Limit/CORS 설정

### 9-4. n8n 보안
- Webhook 경로에 secret 포함 또는 BasicAuth/Header 토큰 검증
- N8N_ENCRYPTION_KEY 설정
- 로그에서 민감값 마스킹

## 10) 벤치마크(샘플)
A: 2024-02-01T00:00:00, Asia/Seoul, 126.98E → 월주 乙丑 / (경계 아니면) 子  
B: 2024-02-04T12:00:00, Asia/Seoul, 126.98E → 乙寅 / 午  
C: 1974-06-07T01:40:00, Asia/Seoul → 경계 진단  
D: A와 동일, 부산 129.08E → 월주 동일, 時支 차이 가능

## 11) 운영/모니터링
- 실패 시 swetest 커맨드/출력 저장 → 재현 가능
- n8n: 리트라이 2회, 장기 실패 DLQ
- 캐시 hit-rate ≥80%, 배치 초당 2~5건

## 12) 로드맵
M1(D+2) API 가동, M2(D+5) 스키마+RLS+회귀, M3(D+8) 배치 5천건/시간, M4(D+10) Swiss 통합/소행성 v1.1

## 13) 리스크 & 대응
- ephe 누락: 설치 체크 + 부트 진단 API
- UTC/파싱 오차: tzMinutes 옵션, debug 상시 노출
- 경계 민감도: useTrueSolarTime 토글/로그, 회귀셋 분리
- Secret 유출: 키 회전 절차 문서화

## 14) 라이선스/법적
- Swiss Eph 규정 준수(상업 사용 재확인)
- PII 최소 수집/보존기간 명시/암호화 고려

## 15) DoD
- 50건 월주/시주 ≥98% 일치, /bazi-test에서 meta.debug 근거 확인
- Supabase 로그로 실패 재현 가능
- RLS 전면 적용, Service Role 키 서버 전용
- n8n 배치 5천건/시간 통과
