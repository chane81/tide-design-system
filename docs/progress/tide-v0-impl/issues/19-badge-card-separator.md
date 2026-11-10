# 19: Badge·Card·Separator

Status: done
Blocked by: 18 (trusted publisher 설정과 0.2.0 CI 릴리스)

## What to build

앱 개발자가 서버 컴포넌트에서 `Badge`(상호작용 없는 상태 라벨), `Card`(surface 컨테이너), `Separator`를 그대로 쓴다. 셋 다 `"use client"` 없이 서버에서 렌더된다.

## 수용 기준

- [x] 세 Component 모두 `"use client"`가 없고 smoke 앱의 서버 컴포넌트에서 렌더된다.
- [x] Badge: Role로 색을 고른다. 상태가 색만이 아니라 텍스트로 전달된다. radius는 `sm`(작은 표시 요소)이다.
- [x] Card: surface 표면, border만 쓰고 그림자는 없다. radius는 `lg`다.
- [x] Separator: 장식/의미 구분에 맞는 역할을 쓴다(장식용 border는 대비 검사 제외).
- [x] `browser`: 역할과 이름, Card의 forced-colors 경계를 단언한다.

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

- 2026-11-10 완료(브랜치 `ticket-19-badge-card-separator`, main 4211e9c 위).
  - **근거 버전**: react 19.3.1, tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, vitest-browser-react 2.3.0, storybook 10.6.6, typescript 7.0.2, react-aria 3.53.1(설치 소스만 읽고 쓰지 않음). 새 의존성은 없고 `minimumReleaseAge`는 그대로다.
  - **API 확인**: `ref`를 일반 prop으로 받는 것(`forwardRef` 불필요)은 context7 `/reactjs/react.dev`(forwardRef.md, manipulating-the-dom-with-refs.md). Tailwind v4 preflight의 `* { border: 0 solid }`와 `hr { height: 0; color: inherit; border-top-width: 1px }`, `border`가 `currentColor` 기본이라는 것, 논리 방향 경계(`border-s`)는 context7 `/tailwindlabs/tailwindcss.com`(preflight.mdx, border-color.mdx, v4 alpha blog)와 설치된 `tailwindcss/preflight.css`로 확인했다. forced-colors에서 투명 경계(`border-transparent`)와 `border-default`가 `CanvasText`로, 배경이 `Canvas`로 덮인다는 것은 Chromium 테스트로 단언한다.
  - **Separator 구현 방식**: React Aria `useSeparator`(3.53.1)는 React hook을 쓰지 않는 순수 함수(`filterDOMProps` + `role`/`aria-orientation` 계산)라 서버에서 부를 수는 있다. 그래도 ADR 0004(「네이티브 HTML로 패턴이 완결되면 hook을 쓰지 않는다」)에 따라 쓰지 않았다. 루트는 항상 네이티브 `<hr>`이다. 암묵 역할이 separator(가로)이고, 세로는 `aria-orientation="vertical"`, 장식용은 `role="none"`(HTML-ARIA에서 hr에 허용된 역할)이다. `useSeparator`도 세로일 때만 `aria-orientation`을 붙이는 같은 규칙이다(소스 확인). 루트 요소가 방향에 따라 바뀌지 않아 `ref` 타입이 `HTMLHRElement` 하나다.
  - **color 범위**([ADR 0017](../../../decisions/0017-badge-is-status-label-role-only.md)): Badge는 상태 라벨이라 `color`는 `Role`만(앱 Role 포함). `"blue"`·`"gray"`는 타입 오류다. ADR 0016 표에서 Badge를 행동·의미 쪽으로 옮기고 spec 「스타일 축」·「앱 확장점(색)」·「Component별 범위」, GLOSSARY 「Role」·「색 이름」·「Badge」, `types.ts` 주석, ADR 0016에 정정 줄, 원칙 README ADR 목록을 고쳤다. Card·Separator는 색 prop이 없다.
  - **props 표**:

    Badge(`span`, 서버 컴포넌트)

    | prop        | 타입·값                                | 기본값      | 비고                                                |
    | ----------- | -------------------------------------- | ----------- | --------------------------------------------------- |
    | `children`  | `ReactNode`                            | — (필수)    | 상태 텍스트. 색만으로 전하지 않으려고 필수          |
    | `variant`   | `"subtle" \| "solid"`                  | `"subtle"`  | `outline`·`ghost`는 타입 오류                       |
    | `size`      | `"sm" \| "md"`                         | `"md"`      | 높이 20 / 24px, `label-sm`/`label-md`, 좌우 6 / 8px |
    | `color`     | `Role`                                 | `"neutral"` | 루트 `data-color`. 색 계열 이름은 타입 오류         |
    | `className` | —                                      |             | 기본 class를 이긴다                                 |
    | 나머지      | `ComponentProps<"span">`(`color` 제외) |             | `ref`, `id`, `title` 등                             |

    Card(기본 `div`, 서버 컴포넌트)

    | prop        | 타입·값                 | 기본값 | 비고                                                            |
    | ----------- | ----------------------- | ------ | --------------------------------------------------------------- |
    | `render`    | `ReactElement`          | —      | `<article />`, `<section />`, `<li />` 등. props·ref·class 병합 |
    | `className` | —                       |        | 기본 class와 render 요소 class를 이긴다(`p-6`, `p-0`)           |
    | 나머지      | `ComponentProps<"div">` |        | `ref` 등                                                        |

    Separator(`hr`, 서버 컴포넌트)

    | prop          | 타입·값                                        | 기본값         | 비고                                                          |
    | ------------- | ---------------------------------------------- | -------------- | ------------------------------------------------------------- |
    | `orientation` | `"horizontal" \| "vertical"`                   | `"horizontal"` | 세로는 `aria-orientation="vertical"`, 루트 `data-orientation` |
    | `decorative`  | `boolean`                                      | `false`        | `true`면 `role="none"`, 방향 속성 없음                        |
    | `className`   | —                                              |                | 바깥 여백(`my-4`)이나 선 색(`border-strong`)                  |
    | 나머지        | `ComponentProps<"hr">`(`role`·`children` 제외) |                | `ref`, `aria-label` 등                                        |

  - **모양**: Badge `inline-flex`, radius `sm`(4px), border 1px 투명(높이에 포함), `whitespace-nowrap`, 안 아이콘 12px, 그림자 없음. Card `rounded-lg`(8px), `border border-default`, `bg-surface`, `text-default`, `p-4`, 그림자 없음. Separator 바깥 여백 0, 가로 `h-0 w-full border-t`, 세로 `w-0 self-stretch border-s`(RTL에서 오른쪽), 선 `border-default` 1px.
  - **Token·대비**: Badge subtle `text-accent` × `bg-accent-subtle`(Role 쌍 `text-<role>` × `bg-<role>-subtle`, neutral은 `text-default` × `bg-neutral-subtle`, 앱 Role은 `colorContrastRules` text × subtle), solid `text-accent-on-solid` × `bg-accent-solid`(`text-on-solid` × `bg-<role>-solid`, 앱 Role on-solid × solid). Card 글자 `text-default` × `bg-surface`. Card 경계와 Separator 선 `border-default`는 장식용 구분선으로 foundation `contrastExclusions`에 이미 있다(Card 경계는 조작 요소 경계가 아니라 WCAG 1.4.11 대상이 아니라고 판단). 모두 이미 등록되어 foundation 대비 쌍을 더하지 않았다. components `unit`(test/contrast.test.ts)에 등록·제외 여부 단언을 더했다.
  - **forced-colors**: 따로 class를 두지 않고 기본 동작을 쓴다. Badge는 배경이 Canvas가 되어도 투명 경계가 `CanvasText`로 그려져 라벨 모양이 남는다. Card 경계·Separator 선(장식용 포함)도 `CanvasText`다.
  - **테스트**: components browser에 Badge·Card·Separator 96 tests(48 × instance 2). 역할(Badge 역할 없음·live region 아님·버튼/목록 이름에 포함, Card 기본 div·render article/li/section region, Separator hr separator·세로 aria-orientation·decorative role none·aria-label 이름), 모양(radius sm/lg, 높이·글자·여백 size 2개, 아이콘 12px, 그림자 없음, Card padding·surface·border-default light/dark, Separator 1px·폭·flex 늘어남·RTL·여백 0·className 여백), Role 6개 subtle(light)·solid(dark) 계산색, `data-color` 비상속, 앱 Role(`brand`) 계산색, 타입 오류(`children` 누락, `lg`, `outline`, `blue`·`gray`, Card `variant`, Separator `diagonal`·`role`), forced-colors 경계(CanvasText)·배경(Canvas), ref·className 우선(render 요소 class 포함). Badge `border border-transparent`, Separator `role="none"`·`border-s`를 각각 빼면 해당 테스트가 실패함을 확인하고 되돌렸다. unit에 대비 쌍 15 tests. docs storybook에 Badge 9, Card 6, Separator 6 story(a11y `error`, 끈 story 없음).
  - **smoke**: page에 `<Card render={<article aria-label="배포" />}>` 안의 `Badge`(Role, 앱 Role `brand` solid sm)와 `Separator`(가로, 세로 장식용). `Badge.js`·`Card.js`·`Separator.js`에 `"use client"`가 없는지, 출력 CSS에 `[&_svg]:size-3`·`bg-surface`·`self-stretch`(@source), prerender HTML에 article·`data-color`·hr 2개(의미 구분은 역할 속성 없음, 장식용 `role="none"`), nodenext `BadgeProps`·`CardProps`·`SeparatorProps`와 `"blue"`·children 누락·`"diagonal"` 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 436, icons 18, components 719(이전 608), docs 177(이전 156) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(`@tide-tds/components` patch).
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. Badge `color` 기본값을 `neutral`로 했다(다른 Component는 `primary`). 뜻을 고르지 않은 상태 라벨이 주 동작 색이면 「주목」으로 읽히기 때문이다(ADR 0017).
    2. Badge `variant`를 `subtle`/`solid` 두 개로, `size`를 `sm`(20px)/`md`(24px)로 했다. 조작 요소가 아니라 size 표(24px 이상)보다 작게 두었다. `outline` 채움은 두지 않았다.
    3. Card 여백은 prop 없이 `p-4`(16px) 고정이고 `className`으로 바꾼다. `padding` prop, `CardHeader`류 하위 Component는 두지 않았다.
    4. Card는 `render`로 요소를 바꾼다(ADR 0005). 기본 `div`라 역할이 없다.
    5. Separator는 세로도 `<hr>`이다(React Aria는 세로를 `div role="separator"`로 렌더). 바깥 여백은 0이고 앱이 준다. 방향을 `data-orientation`(boolean이 아닌 값 속성)으로 노출한다. 상태가 아니라 prop 값이라 공통 규칙의 boolean `data-*` 대상이 아니라고 판단했다.
    6. Card 경계(`border-default`)를 장식용으로 보고 대비 검사 대상에서 뺐다. 표면 구분을 경계에 맡기는 화면이 많으면 `border-strong`으로 올릴지 정해야 한다.
  - **다음 티켓 메모**: 20(Alert)은 Card와 같은 `lg` 담는 요소이고 Role 상태 아이콘을 쓴다. Badge의 subtle 색 조합(`bg-accent-subtle` + `text-accent`)을 그대로 쓸 수 있다. 33(Tag)·21(Avatar)은 ADR 0017에 따라 `ColorFamilyName`을 받는 장식·분류 Component다. 25·31·32(Popover·Tabs·Accordion)가 구분선이 필요하면 `Separator`(장식용)를 쓴다. smoke page의 Card 안 `<p>` 사이 `Separator`가 Next prerender에서 `<hr/>`로 나온다(hr은 `<p>` 안에 둘 수 없어 page에서는 `<p>` 밖에 두었다).
