# 05: 타이포그래피 Foundation과 Typography

Status: done
Blocked by: 04 (컬러 Foundation)

## What to build

앱 개발자가 `text-body-md` 같은 class 하나로 크기·행간·굵기를 한 번에 정하고, `Typography` Component로 알맞은 시맨틱 요소를 자동으로 얻는다. 한글 문단은 어절 단위로 줄바꿈되고, 브라우저 글자 크기를 키우면 함께 커진다. 자동완성에는 Tide 값만 나온다.

## 수용 기준

### Foundation

- [x] font-family는 `sans`(Pretendard Variable 우선 스택)와 `mono`(시스템 스택) 두 개만 둔다. 웹폰트와 `@font-face`는 넣지 않는다.
- [x] Primitive 크기(12/14/16/18/20/24/32/40/48/56px)는 rem으로 쓰고 class로 노출하지 않는다.
- [x] 텍스트 스타일 14개를 `--text-<이름>`과 `--line-height`, `--font-weight` 하위 변수로 정의한다. 값은 spec 표를 따른다.
- [x] 굵기는 300/400/500/600/700 5개만 둔다. 자간은 0이다.
- [x] Tailwind 기본 `text-*` 크기, `font-weight`, `font-serif`를 지운다. `leading-*`, `tracking-*`, `tabular-nums`는 남는다.
- [x] base CSS에 `word-break: keep-all`과 `overflow-wrap: break-word`를 넣는다. 루트 font-size는 바꾸지 않는다.
- [x] tailwind-merge 설정이 텍스트 스타일 이름 충돌을 해결한다(`text-body-md`와 색 class가 서로 지우지 않음).

### Typography Component

- [x] `variant`는 텍스트 스타일 이름이다. 기본 요소: `display-*`·`heading-xl` → `h1`, `heading-lg`/`md`/`sm`/`xs` → `h2`/`h3`/`h4`/`h5`, `body-*`·`caption` → `p`, `label-*` → `span`.
- [x] heading·display는 `level`(1~6)을 선택적으로 받고 항상 `<h*>`로 렌더된다.
- [x] `render`로 다른 요소를 넘기면 props, ref, className을 병합한다.

### 테스트

- [x] `unit`: 컴파일한 CSS에 텍스트 스타일 14개와 굵기 5개가 있고, Tailwind 기본 크기·굵기·`font-serif`가 없다.
- [x] `browser`: 기본 요소, `level`, `render` 병합을 역할과 요소로 단언한다.

### 문서

- [x] 텍스트 스타일 블록: Token 원본에서 14개를 그린다.

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

- 2026-11-10 완료(브랜치 `ticket/05-typography-foundation`).
  - **근거 버전**: tailwindcss·@tailwindcss/node 4.3.5, tailwind-merge 3.7.0, react 19.3.1, storybook 10.6.6, tsdown 0.23.7. 새 의존성은 없다. `pnpm-lock.yaml`·`pnpm-workspace.yaml`·`package.json`(루트, 패키지)은 바꾸지 않았다.
  - **API 확인**: `--text-<이름>--line-height`/`--font-weight` 하위 변수와 `--<namespace>-*: initial`은 context7 `/tailwindlabs/tailwindcss.com`(font-size.mdx, theme.mdx. 문서 사이트는 버전이 없어 v4 최신 문서). namespace 범위는 설치본 4.3.5로 컴파일해서 다시 확인했다: `--text-*: initial`은 기본 크기만 지우고 `--text-color-*`(뒤에서 정의)와 `--text-shadow-*`는 남긴다. `--font-*: initial`은 font-family만 지우고 굵기는 남겨서 `--font-weight-*: initial`을 따로 쓴다. `--font-sans`를 정의하면 preflight의 `--default-font-family`가 `var(--tide-font-sans)`가 된다. 텍스트 스타일 class는 `line-height: var(--tw-leading, …)`, `font-weight: var(--tw-font-weight, …)`로 나와서 `leading-*`·`font-*`가 언제나 덮는다. tailwind-merge는 설치본 3.7.0 `bundle-mjs.mjs`의 theme 키(`text`, `font-weight`, `font`)·class group(`font-size`, `font-weight`, `font-family`)·기본 `conflictingClassGroups`(`font-size` → `leading`)와 `types.d.ts`의 `ConfigExtension.extend.conflictingClassGroups`로 확인했다. `cloneElement`의 ref 교체와 ref callback cleanup은 context7 `/reactjs/react.dev`(cloneElement.md, common.md). sans 스택은 Pretendard README(main 브랜치) 「어디서든 동일한 환경」 원문과 글자 단위로 같다.
  - **Token**(`packages/foundation/src/typography.ts`): `fontFamily`(sans 15개 이름, mono는 tailwindcss 4.3.5 기본 `--font-mono`와 같은 시스템 스택), `fontSize`(Primitive 10개, 키 px·값 rem), `fontWeight`(5개), `textStyle`(14개, `{ fontSize: <px 단계>, lineHeight: <rem>, fontWeight: <이름> }`). 루트 export에 Token 객체 4개와 타입(`TextStyleName` 등)을 더했고, 스택을 CSS 값으로 만드는 `fontFamilyCss`는 internal로 냈다. `as const satisfies`는 oxc d.ts(isolatedDeclarations)가 받지 않아 `roleFamily`처럼 `satisfies` 문을 따로 뒀다.
  - **공개 계약**(tokens.css의 Theme 무관 `:root` 블록): `--tide-font-sans`/`mono`, `--tide-font-size-<px>`, `--tide-font-<굵기>`, `--tide-text-<이름>`(→ `var(--tide-font-size-<px>)`), `--tide-text-<이름>--line-height`(rem), `--tide-text-<이름>--font-weight`(→ `var(--tide-font-<굵기>)`). 이름은 `--tide-<Utility class 이름>` 규칙을 따르고, class가 없는 Primitive 크기만 `--tide-font-size-<px>`로 정했다(Primitive 색 `--tide-color-*`와 같은 방식). FontLoading.mdx(티켓 10)의 `--tide-font-sans` 이름·스택 안내와 일치해서 그 문서는 고치지 않았다. spec 타이포그래피 항목에 공개 계약 한 줄을 더했다.
  - **tailwind.css**: `@theme inline`에 `--text-*`·`--font-*`·`--font-weight-*: initial`과 연결을 더했다. base CSS는 `@layer base`의 `html, :host`(preflight와 같은 선택자)에 `word-break: keep-all`, `overflow-wrap: break-word`만 둔다. 루트 font-size, 자간, `@font-face`는 없다.
  - **tailwind-merge**: theme `text`를 텍스트 스타일 14개, `font-weight`를 5개, `font`를 `sans`/`mono`로 `override`했다. 그래서 `text-body-md`(font-size)와 `text-muted`(text-color)는 서로 지우지 않고, `text-xl`·`font-serif`·`font-black`은 분류되지 않는다. 추가로 `extend.conflictingClassGroups`에 `font-size → font-weight`를 넣었다(아래 판단 보류 1).
  - **Typography**(`packages/desktop/src/Typography.tsx`): `variant`는 `TextStyleName`(foundation 타입)이고 기본값 `body-md`. props 타입은 heading·display(`level?: 1~6`)와 나머지(`level?: never`)의 union이라 `level`을 body에 주거나 없는 variant·7단계를 주면 타입 오류다(`Typography.test.tsx`의 `@ts-expect-error` 3개를 tsc가 확인). class는 Tailwind 스캔을 위해 문자열 맵으로 적었다. `"use client"` 없음(hook·state·이벤트 없음). smoke의 서버 컴포넌트에서 `render` 병합까지 렌더된다.
  - **`render` 병합 유틸**(`packages/desktop/src/render.ts`, 공개 export 아님. ADR 0005의 「Tide가 직접 작성하는 유틸」): className은 기본 class → render 요소 class → 사용자 className 순으로 `cn`, 이벤트 핸들러는 render 요소 것 다음 사용자 것, style은 얕게 합치고, ref는 둘 다 있을 때만 합친다(서버 컴포넌트에서 함수를 새로 만들지 않게). children은 Typography 것이 없으면 render 요소 것. 그 밖의 props는 Typography 쪽이 이긴다. Button·Link에서 다시 쓴다.
  - **테스트**: foundation `unit` 304 tests(250 → 304). `tokens.test.ts`(공개 계약 목록에 타이포그래피 변수 추가, 14개 값을 spec 표 px에서 rem으로 비교, `@font-face`·letter-spacing·루트 font-size 없음), `tailwind.test.ts`(텍스트 스타일 14개와 굵기 5개 class, `font-sans`/`mono`, 기본 크기 13개·기본 전용 굵기 4개·`font-serif` 없음, `leading-*`·`tracking-*`·`tabular-nums` 남음, `md:` variant, base CSS), `tailwind-merge.test.ts`, `exports.test.ts`. desktop `browser` 70 tests(chromium과 forced-colors·reduced-motion instance): 기본 요소 14개를 요소와 heading 역할로, `level`, `render` 병합(props·ref 둘 다·className 순서·핸들러 순서·label 연결), 계산값(크기·행간·굵기, 루트 20px에서 함께 커짐, keep-all, Pretendard 우선 글꼴). desktop `unit`의 `cn`에도 텍스트 스타일 경우를 더했다. smoke: 서버 컴포넌트에서 Typography와 `render`, 출력 CSS에 `.text-heading-lg`·`--tide-text-heading-lg`·`word-break: keep-all`·`--tide-font-sans`가 있고 `--text-xl`·`--font-serif`가 없는지.
  - **해당 없음**: 포커스 표시·forced-colors·reduced-motion 계산값(Typography는 포커스를 받지 않고 색·motion이 없다. 두 번째 browser instance에서도 같은 테스트가 통과한다), 대비 쌍 등록(Typography는 색 Token을 쓰지 않는다. 글자색은 사용자가 `className`으로 고르고 그 Token의 대비 쌍이 보장한다).
  - **문서**: `Foundation/타이포그래피`(`apps/docs/src/foundations/Typography.mdx`). 블록 `TextStyles`(14개: class, 크기/행간 px·rem, 굵기, 미리보기), `FontWeights`, `FontFamilies`는 Token 원본을 import하고 미리보기는 공개 계약 변수를 inline style로 쓴다(이름을 조합한 class는 Tailwind가 만들지 않기 때문). `Component/Typography`는 설명 → 사용 시점/쓰지 않을 때 → 예시 → Do/Don't → 접근성 → props 순서이고 예시 9개가 모두 story다. storybook project가 렌더·axe를 통과했다.
  - **판단 보류(사용자 확인 필요)**:
    1. tailwind-merge `font-size → font-weight` 충돌 추가: 텍스트 스타일이 굵기도 정하므로 `cn("font-bold", "text-body-md")`가 `text-body-md`만 남긴다(뒤에 온 것이 이긴다는 `cn` 규칙과 Tailwind 기본 `font-size → leading`과 같은 방식). 없으면 Tailwind의 `--tw-font-weight` 우선 때문에 앞에 온 `font-bold`가 뒤의 텍스트 스타일을 이긴다. 대가로 `font-bold text-[14px]`처럼 임의 크기 앞의 굵기도 지워진다(기본 `leading`과 같은 한계). spec에 한 줄 적었다. 빼려면 build.ts의 `conflictingClassGroups`와 테스트 한 건만 지우면 된다.
    2. `variant` 기본값 `body-md`: spec은 기본값을 정하지 않았다(「세부 props는 공통 규칙 안에서」). 가장 흔한 본문이라 골랐고 props 표에 적었다.
    3. mono 스택: spec은 「시스템 스택」만 정했다. tailwindcss 4.3.5 기본 `--font-mono` 순서를 그대로 썼다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/*/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force`(15개 태스크) 두 번 연속 통과. foundation 304 tests, icons 9 tests, desktop 70 tests(unit 4 + browser 66 = instance 2개 × 33), docs 42 tests(unit 9 + storybook 33 stories), smoke 「smoke 통과」, tarball publint `--strict` 「All good!」.
