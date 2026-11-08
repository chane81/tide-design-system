# Tailwind theme 노출과 자동완성 조사

티켓: [03-research-tailwind](../progress/tide-v0/issues/03-research-tailwind.md)
조사일: 2026-11-08

## 확인한 버전

| 패키지 | 최신 안정 버전 | 확인 방법 |
| --- | --- | --- |
| `tailwindcss` | **4.3.5** (`latest`; v3는 `v3-lts` 태그로 3.4.19) | `npm view tailwindcss dist-tags` |
| `@tailwindcss/vite`, `@tailwindcss/postcss`, `@tailwindcss/node` | 4.3.5 | `npm view <pkg> version` |
| `tailwind-merge` | **3.7.0** (`latest`; v2 계열은 2.6.1) | `npm view tailwind-merge dist-tags` |
| Tailwind CSS IntelliSense (VS Code) | v0.16.0 (2026-07-17 릴리스) | GitHub releases API |

공식 문서 사이트(tailwindcss.com)의 버전 표시는 **v4.3**이다. context7에서는 `/tailwindlabs/tailwindcss.com`(main 브랜치 docs)을 조회했다. 두 출처의 내용은 일치했다.

출처 약어:

- [theme]: https://tailwindcss.com/docs/theme
- [colors]: https://tailwindcss.com/docs/colors
- [sources]: https://tailwindcss.com/docs/detecting-classes-in-source-files
- [dark]: https://tailwindcss.com/docs/dark-mode
- [directives]: https://tailwindcss.com/docs/functions-and-directives
- [intellisense]: https://github.com/tailwindlabs/tailwindcss-intellisense/blob/main/packages/vscode-tailwindcss/README.md
- [twm-readme]: tailwind-merge 3.7.0 npm 패키지의 `README.md`
- [twm-config]: https://github.com/dcastil/tailwind-merge/blob/tailwind-merge@3.7.0/packages/tailwind-merge/docs/configuration.md
- [twm-limits]: https://github.com/dcastil/tailwind-merge/blob/tailwind-merge@3.7.0/packages/tailwind-merge/docs/limitations.md

---

## 1. 커스텀 theme을 정의하는 방식

근거: tailwindcss 4.3 / [theme], context7 `theme.mdx`

- v4에서는 JS 설정 파일 대신 **CSS의 `@theme` 디렉티브**로 theme 변수를 정의한다. theme 변수는 "어떤 Utility class가 존재할지"를 결정하는 특별한 CSS 변수다.
- 변수 이름의 **namespace**가 어떤 Utility class를 만들지 정한다. 예: `--color-*` → `bg-*`, `text-*`, `fill-*` 등 / `--spacing-*` → `px-*`, `max-h-*` 등 간격·크기 유틸리티 / `--radius-*` → `rounded-*` / `--shadow-*` → `shadow-*` / `--breakpoint-*` → `sm:` 같은 반응형 variant.
- 정의한 theme 변수는 일반 CSS 변수(`var(--color-mint-500)`)로도 출력되므로 inline style이나 arbitrary value에서 참조할 수 있다.
- 옵션은 다음과 같다.
  - `@theme inline`: 다른 변수를 참조하는 값일 때 쓴다. 유틸리티가 theme 변수 대신 **값 자체**(`var(--font-inter)`)를 쓰게 된다. 쓰지 않으면 CSS 변수 해석 위치 때문에 의도와 다른 값이 나올 수 있다고 문서가 경고한다.
  - `@theme static`: 기본 동작은 "사용된 변수만 출력"이다. `static`을 붙이면 모든 CSS 변수를 항상 출력한다.
- 기본 theme은 `node_modules/tailwindcss/theme.css`에 있다. `@import "tailwindcss"`는 `theme.css`(layer theme), `preflight.css`(layer base), `utilities.css`(layer utilities)를 합친 것이다.

```css
@import "tailwindcss";

@theme {
  --color-mint-500: oklch(0.72 0.11 178); /* bg-mint-500, text-mint-500 생성 */
  --font-script: Great Vibes, cursive;    /* font-script 생성 */
}
```

## 2. 기본 컬러 팔레트를 제거하고 간격 규칙은 유지하는 방법

근거: tailwindcss 4.3 / [theme] "Overriding the default theme", [colors] "Using a custom palette", context7 `colors.mdx`, `theme.mdx`

- namespace 전체를 `initial`로 설정하면 해당 namespace의 기본값이 모두 사라진다. `--color-*: initial`을 쓰면 `bg-red-500` 같은 기본 색 유틸리티가 모두 제거되고 직접 정의한 색만 남는다.
- 이 설정은 `--color-*` namespace에만 적용된다. 간격은 별도 변수 `--spacing`(기본값 `0.25rem`)이 맡는다. 따라서 색만 초기화하면 `w-24`, `mt-8` 같은 숫자 간격 규칙은 그대로 남는다.
- v4의 숫자 간격 유틸리티는 `calc(var(--spacing) * N)`으로 **동적으로** 계산된다. `w-17`, `pr-29`처럼 미리 정의하지 않은 숫자도 동작한다(context7 `blog/tailwindcss-v4`). `--spacing` 값 하나만 바꾸면 전체 스케일의 기준 단위가 바뀐다.
- 반대로 `--*: initial`은 theme **전체**(간격, 폰트, breakpoint 등)를 초기화한다. 공식 문서의 "Sharing across projects" 예시가 이 방식을 쓰고, `--spacing: 4px`를 다시 정의한다. 간격 규칙을 유지하려면 `--*: initial`을 쓰지 않거나, 쓴다면 `--spacing`과 필요한 namespace를 다시 정의해야 한다.
- 일부 색만 끄려면 `--color-lime-*: initial`처럼 하위 namespace만 지정할 수 있다.

```css
@theme {
  --color-*: initial;          /* 기본 팔레트 전부 제거 */
  --color-white: #fff;
  --color-black: #000;
  --color-blue-500: #3183f5;   /* 이후 Tide Primitive Token으로 채움 */
  /* --spacing은 건드리지 않음 → w-24 = calc(0.25rem * 24) 유지 */
}
```

참고: 기본 theme에는 `--color-black`, `--color-white`도 들어 있다. `--color-*: initial`을 쓰면 이 둘도 사라지므로 필요하면 다시 정의해야 한다.

## 3. 라이브러리 패키지가 theme CSS를 배포하고 앱이 이를 import하는 방식

근거: tailwindcss 4.3 / [theme] "Sharing across projects", `@tailwindcss/node@4.3.5` 배포 코드, `tailwindcss@4.3.5` `package.json`의 `exports`

- 공식 문서의 방식은 다음과 같다. theme 변수를 별도 CSS 파일에 넣고, 각 앱이 `@import "tailwindcss"` 뒤에 그 파일을 `@import`한다. 문서에는 "모노레포에서는 별도 패키지로 두거나 **npm에 배포해** 다른 서드파티 CSS처럼 import할 수 있다"라고 적혀 있다.
- 배포하는 CSS 파일에는 `@import "tailwindcss"`를 넣지 않고 `@theme` 블록만 둔다. 공식 예시도 이렇게 한다. `@import "tailwindcss"`는 앱의 진입 CSS에서 한 번만 한다.
- 패키지 경로 해석은 다음과 같다(소스 확인). `@tailwindcss/node@4.3.5`의 CSS import resolver는 `conditionNames: ["style"]`, `mainFields: ["style"]`로 설정되어 있다. `tailwindcss` 자체도 `exports["."].style = "./index.css"`와 `"./theme": "./theme.css"` 같은 subpath export로 CSS를 노출한다. 그래서 라이브러리도 `package.json`의 `exports`에 CSS subpath(예: `"./theme.css"`)나 `style` 조건을 두면 `@import "@scope/pkg/theme.css"`로 해석될 것으로 본다. 다만 이 resolver 동작을 설명하는 공식 문서 문단은 찾지 못했다. 배포 코드를 읽고 추론한 내용이므로 프로토타입으로 검증해야 한다.

```css
/* packages/tokens/theme.css (배포물) */
@theme {
  --color-*: initial;
  --color-blue-500: #3183f5;
}
```

```jsonc
// packages/tokens/package.json
{ "exports": { "./theme.css": "./theme.css" } }
```

```css
/* 앱의 app.css */
@import "tailwindcss";
@import "@tide/tokens/theme.css"; /* 패키지 이름은 미정 */
```

## 4. 앱이 node_modules에 있는 Component 클래스를 스캔하게 하는 방법

근거: tailwindcss 4.3 / [sources] "Which files are scanned", "Explicitly registering sources", "Setting your base path", "Ignoring specific paths"

- v4는 자동으로 소스를 감지한다. 다만 다음은 기본 스캔에서 **제외**된다: `.gitignore`에 있는 파일, `node_modules` 디렉터리, 바이너리, CSS 파일, lock 파일.
- 따라서 Tailwind로 만든 외부 라이브러리의 클래스는 앱 CSS에서 `@source`로 명시 등록해야 한다. 경로는 **stylesheet 기준 상대 경로**다. 문서는 바로 이 경우("Tailwind로 만든 외부 라이브러리 스캔")를 예시로 든다.
- 관련 도구는 다음과 같다.
  - `@import "tailwindcss" source("../src")`: 스캔 기준 경로를 지정한다. 모노레포 루트에서 빌드할 때 유용하다고 문서에 적혀 있다.
  - `@source not "<path>"`: 특정 경로를 제외한다.
- 스캔은 파일 텍스트에서 클래스 후보 문자열을 찾는 방식이다. 그래서 배포된 JS 번들 안에 클래스 문자열이 그대로 남아 있어야 한다. 문자열을 동적으로 조립하면 감지되지 않는다는 점은 같은 문서의 "dynamic class names" 항목에서 다룬다.

```css
@import "tailwindcss";
@import "@tide/tokens/theme.css";
@source "../node_modules/@tide/react"; /* 앱 CSS 위치 기준 상대 경로 */
```

확인 불가: pnpm의 symlink 구조(`node_modules/@scope/pkg` → `.pnpm/...`)에서 `@source`가 symlink를 따라가는지는 공식 문서에 명시가 없다. 프로토타입으로 확인해야 한다.

## 5. Tailwind IntelliSense가 커스텀 Token을 자동완성하는 조건

근거: Tailwind CSS IntelliSense README(main, 최신 릴리스 v0.16.0) / [intellisense]

- 활성화 조건(v4 이상): 워크스페이스에 `tailwindcss`가 npm/pnpm/yarn으로 설치되어 있어야 한다. 그리고 Tailwind stylesheet를 import하는 `.css` 파일(예: `@import "tailwindcss"`)이 있어야 한다. Less/Sass/Stylus는 지원하지 않으며 `.css` 파일이 **필수**다.
- v4의 설정 감지: 확장이 프로젝트의 CSS 파일을 스캔해 "root" CSS 파일을 정한다. 그 root CSS 안의 `@import "tailwindcss"`와 `@theme { ... }`가 설정으로 쓰인다. 그래서 `@theme`에 정의한 커스텀 Token(예: `--color-primary` → `bg-primary`)이 자동완성 후보가 된다.
- 감지에 실패하거나 진입 CSS가 여러 개일 때: `tailwindCSS.experimental.configFile`로 진입 CSS를 지정한다. 문자열 하나로 지정하거나, `{ "CSS 경로": "적용 glob" }` 객체로 지정한다. README는 모노레포처럼 `@import "tailwindcss"`가 있는 stylesheet가 여러 개면 이 설정을 권장한다. 이 설정은 experimental이라 바뀔 수 있다.
- `tailwindCSS.files.exclude`의 기본값에 `**/node_modules/**`가 들어 있다. 또 `files.exclude` 등으로 stylesheet가 숨겨지면 동작하지 않는다.
- 자동완성 위치: 기본은 `class`, `className`, `ngClass`, `class:list` 속성이다(`tailwindCSS.classAttributes`). `cn()`, `clsx()`, `tv()` 같은 함수 인자 안에서도 자동완성하려면 `tailwindCSS.classFunctions`에 함수 이름 정규식을 등록해야 한다.
- JSX 문자열 안에서 자동완성 제안이 바로 뜨게 하려면 `"editor.quickSuggestions": { "strings": "on" }`을 권장한다.

```jsonc
// 앱의 .vscode/settings.json
{
  "tailwindCSS.experimental.configFile": "src/app.css",
  "tailwindCSS.classFunctions": ["cn", "clsx"],
  "editor.quickSuggestions": { "strings": "on" }
}
```

확인 불가: root CSS가 `@import`한 node_modules 안의 theme CSS(3번 방식)가 자동완성에 반영되는지 README에 명시가 없다. 앱 CSS가 root로 감지되면 import를 해석해 반영될 것으로 추론되지만, 검증이 필요하다.

## 6. dark Theme variant를 CSS 변수와 연결하는 방식

근거: tailwindcss 4.3 / [dark], [colors] "Referencing other variables", [theme] "Referencing other variables", context7 `dark-mode.mdx`, `colors.mdx`

방법은 두 가지이며 함께 쓸 수 있다.

**(a) `dark:` variant 전환 기준 바꾸기.** 기본값은 `prefers-color-scheme`이다. `@custom-variant`로 class나 data 속성 기준으로 바꿀 수 있다.

```css
@custom-variant dark (&:where(.dark, .dark *));
/* 또는 */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

이 방식에서는 사용자가 `bg-white dark:bg-black`처럼 클래스를 두 번 써야 한다.

**(b) CSS 변수 값을 Theme별로 바꾸고 `@theme inline`으로 연결하기.** 공식 [colors] 문서의 예시다. 선택자(`:root`, `[data-theme="dark"]`)에서 변수 값을 바꾸고, `@theme inline`으로 Utility class를 그 변수에 연결한다. 그러면 `bg-canvas` 하나가 Theme에 따라 자동으로 바뀐다. `inline`이 필요한 이유는 1번에서 설명한 변수 해석 위치 문제 때문이다.

```css
:root              { --tide-bg-primary: var(--color-blue-600); }
[data-theme="dark"] { --tide-bg-primary: var(--color-blue-400); }

@theme inline {
  --color-bg-primary: var(--tide-bg-primary); /* → bg-bg-primary */
}
```

참고: `--color-*` namespace에 넣으면 유틸리티 이름이 `bg-` + 변수 이름이 된다. 그래서 `--color-bg-primary`는 `bg-bg-primary`가 된다. GLOSSARY 예시 이름인 `bg-primary`를 원하면 `--color-primary`로 정의해야 한다. 그러면 `text-primary`, `border-primary`도 함께 생긴다. 이것은 Tailwind의 namespace 규칙에서 나오는 결과다.

## 7. tailwind-merge가 커스텀 theme을 다룰 수 있는지

근거: tailwind-merge 3.7.0 / [twm-readme], [twm-config] "Usage with custom Tailwind config", "Theme", [twm-limits], 배포 소스 `src/lib/types.ts`, `default-config.ts`

- 지원 범위: 3.7.0 README에는 "Tailwind v4.0 ~ v4.3 지원"이라고 적혀 있다. Tailwind v3를 쓰면 tailwind-merge v2.6.0을 쓰라고 안내한다. 현재 tailwindcss 4.3.5와 맞는다.
- tailwind-merge는 **Tailwind CSS 파일을 읽지 않는다.** 브라우저에서 돌아가는 별도 설정이다. 그래서 커스텀 theme은 `extendTailwindMerge`로 직접 알려줘야 한다.
- theme key는 Tailwind namespace와 1:1로 대응한다. 예: `--color-*` → `color`, `--text-*` → `text`, `--spacing-*` → `spacing`, `--radius-*` → `radius`, `--shadow-*` → `shadow`, `--font-*` → `font`, `--breakpoint-*` → `breakpoint` 등 19개. 소스의 `DefaultThemeGroupIds`와 일치한다.
- **커스텀 색은 설정이 필요 없다.** 색 이름에 관대한 validator를 쓰기 때문이다. `twMerge('bg-blue-500 bg-brand-primary')`는 `'bg-brand-primary'`가 된다.
- 설정이 필요한 경우: 커스텀 font size(`--text-huge` → `text: ['huge']`), 이름 붙인 간격(`--spacing-gutter` → `spacing: ['gutter']`), 기본과 다른 radius/shadow 이름 등이다. 숫자 간격(`w-24`)은 "숫자 값만 다른 경우"에 해당하므로 기본 설정으로 처리된다.
- 기본 `twMerge`를 그대로 쓸 수 있는 조건: 색 이름이 다른 Tailwind 클래스 이름과 겹치지 않을 것, 숫자 기반 클래스는 숫자만 다를 것, font-family 이름이 font-weight 이름과 겹치지 않을 것, 나머지는 기본 설정을 따를 것.
- 주의: `text-*`는 색과 font size가 같은 prefix를 쓴다. 커스텀 font size를 등록하지 않으면 tailwind-merge가 그것을 색으로 판단할 수 있다. 그러면 `text-<커스텀 size> text-<색>`이 충돌로 처리된다([twm-limits]의 heuristic 항목).

```ts
import { extendTailwindMerge } from 'tailwind-merge'

export const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['body-md', 'heading-lg'], // --text-* 커스텀 크기
      radius: ['card'],                // --radius-card
      // color는 등록 불필요
    },
  },
})
```

---

## Tide에 주는 시사점

다음은 결정이 아니라, 후속 티켓에서 판단할 때 참고할 사실과 선택지다.

- **theme 노출 방식**: v4.3에서는 Token 패키지가 `@theme` 블록만 담은 CSS를 배포한다. 앱은 `@import "tailwindcss"` 다음에 그 CSS를 import한다. 공식 문서가 이 경로를 명시적으로 안내한다. 이 구조에서는 Token 패키지에 JS/React 의존이 필요 없으므로 ADR 0001의 경계와 충돌하지 않는다.
- **ADR 0002의 "팔레트 교체 + 간격 유지"**: `--color-*: initial` 한 줄로 그대로 구현할 수 있다. `--*: initial`은 간격까지 지우므로 그 목표와 맞지 않는다. `--color-white/black`도 함께 사라진다는 점은 Primitive 목록에 반영할지 판단해야 한다.
- **Semantic Token 이름과 유틸리티 이름의 관계**: `--color-<이름>`은 `bg-`, `text-`, `border-` 등 모든 색 유틸리티에 공통으로 붙는다. `bg-primary`/`text-muted` 같은 GLOSSARY 예시를 그대로 얻으려면 Token 이름을 이 규칙에 맞춰야 한다. 용도별로 이름을 나눌지(`bg-bg-*` 형태가 생김)는 네이밍 티켓에서 다룰 문제다.
- **dark Theme**: (b) 방식(`[data-theme]` 등에서 변수 값을 바꾸고 `@theme inline`으로 연결)을 쓰면 Component가 `dark:`를 쓰지 않아도 된다. "Component는 Semantic Token만 쓴다"는 결정과 잘 맞는다. 선택자를 class로 할지 data 속성으로 할지, `@custom-variant dark`를 함께 제공할지는 미정이다.
- **Component 클래스 스캔**: 앱 CSS에 `@source "../node_modules/<component 패키지>"`가 필요하다. 배포 번들에 클래스 문자열이 그대로 남도록 빌드해야 한다. 설치 문서에 이 한 줄을 안내해야 할 가능성이 높다. pnpm symlink 환경은 미검증이다.
- **자동완성**: IntelliSense는 앱의 root CSS에 있는 `@theme`를 근거로 동작한다. node_modules에서 import한 theme이 반영되는지와, Storybook 등 모노레포 내부의 여러 진입 CSS를 다루는 방식(`experimental.configFile`)은 프로토타입으로 확인할 가치가 있다. `cn()` 같은 헬퍼를 쓴다면 `classFunctions` 안내가 필요하다.
- **className 충돌(Component 공통 API 규칙 티켓)**: tailwind-merge 3.7.0은 Tailwind 4.3을 지원한다. 커스텀 색은 설정 없이 처리된다. 다만 커스텀 font size, radius, shadow 등의 이름은 `extendTailwindMerge`에 수동으로 등록해야 한다. 그래서 Token 목록과 tailwind-merge 설정을 동기화하는 방법(수동 관리 또는 Token 소스에서 생성)이 과제로 남는다.

## 확인 불가 / 추가 검증 필요 목록

1. `@import "<패키지>/theme.css"` 해석: `@tailwindcss/node` 소스의 resolver 설정(`style` 조건)으로 추론했다. 공식 문서 문단은 찾지 못했다.
2. pnpm symlink 경로에서 `@source "../node_modules/..."`의 동작.
3. node_modules에서 import한 `@theme`가 IntelliSense 자동완성에 반영되는지.
