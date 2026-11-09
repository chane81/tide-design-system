# Next.js 소비 흐름 end-to-end 검증

Type: prototype
Status: resolved
Blocked by: 없음

## Question

문서만으로는 확인할 수 없었던 다음 항목이 실제로 동작하는가? 최소 구성의 pnpm workspace(token 패키지 하나, React 패키지 하나, Button 하나)를 Vite 8로 빌드하고, Next.js 16 App Router 앱에서 `@tide-tds/*`로 import해 확인한다.

1. 빌드한 결과물에 `"use client"` 지시어가 남는가? `preserveModules`를 쓰는 방식과 entry를 나누는 방식을 비교한다.
2. 앱이 `@import`로 theme CSS를 불러올 때 패키지의 `exports` 경로가 해석되는가?
3. pnpm symlink 환경에서 `@source`가 동작하는가? `@source` 줄을 Tide의 theme CSS 안에 넣어도 되는가?
4. node_modules에서 import한 theme의 Token이 Tailwind IntelliSense 자동완성에 뜨는가? (`w-`, `bg-` 입력 시)
5. TS 7만 설치된 환경에서 d.ts 생성이 되는가, 아니면 TS 6을 함께 설치해야 하는가?

결과는 "모노레포 패키지 구조와 빌드 결정" 티켓의 입력이 된다. 프로토타입 코드는 `prototype/nextjs-consumption` 브랜치에 두고 main에는 merge하지 않는다.

## Answer

다섯 질문 모두 실제로 동작하는 방법을 찾았다. 다만 workspace symlink 환경에서만 생기는 함정이 하나 있었다. 버전은 2026-11-09 npm 기준이다: next 16.4.5, react 19.3.1, vite 8.3.6(Rolldown 1.2.16), @vitejs/plugin-react 6.2.1, tailwindcss와 @tailwindcss/postcss 4.3.5, typescript 7.0.2, vite-plugin-dts 5.1.2, pnpm 12.11.2, Node 26.12.1. Vite 8 라이브러리 모드 옵션(`build.lib`, `build.rolldownOptions`)은 context7의 Vite v8.3.5 문서로 확인했다.

- **프로토타입 코드**: `prototype/nextjs-consumption` 브랜치의 `prototype/nextjs-consumption/` 폴더(커밋 `1a92e07`). main에는 merge하지 않는다.
- **구성**: `@tide-tds/tokens`(theme CSS), `@tide-tds/react`(`"use client"` Button, 지시어 없는 Badge). 이를 Next 앱 두 곳에서 import했다. workspace 안의 `apps/web`은 symlink로 연결했고, workspace 밖의 `standalone/web`은 `pnpm pack`으로 만든 tarball을 설치했다(npm 배포와 같은 구조).

### 1. `"use client"`가 빌드 결과에 남는가

| 빌드 방식                                                                                      | `Button.js`의 지시어                                                                                                           |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 단일 entry 기본 빌드(대조군)                                                                   | **사라진다**. 모든 코드가 `index.js` 하나로 합쳐진다                                                                           |
| A. 단일 entry + `preserveModules`(`preserveModulesRoot: "src"`, `entryFileNames: "[name].js"`) | 남는다. 원본 파일마다 `dist/Button.js`, `dist/Badge.js`, `dist/index.js`가 생긴다                                              |
| B. 경계마다 entry 분리(`index`, `Button`)                                                      | 이번 구성에서는 남는다. 다만 공유 모듈이 있으면 지시어가 없는 chunk로 코드가 빠진다(「Next.js App Router 호환성 조사」의 실험) |

- 서버 컴포넌트인 `page.tsx`가 래퍼 없이 `import { Badge, Button } from "@tide-tds/react"`로 가져와도 빌드와 prerender가 통과했다.
- **대조 실험**: 설치된 `Button.js`에서 지시어를 지우면 prerender가 `TypeError: (0 , c.useState) is not a function`으로 실패한다. 지시어가 실제로 클라이언트 경계 역할을 한다는 뜻이다.
- **결론**: A(`preserveModules`)가 맞다. 원본 파일의 경계가 그대로 유지되고, 파일 이름도 설정 두 개로 깔끔해진다.

### 2. `exports` 경로로 theme CSS를 `@import`할 수 있는가

- 된다. 앱 CSS의 `@import "@tide-tds/tokens/theme.css"`가 `exports`의 직접 서브패스(`"./theme.css": "./dist/theme.css"`)로 해석된다.
- 패키지 CSS 안에서 다른 패키지를 `@import`하는 것도 된다. `@tide-tds/react/styles.css` 안의 `@import "@tide-tds/tokens/theme.css"`가 pnpm 설치 구조에서 해석됐다.
- 출력 CSS에는 Tide 색(`bg-primary-solid`, `bg-blue-500`)만 있고, Tailwind 기본 팔레트(`--color-red-500`)는 없다.

### 3. pnpm 환경에서 `@source`가 동작하는가, Tide CSS 안에 넣어도 되는가

- **A. 앱의 `@source "../node_modules/@tide-tds/react/dist"`**: 동작한다.
- **B. 패키지 CSS(`@tide-tds/react/styles.css`) 안의 `@source "./"`**: 동작한다. 앱은 `@import "tailwindcss"`와 `@import "@tide-tds/react/styles.css"` 두 줄만 쓰면 된다. `@source` 경로는 패키지 CSS 파일의 실제 위치(pnpm `.pnpm` 경로)를 기준으로 해석된다.
- **대조 실험**: 패키지 CSS에서 `@source` 줄을 지우면 Tide class가 0개가 된다. B의 `@source`가 실제로 스캔하고 있다는 뜻이다.
- **결론**: B가 가능하다. 앱이 `node_modules` 경로를 직접 적지 않아도 되므로 설정이 단순해진다(원칙 ③).

### 4. node_modules에서 가져온 theme이 IntelliSense 자동완성에 뜨는가

- 뜬다. 사용자가 VS Code(Tailwind CSS IntelliSense 0.16.0)에서 B 방식으로 확인했다.
- `bg-`와 `w-` 자동완성이 동작했다. `bg-primary-solid`에 마우스를 올리면 `background-color: var(--color-primary-solid) /* var(--color-blue-600) */`와 색 견본이 보인다.

### 5. TS 7만 설치된 환경에서 d.ts를 만들 수 있는가

- **TS 7.0.2의 `tsc`로는 된다.** `emitDeclarationOnly`와 `isolatedDeclarations`를 켜고 `tsc -p`로 빌드하면 파일마다 `.d.ts`가 생긴다. 이 결과는 `preserveModules` 출력(`Button.js` ↔ `Button.d.ts`)과 1:1로 맞는다. tarball 앱의 타입 검사도 통과했다.
- **`vite-plugin-dts` 5.1.2는 안 된다.** 다음 오류로 멈춘다: `The installed "typescript" package does not provide the JavaScript Compiler API (this happens with TypeScript 7+), and the fallback "@typescript/typescript6" was not found.` 쓰려면 `@typescript/typescript6`을 함께 설치해야 한다.
- **결론**: 번들하지 않는 A 방식과 `tsc` 단독 d.ts 생성을 조합하면 TS 6을 함께 설치할 필요가 없다.

### 함정: workspace symlink로 연결하면 prerender가 실패한다

- workspace 안의 앱(`workspace:*` symlink)에서는 Tide를 import하면 `/_global-error` prerender가 `TypeError: Cannot read properties of null (reading 'useContext')`로 실패했다. Tide import를 빼면 통과하고, React 설치본도 한 벌뿐이었다.
- 앱에 `transpilePackages: ["@tide-tds/react"]`를 넣으면 통과한다.
- **tarball로 설치한 앱(실제 npm 사용자와 같은 구조)에서는 이 설정 없이 통과한다.**
- 원인은 확인하지 않았다. symlink의 실제 경로가 `node_modules` 밖이어서 Next가 그 패키지에 다른 `react`를 연결한 것으로 추정한다.
- **영향**: 사용자 앱에는 문제가 없다. Tide 모노레포 안에 Next 예제 앱을 둔다면 `transpilePackages`가 필요하다.

### 「모노레포 패키지 구조와 빌드 결정」에 넘기는 것

- React 패키지는 Vite 라이브러리 모드에 `preserveModules`를 켜서 빌드한다. d.ts는 TS 7 `tsc`와 `isolatedDeclarations`로 따로 만든다. `vite-plugin-dts`는 TS 6이 필요하므로 쓰지 않는 쪽이 단순하다.
- 앱이 쓰는 CSS 진입점은 하나로 한다. 그 CSS 안에서 theme을 `@import`하고 자기 dist를 `@source`로 등록한다. 이것을 어느 패키지가 export할지 정한다.
- workspace 안에서 Tide를 쓰는 Next 앱에는 `transpilePackages`가 필요하다.
- `"use client"`는 원본 파일에 직접 붙이고 빌드가 그대로 보존하게 한다. `banner`로 일괄로 붙이지 않는다.

## Comments

- 2026-11-09 진행. 1·2·3·5번은 에이전트가 빌드와 대조 실험으로 확인했고, 4번은 사용자가 VS Code에서 확인했다.
