# Next.js App Router 호환성 조사

Type: research
Status: resolved
Blocked by: 없음

## Question

Next.js 최신 안정 버전의 App Router 앱에서 `@tide-tds/*` 패키지를 import해 쓰려면 라이브러리가 무엇을 지켜야 하는가? (1) React Server Components 환경에서 `"use client"` 지시어를 어디에 두어야 하고, vite 라이브러리 빌드가 이 지시어를 보존하는지 (2) ESM 전용 배포와 package.json `exports` 조건 (3) `transpilePackages`가 필요한지 (4) 앱의 Tailwind가 node_modules에 있는 Tide 클래스를 스캔하는 설정 (5) 테마 CSS와 폰트를 어떤 방식으로 import하는지, `next/font`와 어떻게 함께 쓰는지 (6) dark Theme 전환 시 hydration 깜빡임을 막는 방법. 모두 공식 문서와 context7로 확인하고 버전을 명시한다.

## Answer

- Next.js 16.4.5는 컴포넌트 라이브러리의 entry 파일에 `"use client"`를 두라고 권장한다. 하지만 Vite 8.3.6(Rolldown 1.2.16)의 기본 라이브러리 빌드는 이 지시어를 지운다. 실험해 보니 `preserveModules`를 켜거나 경계마다 entry를 분리했을 때만 지시어가 남았다.
- ESM 전용으로 컴파일된 dist를 배포하면 App Router(Turbopack 기본)에서는 `transpilePackages`와 `esmExternals`가 필요 없다. TS/JSX 원본을 배포할 때만 `transpilePackages`가 필요하다.
- Tailwind 4.3.5는 기본으로 `node_modules`를 스캔하지 않는다. 그래서 앱에 `@source "../node_modules/@tide-tds/<패키지>/dist"`가 필요하다. theme CSS는 앱의 `globals.css`에서 `@import`한다.
- 폰트는 앱이 `next/font`의 `variable`로 로드하고 `@theme inline { --font-sans: var(...) }`로 연결한다. dark Theme은 `<head>` 인라인 스크립트로 `<html data-theme>`를 설정하고 `suppressHydrationWarning`을 붙이는 방식이 Next.js 공식 가이드의 방식이다.
- 상세 내용과 출처: [docs/research/nextjs-consumption.md](../../../research/nextjs-consumption.md)
