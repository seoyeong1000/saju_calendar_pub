/**
 * @file page.tsx
 * @description 만세력 입력 페이지
 *
 * 사용자가 만세력 계산에 필요한 정보를 입력하는 페이지입니다.
 */

import { BaziForm } from "@/components/bazi/bazi-form";

export default function BaziPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">만세력 입력</h1>
          <p className="text-muted-foreground mt-2">
            생년월일시와 지역 정보를 입력해주세요
          </p>
        </div>
        <BaziForm />
      </div>
    </main>
  );
}

