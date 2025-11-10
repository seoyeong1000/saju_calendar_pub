/**
 * @file page.tsx
 * @description 프로필 확인 페이지
 *
 * 사용자가 입력한 정보를 확인하고, 시간 보정 정보를 표시합니다.
 */

import { BaziConfirm } from "@/components/bazi/bazi-confirm";

interface PageProps {
  searchParams: Promise<{
    name?: string;
    gender?: string;
    calendarType?: string;
    birthDate?: string;
    birthTime?: string;
    timeUnknown?: string;
    lateNightEarlyMorning?: string;
    city?: string;
    cityFullName?: string;
    lon?: string;
    lat?: string;
    requestId?: string;
  }>;
}

export default async function BaziConfirmPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // 필수 파라미터 검증
  if (
    !params.name ||
    !params.gender ||
    !params.calendarType ||
    !params.birthDate ||
    !params.city ||
    !params.cityFullName ||
    !params.lon ||
    !params.lat ||
    !params.requestId
  ) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">오류</h1>
          <p className="text-muted-foreground">
            필수 정보가 누락되었습니다. 다시 입력해주세요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <BaziConfirm
        name={params.name}
        gender={params.gender as "female" | "male"}
        calendarType={params.calendarType as "solar" | "lunar"}
        birthDate={params.birthDate}
        birthTime={params.birthTime || ""}
        timeUnknown={params.timeUnknown === "true"}
        lateNightEarlyMorning={params.lateNightEarlyMorning === "true"}
        city={params.city}
        cityFullName={params.cityFullName}
        lon={parseFloat(params.lon)}
        lat={parseFloat(params.lat)}
        requestId={params.requestId}
      />
    </main>
  );
}

