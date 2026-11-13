# 13: Button

Status: done
Blocked by: 07 (motion·z-index Foundation), 08 (아이콘 패키지), 09 (Spinner), 12 (0.1.0 첫 publish)

## What to build

앱 개발자가 `Button`을 채움 방식(`variant`) × Role(`color`) × `size`로 고르고, Next `Link`로 렌더해야 하면 `render={<Link href="/x" />}`로 바꾼다. 누르면 살짝 줄어들고(끌 수 있음), 로딩 중에는 Spinner가 보인다. 2단계의 첫 Component이고 이후 버튼류의 기준이 된다.

## 수용 기준

- [x] `variant`는 채움 방식 `solid`/`subtle`/`outline`/`ghost`이고 union 이름은 채움 방식을 드러낸다(예: `FillVariant`). 공통 union 타입은 한 곳에서 정의하고 `Extract`로 고른다.
- [x] `color`는 Role 6개, `size`는 `xs`/`sm`/`md`/`lg`이고 높이 24/32/40/48px, 텍스트 스타일은 size 표를 따른다. radius는 모든 size에서 `md`다.
- [x] variant 정의는 타입이 붙은 객체 맵과 `cn`으로 직접 쓰고(cva·tailwind-variants 없음), 모든 조합을 채웠는지 타입 검사가 확인한다.
- [x] 텍스트 옆 아이콘 크기는 아이콘 크기 규칙 표를 따르고 내부 아이콘은 장식용이다. 아이콘 자리에 다른 라이브러리의 `ReactNode`도 들어간다.
- [x] `render`: 요소를 넘기면 props, ref, className을 병합한다. `asChild`, `as`, 함수 형태는 없다.
- [x] press 축소: 활성 상태에서 누르면 0.96으로 줄어든다(`motion-safe:`일 때만). boolean prop으로 끈다. prop 이름(초안 `static`)을 공통 규칙에 맞춰 확정하고 결정을 Comments에 남긴다(되돌리기 어려우면 ADR).
- [x] 로딩 상태: Spinner를 보여 주고 접근 가능한 상태를 전달한다. 개별 동작은 이 티켓에서 정한다.
- [x] disabled: 네이티브 `disabled`를 쓴다. `render`로 `disabled`를 지원하지 않는 요소가 되면 `aria-disabled="true"`, `data-disabled`, 이벤트 차단. `cursor-not-allowed`를 공통 적용한다.
- [x] 포커스 표시는 `focus-ring`이다. 혼자 있는 조작 요소이므로 `transition-colors` `fast`다.
- [x] `browser`: 역할·이름, 키보드 실행, `render` 병합(Next `Link`), disabled 처리, press 축소의 reduced-motion 계산값, 포커스 ring을 단언한다.

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

- 2026-11-10 완료(브랜치 `worktree-agent-ac7da783947682eb7`).
  - **근거 버전**: react 19.3.1(@types/react 19.3.0), tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, vitest-browser-react 2.3.0, storybook 10.6.6, next 16.4.5. react-aria 3.53.1은 문서만 참고했고 Button에는 hook을 쓰지 않는다(ADR 0004). 새 외부 의존성은 없다. components devDependency에 `next`(catalog, lockfile에 이미 있던 16.4.5)만 더했고 `minimumReleaseAge`는 그대로다.
  - **API 확인**: `scale-<number>` → `scale: <number>% <number>%`, `transition-*`가 `--default-transition-*`를 쓰는 것은 context7 `/tailwindlabs/tailwindcss.com`(scale.mdx, transition-property.mdx). browser 사용자 정의 명령(`BrowserCommand`, `ctx.iframe` FrameLocator, `ctx.page`)은 context7 `/vitest-dev/vitest`(docs/api/browser/commands.md). 로딩 동작은 React Aria Button `isPending` 문서(react-aria.adobe.com/Button: 포커스는 유지하고 그 밖에는 비활성, 상태를 보조 기술에 알림)를 참고했다.
  - **press 축소 prop 이름**: `noPressScale`(기본 `false`)로 확정했다. HTML의 `noValidate`·`noModule`처럼 기본으로 켜진 동작을 끄는 boolean이다. `static`은 뜻이 모호하고 strict mode 예약어라 버렸다. 공개 API 이름이고 IconButton(14)이 따르므로 [ADR 0010](../../../decisions/0010-press-scale-opt-out-prop-name.md)으로 남겼다. spec 공통 API 절도 고쳤다.
  - **로딩 동작**: `loading`이면 앞 아이콘 자리(없으면 텍스트 앞)에 같은 size의 Spinner(`aria-hidden`)를 보인다. 텍스트 뒤에는 VisuallyHidden `loadingLabel`(기본 「로딩 중」)을 넣어 이름이 「저장 로딩 중」이 된다. 네이티브 `disabled` 대신 `aria-disabled="true"`와 `data-loading`을 붙여 포커스를 잃지 않게 하고, 클릭(Enter·Space·폼 제출 포함)을 `preventDefault`로 막는다. 색은 그대로이고 hover·누름 색과 press 축소는 빠진다. cursor는 `wait`다. `disabled`와 함께 오면 disabled가 이긴다. 앞 아이콘이 없으면 폭이 Spinner만큼 늘어난다.
  - **disabled**: 기본 요소나 `render={<button />}`는 네이티브 `disabled`를 쓴다. 그 밖의 `render` 요소(Next Link 등)는 `aria-disabled="true"`, `data-disabled`, 클릭 차단(링크 이동 포함)이고 포커스는 남는다. 모든 경우 `cursor-not-allowed`와 disabled Token 색(solid·subtle `bg-disabled`, outline `border-default`, 글자 `text-disabled`)이다.
  - **props 표**: `variant` `solid`(기본)/`subtle`/`outline`/`ghost`, `color` Role 6개(기본 `primary`), `size` `xs`/`sm`/`md`(기본)/`lg` = 높이 24/32/40/48px, 좌우 padding 8/12/16/20px, 간격 4/6/8/8px, 텍스트 `label-sm`/`label-sm`/`label-md`/`label-lg`, 아이콘 14/14/16/20px, radius `md`. `startIcon`·`endIcon`(ReactNode, `aria-hidden` span으로 감싸고 안의 요소를 크기에 맞춤), `loading`, `loadingLabel`, `noPressScale`, `render`, `disabled`, `type`(기본 요소일 때 기본값 `"button"`, render일 때는 넣지 않음). `ComponentProps<"button">`에서 `color`만 `Omit`한다. ref는 일반 prop이다.
  - **색 맵**: solid `bg-<r>-solid`/`-hover`/`-active` + `text-on-solid`, subtle `bg-<r>-subtle`/`-hover`/`-active` + `text-<r>`, outline `border-<r>` + `text-<r>`(hover `subtle-hover`, 누름 `subtle-active`), ghost는 outline에서 경계만 투명이다. neutral은 `text-default`, outline 경계는 `border-strong`이다. 모두 이미 등록된 대비 쌍이라 foundation 대비 쌍을 더하지 않았다. 모든 variant에 border 1px(색 없는 variant는 투명)를 둬 forced-colors에서 경계가 보인다.
  - **상태별 class를 JS로 고름**: hover·누름 색과 press 축소 class는 활성 상태일 때만 붙인다. `enabled:`는 `<a>`에 맞지 않고, `disabled:`와 `hover:`의 CSS 순서에 기대지 않으려는 것이다. 사용자는 여전히 `disabled:`, `data-loading`, `data-disabled`로 덮어쓸 수 있다.
  - **motion**: `transition-colors`(fast, out). press 축소가 켜져 있으면 `motion-safe:transition-[colors…,scale]`과 `motion-safe:active:scale-96`을 더한다.
  - **"use client"**: Button.tsx에만 붙였다. 차단 상태의 클릭 핸들러를 만들고, 서버 컴포넌트에서는 DOM 요소에 함수를 넘길 수 없기 때문이다. 빌드 결과 `dist/Button.js` 첫 줄에 남는다. smoke가 Button.js에만 있고 Spinner.js에는 없는지 확인한다. 서버 컴포넌트 page에서 `render={<Link href />}`를 넘기는 것도 `next build`로 확인했다.
  - **테스트**: components browser 54개 × instance 2(`src/Button.test.tsx`). 역할·이름·type 기본값, 아이콘 숨김과 다른 라이브러리 svg 크기 덮어쓰기, Tab·Enter·Space·클릭, size 4개의 높이·텍스트 스타일·아이콘·radius, variant 4 × Role 6 계산색이 Token과 같음(기본 instance), `@ts-expect-error` 타입 오류 3개, transition fast, press 축소(Playwright 마우스 명령으로 `:active` 유지 → 기본 `0.96`, reduced-motion `none`, `noPressScale`·disabled·loading `none`), focus-ring(2px, offset 2px, `outline-focus`), forced-colors 투명 border 보임, 네이티브 disabled, Next Link render 병합(href, ref, className 병합과 `px-8` 우선, Enter 실행), render 요소 children, 링크 disabled(aria-disabled·data-disabled·이동 차단·포커스 유지), `render={<button />}` 네이티브 disabled, 로딩(이름, 포커스 유지, 클릭·Enter·Space·폼 제출 차단, Spinner 14px 회전, loadingLabel, 아이콘 교체, disabled 우선, 색 유지), ref·props·className. docs storybook project에 Button story 14개(렌더·axe, Don't 「아이콘만 넣는다」만 a11y off).
  - **대조·발견**: press 축소 테스트는 기본 instance `0.96`, reduced-motion instance `none`으로 갈려 두 분기가 모두 돈다. focus-ring 색을 바로 읽으면 outline 색 전환 중이라 흰색이 나와(transition-colors가 outline-color를 포함) 250ms 뒤에 읽게 고쳤다. `next/link`를 실행 중에 발견하면 Vite가 다시 최적화하며 차가운 캐시에서 테스트 import가 실패해 `optimizeDeps.include`에 넣었다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 364, icons 18, components 234(126 → 234), docs 71 tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(`@tide-tds/components` patch).
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 기본 `color`를 `primary`로 했다(neutral을 기본으로 쓰는 시스템도 있다).
    2. 로딩 상태를 이름(「저장 로딩 중」)으로 알리고 `loadingLabel` prop을 더했다. 상태 변화를 live region으로 알리지는 않는다. 버튼 자식은 presentational이고, `render` 규칙상 루트가 DOM 요소 하나라 형제 요소를 두지 않았다. 결과 알림은 앱이 처음부터 있던 알림 영역에 넣으라고 문서에 적었다.
    3. 로딩 cursor를 `wait`로 했다(spec에는 disabled의 `not-allowed`만 있다).
    4. 링크 disabled에서 `href`를 지우지 않는다. 클릭·Enter는 막지만 가운데 클릭·새 탭 열기는 브라우저가 처리한다. 또 `render` 요소 자신에 준 `onClick`은 차단 상태에서도 먼저 불린다(render 병합 규칙). Button에 준 `onClick`만 막힌다.
    5. 아이콘 prop 이름은 `startIcon`/`endIcon`이다(RTL을 생각해 left/right가 아닌 start/end).
- 2026-11-10 사용자 피드백 반영: 마우스를 올려도 커서가 손 모양이 아니었다.
  - **원인**: tailwindcss 4.3.5 preflight는 button 커서를 정하지 않아 브라우저 기본값(`default`)이 된다. v4 upgrade guide 「Buttons use the default cursor」(context7 `/tailwindlabs/tailwindcss.com` upgrade-guide.mdx)와 설치본 `preflight.css`(cursor 규칙 없음)로 확인했다. Tide foundation base CSS에도 cursor 규칙은 없다. `<a href>`는 브라우저 기본값으로 이미 pointer였다.
  - **결정(이후 버튼류 기준)**: 활성 상태 `cursor-pointer`, 로딩 `cursor-wait`, 비활성 `cursor-not-allowed`. 기본 button과 `render` 요소(Next Link, `<a>`) 모두 Component가 class로 직접 붙인다. spec 공통 API 절에 「커서」 규칙을 더했다.
  - **테스트**: browser에 계산된 `cursor` 단언 2개 × instance 2(button 활성·disabled·loading, Next Link·`<a>` 활성·disabled·loading). 수정을 잠시 빼면 button 활성이 `expected 'default' to be 'pointer'`로 실패함을 확인하고 되돌렸다.
- 2026-11-10 열린 color 반영(티켓 40, [ADR 0011](../../../decisions/0011-open-color-names-data-color-accent.md) 머지 뒤 main 위로 rebase).
  - **API 변경**: `color?: Color`(Role 6개 + 색 계열 6개 + 앱이 `ColorRegistry` augmentation으로 더한 계열). 루트에 `data-color`를 항상 붙인다(기본 `primary`). 바깥 `data-color`를 물려받지 않는다. 사용자가 `data-color`를 직접 줘도 `color`가 이긴다.
  - **variant 맵**: `Record<FillVariant, string>` 두 개(기본 색, hover·누름)로 줄였다. solid `bg-accent-solid text-accent-on-solid`(hover `bg-accent-solid-hover`, 누름 `-active`), subtle `bg-accent-subtle text-accent`(hover·누름 `subtle-hover`/`-active`), outline `border-accent text-accent`, ghost `text-accent`(둘 다 hover `subtle-hover`, 누름 `subtle-active`). neutral의 text `default`·border `strong`·dark subtle 900/800/700은 Foundation의 Role 덮어쓰기가 accent 슬롯에 그대로 들어와 Button은 분기하지 않는다. disabled·커서·press 축소 규칙은 그대로다. 앞으로 색 계열이나 앱 계열을 더해도 Button 코드는 바뀌지 않는다.
  - **기본 color `primary`는 확정**(사용자가 추천안 승인). 이전 「판단 보류」 1번은 닫는다.
  - **테스트**: Role 6개 × variant 4 계산색 회귀(전과 같은 Role Token 비교가 그대로 통과), 색 계열 6개 × variant 4가 `--tide-<계열>-<슬롯>`과 같음, `data-color` 기본 `primary`와 바깥 `data-color="danger"` 비상속, dark subtle(blue 950, neutral gray-900, gray 950), `colorFamilyCss`로 넣은 앱 계열 `brand`(light solid는 앱 계열 600·흰 글자, dark subtle은 950. 당시 픽스처 값은 티켓 49에서 Tide 예시 값으로 바꿨다), `ColorRegistry` augmentation으로 `color="brand"`·`"gray"` 통과와 `"purple"` 타입 오류. 테스트 안에서는 interface를 선언한 `@tide-tds/foundation`을 넓혔고, 앱처럼 `@tide-tds/components`를 넓히는 경우는 smoke(page의 `<Button color="brand">`, nodenext `ButtonProps`)가 본다. components browser 292 tests.
  - **문서**: MDX 「색 고르기」에 Role·색 계열·앱 브랜드 색 표와 「브랜드 색 더하기」 링크, story 「색 계열」·「앱 브랜드 색」(문서에서만 `colorFamilyCss` 결과를 `<style>`로 넣는다)을 더했다. changeset 설명도 고쳤다.
  - **rebase 충돌**: components `index.ts`·`types.ts`(Color·ColorRegistry와 FillVariant·Role을 함께 export), smoke `page.tsx`·`smoke.ts`·`nodenext.ts`(40의 브랜드 검사와 Button 검사를 모두 유지), `docs/principles/README.md`(ADR 0010·0011 둘 다). spec은 자동 병합되어 커서 규칙·`noPressScale`·color 정의가 모두 남았다.
