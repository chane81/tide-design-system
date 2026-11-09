# 03: Storybook과 브라우저 테스트 골격

Status: done
Blocked by: 02 (Token에서 Next 앱까지 관통)

## What to build

문서 앱과 브라우저 테스트가 VisuallyHidden 하나로 끝까지 돈다. 앱 개발자는 Storybook에서 VisuallyHidden 페이지를 읽고 툴바로 light/dark를 바꿀 수 있다. 기여 에이전트는 이후 Component마다 `browser`(동작·forced-colors·reduced-motion)와 `storybook`(렌더·a11y) 검사를 같은 틀로 붙일 수 있다.

## 수용 기준

### 문서 앱

- [x] Storybook 10.6.6이고 `reactDocgen`은 `react-docgen`으로 고정한다.
- [x] Tailwind는 `@tailwindcss/vite`로 연결한다. desktop은 원본 조건(`@tide-tds/source`)으로, foundation은 빌드 결과로 resolve한다. desktop 원본을 고치면 HMR로 반영된다.
- [x] Vite 8에서 resolve 조건을 지정하는 옵션 이름을 문서로 확인하고 근거 버전을 남긴다.
- [x] Theme 툴바: addon-themes로 `data-theme`를 바꾸고 기본은 light다. globals 채널 구독으로 글(MDX) 페이지에도 Theme을 적용한다. 전환 순간에는 transition을 끈다.
- [x] VisuallyHidden의 CSF story와 MDX 페이지가 있다. MDX에는 글과 Canvas만 둔다.

### 테스트 project

- [x] `browser` project: Vitest Browser Mode + Playwright Chromium. 두 번째 instance는 `forcedColors: 'active'`, `reducedMotion: 'reduce'`다.
- [x] `storybook` project: addon-vitest + Chromium으로 모든 story를 렌더한다. a11y는 `test: 'error'`, `runOnly`는 `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`다. 의도적으로 잘못된 Don't story만 a11y를 끄는 방법을 정해 둔다.
- [x] 동작 단언은 `*.test.tsx`에만 둔다. story `play` 함수, jsdom, happy-dom은 쓰지 않는다.
- [x] CI에서 두 project가 Chromium만으로 돈다.

### VisuallyHidden

- [x] 화면에는 보이지 않지만 접근성 트리에서 이름으로 읽힘을 `browser`에서 단언한다.

### 공통 API 규칙

- [x] `ref`는 일반 prop으로 받아 루트 DOM 요소에 연결한다(`forwardRef` 없음).
- [x] props는 루트 DOM 요소의 props를 확장하고 겹치는 HTML 속성은 `Omit`한다. `XxxProps` 타입을 루트에서 export한다.
- [x] prop 이름은 DOM 이름을 쓰고, React Aria 이름(`isDisabled`, `onPress` 등)은 드러내지 않는다.
- [x] 사용자 `className`은 `cn`의 마지막에 넣어 충돌 시 이긴다.
- [x] 상태는 네이티브 pseudo-class가 있으면 그것을, 없으면 boolean `data-*` 속성으로 노출한다.
- [x] `"use client"`는 hook·state·이벤트를 쓰는 파일에만 붙인다.
- [x] Semantic Token만 쓰고, 지원하지 않는 `variant`·`size` 값은 타입 오류가 된다.
- [x] 세부 props(값, 기본값, padding)는 공통 규칙 안에서 정하고 props 표로 확정한다.

### Component 완료 기준 (spec Testing Decisions)

- [x] `*.test.tsx`에 동작 단언이 있다(`browser` project).
- [x] 모든 예시가 story로 있고 a11y 검사를 통과한다(`storybook` project).
- [x] 포커스 표시, forced-colors, reduced-motion 계산값을 단언한다(해당하는 경우).
- [x] MDX 문서가 고정된 섹션 순서(설명 → 사용 시점/쓰지 않을 때 → 예시 → Do/Don't → 접근성 → props 표)를 따른다.
- [x] 쓰는 Token이 대비 쌍에 등록되어 있다(`unit` project).
- [x] smoke 앱에서 import해 빌드가 통과한다(`smoke`).

## Comments

- 2026-11-10 완료(브랜치 `ticket/03-storybook-browser-test-skeleton`).
  - **버전**(pnpm `minimumReleaseAge` 하루를 넘긴 것): storybook·@storybook/react-vite·addon-docs·addon-themes·addon-a11y·addon-vitest 10.6.6, @tailwindcss/vite 4.3.5, @vitest/browser-playwright 5.1.0, playwright 1.65.0, vitest-browser-react 2.3.0(axe-core 4.14.0은 addon-a11y 의존). 정책은 그대로 strict이고 예외 목록을 두지 않았다. esbuild의 postinstall은 `allowBuilds: esbuild: false`로 돌리지 않는다(플랫폼 바이너리는 optionalDependencies로 설치됨, pnpm strictDepBuilds 때문에 명시가 필요).
  - **resolve 조건**: Vite 8의 옵션 이름은 `resolve.conditions`이고, 값을 주면 기본값(`defaultClientConditions` = `module`, `browser`, `development|production`)을 대체한다(context7 `/vitejs/vite` docs `config/shared-options.md`, 설치본 vite 8.3.6 export 확인). 그래서 `['@tide-tds/source', ...defaultClientConditions]`로 넣었다. dev 서버에서 story의 `@tide-tds/desktop` import가 `packages/desktop/src/index.ts`로, desktop 안의 `@tide-tds/foundation/tailwind-merge`가 `packages/foundation/dist`로 resolve되는 것을 확인했다. 타입도 원본에서 읽도록 `apps/docs/tsconfig.json`에 `customConditions`를 두었다.
  - **HMR**: dev 서버를 띄운 채 desktop 원본의 class를 바꾸면 story DOM의 class와 Tailwind가 만든 CSS가 새로고침 없이 반영되는 것을 Playwright로 확인했다. 문서 앱 CSS는 desktop 원본 폴더를 `@source`로 스캔한다(배포 사용자 경로 `@tide-tds/desktop/styles.css`와 다름, 파일에 주석). `@vitejs/plugin-react`는 넣지 않았다. @storybook/react-vite 10.6.6은 이를 의존하지 않고, Vite 8 Oxc가 JSX를 변환한다. 그래서 React Fast Refresh(상태 보존)는 없고 Storybook이 story를 다시 렌더한다.
  - **Theme**: `applyTheme` 하나를 addon-themes 툴바용 커스텀 decorator(`DecoratorHelpers.initializeThemeState`·`pluckThemeFromContext`, 10.6.6 설치본 타입)와 globals 채널 구독(`SET_GLOBALS`, `GLOBALS_UPDATED`, payload의 `globals.theme`, 10.6.6 preview runtime 소스 확인)이 함께 쓴다. story의 `parameters.themes.themeOverride`도 따른다. MDX 페이지에서 툴바를 눌러 `<html data-theme>`가 light ↔ dark로 바뀌고, 바뀌는 순간에는 임시 `transition: none` style이 있고 그 뒤 제거되는 것을 Playwright로 확인했다. 기본은 light이고 `prefers-color-scheme`은 읽지 않는다. Theme이 둘이라 addon-themes 툴바는 목록이 아니라 토글 버튼으로 나온다. dark Token은 아직 없다(04).
  - **storybook project**: setup 파일은 두지 않았다. addon-vitest 10.6.6의 `storybookTest`는 사용자 setup에 `setProjectAnnotations`가 없으면 내부 setup 파일(`setup-file-with-project-annotations`)로 preview annotations를 자동 적용한다(설치본 `dist/vitest-plugin/index.js`). 실제로 setup 없이 preview의 a11y 설정이 적용됐다.
  - **a11y 키 이름**: `parameters.a11y.test`(`'off' | 'todo' | 'error'`), `parameters.a11y.options`(axe `RunOptions`)의 `runOnly: { type: 'tag', values: [...] }`(addon-a11y 10.6.6 `A11yParameters` 타입). Don't story는 story `parameters.a11y.test: 'off'`로 끈다. 대조 확인: off를 빼면 `button-name` 위반으로 실패하고, runOnly를 잠시 `best-practice`로 바꾸면 같은 story가 통과했다(runOnly가 실제로 적용됨). 둘 다 되돌렸다.
  - **문서 중복 방지**: CSF에 `autodocs` 태그를 달지 않고 MDX에서 `<Meta of>`로 붙였다. 빌드 결과 `index.json`에서 docs 항목은 `attached-mdx` 하나뿐이다. props 표는 `<ArgTypes of>`이다. VisuallyHiddenProps가 `ComponentProps<"span">` 그대로라 react-docgen이 펼치는 prop은 거의 없다. 그래서 받는 props는 MDX 글로 설명했다.
  - **수용 기준 해석**: VisuallyHidden은 상태·variant·size·색 Token·motion이 없어서 「포커스 표시, forced-colors, reduced-motion 계산값」과 「대비 쌍 등록」, 「지원하지 않는 variant·size 타입 오류」는 해당 없음으로 보고 체크했다. 공통 API 규칙과 smoke import는 02의 구현을 그대로 확인했다.
  - **desktop typecheck**: TS 7.0.2는 side-effect import(`import "./browser.css"`)의 모듈을 검사하므로 desktop `tsconfig.json` types에 `vite/client`를 더했다(docs도 같음).
  - **CI**: `pnpm install` 다음에 `pnpm --filter @tide-tds/desktop exec playwright install --with-deps --only-shell chromium`을 둔다(캐시 없음, 옵션은 playwright 1.65.0 `install --help`로 확인). docs도 같은 catalog 버전이라 한 번 설치로 둘 다 돈다. GitHub Actions에서의 실행은 첫 PR에서 확인해야 한다.
  - **기타**: vitest browser mode가 실패 스크린샷을 `.vitest/`에 남겨서 `.gitignore`에 넣었다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `pnpm --filter @tide-tds/docs build`, `TURBO_SCM_BASE=main pnpm turbo run typecheck test build smoke --affected`(11개 태스크) 통과. desktop 7 tests(unit + browser 2 instance), docs storybook 4 stories.
