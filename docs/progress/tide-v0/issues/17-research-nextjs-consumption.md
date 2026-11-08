# Next.js App Router 호환성 조사

Type: research
Status: open
Blocked by: 없음

## Question

Next.js 최신 안정 버전의 App Router 앱에서 `@tide-tds/*` 패키지를 import해 쓰려면 라이브러리가 무엇을 지켜야 하는가? (1) React Server Components 환경에서 `"use client"` 지시어를 어디에 두어야 하고, vite 라이브러리 빌드가 이 지시어를 보존하는지 (2) ESM 전용 배포와 package.json `exports` 조건 (3) `transpilePackages`가 필요한지 (4) 앱의 Tailwind가 node_modules에 있는 Tide 클래스를 스캔하는 설정 (5) 테마 CSS와 폰트를 어떤 방식으로 import하는지, `next/font`와 어떻게 함께 쓰는지 (6) dark Theme 전환 시 hydration 깜빡임을 막는 방법. 모두 공식 문서와 context7로 확인하고 버전을 명시한다.
