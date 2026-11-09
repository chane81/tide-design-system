# 02: Token에서 Next 앱까지 관통

Status: ready-for-agent
Blocked by: 01 (저장소 골격)

## What to build

Token 하나가 원본에서 시작해 Next.js App Router 앱에서 class로 동작할 때까지의 길을 처음부터 끝까지 한 번 뚫는다. foundation에 `blue` 일부와 `bg-primary-solid`만 두고, desktop은 `cn`과 VisuallyHidden만 export한다. 앱 개발자 입장에서는 tarball을 설치하고 CSS 두 줄을 import하면 `bg-primary-solid`와 VisuallyHidden이 Next 앱에서 동작하는 상태다.

## 수용 기준

### foundation

- [ ] Token 원본은 TS 객체(`as const`)다. `blue` 일부 단계와 Semantic `bg-primary-solid` 하나만 담는다. 대비 쌍 목록도 같은 원본에 둘 자리를 만든다.
- [ ] 직접 만든 Node 스크립트가 원본에서 tokens CSS, tailwind CSS, tailwind-merge 설정을 만든다. JS와 d.ts는 `tsc`로 만들고 번들러는 쓰지 않는다. DTCG JSON은 만들지 않는다.
- [ ] tokens CSS는 `--tide-*` 변수와 `[data-theme]` 덮어쓰기만 담는다.
- [ ] tailwind CSS는 tokens CSS를 import하고 `@theme inline`으로 Tailwind 변수를 `--tide-*`에 연결한다.
- [ ] tailwind-merge 설정은 타입만 import하는 순수 객체이고, 런타임에서 tailwind-merge에 의존하지 않는다.
- [ ] exports: 루트(Token 객체), tokens CSS, tailwind CSS, tailwind-merge 설정.

### desktop

- [ ] `cn`(clsx + 생성된 설정으로 확장한 tailwind-merge)과 `VisuallyHidden`을 루트에서 export한다.
- [ ] Vite 8 라이브러리 모드에 `preserveModules`를 켜고, d.ts는 `tsc`의 `emitDeclarationOnly`로 만든다.
- [ ] styles CSS는 foundation tailwind CSS를 import하고 `@source`로 패키지 자신을 등록한다.
- [ ] `sideEffects`는 CSS만 둔다. 개발용 exports 조건 `@tide-tds/source`가 원본을 가리킨다.
- [ ] peer는 `react ^19`, `react-dom ^19`, `tailwindcss ^4.3`. dependencies는 foundation(내부 workspace), `react-aria`, `react-stately`, `clsx`, `tailwind-merge`.

### 테스트

- [ ] Vitest `unit` project: Tailwind로 컴파일한 CSS에 `bg-primary-solid`가 있고 Tailwind 기본 팔레트 값이 아님을 확인한다. `cn`이 사용자 `className`을 이기게 병합하는지 확인한다.
- [ ] `smoke` 앱(private Next.js App Router): `pnpm pack` tarball 설치 → `next build`(prerender 포함) → `tsc`(`moduleResolution: nodenext`) → publint → CSS import와 `@source` 동작을 확인한다. `transpilePackages` 없이 통과한다.
- [ ] CI에서 `unit`과 `smoke`가 돈다.

### 구현 중 확인할 것

- [ ] `rewriteRelativeImportExtensions`가 d.ts의 import 경로까지 바꾸는지 smoke로 확인한다. 바꾸지 않으면 d.ts를 후처리한다. 결과를 Comments에 남긴다.
- [ ] foundation 테스트에서 Tailwind를 컴파일하는 API를 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [ ] Next.js 소비 검증은 tide-v0 티켓 19(prototype)의 절차를 따른다.

## Comments
