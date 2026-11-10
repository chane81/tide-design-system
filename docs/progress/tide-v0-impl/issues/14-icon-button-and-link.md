# 14: IconButton과 Link

Status: done
Blocked by: 13 (Button)

## What to build

앱 개발자가 아이콘만 있는 버튼을 `IconButton`으로 만들면 `aria-label`이 타입상 필수라 이름이 빠질 수 없다. 텍스트 링크는 `Link`로 쓰고 Next `Link`로 렌더할 수 있다.

## 수용 기준

### IconButton

- [x] Button과 같은 채움 방식·Role·size 축을 쓰는 별도 Component다.
- [x] `aria-label`은 타입상 필수다. 24×24 미만 size는 없다.
- [x] 아이콘 크기는 크기 규칙 표의 IconButton 열(16/16/20/24px)을 따른다.
- [x] press 축소와 끄는 prop은 Button에서 확정한 이름을 따른다.

### Link

- [x] `render`로 Next `Link` 등으로 바꿀 수 있고 props, ref, className을 병합한다.
- [x] 포커스 표시는 `focus-ring`이다. 링크 색 대비가 대비 쌍에 등록되어 있다.

### 테스트

- [x] `browser`: IconButton의 이름, 크기 하한(24×24) 계산값, Link의 `render` 병합과 키보드 이동을 단언한다.
- [x] `aria-label` 없는 IconButton이 타입 오류가 되는지 타입 테스트로 확인한다.

### 공통 API 규칙

- [x] `ref`는 일반 prop으로 받아 루트 DOM 요소에 연결한다(`forwardRef` 없음).
- [x] props는 루트 DOM 요소의 props를 확장하고 겹치는 HTML 속성은 `Omit`한다. `XxxProps` 타입을 루트에서 export한다.
- [x] prop 이름은 DOM 이름을 쓰고, React Aria 이름(`isDisabled`, `onPress` 등)은 드러내지 않는다.
- [x] 사용자 `className`은 `cn`의 마지막에 넣어 충돌 시 이긴다.
- [x] 상태는 네이티브 pseudo-class가 있으면 그것을, 없으면 boolean `data-*` 속성으로 노출한다.
- [x] `"use client"`는 hook·state·이벤트를 쓰는 파일에만 붙인다.
- [x] Semantic Token만 쓰고, 지원하지 않는 `variant`·`size` 값은 타입 오류가 된다.
- [x] 세부 props(값, 기본값, padding)는 공통 규칙 안에서 정하고 props 표로 확정한다.
- [x] changeset을 포함한다.

### Component 완료 기준 (spec Testing Decisions)

- [x] `*.test.tsx`에 동작 단언이 있다(`browser` project).
- [x] 모든 예시가 story로 있고 a11y 검사를 통과한다(`storybook` project).
- [x] 포커스 표시, forced-colors, reduced-motion 계산값을 단언한다(해당하는 경우).
- [x] MDX 문서가 고정된 섹션 순서(설명 → 사용 시점/쓰지 않을 때 → 예시 → Do/Don't → 접근성 → props 표)를 따른다.
- [x] 쓰는 Token이 대비 쌍에 등록되어 있다(`unit` project).
- [x] smoke 앱에서 import해 빌드가 통과한다(`smoke`).

## Comments

- 2026-11-10 완료(브랜치 `ticket-14-icon-button-link`, Button 브랜치 티켓 13 `3d6646b` 위).
  - **근거 버전**: react 19.3.1(@types/react 19.3.0), tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, vitest-browser-react 2.3.0, storybook 10.6.6, next 16.4.5, typescript 7.0.2. 새 의존성은 없고 `minimumReleaseAge`는 그대로다. React Aria hook은 쓰지 않는다(네이티브 요소, ADR 0004).
  - **API 확인**: ref를 일반 prop으로 받는 것은 context7 `/reactjs/react.dev`(forwardRef.md 「In React 19, forwardRef is no longer necessary」). `underline-offset-<number>` = `text-underline-offset: <number>px`, `decoration-<number>` 두께, v4 `hover:`가 `@media (hover: hover)` 안에 들어가는 것은 context7 `/tailwindlabs/tailwindcss.com`(text-underline-offset.mdx, text-decoration-thickness.mdx, upgrade-guide.mdx). Next `Link`가 `className` 등 `<a>` 속성을 밑의 `<a>`로 넘기고, 서버 컴포넌트에서 client Component로 함수 prop을 넘길 수 없다는 것은 context7 `/vercel/next.js/v16.4.5`(link.mdx, server-and-client-boundary.mdx).
  - **공유 모듈**: `packages/components/src/pressable.ts`(내부, 루트에서 export하지 않음)로 Button의 채움 방식 맵 3개(`Record<FillVariant, string>`: 기본 색, hover·누름, 비활성), 공통 base class, 누름 축소 class, 상태 처리(`pressableState`: 네이티브/soft disabled, loading, 커서, 클릭 차단, `type` 기본값, `data-color`·`aria-disabled`·`data-disabled`·`data-loading`)를 옮겼다. Button과 IconButton이 모양·커서·차단 규칙에서 어긋나지 않게 하려는 것이다. 핸들러를 만들기만 하고 DOM에 넘기지 않으므로 `"use client"`가 없다(Button.tsx·IconButton.tsx가 경계). Button의 공개 API와 class·props 출력 순서는 그대로이고 Button 테스트 166개(83 × instance 2)가 수정 없이 통과했다. size·아이콘 크기 맵은 Component마다 다르므로 각 파일에 남겼다. 내부 모듈이라 되돌리기 쉬워 ADR은 쓰지 않았다.
  - **IconButton props 표**: `aria-label: string`(필수), `children: ReactNode`(필수, 아이콘. `aria-hidden` span으로 감싸고 안의 요소를 크기에 맞춤), `variant` `solid`(기본)/`subtle`/`outline`/`ghost`, `color?: Color`(기본 `primary`, 루트 `data-color` 항상), `size` `xs`/`sm`/`md`(기본)/`lg` = 정사각형 24/32/40/48px(`size-6`~`size-12`, padding 0), 아이콘 16/16/20/24px(크기 규칙 표 IconButton 열), radius `md`, `loading`(아이콘 자리에 같은 크기 Spinner, `aria-label` 뒤에 `loadingLabel`을 붙여 이름이 「새로 고침 로딩 중」), `loadingLabel`(기본 「로딩 중」), `noPressScale`(ADR 0010), `render`, `disabled`, `type`(기본 요소일 때 `"button"`). `ComponentProps<"button">`에서 `color`·`aria-label`·`children`을 `Omit`한다. ref는 일반 prop이다. 24×24 미만 size는 없다.
  - **IconButton 아이콘을 `children`으로 받음**: `icon` prop 대신 `children`이다. Radix Themes·Chakra·Mantine ActionIcon이 같고, Button의 `startIcon`과 달리 아이콘이 내용 전부라서다. 타입상 필수라 빈 버튼을 만들 수 없다.
  - **IconButton 로딩 이름**: `aria-label`이 내용보다 먼저 이름이 되므로 VisuallyHidden 대신 `aria-label`에 상태를 붙인다. Button의 「저장 로딩 중」과 같은 결과다.
  - **Link props 표**: `color?: Color`(기본 `primary`, 루트 `data-color` 항상), `render?: ReactElement`, 그 밖에 `ComponentProps<"a">`(`color`만 `Omit`). class는 `text-accent underline decoration-1 underline-offset-2 hover:decoration-2 rounded-sm cursor-pointer focus-visible:focus-ring`. 글자 크기·굵기는 물려받는다(size·variant 축 없음). `disabled`·`loading`은 없다(HTML `a`에 비활성이 없고, 갈 수 없는 링크는 텍스트로 두라고 문서에 적었다). 색이 바뀌는 상태가 없어 `transition-colors`를 두지 않았다(reduced-motion 해당 없음).
  - **Link `color`를 둠(결정)**: ADR 0011대로 열린 `color?: Color`를 받는다. 사용자가 Role 밖 색과 앱 브랜드 색을 원하고, 실무 라이브러리(Radix Themes `Link color`, MUI `Link color`, Chakra `colorPalette`)도 링크 색을 고르게 한다. 바깥 색 상속(예: Alert 안 링크가 Alert 색을 따름)은 ADR 0011의 「루트에 `data-color`를 항상」 규칙과 맞지 않아 두지 않았다. 필요하면 앱이 `color`를 같은 값으로 준다. 새 공개 개념이 아니라 ADR 0011을 따른 것이라 새 ADR은 쓰지 않았다.
  - **Link 대비 쌍**: 글자색은 accent 슬롯 `text`다. Role은 `text-<role>` × 표면 층 3개(4.5:1), neutral은 `text-default` × 표면 층, 색 계열·앱 계열은 `colorContrastRules`의 `text` × 표면 층(4.5:1)으로 이미 등록되어 있어 Foundation 대비 쌍을 더하지 않았다. 등록 여부를 components unit 테스트(`test/contrast.test.ts`)로 고정했다. 밑줄을 항상 두므로 링크와 주변 글자 사이 3:1(WCAG 1.4.1 F73 기법)은 요구하지 않는다.
  - **"use client"**: IconButton.tsx에만 붙였다(차단 핸들러). Link.tsx·pressable.ts에는 없다. smoke가 빌드 결과 `Button.js`·`IconButton.js`에는 지시어가 있고 `Spinner.js`·`Link.js`·`pressable.js`에는 없는지 확인한다. 서버 컴포넌트 page에서 `<TideLink render={<Link href="/docs" />} color="brand">`와 `<IconButton render={<Link href />}>`가 `next build`를 통과했다(cloneElement로 Next Link 요소에 직렬화 가능한 props만 얹음).
  - **테스트**: components browser IconButton 25개 × instance 2(이름·type 기본값·아이콘 숨김, `@ts-expect-error`로 `aria-label`·children 누락·variant·size(`2xs`)·color 오류, JSX에서 `aria-label` 누락 타입 오류, Tab·Enter·Space·클릭, size 4개의 정사각형·아이콘 16/16/20/24px·다른 라이브러리 svg 크기 덮어쓰기·radius 6px, xs 계산값 24×24 이상, 기본 solid·primary와 바깥 data-color 비상속, 대표 variant × color 계산색, gray 계열, press 축소 0.96/reduced-motion none, noPressScale·disabled·loading none, focus-ring, forced-colors 투명 border, 커서 4종, 네이티브 disabled, 로딩(이름·포커스 유지·aria-disabled·Spinner 24px·클릭·Enter 차단·loadingLabel), Next Link render 병합과 Enter, 링크 disabled 이동 차단, ref·props). Link 13개 × instance 2(role·href·밑줄 1px·offset 2px·cursor, 글자 크기·굵기 상속, 기본 primary·data-color 비상속, neutral·danger·gray·cyan 계산색, color 타입 오류, focus-ring, Next Link render 병합(href, ref, className, `no-underline`이 기본 밑줄을 이김, onClick 순서 render → Link)과 Tab 두 번 이동·Enter, render children, a 속성·ref). unit 대비 쌍 등록 8개. `aria-label`을 잠시 optional로 바꾸면 tsc가 `Unused '@ts-expect-error'` 2건으로 실패함을 확인하고 되돌렸다. docs storybook project에 IconButton story 14개, Link story 8개(모두 a11y 켬).
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 433, icons 18, components 384, docs 98 tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(`button`, `icon-button-and-link`, 둘 다 `@tide-tds/components` patch).
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. IconButton 기본 `variant`를 Button과 같은 `solid`로 했다. 실제로는 툴바·닫기처럼 `ghost`로 쓰는 경우가 많아(MUI IconButton은 배경 없음이 기본) `ghost` 기본도 말이 된다. Button과 같은 축이라는 일관성을 앞에 뒀다.
    2. IconButton은 `aria-labelledby`만으로 이름을 주는 길을 막는다(`aria-label` 필수). spec·티켓 문구를 그대로 따랐다.
    3. Link 기본 색을 `primary`로 했고 바깥 색을 물려받지 않는다. Alert(20) 등 색 있는 표면 안 링크는 그 Component 티켓에서 대비 쌍(예: `text-primary` × `bg-danger-subtle`)을 따로 정해야 한다.
    4. Link hover 표시는 밑줄 두께(1px → 2px)뿐이다. hover용 글자색 Token이 없어서다.
