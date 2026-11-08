# Next.js App Router에서 Tide를 소비하는 쪽의 요구사항

티켓: [17. Next.js App Router 호환성 조사](../progress/tide-v0/issues/17-research-nextjs-consumption.md)

이 문서는 Next.js 앱이 `@tide-tds/*` 패키지를 가져다 쓸 때 라이브러리가 무엇을 지켜야 하는지를 정리한다. 범위는 소비 측이다. Tailwind theme 노출 방식은 [tailwind-theme-and-autocomplete.md](./tailwind-theme-and-autocomplete.md), 모노레포 빌드 도구 선택은 [monorepo-tooling.md](./monorepo-tooling.md)에서 다룬다. 이 문서는 결정을 내리지 않는다. 시사점만 적는다.

## 조사 기준 버전 (2026-11-08, `npm view`로 확인)

| 패키지 | 최신 안정 버전 | 비고 |
| --- | --- | --- |
| `next` | 16.4.5 | `engines.node >=20.9.0`, peer `react ^18.2.0 \|\| ^19.0.0` |
| `react` | 19.3.1 | |
| `vite` | 8.3.6 | 번들러로 `rolldown ~1.2.16`을 씀(Rollup이 아님). 실험할 때 설치된 버전은 rolldown 1.2.16 |
| `rolldown` | 1.3.0 | |
| `tailwindcss` / `@tailwindcss/postcss` | 4.3.5 / 4.3.5 | |

Next.js 문서는 nextjs.org(페이지에 "Latest Version 16.4.5"로 표시됨)와 GitHub `vercel/next.js` 저장소의 `v16.4.5` 태그에 있는 `docs/` 원문을 함께 봤다. context7(`/vercel/next.js/v16.2.9`, 등록된 버전 중 가장 최신)은 교차 확인용으로만 썼다.

---

## 1. `"use client"` 위치와 vite 라이브러리 빌드가 지시어를 보존하는지

### 공식 문서가 요구하는 것

- `'use client'`는 파일 맨 위, 모든 import보다 앞에 둔다. 주석은 앞에 와도 된다. 백틱이 아닌 작은따옴표나 큰따옴표로 써야 한다. 지시어는 모듈 전체에 적용된다. ([React `'use client'` Caveats](https://react.dev/reference/rsc/use-client#caveats), [Next.js `use client`](https://nextjs.org/docs/app/api-reference/directives/use-client))
- `"use client"`는 서버 모듈 그래프와 클라이언트 모듈 그래프의 **경계**를 선언한다. 표시된 파일이 import하는 모듈과 직접 렌더링하는 컴포넌트는 모두 클라이언트 번들에 포함된다. 그래서 컴포넌트마다 지시어를 붙일 필요는 없다. ([Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), 16.4.5)
- 클라이언트에서만 실행되어야 하는 React API: `createContext`, `react`·`react-dom` Hook(`use`와 `useId`는 제외), `forwardRef`, `memo`, `startTransition`, DOM 조작 같은 클라이언트 API. 이런 API를 쓰는 서드파티 컴포넌트가 RSC에 대응했다면 자체 `'use client'`를 갖고 있어야 한다. ([React — Using third-party libraries](https://react.dev/reference/rsc/use-client#using-third-party-libraries))
- 서버 모듈이 `'use client'` 모듈에서 가져오는 값은 React 컴포넌트이거나 직렬화할 수 있는 prop 값이어야 한다. 그렇지 않으면 예외가 난다. 함수 prop(`onClick` 등)은 서버 컴포넌트에서 넘길 수 없다. (React Caveats, Next.js `use client` 문서)
- **라이브러리 작성자를 위한 Next.js 공식 조언**(16.4.5 원문 `docs/01-app/01-getting-started/05-server-and-client-components.mdx` 522행):
  > If you're building a component library, add the `"use client"` directive to entry points that rely on client-only features. This lets your users import components into Server Components without needing to create wrappers. It's worth noting some bundlers might strip out `"use client"` directives.
- 라이브러리에 지시어가 없으면 소비자가 직접 `'use client'` 래퍼 파일을 만들어 다시 export해야 한다(Next.js 문서의 `acme-carousel` 예시). Tide가 피해야 할 상황이다.

### Vite 8(Rolldown)이 지시어를 보존하는지

Vite 8.3.6의 `build.rolldownOptions`는 Rolldown에 그대로 전달된다([Vite Build Options](https://vite.dev/config/build-options.html#build-rolldownoptions)). 따라서 지시어 처리 규칙은 Rolldown이 정한다.

**Rolldown 공식 문서**([In-depth: Directives](https://rolldown.rs/in-depth/directives#other-directives), 원문 `rolldown/rolldown` `docs/in-depth/directives.md`)는 `"use client"` 같은 "기타 지시어"를 `"use strict"`와 비슷하게 다룬다고 설명한다. 최상위 지시어는 보존하지 않을 수 있으며, 다음 경우에만 출력한다.

1. 지시어가 최상위 스코프에 있지 않을 때
2. 최상위 지시어이고 그 모듈이 **entry 모듈**일 때
3. 최상위 지시어이고 **`output.preserveModules`가 켜져 있을 때**

모든 파일에 지시어를 강제로 붙이려면 `output.banner: "'use client';"`를 쓰라고 안내한다.

**관련 1차 이슈**

- [rolldown#4862](https://github.com/rolldown/rolldown/issues/4862) "Directives are missing with `preserveModules`": 2025-06-09에 닫혔다. 위 3번 규칙이 이 수정으로 생겼다.
- [rolldown#7809](https://github.com/rolldown/rolldown/issues/7809) "Directives not being preserved": entry가 아닌 hook 파일의 `"use client"`가 사라진다는 보고다. 메인테이너(sapphi-red)는 여러 모듈을 하나로 합친 chunk에 지시어를 유지하는 것도 React 관점에서 맞지 않다고 답했다. 결론은 동작을 바꾸지 않고 경고만 추가하는 것이었다. 커밋 [41813e0](https://github.com/rolldown/rolldown/commit/41813e04a166afc609a89ef923092b7bf0ef2cc3) "add `MODULE_LEVEL_DIRECTIVE` warning (#10791)"으로 2026-09-10에 닫혔다. 커밋 메시지는 "Rollup removes the directives, but this PR does not implement that behavior and keeps the directives"이다. Rolldown CHANGELOG 기준으로 **1.2.9**(2026-09-16)부터 들어갔다.
- 같은 이슈의 댓글: 이 경고는 클라이언트 전용 SPA를 빌드할 때도 dist에 `"use client"`가 들어 있는 의존성 때문에 나온다. `checks: { moduleLevelDirective: false }`로 끌 수 있다고 언급되어 있다. 이 옵션 이름은 이슈 댓글에만 있고 Rolldown 레퍼런스 문서에서는 찾지 못했다(**옵션 이름은 확인 불가**).

**직접 실험한 결과** (vite 8.3.6 + rolldown 1.2.16, Node 26.12.1, `formats: ['es']`)

`button.js`(`"use client"`, `shared.js` import), `hook.js`(`"use client"`), `shared.js`(지시어 없음), 그리고 셋을 다시 export하는 `index.js`를 만들어 빌드했다.

| 설정 | 결과 |
| --- | --- |
| 단일 entry(`index.js`) | 출력 `index.js`에서 **`"use client"`가 모두 사라짐**. 세 모듈이 한 파일로 합쳐짐. 빌드할 때 `module level directive may not be preserved` 경고가 나옴 |
| 다중 entry(`button`, `index`) | entry 파일 `button.js`에는 `"use client"`가 남음. 다만 실제 코드는 지시어가 없는 공유 chunk(`button-xxxx.js`)로 빠지고, `button.js`는 그 chunk를 다시 export하는 얇은 파일이 됨. `index.js`는 공유 chunk를 직접 import하므로 **`index`로 import하면 클라이언트 경계가 없음** |
| 단일 entry + `rolldownOptions.output.preserveModules: true` | 원본 파일마다 출력 파일이 하나씩 생김. `button`·`hook`에 해당하는 파일에는 `"use client"`가 남고 `shared`·`index`에는 없음. **원본의 경계가 그대로 유지됨**. 다만 기본 파일 이름이 `<패키지명>N.js` 형태로 바뀌므로 `entryFileNames`나 `preserveModulesRoot`를 따로 설정해야 할 것으로 보임(실험하지 않음) |

**결론**: Vite 8의 기본 라이브러리 빌드는 `"use client"`를 보존하지 않는다. `preserveModules`를 켜거나, 클라이언트 경계마다 entry를 따로 두되 barrel이 그 entry 파일을 거쳐 가게 하거나, `output.banner`로 지시어를 붙이는 방법이 필요하다. `banner`를 쓰면 모든 출력 파일이 클라이언트 경계가 되므로 서버 컴포넌트로 쓸 수 있는 순수 컴포넌트까지 클라이언트로 넘어간다. 이건 문서 내용에서 추론한 것이고 실험하지 않았다.

참고: Next.js 문서는 esbuild/tsup 설정 예시로 [react-wrap-balancer](https://github.com/shuding/react-wrap-balancer/blob/main/tsup.config.ts#L10-L13)와 [Vercel Analytics](https://github.com/vercel/analytics/blob/main/packages/web/tsup.config.js#L26-L30)를 링크한다. 빌드 도구 선택은 monorepo-tooling 문서의 범위다.

---

## 2. ESM 전용 배포와 `package.json` `exports` 조건

### 확인한 사실

- **Turbopack은 Next.js 16의 기본 번들러다.** `next dev`와 `next build` 모두 별도 설정 없이 Turbopack을 쓴다. ESM은 "Supported — Static and dynamic `import` are fully supported"로 표시되어 있다. ([Next.js Turbopack](https://nextjs.org/docs/app/api-reference/turbopack), 16.4.5)
- 레거시 옵션 `experimental.esmExternals`는 Turbopack에서 "Not planned"다. ESM 패키지를 쓰려고 따로 켤 옵션이 없다는 뜻이다. (같은 문서, 16.4.5 원문 432행)
- App Router는 Server Component와 Route Handler의 의존성을 기본으로 **번들링**한다. `serverExternalPackages`에 넣은 패키지만 Node.js `require`로 런타임에 불러온다. ([transpilePackages](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages), [package-bundling 가이드](https://nextjs.org/docs/app/guides/package-bundling)) 그래서 App Router에서 ESM 전용 패키지는 Node의 CJS/ESM 상호운용 문제를 직접 겪지 않는다. 이건 문서에서 추론한 것이다.
- Node.js에서 `require(esm)`은 v20.19.0, v22.12.0부터 플래그 없이 쓸 수 있고, v25.4.0에서 실험 기능을 벗어났다. ([Node.js Modules — Loading ECMAScript modules using `require()`](https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require)) Next.js 16.4.5의 최소 Node는 20.9.0이다. 따라서 Node 20.9~20.18에서 Tide를 CJS로 `require`하는 경로(예: `serverExternalPackages`에 넣는 경우, CJS 테스트 러너)가 있으면 ESM 전용 패키지는 실패할 수 있다. 이건 버전 범위에서 추론한 것이다.
- `exports` 조건은 구체적인 것을 먼저 쓴다. `"import"`와 `"require"`는 서로 배타적이고, `"default"`는 마지막에 둔다. ([Node.js Packages — Conditional exports](https://nodejs.org/api/packages.html#conditional-exports))
- Vite 라이브러리 모드의 `package.json` 예시는 `"type": "module"`, `exports["."].import`, `"./style.css"` 서브패스 형식이다. `"type": "module"`이 없으면 출력 확장자가 `.mjs`와 `.js`로 바뀐다. ([Vite Library Mode](https://vite.dev/guide/build.html#library-mode), 8.3.6)
- Vite `build.lib`의 기본 `formats`는 `['es', 'umd']`이고, entry가 여러 개면 `['es', 'cjs']`다. ESM만 내려면 `formats: ['es']`로 지정해야 한다. ([build.lib](https://vite.dev/config/build-options.html#build-lib))
- **CSS 서브패스의 `style` 조건**: `@tailwindcss/node`(4.3.5 계열, main 브랜치 `packages/@tailwindcss-node/src/compile.ts`)는 CSS `@import`를 `conditionNames: ['style']`, `mainFields: ['style']`, `extensions: ['.css']`로 해석한다. `tailwindcss@4.3.5`도 자기 `exports["."]`에 `"style": "./index.css"`를 둔다. 따라서 Tide의 CSS 진입점은 `"./theme.css": "./dist/theme.css"`처럼 직접 서브패스로 두거나 `style` 조건을 써도 앱 CSS에서 `@import`로 해석된다.
- `react-server` export 조건으로 서버용 진입점을 따로 두는 방식이 있다. Next.js 16.4.5 문서에서는 이 조건을 설명하는 부분을 찾지 못했다(**확인 불가**). Tide가 이 조건을 쓸 필요가 있는지도 이 조사로는 판단하지 못했다.

### 소비 측 기준 `package.json` 예시 (참고용, 결정 아님)

```json
{
  "name": "@tide-tds/react",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./theme.css": "./dist/theme.css",
    "./package.json": "./package.json"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.3.0"
  }
}
```

`sideEffects`, `types` 조건 순서, peer 범위는 이 조사에서 1차 출처로 확인하지 않았다. 예시를 보여 주려고 넣었다.

---

## 3. `transpilePackages`가 필요한지

Next.js 16.4.5 [transpilePackages](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages) 문서의 "When you need it" 섹션:

- Turbopack은 monorepo의 workspace 패키지(npm, pnpm, Yarn workspaces)를 **두 라우터 모두에서 자동으로 트랜스파일**한다. webpack은 App Router에서 같은 일을 한다.
- `transpilePackages`가 필요한 경우:
  1. `node_modules` 의존성이 **TypeScript나 JSX 원본을 그대로 배포**할 때. Next.js는 기본으로 `node_modules`를 컴파일하지 않는다. 패키지를 평범한 JavaScript로 빌드하고 `main`/`exports`가 빌드 결과를 가리키게 하면 필요 없다.
  2. Pages Router + webpack 조합에서 의존성 소스가 Next 앱 디렉터리 밖에 있을 때
  3. Pages Router에서 `node_modules` 의존성을 라우트에 번들로 넣고 싶을 때
- 한 패키지를 `transpilePackages`와 `serverExternalPackages`에 동시에 넣으면 빌드를 시작할 때 오류가 난다.

**결론**: Tide가 npm에 **컴파일된 JS(+ `.d.ts`)** 를 배포하고 `exports`가 `dist`를 가리키면 App Router 소비자는 `transpilePackages`를 설정할 필요가 없다. TS/JSX 원본을 배포하면 소비자가 설정해야 한다.

참고: Turbopack은 프로젝트 루트 밖의 파일을 해석하지 않는다. 루트는 lockfile 등을 찾아 자동으로 정한다. ([turbopack config](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack), 16.4.5) Tide 저장소 안에 Next 예제 앱을 workspace 패키지로 둘 때 고려할 점이며, npm 소비자와는 관계없다.

---

## 4. 앱의 Tailwind가 `node_modules`에 있는 Tide 클래스를 스캔하는 설정

Tailwind 4.3 [Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files):

- Tailwind는 프로젝트의 모든 파일을 스캔한다. 단 `.gitignore`에 있는 파일, **`node_modules` 디렉터리**, 바이너리, CSS 파일, lockfile은 제외한다.
- 외부 라이브러리를 스캔하려면 `@source`로 경로를 **스타일시트 기준 상대 경로**로 등록한다. 문서 예시: `@source "../node_modules/@acmecorp/ui-lib";` "Tailwind로 빌드한 외부 라이브러리를 스캔할 때 특히 유용하다"고 적혀 있다.
- `@source not`, `@source inline()`(safelist), `@import "tailwindcss" source("../src")`(기준 경로), `source(none)`(자동 감지 끄기)을 쓸 수 있다.
- 클래스 이름은 평문으로 스캔하므로 `bg-${color}-600`처럼 동적으로 조합하면 생성되지 않는다. 완전한 클래스 문자열로 매핑해야 한다. 컴파일된 dist에서도 클래스 문자열이 그대로 남아 있어야 한다는 뜻이다.

Tailwind CHANGELOG에서 관련 항목을 확인했다([CHANGELOG.md](https://github.com/tailwindlabs/tailwindcss/blob/main/CHANGELOG.md)).

- "Ignore `node_modules` by default (can be overridden by `@source …` rules)"
- "`@source` rules that include file extensions or point inside `node_modules/` folders no longer consider your `.gitignore` rules"
- "Follow symlinks when resolving `@source` directives". pnpm의 심볼릭 링크 구조와 관련된다.
- "Ignore `.pnpm-store` folders by default"

**라이브러리 CSS 안에 `@source`를 넣을 수 있는지**: 공식 문서에는 명시되어 있지 않다. Tailwind 소스(main 브랜치 `packages/tailwindcss/src/index.ts`, `at-import.ts`)를 보면 `@source`의 `base`는 `ctx.context.base`이고, `@import`로 불러온 각 스타일시트는 `context({ base: loaded.base }, ast)`로 감싸진다. 따라서 Tide의 `theme.css` 안에 `@source "./";`처럼 쓰면 **그 CSS 파일 위치를 기준으로** 해석될 것으로 보인다. 이건 소스 코드를 읽고 내린 해석이며 실험하지 않았다. 문서로는 **확인 불가**다.

### 소비 측 설정 예시

```css
/* app/globals.css */
@import "tailwindcss";
@import "@tide-tds/react/theme.css"; /* 패키지 이름과 경로는 미정 */

/* Tide 컴포넌트가 쓰는 유틸리티 클래스를 생성하려면 dist를 스캔해야 한다 */
@source "../node_modules/@tide-tds/react/dist";
```

```js
// postcss.config.mjs (Tailwind 4.3 Next.js 가이드와 Next.js CSS 문서의 예시와 같음)
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

경로 `../node_modules/...`는 `app/globals.css` 기준이다. monorepo 앱에서 `node_modules`가 다른 위치에 hoist되면 경로가 달라진다. 이건 문서의 "스타일시트 기준 상대 경로" 규칙에서 추론한 것이다.

---

## 5. 테마 CSS와 폰트를 import하는 방식, `next/font`와 함께 쓰는 법

### CSS import

- 외부 패키지가 배포한 스타일시트는 `app` 디렉터리 어디에서든 import할 수 있다. 예시는 `import 'bootstrap/dist/css/bootstrap.css'`다. ([Next.js CSS — External stylesheets](https://nextjs.org/docs/app/getting-started/css#external-stylesheets), 16.4.5)
- 전역 CSS는 root layout에서 import하는 것을 권장한다. 라우트를 이동해도 스타일시트가 제거되지 않아 충돌이 생길 수 있으므로 "정말 전역인 CSS(Tailwind base 같은 것)"에만 쓰라고 한다. 프로덕션 빌드에서 CSS 순서는 **import 순서**를 따른다. (같은 문서 Global CSS, Ordering and Merging)
- Tailwind 방식에서 Tide theme CSS는 JS에서 따로 import하기보다 앱의 `globals.css`에서 `@import "tailwindcss"` 다음에 `@import`해야 Tailwind가 그 안의 `@theme`를 처리할 수 있다. `@import` 해석에는 `style` 조건이 쓰인다(2절 참고). Tailwind가 `@theme`를 처리하는 방식은 tailwind-theme-and-autocomplete 문서의 범위다.

### `next/font`

[Next.js Font Module](https://nextjs.org/docs/app/api-reference/components/font) (16.4.5 원문 `docs/01-app/03-api-reference/02-components/font.mdx`):

- `variable: '--font-xxx'` 옵션으로 CSS 변수를 선언하고, `font.variable` className을 `<html>`이나 `<body>`에 붙인다.
- **Tailwind v4 연동 공식 예시**:
  ```css
  @import 'tailwindcss';
  @theme inline {
    --font-sans: var(--font-inter);
    --font-mono: var(--font-roboto-mono);
  }
  ```
- `next/font/local`의 `src`는 **font loader를 호출한 파일의 디렉터리 기준 상대 경로**다. `node_modules` 안의 폰트 파일을 직접 가리킬 수 있는지는 문서에 없다(**확인 불가**).
- 폰트는 loader를 호출한 파일 종류에 따라 preload된다. root layout에서 호출하면 모든 라우트에 preload된다.
- `next/font`는 Next.js 전용 모듈이다. 프레임워크와 무관해야 하는 Tide 패키지(ADR 0001)는 `next/font`를 호출할 수 없다. 그러니 폰트를 로드하는 일은 앱이 맡고, Tide는 CSS 변수를 통해 폰트를 받는 구조가 자연스럽다. 이건 ADR과 문서에서 추론한 것이다.

### 소비 측 설정 예시

```tsx
// app/layout.tsx
import localFont from "next/font/local";
import "./globals.css";

const sans = localFont({
  src: "./fonts/PretendardVariable.woff2", // 폰트 선정은 다른 티켓의 범위
  variable: "--font-tide-sans",            // 변수 이름은 미정
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@tide-tds/react/theme.css";

@theme inline {
  --font-sans: var(--font-tide-sans);
}
```

---

## 6. dark Theme 전환 시 hydration 깜빡임을 막는 방법

### Next.js 공식 가이드

Next.js 16.4.5에는 전용 가이드 [How to prevent flash before hydration](https://nextjs.org/docs/app/guides/preventing-flash-before-hydration)이 있다(원문 `docs/01-app/02-guides/preventing-flash-before-hydration.mdx`). Themes 섹션의 내용:

- 서버는 기본 테마(예: light)로 렌더링한다. 사용자 선호는 `localStorage`나 cookie에 있다.
- 클라이언트 컴포넌트에서 다시 렌더링하면 hydration 오류가 난다. `useEffect`로 미루면 오류는 없지만 **화면이 깜빡인다**.
- 해결책: `<head>` 안의 **인라인 `<script>`**(`dangerouslySetInnerHTML`)가 HTML을 파싱하는 동안 동기적으로 실행되어 `<html data-theme>`를 첫 페인트 전에 설정한다. `<html>`에 `suppressHydrationWarning`을 붙인다. `try/catch`로 `localStorage`를 쓸 수 없는 환경에 대비한다.
- cookie를 쓸 때: root layout에서 `cookies()`로 읽으면 앱 전체가 정적 프리렌더링에서 빠진다. 그래서 cookie도 인라인 스크립트에서 읽으라고 권장한다.
- 엄격한 CSP를 쓰면 인라인 스크립트에 nonce가 필요하다.
- React는 개발 모드에서 렌더링 결과에 `<script>`가 있으면 경고한다. 가이드는 서버에서 `type="text/javascript"`, 클라이언트에서 `type="text/plain"`을 쓰는 `InlineScript` 헬퍼 패턴을 소개한다.

`suppressHydrationWarning`은 한 단계 깊이에만 적용되는 탈출구다. React는 불일치한 텍스트를 고치지 않는다. ([React hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors), [Next.js hydration error](https://nextjs.org/docs/messages/react-hydration-error))

### Tailwind 측 dark variant

[Tailwind 4.3 Dark mode](https://tailwindcss.com/docs/dark-mode):

- 기본 동작은 `prefers-color-scheme`이다. 수동 전환은 `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`(data 속성 방식)나 class 방식으로 바꾼다.
- 시스템/라이트/다크 3단계 전환 예시에도 "FOUC를 피하려면 `head`에 인라인으로 넣는 것이 좋다"는 주석이 있다.

### 소비 측 설정 예시

```tsx
// app/layout.tsx — Next.js 공식 가이드의 패턴을 그대로 옮김
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

```css
/* app/globals.css 또는 Tide theme.css 안 */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

가이드의 스크립트는 `localStorage` 값만 본다. 시스템 설정까지 반영하려면 Tailwind 예시처럼 `matchMedia("(prefers-color-scheme: dark)")`도 확인해야 한다.

---

## Tide에 주는 시사점 (결정 아님)

1. **Vite 8의 기본 빌드는 `"use client"`를 지운다.** Next.js가 권하는 "entry에 `use client`"를 지키려면 다음 중 하나가 필요하다: (a) `preserveModules`로 원본 파일 단위를 유지하기, (b) 클라이언트 경계마다 entry를 나누고 barrel이 그 entry를 통과하게 하기, (c) `output.banner`로 전체 파일에 붙이기(모든 컴포넌트가 클라이언트가 됨). 어느 방식이든 빌드 결과물을 검사하는 테스트(dist에 지시어가 있는지)를 두는 것이 좋겠다. Rolldown 1.2.9 이상의 `MODULE_LEVEL_DIRECTIVE` 경고도 신호로 쓸 수 있다.
2. **경계를 어디에 둘지는 Component 단위로 정해야 한다.** Hook, Context, `forwardRef`를 쓰는 컴포넌트만 `"use client"`로 표시하면 정적인 컴포넌트(Text, Badge 등)는 서버 컴포넌트로 남을 수 있다. 다만 Tide가 headless 라이브러리를 감싸는 구조라면 대부분 클라이언트 컴포넌트가 될 가능성이 크다(headless 결정 티켓과 관련). 함수 prop은 서버에서 넘길 수 없다는 제약도 Component API 규칙에 영향을 준다.
3. **ESM 전용 + 컴파일된 dist 배포면 App Router 소비자는 `transpilePackages`와 `esmExternals` 설정이 필요 없다.** 남는 위험은 Node 20.9~20.18에서 CJS `require` 경로를 쓰는 경우다. CJS 출력을 같이 낼지는 이 위험을 얼마나 중요하게 볼지에 달려 있다.
4. **앱은 `@source "../node_modules/@tide-tds/<패키지>/dist"`를 직접 적어야 한다.** 이 한 줄을 Tide의 `theme.css` 안으로 옮길 수 있는지(소스 코드상 가능해 보임)는 실험으로 확인할 가치가 있다. 옮길 수 있으면 설치 문서가 짧아진다. dist에 클래스 문자열이 그대로 남도록 minify나 동적 조합을 피해야 한다.
5. **폰트 로드는 앱이 맡고 Tide는 CSS 변수로 받는 구조가 `next/font`와 잘 맞는다.** Tide가 정할 것은 변수 이름(`--font-sans`에 직접 연결할지, Tide 전용 변수를 둘지)과 대체 폰트 스택이다.
6. **dark Theme은 `<html data-theme>`와 인라인 스크립트 조합이 Next.js 공식 권장 방식이다.** Tide가 정할 것은 다음과 같다. 선택자 이름(`data-theme` 또는 `.dark`), 그 선택자에 맞춘 `@custom-variant dark`를 theme CSS에 넣을지, 그리고 인라인 스크립트 문자열이나 `ThemeScript` 같은 헬퍼를 제공할지. 헬퍼를 제공하면 CSP nonce를 받을 수 있게 해야 한다.

## 확인하지 못한 것

- Rolldown `checks.moduleLevelDirective` 옵션 이름: 이슈 댓글에만 있고 레퍼런스 문서에서 찾지 못했다.
- Next.js 16.4.5 문서에서 `react-server` export 조건을 설명하는 부분
- `next/font/local`의 `src`가 `node_modules` 안 파일을 가리킬 수 있는지
- Tide CSS 안의 `@source`가 소비자 앱에서 의도대로 해석되는지: 소스 코드상 가능해 보이지만 실험하지 않았다.
- `preserveModules`를 쓸 때 출력 파일 이름을 원본 경로대로 맞추는 설정(`entryFileNames`, `preserveModulesRoot`)이 Vite 8 라이브러리 모드에서 동작하는지
