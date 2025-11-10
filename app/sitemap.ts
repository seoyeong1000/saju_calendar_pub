import { MetadataRoute } from "next";

/**
 * @file sitemap.ts
 * @description sitemap.xml 생성 함수
 *
 * 검색 엔진을 위한 사이트맵을 생성합니다.
 * Next.js 15 App Router의 MetadataRoute.Sitemap 타입을 사용합니다.
 *
 * 주요 기능:
 * - 주요 페이지들의 URL과 우선순위 설정
 * - 마지막 수정 날짜 정보 포함
 * - 동적 라우트 확장 가능한 구조
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/bazi-test`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth-test`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/storage-test`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];
}
