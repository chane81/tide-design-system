# Storybook 문서 사이트 구성 조사

티켓: [25. Storybook 문서 사이트 구성 조사](../progress/tide-v0/issues/25-research-storybook.md)

Tide 공개 문서 사이트(Storybook 하나, MDX, private `apps/docs`)를 만들 때 필요한 사실을 정리한다. 패키지 구조와 TS 7 단독 결정은 [모노레포 패키지 구조와 빌드 결정](../progress/tide-v0/issues/16-grilling-monorepo-structure.md), Tailwind 연동 일반론은 [monorepo-tooling.md](./monorepo-tooling.md) 7절과 [tailwind-theme-and-autocomplete.md](./tailwind-theme-and-autocomplete.md)에 있다. 이 문서는 결정을 내리지 않고 시사점만 적는다. 결정은 [26. Storybook 문서 구성 결정](../progress/tide-v0/issues/26-grilling-storybook.md)에서 한다.

## 조사 기준 버전 (2026-11-09, `npm view`로 확인)

| 패키지                                             | 최신 안정 버전 | 비고                                                                                                                                                                              |
| -------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `storybook`                                        | 10.6.6         | 2026-11-05 배포. `next` 태그는 11.0.0-beta.0                                                                                                                                      |
| `@storybook/react-vite`                            | 10.6.6         | peer `vite ^5 \|\| ^6 \|\| ^7 \|\| ^8`, `react ^16.8 ~ ^19`, `typescript >= 4.9.x`. dependency로 `react-docgen ^8.0.2`, `@joshwooding/vite-plugin-react-docgen-typescript ^0.7.0` |
| `@storybook/addon-docs`                            | 10.6.6         | dependency `@mdx-js/react ^3.0.0`. Doc Block은 `@storybook/addon-docs/blocks`에서 import                                                                                          |
| `@storybook/addon-themes`                          | 10.6.6         |                                                                                                                                                                                   |
| `@storybook/addon-a11y`                            | 10.6.6         | dependency `axe-core ^4.2.0`                                                                                                                                                      |
| `@storybook/addon-vitest`                          | 10.6.6         | 테스트 전략 티켓(27) 범위                                                                                                                                                         |
| `@storybook/blocks`, `@storybook/addon-essentials` | 8.6.14         | **10에서는 쓰지 않는 옛 패키지**. 9.0 alpha에서 멈춤. 블록은 `@storybook/addon-docs/blocks`로, essentials는 core로 들어갔다                                                       |
| `axe-core`                                         | 4.14.0         | 실험 설치에서도 4.14.0으로 풀림                                                                                                                                                   |
| `react-docgen`                                     | 8.0.4          | 실험 설치에서 8.0.4로 풀림                                                                                                                                                        |
| `typescript`                                       | 7.0.2          |                                                                                                                                                                                   |
| `tailwindcss` / `@tailwindcss/vite`                | 4.3.5 / 4.3.5  | `@tailwindcss/vite` peer `vite ^5.2.0 \|\| ^6 \|\| ^7 \|\| ^8`                                                                                                                    |
| `vite`                                             | 8.3.6          |                                                                                                                                                                                   |
| `react`                                            | 19.3.1         |                                                                                                                                                                                   |

**1차 출처**: GitHub `storybookjs/storybook`의 **`v10.6.6` 태그**(커밋 `a3bc279`, 2026-11-05)를 받아 `docs/`와 `code/` 원문을 직접 읽었다. 아래에서 "문서 `docs/...`"는 이 태그 안의 경로이고, 공개 사이트에서는 `https://storybook.js.org/docs/<같은 경로>`로 보인다. 소스 코드 인용도 같은 태그 기준이다.

**실험**: scratchpad에 pnpm workspace를 만들고 `packages/foundation`(`tailwind.css`, `tokens.css`), `packages/desktop`(`styles.css`, Button), `packages/icons`(가짜 아이콘 Component 2,000개), `apps/docs`(Storybook 10.6.6 + Vite 8.3.6 + Tailwind 4.3.5 + TS 7.0.2, addon-docs·themes·a11y)를 두었다. Node 26.12.1, pnpm 12.11.2. `storybook build`를 돌리고, 결과물을 로컬 정적 서버에 올려 헤드리스 Chromium(agent-browser)으로 확인했다. 저장소에는 아무것도 남기지 않았다.

---

## 1. Storybook 버전, React + Vite 프레임워크, TS 7 단독 환경

### 확인한 사실

- 최신 안정은 **10.6.6**이고 프레임워크 패키지는 **`@storybook/react-vite`** 다. 요구 사항은 React ≥ 16.8, Vite ≥ 5다(문서 `docs/get-started/frameworks/react-vite.mdx`). Node 요구는 `^22.12.0 || ^24 || >=26`다([monorepo-tooling.md](./monorepo-tooling.md)).
- `typescript.reactDocgen`의 타입은 `'react-docgen' | 'react-docgen-typescript' | false`이고, `@storybook/react`가 있으면 기본값은 `'react-docgen'`이다. 문서는 "`react-docgen-typescript`는 TypeScript 컴파일러를 호출해 느리지만 대체로 정확하고, `react-docgen`은 자체 분석이라 훨씬 빠르지만 불완전하다"고 쓴다(문서 `docs/api/main-config/main-config-typescript.mdx`).
- 소스(`code/frameworks/react-vite/src/preset.ts`)를 보면 `'react-docgen'`일 때 Babel 기반 react-docgen 플러그인이 `.mjs/.tsx/.ts/.jsx/.js` 전부를 처리한다. `react-docgen-typescript` 플러그인은 옵션이 `'react-docgen-typescript'`이고 `typescript`가 resolve될 때만 붙는다. 즉 기본값에서는 docgen 경로에 TS API가 들어가지 않는다.
- TS API를 쓰는 곳은 따로 있다.
  - `code/renderers/react/src/componentManifest/reactDocgen/utils.ts`의 `getTsConfig`는 `import('typescript')` 후 `ts.findConfigFile(..., ts.sys.fileExists)`를 부른다. 단 `try/catch`로 감싸 실패하면 `{}`를 돌려준다. 16번 결정에 적힌 `react-docgen-typescript` 실패 메시지(`reading 'fileExists'`)는 `ts.sys`가 없을 때의 모양과 같다. TS 7에 JS API가 없어서 생기는 것으로 보인다(추론. 실패 스택을 따로 추적하지는 않았다).
  - **`features.experimentalDocgenServer`**(실험, 기본 `false`): "TypeScript Language Service로 dev 서버에서 메타데이터를 뽑는다"(문서 `docs/api/main-config/main-config-features.mdx`). 소스(`componentMeta/ComponentMetaProject.ts`)는 `@volar/language-core`와 `typescript` 타입을 쓴다. **TS 7 단독에서는 동작하지 않을 가능성이 높다**(추론, 실험하지 않음).
  - **`features.componentsManifest`**(기본 `false`): MCP 서버용 manifest를 만든다. React는 `reactDocgen` 설정을 그대로 따르므로 기본값에서는 react-docgen을 쓴다(`componentManifest/generator.ts`). `experimentalReactComponentMeta`를 켜면 TS 기반 엔진으로 바뀐다.
- CSF Next(`definePreview`, `defineMain`)는 "preview" 단계 기능이다(문서 `docs/api/csf/csf-next.mdx`). `@storybook/react-vite@10.6.6`의 exports에 `./node`가 있다. SEED는 `@storybook/nextjs-vite/node`의 `defineMain`을 쓰고 있다(아래 8절).

### 실험 결과 (TS 7.0.2 단독)

- `reactDocgen: 'react-docgen'` + MDX 3개 + CSF 1개 구성으로 `storybook build`가 **약 5초 만에 성공**했다. Button 청크의 `__docgenInfo`에 union(`'solid' | 'outline'`), 기본값(`'solid'`), JSDoc 설명(한글)이 들어 있었다. 16번 결정의 실측과 같다.
- MDX는 Storybook의 MDX 플러그인이 컴파일하고 `tsc`는 MDX를 읽지 않는다. 그래서 TS 7이어도 MDX 빌드에는 영향이 없었다. 에디터에서 MDX 안의 TS 타입을 검사하는 문제는 [monorepo-tooling.md](./monorepo-tooling.md)에 적은 대로 **확인 불가**다.
- `.storybook/main.ts`, `preview.ts`, 직접 만든 decorator를 TS 7 `tsc --noEmit`으로 검사했을 때 오류가 없었다(`@storybook/react-vite`, `storybook/preview-api`, `storybook/internal/core-events` 타입 포함).
- 빌드할 때 Node 26에서 `DEP0205 module.register() is deprecated` 경고가 나왔다. 동작에는 영향이 없었다.

---

## 2. Tailwind 4.3.x 연결과 workspace 패키지 CSS 읽기

### 공식 안내

- Storybook 공식 Tailwind 레시피([storybook.js.org/recipes/tailwindcss](https://storybook.js.org/recipes/tailwindcss))는 Vite 사용자라면 PostCSS 설정 단계를 건너뛰고, Tailwind CSS 파일을 `.storybook/preview`에서 import하라고 안내한다. Tailwind v4 전용 단계는 없다.
- addon-themes의 Tailwind 가이드(`code/addons/themes/docs/getting-started/tailwind.md`)도 "CSS를 `preview`에서 import → `withThemeByClassName` 또는 `withThemeByDataAttribute`"의 두 단계뿐이다. 이 가이드의 `main.js` 예시에는 10에서 없어진 `@storybook/addon-essentials`가 그대로 남아 있다(문서가 옛 내용).
- Vite 빌더는 Storybook 프로젝트 루트의 `vite.config.*`를 자동으로 병합한다([monorepo-tooling.md](./monorepo-tooling.md) 7절). 그러니 `@tailwindcss/vite`를 `apps/docs/vite.config.ts`에 넣으면 된다.
- Tailwind는 `node_modules`와 `.gitignore`에 든 파일을 스캔하지 않는다. 바깥 패키지는 `@source`로 등록해야 한다([tailwindcss.com/docs/detecting-classes-in-source-files](https://tailwindcss.com/docs/detecting-classes-in-source-files)).
- Storybook 소스(`@storybook/builder-vite@10.6.6` dist)는 Vite `base: "./"`를 설정한다(7절과 관련).

### 실험한 구성과 결과

```css
/* apps/docs/.storybook/tide.css — preview.ts에서 import */
@import "tailwindcss";
@import "@tide-tds/foundation/tailwind.css"; /* @theme + tokens.css */
@import "@tide-tds/desktop/styles.css"; /* 안에 @source "./src" */
@source "../src"; /* docs 앱의 MDX·블록 */
```

- `vite.config.ts`: `plugins: [react(), tailwindcss()]`, `resolve.conditions: ['@tide-tds/source']`(16번 결정의 개발용 exports 조건). desktop은 dist 없이 `src/index.ts`로 연결됐다.
- 빌드된 CSS에 desktop 소스의 class(`bg-primary-solid`, `h-10`, `border-primary-solid`), docs 앱 MDX와 블록의 class(`bg-canvas`, `text-default`, `grid-cols-6`)가 모두 생성되었다. `--color-*: initial`로 지운 기본 팔레트(`bg-red-500`)는 생성되지 않았다.
- 19번 프로토타입에서 확인한 "패키지 CSS 안의 `@source "./"` + `exports` 경로 `@import`" 방식이 Storybook(Vite) 쪽에서도 그대로 동작했다.
- **Storybook 문서 스타일과 겹침**: MDX 페이지의 `h1`은 Tailwind preflight가 있어도 Storybook 스타일(32px, 700)을 유지했다. 대신 MDX 안에 직접 넣은 요소의 `font-family`는 Storybook 문서 글꼴(`"Nunito Sans", ...`)을 상속했다. 문서는 MDX에 직접 import한 Component는 `<Unstyled>`로 감싸고, `<Unstyled>`는 중첩하지 말고 MDX 루트에 두라고 권한다(문서 `docs/api/doc-blocks/doc-block-unstyled.mdx`).

---

## 3. MDX 문서 페이지와 Token 시각화

### 기본 Doc Block (10.6.6에 있음)

문서 `docs/writing-docs/doc-blocks.mdx`의 "Available blocks"에 **ArgTypes, Canvas, ColorPalette(+ColorItem), Controls, Description, IconGallery(+IconItem), Markdown, Meta, Primary, Source, Stories, Story, Subtitle, TableOfContents, Title, Typeset, Unstyled**가 있다. `useOf` hook으로 직접 블록을 만드는 방법도 공식으로 안내한다("Make your own Doc Blocks").

| 블록                         | props(문서 기준)                                                                  | Tide 요구와 맞는지                                                                                                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ColorPalette` / `ColorItem` | `ColorItem`: `title`, `subtitle`, `colors: string[] \| {[key]: string}`           | 문자열을 CSS 값으로 그대로 쓴다. 실험에서 `'var(--tide-color-bg-primary-solid)'`도 swatch로 그려졌다. 대비비, 짝이 되는 text 색, light/dark 나란히 보기 같은 표시는 없다                         |
| `Typeset`                    | `fontFamily`, `fontSizes: (string\|number)[]`, `fontWeight: number`, `sampleText` | **행간 prop이 없고 굵기는 하나뿐이다.** 크기·행간·굵기가 묶인 텍스트 스타일 14개를 그대로 보여 줄 수 없다                                                                                        |
| `IconGallery` / `IconItem`   | `IconItem`: `name`, `children`                                                    | 소스(`components/IconGallery.tsx`, 80행)는 CSS grid(`minmax(140px, 1fr)`)일 뿐이다. 검색, 가상화, 지연 렌더링이 없다. 문서는 많은 아이콘을 `Object.keys(icons).map(...)`으로 반복하라고 안내한다 |

- 그림자, radius, motion 전용 블록은 없다(위 목록 기준).
- MDX는 React로만 렌더링한다(문서 `docs/writing-docs/mdx.mdx` "Known limitations"). Tide는 React 전용이라 제약이 없다.
- story가 없는 MDX 페이지("unattached documentation")를 만들 수 있다. `<Meta title="Foundations/Color" />`로 사이드바 위치를 정한다(같은 문서).

### 직접 만든 React 블록 사례

- Storybook 공식 문서가 직접 만드는 방법(`useOf`)과 IconGallery 확장 예시를 제공한다.
- 레퍼런스 시스템은 Foundation 문서를 Storybook 기본 블록으로 만들지 않는다. Primer, Atlassian, Radix, SEED 모두 공개 문서를 Storybook이 아닌 별도 사이트로 운영한다(8절). 그래서 "Storybook 기본 블록으로 Token 페이지를 만든 대형 시스템" 사례는 찾지 못했다(**확인 불가**).
- 실험에서는 `ColorSwatch`(Tailwind class + `var(--tide-*)`)를 `.tsx`로 만들어 MDX에서 `<Unstyled>`로 감싸 렌더링했다. 빌드와 렌더링 모두 문제없었다.

---

## 4. Theme(light/dark, `[data-theme]`) 전환

### `@storybook/addon-themes` 10.6.6의 API (`code/addons/themes/docs/api.md`, 소스)

- decorator 세 가지: `withThemeFromJSXProvider`, `withThemeByClassName`, `withThemeByDataAttribute`.
- `withThemeByDataAttribute({ themes, defaultTheme, parentSelector = 'html', attributeName = 'data-theme' })`. 기본값이 Tide 규칙(`html[data-theme]`)과 같다.
- 직접 decorator를 만들 때 쓰는 `DecoratorHelpers`: `initializeThemeState(themeNames, defaultTheme)`(툴바 등록), `pluckThemeFromContext(context)`(선택된 Theme 읽기). `useThemeParameters`는 deprecated다. story 단위 고정은 `parameters.themes.themeOverride`로 한다.
- 선택값은 globals의 `theme` 키에 들어간다. URL에서는 `&globals=theme:dark`로 지정할 수 있다(실험에서 확인).
- 문서 `docs/essentials/themes.mdx`는 frontmatter가 `draft: true`다. 공개 사이트에서 정식 페이지로 보이는지는 **확인 불가**다. 정본은 addon 저장소의 `docs/api.md`다.

### 소스로 확인한 동작

`withThemeByDataAttribute`는 story 렌더 안에서 `useEffect(() => parent.setAttribute(attributeName, themes[key]))`만 한다(`src/decorators/data-attribute.decorator.tsx`). 전환 전후로 끼어들 hook이 없다.

### 실험 결과

| 페이지                                             | 결과                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------ |
| CSF story (`viewMode=story`, `globals=theme:dark`) | `html[data-theme="dark"]` 적용됨                                               |
| autodocs 페이지(story를 포함한 docs)               | `data-theme="light"` 적용됨                                                    |
| **story가 없는 MDX 페이지**                        | **`data-theme`이 설정되지 않음**(`null`). `globals=theme:dark`를 줘도 마찬가지 |

- decorator는 story를 렌더링할 때만 실행된다. 원칙·Foundation처럼 story가 없는 MDX 페이지에는 decorator 방식만으로 Theme이 적용되지 않는다.
- 대안으로 `preview.ts` 최상위에서 `addons.getChannel()`(`storybook/preview-api`)로 `SET_GLOBALS`·`GLOBALS_UPDATED`(`storybook/internal/core-events`) 이벤트를 구독해 `html`에 속성을 붙여 봤다. **story 없는 MDX 페이지에서도, manager URL로 열었을 때도 `dark`가 적용됐다.** `storybook/internal/core-events`는 이름에 internal이 들어 있지만 Storybook 문서의 addon API 예시(`docs/_snippets/storybook-addons-api-getchannel.md`)와 마이그레이션 표가 이 경로를 쓴다.
- Storybook 문서 UI 자체(ArgTypes 표, 블록 배경)의 색은 `parameters.docs.theme`(`storybook/theming`의 `themes.dark` 등)으로 정한다. 공식 예시는 정적인 지정뿐이다(`docs/_snippets/storybook-preview-docs-dark-theme.md`). globals에 따라 바꾸려면 `parameters.docs.container`로 `DocsContainer`를 감싸는 방법(`docs/writing-docs/autodocs.mdx`)이 있지만 실험하지 않았다(**확인 불가**).
- Primer는 globals에 `all`을 두어 모든 Theme을 나란히 렌더링한다(`primer/react` `packages/react/.storybook/preview.jsx`). `body`에 `data-color-mode` 등을 붙인다.

### 전환 순간 transition 끄기를 넣을 위치

21번 결정 내용: 전환 직전에 `transition: none !important`를 넣고, 강제로 reflow한 뒤, 다음 프레임에 뺀다. addon-themes의 내장 decorator에는 이 단계를 넣을 수 없다. 넣을 수 있는 곳은 둘이다.

1. `DecoratorHelpers`로 만든 **직접 작성한 decorator**의 `useEffect` 안. story가 있는 페이지에서만 동작한다.
2. 위의 **channel 구독 함수** 안. MDX 페이지까지 포함된다.

실험에서 1번 위치에 `<style>` 삽입 → `setAttribute` → `getComputedStyle` → 두 번의 `requestAnimationFrame` 뒤 제거하는 코드를 넣었다. 빌드와 Theme 적용은 확인했다. **번짐이 실제로 사라지는지 눈으로 비교하지는 않았다**(확인 불가). 이 코드는 Tide 사용자에게 줄 "Theme 전환 가이드" 예시로도 그대로 쓸 수 있는 형태다.

---

## 5. 접근성 addon(`@storybook/addon-a11y`)

### 확인한 사실 (문서 `docs/writing-tests/accessibility-testing.mdx`, 소스 `code/addons/a11y/src/preview.tsx`)

- Deque **axe-core** 기반이다. dependency 범위는 `^4.2.0`이고 현재 설치하면 **4.14.0**이 된다. 문서는 axe가 "WCAG 문제의 최대 57%"를 자동으로 잡는다고 인용한다.
- 설정: `parameters.a11y.context`(기본 `'body'`), `parameters.a11y.config`(`axe.configure`로 전달. 기본으로 `region` 규칙을 끔), `parameters.a11y.options`(`axe.run` 옵션), `parameters.a11y.test`, `globals.a11y.manual`.
- **기본 규칙셋은 WCAG 2.0·2.1 A/AA와 best-practice다.** WCAG 2.2를 검사하려면 `options.runOnly`에 태그를 직접 넣어야 한다. axe-core 4.14.0의 rule-descriptions에서 `wcag22aa` 태그가 붙은 규칙은 **`target-size`(2.5.8) 하나**다([axe-core v4.14.0 rule-descriptions](https://github.com/dequelabs/axe-core/blob/v4.14.0/doc/rule-descriptions.md)).
- `parameters.a11y.test`: `'off'`(실행 안 함), `'todo'`(경고), `'error'`(실패). 소스는 값이 없으면(`undefined`) `'error'`와 같은 `failed` 상태로 보고한다. CI에서 실패로 처리되는지는 문서에 "`'error'`일 때 CI에서 실패"라고만 되어 있어, `undefined`일 때 CLI 결과가 어떤지는 **확인 불가**다(테스트 전략 티켓 27에서 확인할 일).
- **`viewMode === 'story'`일 때만 자동 검사한다**(소스 `preview.tsx` 42행). docs 페이지(MDX, autodocs)는 자동 검사 대상이 아니다. MDX 안의 Do/Don't 예시는 story로 만들어야 검사된다.
- Vitest addon과 함께 쓰면 Playwright Chromium에서 component test와 같이 돌아간다. 환경에 따라 axe 결과가 달라질 수 있다는 FAQ가 있다.
- 빌드된 Storybook에서 패널에 위반 사항이 안 보이는 문제가 있어 `features.developmentModeForBuild`가 생겼다(같은 문서 FAQ).
- 소스에 시각 장애 시뮬레이터(`withVisionSimulator.ts`)가 있다.
- 실험 빌드에서 axe 청크는 약 659 kB(gzip 188 kB)였다.

---

## 6. 아이콘 2,000개 이상 검색 페이지

### 공식 블록의 한계

`IconGallery`는 grid 레이아웃만 있다(3절). 검색, 필터, 가상화, 복사 같은 기능은 직접 만들어야 한다. Storybook 문서에서 대량 아이콘의 성능을 다루는 안내는 찾지 못했다(**확인 불가**).

### 실험 (가짜 아이콘 2,000개, 각 `<svg>` 안에 path 1개 + circle 1개)

- 구성: `@tide-tds/icons`를 흉내 낸 패키지에서 `import * as icons`를 하고, `useDeferredValue`로 검색어를 지연시켜 `filter`했다. 목록에는 `content-visibility: auto`를 걸었다. 가상화는 하지 않았다.
- 빌드: MDX 페이지마다 청크가 나뉘어, 아이콘 페이지 청크(`Icons-*.js`)만 **약 987 kB(gzip 86 kB)** 가 되었다. 다른 페이지를 열 때는 이 청크를 받지 않는다. Vite가 500 kB 초과 경고를 냈다.
- 렌더링(로컬 정적 서버, 헤드리스 Chromium): 이동 후 약 0.3초 안에 2,000개가 그려졌다. 검색어를 넣으면 결과 수가 바로 바뀌었다(111개).
- 한계: 실제 Lucide 아이콘은 path가 더 많다. 네트워크 지연이나 저사양 기기는 재지 않았다. 숫자는 대략적인 참고값이다.
- 아이콘 이름·태그 메타데이터를 Component와 따로(`meta`) 내보내면, 검색 인덱스와 Component 렌더링을 나눌 수 있다(실험에서 파일만 만들고 쓰지는 않았다).

---

## 7. 정적 빌드 배포처와 base path

### 확인한 사실

- `storybook build`의 기본 출력은 `storybook-static`이고 `-o`로 바꾼다. 문서 모드만 빌드하는 `--docs` 플래그가 있다(문서 `docs/api/cli-options.mdx`).
- 공식 문서(`docs/sharing/publish-storybook.mdx`)는 Chromatic을 권장하고, GitHub Pages·Netlify·S3 같은 정적 호스트도 된다고 적는다. Composition, embed, 버전 이력은 호스트가 "Component Publishing Protocol"을 얼마나 지원하는지에 달려 있다. Chromatic은 CPP level 1(버전별 URL, `/index.json`, `/metadata.json`), Netlify·S3는 level 0이다.
- **GitHub Pages**: 공식 문서는 커뮤니티 Action [bitovi/github-actions-storybook-to-github-pages](https://github.com/bitovi/github-actions-storybook-to-github-pages)를 안내한다. 같은 페이지의 스니펫(`docs/_snippets/ghp-github-action.md`)은 `actions/upload-pages-artifact@v3`로 `storybook-static`을 올리고 `pages: write`, `id-token: write` 권한을 쓴다.
- **Vercel**: Storybook 문서에는 안내가 없다. Vercel KB [Deploying Storybook with Vercel](https://vercel.com/kb/guide/storybook-with-vercel)(last_updated 2026-10-16)은 `vercel.json`에 `"framework": null`, `"outputDirectory": "./storybook-static"`, 빌드 명령을 지정하라고 한다. 다만 본문의 스크립트는 Storybook 6 시절 명령(`start-storybook`, `build-storybook -s public`)이라 내용이 오래됐다.
- SEO: `manager-head.html`에 description이나 `noindex` meta를 넣는 방법이 공식 문서에 있다.

### base path

- `@storybook/builder-vite@10.6.6`는 Vite `base: "./"`를 넣는다. 실험 빌드의 `index.html`, `iframe.html`도 모든 자산을 `./...` 상대 경로로 참조했다.
- 빌드 결과를 `/tide-design-system/` 하위 경로에 두고 manager URL(`/tide-design-system/?path=/docs/...`)로 열었을 때, preview iframe이 `/tide-design-system/iframe.html`로 정상 로드되어 MDX와 아이콘 페이지가 렌더링되었다. **GitHub Pages 프로젝트 페이지(`<user>.github.io/<repo>/`)처럼 하위 경로에 배포해도 base 설정이 따로 필요 없다**(실제 GitHub Pages 배포는 하지 않았다).
- `viteFinal`이나 `vite.config`에서 `base`를 덮어쓰면 이 동작이 바뀔 수 있다(추론).
- `staticDirs`로 넣은 폰트 같은 자산을 절대 경로(`/fonts/...`)로 참조하면 하위 경로 배포에서 깨진다(일반적인 상대/절대 경로 규칙에서 나온 추론, 실험하지 않음).

---

## 8. 레퍼런스 디자인 시스템의 문서 사이트 구성

2026-11-09에 각 사이트를 헤드리스 브라우저로 렌더링해 navigation 링크를 뽑았고, GitHub 저장소 트리를 확인했다.

| 시스템           | 공개 문서 사이트                                                                                                                                    | 최상위 구성                                                                                                                                                                                                                                                                        | Component 페이지 구성                                                                                        | Storybook 위치                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primer**       | [primer.style/product](https://primer.style/product/) (Storybook 아님)                                                                              | Getting started(Foundations: Color usage, Content, Icons, Layout, Responsive, Typography / React·Rails별 안내) → Primitives(Color, Size, Typography, Token Names) → UI Patterns → Scenario Patterns → Components. 상단에 Product UI, Brand UI, Octicons, Accessibility가 따로 있음 | Overview / Guidelines / Accessibility 하위 페이지([button](https://primer.style/product/components/button/)) | `primer/react`의 `packages/react/.storybook`. stories에 `src/**/*.mdx`도 포함. [primer.style/react/storybook](https://primer.style/react/storybook/)에 공개 |
| **Atlassian**    | [atlassian.design](https://atlassian.design/) (Storybook 아님)                                                                                      | Get started(Design, Develop, With AI, Content design, About the design system — 원칙은 About에 있음) → Foundations(Tokens, Accessibility, Content, Spacing, Grid, Color, Typography, Motion, Iconography, Illustrations, Logos, Elevation, Border, Radius) → Components → Tools 등 | Examples / Code / Usage / Changelog 하위 경로([button](https://atlassian.design/components/button))          | 공개 Storybook은 **확인 불가**                                                                                                                              |
| **Radix Themes** | [radix-ui.com/themes/docs](https://www.radix-ui.com/themes/docs/overview/getting-started) (Next.js, `radix-ui/website` 저장소의 `data/themes/docs`) | Overview(Getting started, Styling, Layout, Releases) → Theme(Overview, Color, Dark mode, Typography, Spacing, Breakpoints, Radius, Shadows, Cursors) → Components(70여 개)                                                                                                         | 한 페이지 안에 API Reference와 Examples                                                                      | `radix-ui/themes` 저장소에는 Storybook이 없고 `apps/playground`만 있음                                                                                      |
| **SEED**         | [seed-design.io](https://seed-design.io/) (Next.js + Sanity, `daangn/seed-design`의 `docs/`)                                                        | Get Started → Foundations(Design token, Color, Typography, Iconography, Elevation, Gradient, Inclusive design, International design, Layout, Motion, Radius, Spacing, State, Voice and tone, Writing, Feedback) → Components → Patterns → AI & Tools → Updates. 원칙은 홈 섹션     | (세부 탭 구성은 확인하지 않음)                                                                               | `docs/.storybook`(`@storybook/nextjs-vite`, `stories/**/*.stories.*`만, MDX 없음) + `chromatic.config.json` → 시각 회귀 테스트용                            |

- 공통점: 네 곳 모두 **원칙 → Foundation → Component** 순서다. 원칙은 독립 최상위 섹션이 아니라 Get started나 홈 안에 들어 있다(Atlassian은 Get started의 About, SEED는 홈 섹션, Primer는 [principles-reference-systems.md](./principles-reference-systems.md)에서 본 `primer.style/guides/introduction`. 현재 Product UI nav에서 그 페이지의 위치는 확인하지 않았다). Foundation에 Token, Color, Typography, Motion, Radius, Elevation(그림자), Iconography가 공통으로 있다.
- 네 곳 모두 공개 문서 사이트는 Storybook이 아니다. Storybook은 개발·예제(Primer)나 시각 테스트(SEED)에 쓴다. **Storybook 하나로 공개 문서를 운영하는 Tide 구성과 같은 사례는 이 네 곳에 없다.**
- Component 페이지를 "사용 지침 / 코드·API / 접근성"으로 나누는 것이 흔하다(Primer는 3개, Atlassian은 4개 하위 경로).

---

## 참고 항목 (다른 티켓에서 넘어온 가이드)

| 항목                               | 확인한 사실                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 폰트 로드                          | `@storybook/react-vite`에는 `next/font`가 없다. `next/font/local`·`next/font/google`은 `@storybook/nextjs`·`nextjs-vite` 프레임워크에서만 "부분 지원"된다(문서 `docs/get-started/frameworks/nextjs-vite.mdx`). Storybook 안에서는 `.storybook/preview-head.html`에 `<link>`(CDN 동적 subset)를 넣거나, `staticDirs`로 폰트 파일을 서빙하고 `preview-head.html`에서 참조한다(문서 `docs/configure/story-rendering.mdx`, `docs/configure/integration/images-and-assets.mdx`). `next/font/local` 사용법은 Storybook 안에서 렌더링할 수 없으므로 MDX에 코드 예시로만 보여 줄 수 있다 |
| 텍스트 스타일 시각화               | `Typeset`은 행간·스타일별 굵기를 표현하지 못한다(3절). 14개 스타일은 직접 만든 블록이 필요하다                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 원칙별 Do/Don't를 실제 Component로 | MDX에 Component를 직접 렌더링할 수 있지만 `<Unstyled>`가 필요하고, Theme decorator와 a11y 자동 검사는 story에만 적용된다(4·5절). Do/Don't를 CSF story로 만들고 MDX에서 `<Canvas of={...}>`로 불러오면 둘 다 적용된다(추론: 블록과 decorator 동작에서 나온 결론, 따로 실험하지 않음). Don't 예시에는 `parameters.a11y.test: 'off'`를 쓰라고 문서가 안내한다                                                                                                                                                                                                                       |
| Theme 전환 시 transition 끄기      | 4절                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| sticky 헤더용 `scroll-padding-top` | Storybook 문서에서 관련 기능이나 안내를 찾지 못했다. 가이드는 MDX 본문에 예시 코드로 둘 수 있다. Storybook 문서 UI 자체의 앵커 이동이 sticky 요소에 가리는지는 확인하지 않았다(**확인 불가**)                                                                                                                                                                                                                                                                                                                                                                                    |
| 아이콘 목록 검색과 사용 가이드     | 6절                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

---

## 확인 불가

- `experimentalDocgenServer`, `experimentalReactComponentMeta`가 TS 7 단독에서 실패하는지(TS Language Service 기반이라 실패할 것으로 추론만 함)
- MDX 에디터 타입 검사가 TS 7에서 되는지
- `parameters.docs.container`로 Storybook 문서 UI(ArgTypes 표 등)의 테마를 globals에 맞춰 바꾸는 방법(실험하지 않음)
- transition 끄기 코드가 번짐을 실제로 없애는지(시각 비교 안 함)
- `parameters.a11y.test`가 `undefined`일 때 Vitest CLI에서 실패로 처리되는지
- 실제 Lucide 아이콘 2,000개 이상, 저사양 기기와 네트워크 지연에서의 성능
- Storybook 기본 블록으로 Token 페이지를 만든 대형 시스템 사례
- Atlassian의 공개 Storybook 존재 여부, SEED Component 페이지의 세부 탭 구성
- `docs/essentials/themes.mdx`(`draft: true`)가 공개 사이트에 보이는지
- 실제 GitHub Pages·Vercel 배포(로컬에서 하위 경로 서빙만 확인)

## 시사점 (결정은 26번에서)

1. **Theme 적용 경로가 둘로 갈린다.** decorator(내장이든 직접 만들든)는 story가 없는 MDX 페이지에 닿지 않는다. 원칙·Foundation 페이지가 대부분 MDX이므로 channel 구독(`SET_GLOBALS`/`GLOBALS_UPDATED`)을 같이 둘지, MDX 페이지에도 항상 story를 넣을지 정해야 한다. transition 끄기 코드를 넣을 위치도 이 선택을 따른다.
2. **Token 시각화는 대부분 직접 만들어야 한다.** `ColorPalette`는 쓸 수 있지만 대비비·Theme 비교가 없고, `Typeset`은 텍스트 스타일 14개를 표현하지 못하며, 그림자·radius·motion 블록은 없다. 직접 블록을 Token 원본(TS 객체)에서 바로 그리면 문서와 Token이 어긋나지 않는다.
3. **a11y 자동 검사는 story에만 돈다.** Do/Don't, Token 예시를 CSF story로 만들어 MDX에서 `Canvas`로 불러올지 정해야 한다. WCAG 2.2 AA를 최소 기준으로 했으므로 `runOnly`에 `wcag22aa`를 넣을지도 정해야 한다(추가되는 규칙은 `target-size` 하나).
4. **배포는 정적 호스트 어디든 되고 base 설정이 필요 없다.** GitHub Pages(공식 문서가 Action 안내)와 Vercel(Vercel KB) 중에서 고르는 기준은 PR 미리보기, 커스텀 도메인, Chromatic(CPP level 1, 시각 회귀)과의 관계다. 시각 회귀는 테스트 전략 티켓 27·28과 겹친다.
5. **레퍼런스 사이트 구성(원칙 → Foundation → Component, Component 안에서 지침/코드/접근성)을 Storybook 사이드바로 옮기는 방법**을 정해야 한다. 예: `Principles/`, `Foundations/`, `Components/<이름>/{Usage, Code, Accessibility}`. 레퍼런스 중 Storybook 하나로 문서를 운영하는 곳은 없어서 직접 설계해야 한다.
6. **아이콘 페이지**는 MDX 청크 분할 덕분에 다른 페이지에 비용을 주지 않는다. 가상화를 할지, 검색용 메타데이터를 `@tide-tds/icons`에서 따로 내보낼지(ADR 0007의 생성 스크립트 범위)는 실제 Lucide 데이터로 다시 재 보는 것이 좋다.
