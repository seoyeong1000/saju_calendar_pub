/**
 * @file bazi-form.tsx
 * @description 만세력 입력 폼 컴포넌트
 *
 * 사용자가 만세력 계산에 필요한 정보를 입력하는 폼입니다.
 * 이름, 성별, 생년월일시, 도시를 입력받습니다.
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CitySearch } from "@/components/bazi/city-search";
import {
  baziFormSchema,
  type BaziFormData,
  transformFormDataToApiRequest,
} from "@/lib/bazi/form-schema";
import { type CityInfo, getDefaultCity } from "@/lib/bazi/city-coordinates";

interface BaziFormProps {
  onSubmit?: (data: BaziFormData, coordinates: CityInfo) => void;
}

export function BaziForm({ onSubmit }: BaziFormProps) {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = React.useState<CityInfo>(getDefaultCity());
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<BaziFormData>({
    resolver: zodResolver(baziFormSchema),
    defaultValues: {
      name: "",
      gender: undefined,
      calendarType: "solar",
      birthDate: "",
      birthTime: "",
      timeUnknown: false,
      lateNightEarlyMorning: false,
      city: "",
    },
  });

  const handleCitySelect = (city: CityInfo) => {
    setSelectedCity(city);
    form.setValue("city", city.name);
  };

  const handleSubmit = async (data: BaziFormData) => {
    console.group("만세력 입력 폼 제출");
    console.log("입력 데이터:", data);
    console.log("선택된 도시:", selectedCity);

    setIsSubmitting(true);

    try {
      // 폼 데이터를 API 요청 형식으로 변환
      const apiRequest = transformFormDataToApiRequest(data, {
        lon: selectedCity.lon,
        lat: selectedCity.lat,
      });

      console.log("API 요청 데이터:", apiRequest);

      // API 호출
      const response = await fetch("/api/bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiRequest),
      });

      const result = await response.json();
      console.log("API 응답:", result);

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "API 호출 실패");
      }

      // 프로필 확인 페이지로 이동 (입력 데이터 전달)
      const params = new URLSearchParams({
        name: data.name,
        gender: data.gender,
        calendarType: data.calendarType,
        birthDate: data.birthDate,
        birthTime: data.birthTime || "",
        timeUnknown: data.timeUnknown ? "true" : "false",
        lateNightEarlyMorning: data.lateNightEarlyMorning ? "true" : "false",
        city: selectedCity.name,
        cityFullName: selectedCity.fullName,
        lon: selectedCity.lon.toString(),
        lat: selectedCity.lat.toString(),
        requestId: result.request_id,
      });

      router.push(`/bazi/confirm?${params.toString()}`);

      // onSubmit 콜백 호출
      if (onSubmit) {
        onSubmit(data, selectedCity);
      }
    } catch (error) {
      console.error("만세력 계산 요청 실패:", error);
      alert(`오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 이름 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input
                  placeholder="최대 12글자 이내로 입력하세요"
                  maxLength={12}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 성별 */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>성별</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <label htmlFor="female" className="cursor-pointer">
                      여자
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <label htmlFor="male" className="cursor-pointer">
                      남자
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 생년월일시 */}
        <div className="space-y-4">
          <FormLabel>생년월일시</FormLabel>

          {/* 달력 종류 */}
          <FormField
            control={form.control}
            name="calendarType"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="달력 종류 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="solar">양력</SelectItem>
                    <SelectItem value="lunar" disabled>
                      음력 (준비 중)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 날짜 */}
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="YYYY/MM/DD"
                    {...field}
                    onChange={(e) => {
                      // 입력 형식 자동 변환
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length >= 4) {
                        value = `${value.slice(0, 4)}/${value.slice(4, 6)}/${value.slice(6, 8)}`;
                      } else if (value.length >= 6) {
                        value = `${value.slice(0, 4)}/${value.slice(4, 6)}`;
                      }
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 시간 */}
          <FormField
            control={form.control}
            name="birthTime"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="HH:MM"
                    {...field}
                    onChange={(e) => {
                      // 입력 형식 자동 변환
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length >= 2) {
                        value = `${value.slice(0, 2)}:${value.slice(2, 4)}`;
                      }
                      field.onChange(value);
                    }}
                    disabled={form.watch("timeUnknown")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 시간 옵션 */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="timeUnknown"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">시간 모름</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lateNightEarlyMorning"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <div className="flex items-center gap-1">
                    <FormLabel className="!mt-0 cursor-pointer">야자시/조자시</FormLabel>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* 12간지 시간표 안내 */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>12간지 시간표</span>
            <HelpCircle className="h-4 w-4" />
          </div>
        </div>

        {/* 도시 */}
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>도시</FormLabel>
              <FormControl>
                <CitySearch
                  value={field.value}
                  onSelect={handleCitySelect}
                  placeholder="시군구 단위로 검색"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 버튼 */}
        <div className="flex flex-col gap-4 pt-4">
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "계산 중..." : "만세력 보러가기"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.push("/profile")}
            className="w-full"
          >
            저장된 만세력 불러오기
          </Button>
        </div>
      </form>
    </Form>
  );
}

