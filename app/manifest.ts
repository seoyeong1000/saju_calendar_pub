import { MetadataRoute } from "next";

/**
 * @file manifest.ts
 * @description PWA 매니페스트 생성 함수
 *
 * Progressive Web App(PWA) 설치를 위한 매니페스트를 생성합니다.
 * Next.js 15 App Router의 MetadataRoute.Manifest 타입을 사용합니다.
 *
 * 주요 기능:
 * - 앱 이름, 설명, 아이콘 설정
 * - 테마 색상 및 배경색 설정
 * - 표시 모드 및 언어 설정
 * - public/icons/ 디렉토리의 아이콘 파일 활용
 */

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  return {
    name: "SaaS 템플릿",
    short_name: "SaaS 템플릿",
    description: "Next.js + Clerk + Supabase 보일러플레이트",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    lang: "ko",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
