# 모노레포 패키지 구조와 빌드 결정

Type: grilling
Status: resolved
Blocked by: 05, 03, 17, 19

## Question

패키지 목록과 이름, npm scope, 각 패키지의 exports 경로(Token CSS, Tailwind theme, React), 빌드 도구 구성, Storybook 앱 위치, 공통 설정(tsconfig, oxlint, oxfmt)을 어떻게 공유할지 결정한다. 제약: npm scope는 `@tide-tds`이고, Next.js App Router 앱에서 import해서 바로 쓸 수 있어야 한다("Next.js App Router 호환성 조사" 티켓 참고). 리서치로 남은 쟁점: TS 6/7 병행 여부, d.ts 생성 도구, `"use client"` 보존 방식.

### 참고 (다른 티켓에서 넘어온 것)

- 「Token 네이밍과 Utility class 노출 규칙 결정」: Token 원본은 TS 객체이고, 직접 만든 빌드 스크립트가 CSS(`--tide-*`, `[data-theme]`, `@theme inline`, `@custom-variant dark`)와 tailwind-merge 설정을 만든다. 이 스크립트와 출력물을 어느 패키지에 두고 어떤 exports 경로로 내보낼지 여기서 정한다. 빌드한 CSS에 기대한 class가 있는지 확인하는 CI 테스트를 둘 위치도 정한다.
- 「접근성 동작 구현 방식 결정」: `react-aria` 3.53.1과 `react-stately` 3.51.0을 dependencies로 둘지 peer로 둘지 정한다. hook을 쓰는 Component는 클라이언트 전용이라 `"use client"` 경계 안에 있어야 한다(ADR 0004).
- 「Component 공통 API 규칙 결정」: React peer 범위는 `^19`이다. `cn`(clsx + 생성된 tailwind-merge 설정)과 공통 union 타입(`Variant`, `Color`, `Size`)을 공개 export하므로, 어느 패키지에 둘지 여기서 정한다. `"use client"`는 hook, state, 이벤트 처리를 쓰는 Component 파일에만 붙는다. 여러 부분으로 된 Component는 평평하게 export한다(`DialogTrigger`).
- 사용자 결정(2026-11-09): **모노레포 태스크 러너는 Turborepo를 쓴다.** pnpm workspace 위에 얹는다. npm 최신 버전은 `turbo` 2.11.10이다(2026-11-09 확인). `turbo.json`의 태스크 구성(build, test, lint, Storybook)과 캐시 대상(dist, Token 생성물)은 여기서 정한다. 설정 문법은 실제 설치 버전의 문서로 확인한다.
- 「Next.js 소비 흐름 end-to-end 검증」: React 패키지는 `preserveModules`로 빌드하고, d.ts는 TS 7 `tsc`와 `isolatedDeclarations`로 만든다. `vite-plugin-dts`는 TS 6이 필요하다. 앱이 쓰는 CSS 진입점 하나에 theme `@import`와 자기 dist의 `@source "./"`를 함께 둘 수 있다. workspace 안의 Next 앱에는 `transpilePackages`가 필요하다. 상세는 그 티켓의 Answer에 있다.
- 사용자 결정(2026-11-09): **의존성 버전은 pnpm catalog로 관리한다.** `pnpm-workspace.yaml`의 `catalog`(기본)와 `catalogs`(이름 붙인 묶음)에 버전 범위를 두고, 각 `package.json`에서는 `"react": "catalog:"` 또는 `"catalog:<이름>"`으로 참조한다. `pnpm publish`와 `pnpm pack`을 실행하면 `catalog:`는 실제 버전 범위로 바뀐다. 그래서 배포된 패키지는 다른 패키지 매니저에서도 쓸 수 있다. 근거: pnpm v12.11.2 `docs/catalogs.md`(context7). 여기서 정할 것은 기본 catalog 하나로 충분한지, peer 범위(예: React `^19`)도 catalog로 둘지, `catalogMode` 같은 강제 옵션을 쓸지다. 옵션 이름은 그때 문서로 확인한다.

## Answer

배포 패키지는 `@tide-tds/foundation`과 `@tide-tds/desktop` 두 개이고, Storybook 앱 `apps/docs`는 private이다([ADR 0006](../../../decisions/0006-foundation-and-target-packages.md)). TypeScript는 7.0.2 하나만 쓴다. 이 답에 나오는 버전은 2026-11-09에 npm과 context7로 확인했다.

### 패키지와 디렉터리

```
packages/foundation   → @tide-tds/foundation (프레임워크 무관)
packages/desktop      → @tide-tds/desktop (desktop Target React Component)
apps/docs             → Storybook 10.6.6 (private, 배포 안 함)
```

- 별도의 설정 패키지나 `utils` 패키지는 두지 않는다. `cn`과 공통 union 타입은 desktop 패키지에서 export한다.
- workspace 안에는 Next 예제 앱을 두지 않는다. symlink로 연결하면 `transpilePackages`가 필요해서, 실제 사용자 구조와 달라진다. Next 소비 검증은 `pnpm pack`으로 만든 tarball을 설치하는 smoke test로 한다. 이 테스트는 「테스트 전략」에서 다룬다.

### `@tide-tds/foundation`

| exports | 내용 |
| --- | --- |
| `.` | Token TS 객체(Primitive, Semantic, 타이포그래피, radius, shadow 등)를 컴파일한 JS와 d.ts |
| `./tokens.css` | `--tide-*` 변수와 `[data-theme]` 덮어쓰기만 담는다. Tailwind 문법은 쓰지 않는다. Tailwind 없이 쓰는 사용자의 공개 계약이다(ADR 0003) |
| `./tailwind.css` | `tokens.css`를 `@import`하고, `--color-*: initial`, `@theme inline`, `@custom-variant dark`, base CSS(`keep-all`)를 담는다 |
| `./tailwind-merge` | 생성된 tailwind-merge 설정 객체. `import type { ConfigExtension }`만 쓰고 런타임에서는 tailwind-merge에 의존하지 않는다(tailwind-merge 3.7.0 타입 선언으로 확인). 내장 `validators`가 필요하면 직접 만든 함수로 대체한다 |

- 원본은 `src/`, 생성 스크립트는 `scripts/build-css.ts`에 둔다. 스크립트는 Node 26에서 `.ts` 파일을 바로 실행한다(type stripping은 v22.18.0, v23.6.0부터 플래그 없이 동작). JS와 d.ts는 TS 7 `tsc`로 만든다. 번들러는 쓰지 않는다.
- 이름은 처음에 `tokens`였다. 인증 token, LLM token과 헷갈리고, Token이 아닌 base CSS도 들어가서 바꿨다. 같은 이유로 `theme.css`도 `tailwind.css`로 바꿨다. GLOSSARY의 Theme(light/dark)와 이름이 겹치기 때문이다.
- vitest 테스트 두 가지를 이 패키지에 둔다. ① 대비 쌍 128개 WCAG 검사는 `src`를 직접 import한다. ② 기대한 class가 만들어지는지(`bg-primary-solid`는 생기고 `text-bg-primary`는 생기지 않음) 확인하는 테스트는 `tailwind.css`를 Tailwind로 컴파일해 본다(ADR 0003). 따라서 tailwindcss는 이 패키지의 devDependency다. 컴파일 API는 구현할 때 문서로 확인한다.
- 아이콘을 이 패키지에 넣을지는 「아이콘 전략 결정」에서 정한다.

### `@tide-tds/desktop`

- exports는 두 개다.
  - `.`: Component 33개, `cn`, 공통 union 타입을 평평하게 export한다. Component별 서브패스는 없다.
  - `./styles.css`: `@import "@tide-tds/foundation/tailwind.css"`와 `@source "./"`를 담는다. 앱은 `@import "tailwindcss"`와 이 파일, 두 줄만 쓰면 된다.
- 개발용 exports 조건 `"@tide-tds/source"`를 두어 `src/index.ts`를 가리키게 한다(Storybook HMR용).
- 출력은 ESM 전용이다. `"type": "module"`, `sideEffects: ["**/*.css"]`로 둔다.
- 빌드는 Vite 8 라이브러리 모드에 `preserveModules`(`preserveModulesRoot: "src"`, `entryFileNames: "[name].js"`)를 켠다. d.ts는 TS 7 `tsc`(`emitDeclarationOnly`, `isolatedDeclarations`)로 따로 만든다. `vite-plugin-dts`는 TS 6 API가 필요하므로 쓰지 않는다. `"use client"`는 원본 파일에 직접 붙이고, `banner`로 일괄로 붙이지 않는다.
- 의존성은 다음과 같이 나눈다.
  - `peerDependencies`: `react ^19`, `react-dom ^19`, `tailwindcss ^4.3`
  - `dependencies`: `@tide-tds/foundation`, `react-aria`, `react-stately`, `clsx`, `tailwind-merge`. 앱이 직접 import하지 않는 구현 세부이므로 peer로 두지 않는다.

### Storybook(`apps/docs`)

- desktop은 `"@tide-tds/source"` 조건으로 src를 resolve하고, foundation은 dist를 쓴다(CSS 생성 단계가 있으므로 `^build`). Vite 8의 resolve 조건 옵션 이름은 구현할 때 문서로 확인한다.
- `typescript.reactDocgen`은 기본값 `"react-docgen"`(Babel 기반)으로 고정한다. `react-docgen-typescript`는 TS 7에서 `TypeError: Cannot read properties of undefined (reading 'fileExists')`로 빌드가 실패한다.
- 근거: TS 7.0.2만 설치한 최소 프로젝트로 Storybook 10.6.6 `storybook build`가 성공했고, `__docgenInfo`에 union 타입, 기본값, JSDoc 설명이 채워졌다.

### TypeScript와 소스 규칙

- TS 7.0.2 하나만 쓴다. TS 6(`@typescript/typescript6`)은 함께 두지 않는다. 그 대가로 VS Code에서 MDX의 타입 지원이 약할 수 있다.
- 루트 `tsconfig.base.json`을 각 패키지가 `extends`한다. 공통 옵션은 다음과 같다.
  - `erasableSyntaxOnly`: enum을 쓰지 않고 union을 쓴다.
  - `isolatedDeclarations`
  - `verbatimModuleSyntax`
  - 상대 import에 `.ts`/`.tsx` 확장자를 붙이고, `rewriteRelativeImportExtensions`를 켠다.
- 이렇게 하면 Node가 스크립트를 바로 실행할 수 있고, 사용자의 `moduleResolution: nodenext`에서도 d.ts가 해석된다.
- **구현할 때 확인할 것**: `rewriteRelativeImportExtensions`가 d.ts의 import 경로까지 바꾸는지 tarball smoke test로 확인한다. 바꾸지 않으면 d.ts 후처리가 필요하다.
- oxlint type-aware 린팅(`oxlint-tsgolint`)은 v0에서 쓰지 않는다. 타입 오류는 `tsc --noEmit`(typecheck 태스크)이 잡는다.

### 공통 설정과 Turborepo

- `.oxlintrc.json`과 oxfmt 설정은 루트에 하나씩 둔다. lint와 format은 루트 `package.json` 스크립트로 저장소 전체를 한 번에 실행하고, turbo를 거치지 않는다.
- `turbo.json`의 키 이름은 turbo 2.11.10 문서(context7 `/vercel/turborepo/v2.11.10`)로 확인했다.

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build":     { "dependsOn": ["^build"], "outputs": ["dist/**", "storybook-static/**"] },
    "typecheck": { "dependsOn": ["^build"] },
    "test":      { "dependsOn": ["^build"] },
    "dev":       { "dependsOn": ["^build"], "cache": false, "persistent": true }
  }
}
```

### 의존성 버전과 런타임

- pnpm catalog는 기본 catalog 하나만 둔다.
- `catalogMode: strict`로 catalog 밖의 버전을 막는다. 값은 `manual`(기본값), `strict`, `prefer` 세 가지다(context7 `/pnpm/pnpm/v12.15.0`).
- peer 범위는 catalog에 넣지 않고 `package.json`에 직접 쓴다. peer 범위는 공개 계약이라 개발에 쓰는 버전과 따로 움직이기 때문이다.
- 0.x인 oxfmt는 정확한 버전으로 고정하고, 나머지는 `^` 범위로 둔다.
- 저장소는 Node 26(`.node-version`)과 `packageManager: pnpm@12.18.0`으로 고정한다. 배포 패키지에는 `engines`를 두지 않는다.

### 다른 문서에 준 영향

- GLOSSARY에 **Target(대상 환경)** 을 추가했다.
- ADR 0006을 새로 만들었다. ADR 0002의 "패키지 이름은 나중에 확정" 문장을 ADR 0006으로 연결했다.
- mobile Target(`@tide-tds/mobile`)은 v0 지도의 Out of scope에 추가했다.

## Comments

- 2026-11-09 grilling 진행. 사실 확인(Storybook과 TS 7 빌드 실측, pnpm `catalogMode`, turbo 문법, Node type stripping, tailwind-merge 순수 객체)은 서브에이전트가 맡았다. Storybook 실측 프로젝트는 scratchpad에 두었고 저장소에는 넣지 않았다.
- 패키지 이름: `tokens`에서 `foundation`으로, `react`에서 `desktop`으로 바꿨다. 둘 다 사용자 결정이다.
- 2026-11-09 보완(「테스트 전략 결정」): private app `apps/smoke-next`(Next.js App Router, tarball smoke test용)와 turbo task `smoke`(`dependsOn: ["^build"]`)를 더함. turbo task는 build, typecheck, test, smoke, dev 다섯 개가 됨.
