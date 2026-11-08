# 모노레포 툴링 조사

Type: research
Status: resolved
Blocked by: 없음

## Question

pnpm workspace에서 vite(라이브러리 모드), vitest, Storybook, TypeScript, oxlint, oxfmt를 함께 쓰는 구성을 조사한다. 각 도구의 최신 안정 버전, 서로의 호환성, Tailwind 연동 방식을 확인한다. 라이브러리 빌드 출력(ESM, 타입 선언, CSS export), 패키지 exports 설정, 릴리스 도구(changesets 등) 현황도 정리한다. 모두 공식 문서와 context7로 확인하고 버전을 명시한다.

## Answer

- 최신 안정 버전(2026-11-08): vite 8.3.6, vitest 5.1.0, storybook 10.6.6, typescript 7.0.2, oxlint 1.92.0, oxfmt 0.77.0(beta), pnpm 12.18.0, @changesets/cli 3.0.3, tailwindcss·@tailwindcss/vite 4.3.5. peer 범위상 서로 충돌하지 않고, Node 22.12 이상이 필요하다.
- Vite 라이브러리 모드는 ESM과 단일 CSS 파일을 만들지만 d.ts는 만들지 않는다. 후보는 vite-plugin-dts, tsdown(oxc + `isolatedDeclarations`), tsc다.
- TypeScript 7.0에는 프로그래밍 API가 없다. oxlint type-aware는 TS 7을 요구하고, d.ts 플러그인과 MDX 도구는 TS 6에 기대므로 TS 버전 선택이 핵심 쟁점이다.
- Tailwind v4는 `@theme` CSS 파일 공유(`--color-*: initial`, `@theme inline`)로 테마를 배포하고, 사용하는 앱은 `@source`로 라이브러리를 스캔해야 한다. Storybook은 `vite.config`를 자동 병합하고, Vitest 5는 `test.projects`로 unit과 storybook browser 테스트를 나눈다.
- 상세: [docs/research/monorepo-tooling.md](../../../research/monorepo-tooling.md)
