# 22: Skeleton과 Progress

Status: done
Blocked by: 18 (trusted publisher 설정과 0.2.0 CI 릴리스)

## What to build

앱 개발자가 로딩 자리를 `Skeleton`으로, 진행률을 `Progress`로 보여 준다. 움직임 줄이기를 켠 사용자에게 Skeleton 깜빡임은 멈추지만, Progress는 진행 정보이므로 유지된다.

## 수용 기준

- [x] Skeleton: keyframe 깜빡임을 쓰고 reduced-motion에서 멈춘다. 스크린리더에는 읽히지 않는다.
- [x] Progress: 진행률 역할과 값(`aria-valuenow` 등 또는 네이티브)을 노출하고 접근 가능한 이름을 받는다. reduced-motion에서도 진행 표시는 유지된다.
- [x] Progress 막대와 트랙의 UI 경계 대비가 3:1 이상이고 대비 쌍에 등록되어 있다.
- [x] `browser`(reduced-motion instance): Skeleton 애니메이션 정지와 Progress 유지를 계산값으로 단언한다. Progress 역할·값·이름을 단언한다.

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

- 2026-11-11 완료(브랜치 `ticket-22-skeleton-and-progress`, main 9974c4e 위).
  - **근거 버전**: react 19.3.1, tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, vitest-browser-react 2.3.0, playwright 1.65.0(Chromium), storybook 10.6.6, typescript 7.0.2. React Aria는 쓰지 않았다(ADR 0004: 포커스·키보드 동작이 없어 속성만으로 완결, spec 단계 3 「네이티브」). 새 의존성은 없고 `minimumReleaseAge`는 그대로다.
  - **API 확인**: `animate-pulse`(`pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`, keyframe 50% opacity 0.5)와 `motion-safe:`는 context7 `/tailwindlabs/tailwindcss.com`(animation.mdx, theme.mdx, hover-focus-and-other-states.mdx). `rerender`·`unmount`가 Promise인 것은 설치된 vitest-browser-react 2.3.0 d.ts에서, `toMatchAriaInlineSnapshot`은 설치된 @vitest/browser 5.1.0 d.ts에서 확인했다. progressbar 규칙은 1차 자료: WAI-ARIA 1.2 `progressbar`(aria-valuemin·max 기본 0·100, 값을 모르면 `aria-valuenow`를 빼고, 값을 바꾸면 갱신), MDN progressbar role(이름 필수, 「Prefer HTML」), MDN `<progress>`(label 연결).
  - **Progress 구현 방식(`div role="progressbar"`)**: MDN은 네이티브 `<progress>`를 권하지만 다음 이유로 div를 골랐다. ① 스타일링: `<progress>`는 막대를 `::-webkit-progress-value`·`::-moz-progress-bar`처럼 브라우저별 pseudo-element로만 칠하고, 실험(Playwright 1.65.0 Chromium, 테스트 밖 스크립트)에서 `getComputedStyle(el, "::-webkit-progress-value")`가 값을 돌려주지 않아(배경 `rgba(0,0,0,0)`) 수용 기준의 「계산값 단언」을 할 수 없다. ② forced-colors: 두 방식 모두 기본 동작은 막대·트랙 배경이 Canvas로 덮여 사라진다(같은 실험, 화면 찍기). 어차피 `forced-color-adjust: none`과 시스템 색을 직접 줘야 하고, div는 그 결과를 계산값으로 단언할 수 있다. ③ indeterminate: 이번에 두지 않으므로(아래) 네이티브의 장점이 없다. ④ 서버 렌더: 둘 다 속성만이라 차이가 없다(`"use client"` 없음). 접근성 트리는 두 방식이 같다(`progressbar "이름"`, 실험의 aria snapshot).
  - **indeterminate 없음**: spec motion 적용 「keyframe은 Spinner·Skeleton에만 쓴다」에 따라 값을 모르는 진행은 Spinner가 맡는다. `value`가 필수다.
  - **color 결정(ADR 0016 덧붙임)**: Progress `color`는 `Role`만(앱 Role 포함, 기본 `primary`). 진행 상태(진행 중·완료·실패)는 뜻이 있는 표시다. Skeleton은 `color`가 없다(뜻 없는 회색 자리 표시, `bg-neutral-subtle-active` 고정). ADR 0016 표에 없던 두 Component의 자리를 정한 것이라 ADR 0016 덧붙임 줄로 남겼다.
  - **Progress 색과 대비**: 막대는 accent `text` 슬롯(`bg-current text-accent`), 트랙은 accent `subtle`. 처음 후보 `solid` × `subtle`은 dark에서 3:1이 안 된다(primary 2.90, warning 2.92, danger 2.70, neutral × neutral-subtle 2.05). `border` 슬롯은 3:1을 넘지만(dark 5.35 이상) 배경용 accent utility가 없어 임의 값 class가 필요하다. `text` × 같은 Role `subtle`은 light 7.23 이상, dark 10.02 이상이고 이미 4.5:1 대비 쌍으로 등록되어 있으며(Tide Role 5개 `text-<role>` × `bg-<role>-subtle`, neutral `text-default` × `bg-neutral-subtle`), 앱 Role은 `colorContrastRules` text × subtle(4.5:1)로 tide-color가 검사한다. 그래서 foundation 대비 쌍은 늘지 않았다. components `unit`에 이 등록 단언 8개를 더했다.
  - **props 표**:

    Progress(`div role="progressbar"`, 서버 컴포넌트)

    | prop                             | 타입·값                                                                                                 | 기본값        | 비고                                                           |
    | -------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------- |
    | `value`                          | `number`                                                                                                | — (필수)      | 0~`max`로 잘라 `aria-valuenow`와 막대 너비(%)로 쓴다           |
    | `max`                            | `number`                                                                                                | `100`         | 0 이하·숫자가 아니면 100. `aria-valuemin`은 항상 0             |
    | `size`                           | `"sm" \| "md"`                                                                                          | `"md"`        | 굵기 4·8px, 너비는 부모를 채운다(`w-full`)                     |
    | `color`                          | `Role`                                                                                                  | `"primary"`   | 루트 `data-color`. 막대 `text-accent`, 트랙 `bg-accent-subtle` |
    | `aria-label` / `aria-labelledby` | `string`                                                                                                | — (하나 필수) | 타입 union으로 강제                                            |
    | `className`                      | —                                                                                                       |               | 트랙(루트)에 붙고 기본 class를 이긴다(`w-1/2`, `rounded-none`) |
    | 나머지                           | `ComponentProps<"div">`(`color`·`children`·`role`·`aria-valuenow`·`aria-valuemin`·`aria-valuemax` 제외) |               | `ref`, `id`, `aria-valuetext`, `aria-describedby` 등           |

    Skeleton(`div aria-hidden`, 서버 컴포넌트)

    | prop        | 타입·값                                                   | 기본값   | 비고                                                                                                     |
    | ----------- | --------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
    | `variant`   | `"text" \| "rect" \| "circle"`                            | `"text"` | text: 높이 1em·너비 100%·radius sm / rect: 너비 100%·radius md(높이는 `className`) / circle: radius full |
    | `size`      | `"xs" \| "sm" \| "md" \| "lg"`(`variant="circle"`일 때만) | `"md"`   | 24·32·40·48px(Avatar와 같다). text·rect에 주면 타입 오류                                                 |
    | `className` | —                                                         |          | 기본 class를 이긴다                                                                                      |
    | 나머지      | `ComponentProps<"div">`(`children`·`aria-hidden` 제외)    |          | `ref`, `id` 등                                                                                           |

  - **motion**: Skeleton은 `motion-safe:animate-pulse`라 움직임 줄이기에서 animation이 없다(`animationName: none`, `getAnimations()` 0개, 300ms 뒤에도 opacity 1). Progress는 keyframe이 없고 너비 전환만 `motion-safe:transition-[width]`(시간을 적지 않은 기본값 fast 150ms·out)이다. 움직임 줄이기에서는 `transitionDuration: 0s`이고 막대는 그대로 보인다(display·visibility·opacity·너비 비율 단언).
  - **forced-colors**: Progress는 트랙에 `forced-color-adjust: none`을 주고 트랙 Canvas + 1px CanvasText 경계, 막대 Highlight(Switch와 같은 시스템 색). Skeleton은 평소 투명한 1px 경계가 CanvasText로 그려져 모양이 남는다(Badge 방식).
  - **테스트**: components browser에 Progress 54 tests(27 × instance 2: 역할·이름·값 속성, aria-labelledby·aria-valuetext, 막대 숨김, 이름·value 누락·role·aria-valuenow·children 타입 오류, 비율·잘림·max 0·rerender, size 굵기·radius·너비, Role 6개 light·dark 계산색, 바깥 data-color 비상속, 앱 Role 통과·색 계열 타입 오류, reduced-motion 유지, forced-colors 시스템 색, ref·className), Skeleton 30 tests(15 × 2: aria snapshot으로 트리에 안 나옴, 깜빡임과 정지, variant 3개 크기·radius, circle size 4개, 타입 오류, 색, forced-colors, ref·className). unit에 대비 8 tests. docs storybook에 Skeleton 6·Progress 6 story(a11y 통과, off 없음). 실험으로 `motion-safe:`를 빼면 Skeleton 정지 단언이, `forced-colors:text-[Highlight]`를 빼면 forced-colors 단언이 실패함을 확인하고 되돌렸다.
  - **smoke**: page에 `<Skeleton variant="circle" size="sm" />`·`<Skeleton />`(`aria-busy` 영역 안)과 `<Progress value={30} max={60} color="success" aria-label="업로드" />`. `Skeleton.js`·`Progress.js`에 `"use client"`가 없는지, 출력 CSS에 `motion-safe:animate-pulse`·`h-[1em]`·`motion-safe:transition-[width]`·`forced-colors:text-[Highlight]`(@source), prerender HTML에 Skeleton `aria-hidden` 2개와 Progress 역할·이름·값 속성·`data-color`·`width:50%`, nodenext에 `SkeletonProps`·`ProgressProps`와 타입 오류 3개. Progress 색을 처음에 `brand`로 두었더니 Alert smoke 정규식(`data-color="(warning|brand)"`인 div)이 Progress까지 잡아 실패해서 `success`로 바꿨다(앱 Role 통과는 nodenext 타입으로 확인).
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 460, icons 18, components 1007(이전 915), docs 210(이전 198) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(`@tide-tds/components` patch). 「Failed to import test file … Unexpected token '}'」는 나지 않았다(테스트 실행 중에는 파일을 편집·포맷하지 않았다). 첫 두 번의 전체 실행은 story 타입 오류와 위 smoke 정규식 충돌로 실패했고, 고친 뒤 세 번째에 통과했다.
  - **ADR·티켓 어긋남**: 티켓 수용 기준 「Progress: 진행률 역할과 값을 노출」은 indeterminate를 막지 않지만, spec motion 「keyframe은 Spinner·Skeleton에만」을 따라 indeterminate를 두지 않았다. spec 스타일 축 「`size`는 `xs`/`sm`/`md`/`lg`」의 높이 표는 컨트롤 높이라 막대 굵기에 맞지 않아 Badge처럼 `sm`·`md`만 두고 값을 따로 정했다. spec 「Component별로 이미 정한 범위」에 Skeleton·Progress 줄을, 스타일 축에 color 줄을 더했다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. Progress는 값을 아는 진행만 다룬다(`value` 필수). indeterminate가 필요해지면 spec motion 규칙(keyframe 범위)을 바꿀지 먼저 정해야 한다.
    2. 막대 색이 accent `text` 슬롯이라 light에서 Button solid(`#006ae2`)보다 진한 색(primary `#0049a1`)이다. 브랜드 색에 더 가깝게 하려면 foundation에 배경용 accent `border` utility와 색 이름 규칙 border × subtle(3:1)을 더하는 안이 있다(dark에서도 3:1 이상 확인).
    3. 트랙(accent subtle)과 표면의 대비는 낮다(light 약 1.1). 진행 비율은 막대 × 트랙 대비(4.5:1 이상)로 읽히고, 전체 길이는 레이아웃으로 알 수 있다고 보았다. forced-colors에서는 트랙 경계가 그려진다.
    4. Progress `size`는 `sm` 4px·`md` 8px, 라벨·값 글자는 Component에 넣지 않고 앱이 `aria-labelledby`로 연결한다.
    5. Skeleton 기본 `variant`는 `text`, 색은 `bg-neutral-subtle-active`(dark raised 위에서도 보이도록 subtle 3단계 중 가장 진한 값). Skeleton이 `children`으로 내용 크기를 따라가는 방식은 두지 않았다.
    6. Storybook `Meta` 타입이 union props(Skeleton `size`, Progress 이름)를 풀지 못해 story는 평평한 args 타입을 쓰고 Skeleton은 `component`를 타입 단언했다.
  - **다음 티켓 메모**: 23(Table)·24(Breadcrumb·Pagination)도 「네이티브」 단계라 같은 서버 컴포넌트 패턴을 쓴다. union props를 쓰는 Component의 story는 평평한 args 타입이 필요하다. smoke page에 `data-color`가 붙은 `div`를 더하면 Alert 정규식(`data-color="(warning|brand)"`)과 겹치지 않게 색을 고른다. 34(Toast)의 진행 표시나 자동 닫힘 막대가 필요하면 Progress를 쓰되 keyframe 규칙을 지킨다.
