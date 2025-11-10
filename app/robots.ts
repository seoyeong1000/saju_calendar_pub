import { MetadataRoute } from "next";

/**
 * @file robots.ts
 * @description robots.txt 생성 함수
 *
 * 검색 엔진 크롤러를 위한 robots.txt 파일을 생성합니다.
 * Next.js 15 App Router의 MetadataRoute.Robots 타입을 사용합니다.
 *
 * 주요 기능:
 * - 모든 크롤러에 대한 기본 규칙 설정
 * - sitemap.xml 위치 참조
 * - 프로덕션/개발 환경 구분 가능
 */

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
