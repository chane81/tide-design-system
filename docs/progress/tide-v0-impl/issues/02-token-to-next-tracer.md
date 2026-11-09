# 02: Token에서 Next 앱까지 관통

Status: done
Blocked by: 01 (저장소 골격)

## What to build

Token 하나가 원본에서 시작해 Next.js App Router 앱에서 class로 동작할 때까지의 길을 처음부터 끝까지 한 번 뚫는다. foundation에 `blue` 일부와 `bg-primary-solid`만 두고, desktop은 `cn`과 VisuallyHidden만 export한다. 앱 개발자 입장에서는 tarball을 설치하고 CSS 두 줄을 import하면 `bg-primary-solid`와 VisuallyHidden이 Next 앱에서 동작하는 상태다.

## 수용 기준

### foundation

- [x] Token 원본은 TS 객체(`as const`)다. `blue` 일부 단계와 Semantic `bg-primary-solid` 하나만 담는다. 대비 쌍 목록도 같은 원본에 둘 자리를 만든다.
- [x] 직접 만든 Node 스크립트가 원본에서 tokens CSS, tailwind CSS, tailwind-merge 설정을 만든다. JS와 d.ts는 `tsc`로 만들고 번들러는 쓰지 않는다. DTCG JSON은 만들지 않는다.
- [x] tokens CSS는 `--tide-*` 변수와 `[data-theme]` 덮어쓰기만 담는다.
- [x] tailwind CSS는 tokens CSS를 import하고 `@theme inline`으로 Tailwind 변수를 `--tide-*`에 연결한다.
- [x] tailwind-merge 설정은 타입만 import하는 순수 객체이고, 런타임에서 tailwind-merge에 의존하지 않는다.
- [x] exports: 루트(Token 객체), tokens CSS, tailwind CSS, tailwind-merge 설정.

### desktop

- [x] `cn`(clsx + 생성된 설정으로 확장한 tailwind-merge)과 `VisuallyHidden`을 루트에서 export한다.
- [x] Vite 8 라이브러리 모드에 `preserveModules`를 켜고, d.ts는 `tsc`의 `emitDeclarationOnly`로 만든다.
- [x] styles CSS는 foundation tailwind CSS를 import하고 `@source`로 패키지 자신을 등록한다.
- [x] `sideEffects`는 CSS만 둔다. 개발용 exports 조건 `@tide-tds/source`가 원본을 가리킨다.
- [x] peer는 `react ^19`, `react-dom ^19`, `tailwindcss ^4.3`. dependencies는 foundation(내부 workspace), `react-aria`, `react-stately`, `clsx`, `tailwind-merge`.

### 테스트

- [x] Vitest `unit` project: Tailwind로 컴파일한 CSS에 `bg-primary-solid`가 있고 Tailwind 기본 팔레트 값이 아님을 확인한다. `cn`이 사용자 `className`을 이기게 병합하는지 확인한다.
- [x] `smoke` 앱(private Next.js App Router): `pnpm pack` tarball 설치 → `next build`(prerender 포함) → `tsc`(`moduleResolution: nodenext`) → publint → CSS import와 `@source` 동작을 확인한다. `transpilePackages` 없이 통과한다.
- [x] CI에서 `unit`과 `smoke`가 돈다.

### 구현 중 확인할 것

- [x] `rewriteRelativeImportExtensions`가 d.ts의 import 경로까지 바꾸는지 smoke로 확인한다. 바꾸지 않으면 d.ts를 후처리한다. 결과를 Comments에 남긴다.
- [x] foundation 테스트에서 Tailwind를 컴파일하는 API를 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [x] Next.js 소비 검증은 tide-v0 티켓 19(prototype)의 절차를 따른다.

## Comments

- 2026-11-10 완료(브랜치 `ticket/02-token-to-next-tracer`).
  - **버전**(npm 2026-11-10, pnpm `minimumReleaseAge` 하루를 넘긴 것): next 16.4.5, react·react-dom 19.3.1, tailwindcss·@tailwindcss/postcss·@tailwindcss/node 4.3.5, vite 8.3.6, vitest 5.1.0, tailwind-merge 3.7.0, clsx 2.1.1, publint 0.3.25(0.x라 정확한 버전), react-aria 3.53.1, react-stately 3.51.0.
  - **공급망 정책(01 보완)**: pnpm 기본 `minimumReleaseAge`(1440분)는 non-strict라서, 범위 안에 하루가 지난 버전이 없으면 새 버전을 설치하고 `pnpm-workspace.yaml`에 `minimumReleaseAgeExclude`를 스스로 써 넣는다(01 커밋에 oxfmt 0.78.0·oxlint 1.93.0 예외 목록이 그렇게 들어가 있었다). 그 상태에서는 다음 install이 `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`으로 실패한다. `minimumReleaseAge: 1440`을 명시해 strict로 바꾸고(pnpm v12.15.0 `settings/dependency-resolution.md`), 예외 목록을 지우고, oxfmt 0.77.0·oxlint ^1.92.0으로 내렸다. 새 버전을 쓰려면 배포 후 하루를 기다린다.
  - **Token 원본**: `blue`는 일부가 아니라 11단계 전부를 넣었다(정본 hex가 이미 정해져 있어서). Semantic은 `bg-primary-solid` 하나다. 대비 쌍은 타입과 빈 목록만 두었다. isolatedDeclarations에서는 export 값에 `satisfies`를 쓸 수 없어서 모양 검사를 별도 문장으로 두었다.
  - **tailwind-merge 설정**: tailwind-merge 3.7.0의 theme `color` 기본값은 `[isAny]`다(설치본 `dist/bundle-mjs.mjs`). 이를 Tide 색 이름 목록(+ `inherit`, `current`, `transparent`)으로 `override`했다. 그래서 Tide에 없는 색 이름은 충돌 해결 대상에서 빠진다. 텍스트 스타일(`text-body-md`)이 색으로 잘못 분류되지 않게 하는 일은 05에서 `text` theme에 등록한다. d.ts는 `ConfigExtension<DefaultClassGroupIds, DefaultThemeGroupIds>` 타입만 import한다. foundation은 tailwind-merge를 optional peer(`^3`)로 둔다(d.ts의 타입 import 때문).
  - **Tailwind 컴파일 API**: `@tailwindcss/node` 4.3.5의 `compile(css, { base, onDependency })` → `build(candidates)`. 공식 문서에 없는 API라 설치본 타입 선언(`dist/index.d.ts`)으로 확인했다.
  - **`rewriteRelativeImportExtensions`와 d.ts**: TS 7.0.2는 JS의 상대 import만 `.js`로 바꾸고 d.ts에는 `./cn.ts`를 그대로 둔다. spec대로 d.ts 후처리 스크립트(저장소 루트 `scripts/`)를 두 패키지 빌드에 넣었다. 대조 실험: 후처리 없이 만든 tarball도 TS 7.0.2(bundler, nodenext)와 TS 5.9.3(nodenext)에서 타입 검사가 통과했다. 그보다 오래된 TS는 확인하지 않았다. 후처리를 빼도 되는지는 나중에 다시 판단할 수 있다. → 2026-11-10 정정: 빌드를 tsdown으로 바꾸면서(티켓 [36](36-tsdown-build.md)) d.ts가 처음부터 `./cn.js`로 나와 후처리 스크립트를 지웠다. 이 항목의 Vite 빌드·`tsc` d.ts 기록도 36으로 대체됐다.
  - **Vite 빌드**: Vite 8은 Oxc로 tsx를 변환하므로 빌드에 `@vitejs/plugin-react`를 쓰지 않았다(Vite docs `oxc` 옵션). Storybook(03)에서 필요하면 그때 더한다. external은 package.json의 dependencies·peerDependencies 이름과 그 서브패스다.
  - **개발용 exports 조건**: `@tide-tds/source`는 `publishConfig.exports`로 publish·pack 때 뺀다(pnpm v12.15.0 `package_json.md` publishConfig). publint `--strict`가 두 tarball 모두 통과했다.
  - **typecheck와 isolatedDeclarations**: 각 패키지의 `tsconfig.json`(typecheck: src·test·설정)에서는 끄고, `tsconfig.build.json`(배포 d.ts)에서만 켠다. 설정 파일의 default export가 isolatedDeclarations에 걸리기 때문이다.
  - **smoke**: workspace 밖 임시 폴더에 앱을 만들고 tarball을 설치한다(티켓 19 standalone 방식). 외부 패키지 버전은 smoke 앱에 설치된 catalog 버전을 그대로 쓰고, pnpm은 저장소 `packageManager`로 고정한다. 출력 CSS에 앱이 쓰지 않은 `sr-only`가 있는지로 패키지 CSS의 `@source`를 확인한다. `next build` 안의 TypeScript 단계도 TS 7.0.2에서 통과했다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `TURBO_SCM_BASE=main pnpm turbo run typecheck test build smoke --affected`(10개 태스크) 통과. GitHub Actions에서의 실행은 첫 PR에서 확인해야 한다.
