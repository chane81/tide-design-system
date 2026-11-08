# 레퍼런스 Component 구성과 공통 API 관례

조사일: 2026-11-08. 티켓: [06-research-component-conventions](../progress/tide-v0/issues/06-research-component-conventions.md)

## 질문

1. 레퍼런스 시스템과 shadcn/ui는 v0나 초기 버전에 어떤 Component를 넣었는가?
2. 공통 API 관례(size와 variant 이름, `className` 병합, ref 전달, `asChild`나 polymorphic 패턴, controlled/uncontrolled)는 어떤가?
3. 접근성 동작을 담당하는 headless 라이브러리(Radix Primitives, React Aria, Base UI, Ark UI)는 현재 어떤 상태이고 장단점은 무엇인가?

## 조사 방법과 출처 등급

- npm 버전, 릴리스 날짜, `peerDependencies.react`는 2026-11-08에 `npm view <pkg> --json`으로 확인했다. 주간 다운로드는 `https://api.npmjs.org/downloads/point/last-week/<pkg>`(2026-11-01~11-07)로 확인했다.
- 초기 Component 목록은 GitHub 저장소의 해당 시점 커밋 트리, 또는 npm에 올라간 최초 tarball로 확인했다.
- API는 각 라이브러리의 공식 문서, 저장소 소스, context7(`/mui/base-ui/v1.9.0`, `/websites/radix-ui_primitives`, `/websites/react-aria_adobe`, `/llmstxt/ark-ui_llms_txt`)로 확인했다. context7의 React Aria, Radix, Ark 문서에는 버전이 붙어 있지 않다. 그래서 조사 시점의 공식 사이트 문서, 곧 npm 최신 버전 기준으로 본다.
- primer.style은 클라이언트 렌더링 페이지라 본문을 가져오지 못했다. Primer는 저장소의 `*.docs.json`과 `CHANGELOG.md`로 대신 확인했다.

## 1. 유지보수 상태 요약 (npm 기준, 2026-11-08)

| 패키지 | 최신 버전 | 최신 릴리스 | 최초 publish | React peer | 주간 다운로드 |
|---|---|---|---|---|---|
| `radix-ui` (Radix Primitives 통합 패키지) | 1.8.1 | 2026-10-12 | 2022-08-01 | `^16.8 \|\| ^17 \|\| ^18 \|\| ^19` | 약 2,678만 |
| `@radix-ui/react-dialog` | 1.3.1 | 2026-10-12 | 2020-12-15 | 위와 같음 | 약 9,271만 |
| `@radix-ui/themes` | 3.3.0 | 2026-01-31 | 2023-06-15 | `16.8 \|\| ^17 \|\| ^18 \|\| ^19` | 약 146만 |
| `react-aria-components` | 1.22.1 | 2026-10-09 | (1.0.0: 2023-12-20) | `^16.8 \|\| ^17 \|\| ^18 \|\| ^19.0.0-rc.1` | 약 898만 |
| `@base-ui/react` | 1.9.0 | 2026-10-09 | 2025-12-11 (1.0.0) | `^17 \|\| ^18 \|\| ^19` | 약 2,836만 |
| `@ark-ui/react` | 5.40.0 | 2026-10-29 | 2022-11-06 | `>=18.0.0` | 약 141만 |
| `shadcn` (CLI) | 4.23.0 | 2026-10-27 | 2024-07-09 | (없음) | - |
| `@primer/react` | 38.45.0 | 2026-11-06 | 2021-12-08 | `18.x \|\| 19.x` | 약 7.3만 |
| `@carbon/react` | 1.120.0 | 2026-11-04 | 2021-07-30 (1.0.0: 2022-03-31) | `^16.8.6 \|\| ^17 \|\| ^18.2 \|\| ^19` | 약 20만 |
| `@atlaskit/button` | 25.7.1 | 2026-11-06 | 2017-01-29 | `^18.2.0 \|\| ^19.0.0` | - |
| `@seed-design/react` | 3.2.0 | 2026-11-05 | 2025-02-10 (0.0.1: 2025-02-24) | `>=18.0.0` | 약 4.6만 |

- `@base-ui-components/react`는 npm에서 deprecated 상태다. 메시지는 "Package was renamed to @base-ui/react"이고, 1.0.0에서 이름이 바뀌었다([Base UI v1.0.0 릴리스 노트](https://base-ui.com/react/overview/releases/v1-0-0), 2025-12-11).
- 다운로드 수는 다른 라이브러리가 의존성으로 끌어온 수까지 포함한다. 채택도를 대략 보는 지표로만 쓴다.
- 조사한 패키지는 모두 peer 범위에 React 19가 들어 있다.

## 2. 시스템별 초기 Component 구성

### shadcn/ui

- **출시 시점 (2023-01)**: shadcn/ui는 2023년 1월 Radix 기반으로 출시됐다([changelog: Base UI as the Default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)). 2023-01-29 커밋([`7b121b1`](https://github.com/shadcn-ui/ui/tree/7b121b10abf2f67daf716f32cd6a8266ce3151ed/apps/www/components/ui)) 기준 `components/ui`에는 26개가 있었다.
  - Accordion, Alert Dialog, Aspect Ratio, Avatar, Button, Checkbox, Collapsible, Context Menu, Dialog, Dropdown Menu, Hover Card, Input, Label, Menubar, Navigation Menu, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Slider, Switch, Tabs, Textarea, Tooltip
  - Radix Primitive를 하나씩 감싼 것이 대부분이다. Button, Input, Textarea처럼 Radix에 없는 것만 순수 HTML이다. Badge, Card, Toast, Table, Skeleton은 아직 없었다.
- **현재**: [Components 페이지](https://ui.shadcn.com/docs/components)에 60개가 넘는 항목이 있다. Badge, Card, Table, Skeleton, Spinner, Toast, Combobox, Field, Sidebar, Chart, Calendar, Date Picker, 채팅 UI용 Bubble, Message 등이 추가됐다.
- **주요 변화** (모두 [changelog](https://ui.shadcn.com/docs/changelog) 출처):
  - 2024-10: React 19 호환([링크](https://ui.shadcn.com/docs/changelog/2024-10-react-19)).
  - 2025-02: Tailwind v4와 React 19로 전면 갱신했다. `forwardRef`를 제거하고, 모든 primitive에 `data-slot` 속성을 붙였다. toast는 sonner로 대체하며 deprecated했다([링크](https://ui.shadcn.com/docs/changelog/2025-02-tailwind-v4)).
  - 2025-06: `@radix-ui/react-*` 개별 import를 통합 패키지 `radix-ui`로 옮기는 명령을 추가했다([링크](https://ui.shadcn.com/docs/changelog/2025-06-radix-ui)).
  - 2026-07: **새 프로젝트의 기본 base를 Base UI로 바꿨다.** Radix도 계속 지원하며 `-b radix`로 고를 수 있다. 마이그레이션에서 기계적으로 바뀌는 대표 항목은 "`asChild` → `render`"다([링크](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)).
  - 2026-07: React Aria를 세 번째 base로 추가했다(`--base aria`)([링크](https://ui.shadcn.com/docs/changelog/2026-07-react-aria)).
  - 2026-09: `lib/utils.ts`의 `twMerge(clsx(...))` 헬퍼를 `cn` npm 패키지로 대체했다([링크](https://ui.shadcn.com/docs/changelog/2026-09-cn)).

### Radix Themes

- **1.0.0 (2023-08-08, "Initial release")**([Releases](https://www.radix-ui.com/themes/docs/overview/releases)). 해당 시점 커밋([`39f5a43`](https://github.com/radix-ui/themes/tree/39f5a438db0d8496134d4bc35d71899fee1b2562/packages/radix-ui-themes/src/components)) 기준 약 44개다.
  - 레이아웃: Box, Flex, Grid, Container, Section, Inset
  - 타이포그래피: Text, Heading, Blockquote, Code, Em, Kbd, Link, Quote, Strong
  - 컨트롤: Button, IconButton, Checkbox, RadioGroup, Select, Slider, Switch, TextArea, TextField
  - 오버레이: Dialog, AlertDialog, Popover, HoverCard, Tooltip, DropdownMenu, ContextMenu
  - 표시: Avatar, Badge, Callout, Card, Table, Tabs, Separator, ScrollArea, AspectRatio
  - 유틸리티: AccessibleIcon, Portal, Slot, VisuallyHidden, Theme
  - Toast, Accordion, Skeleton, Progress는 없었다. Skeleton, Spinner, Progress, SegmentedControl, Radio Cards 등은 이후 버전에서 추가됐다(현재 문서 사이드바 기준).
- **유지보수**: npm 최신은 3.3.0(2026-01-31)이다. 공식 Releases 페이지는 3.1.3까지만 적혀 있어 3.2와 3.3 내용은 확인하지 못했다. GitHub `main`의 마지막 커밋은 2026-04-11이다. Primitives(2026-10)에 비해 릴리스 주기가 느리다.

### Primer React (GitHub)

- **초기 버전 구성은 확인 불가.** `@primer/react`는 2021-12에 처음 publish됐지만 그 전 패키지명과 그 시점 목록은 이번 조사에서 확인하지 않았다.
- **현재** ([저장소 `packages/react/src/**/*.docs.json`](https://github.com/primer/react/tree/main/packages/react/src), 80개 파일): 컴포넌트마다 lifecycle `status`가 붙어 있다. alpha 56개, beta 6개(ActionList, ActionMenu, PageHeader, Tooltip, TreeView, UnderlineNav), draft 7개, deprecated 11개다. 예를 들어 [Button.docs.json](https://github.com/primer/react/blob/main/packages/react/src/Button/Button.docs.json)도 `status: "alpha"`이고, `a11yReviewed: "2025-01-08"`이 함께 적혀 있다. 공개 사이트에 status가 어떻게 표시되는지는 확인 불가다(SPA라 가져오지 못함).
- **v38 (2025-10-27)**: `sx` prop과 `styled-components`, `styled-system` 의존성을 제거했다([CHANGELOG](https://github.com/primer/react/blob/main/packages/react/CHANGELOG.md), #7027, #7032, #6904 등). 이후 버전에서 "react 19 refs 타입 호환"을 고쳤다(#7246).

### Carbon React (IBM)

- **초기 구성은 확인 불가.** `@carbon/react` 1.0.0은 2022-03-31에 나왔다(npm). 그 전 패키지와의 관계는 이번에 확인하지 않았다.
- **현재** ([`packages/react/src/components`](https://github.com/carbon-design-system/carbon/tree/main/packages/react/src/components)): 디렉터리가 약 150개다. Fluid* 입력 변형, AI 관련(AILabel, AISkeleton, ChatButton), UIShell, DataTable, Tearsheet 등 엔터프라이즈 앱용 구성이 넓다.

### Atlassian Design System

- **초기 구성은 확인 불가.** `@atlaskit/button`은 2017-01에 처음 publish됐다.
- **현재** ([llms-components.txt](https://atlassian.design/llms-components.txt)): 컴포넌트마다 독립 npm 패키지(`@atlaskit/*`)로 배포한다. avatar, badge, banner, breadcrumbs, button, calendar, checkbox, datetime-picker, dropdown-menu, dynamic-table, flag, form, heading, link, lozenge, modal-dialog, popup, primitives, progress-bar, radio, range, section-message, select, skeleton, spinner, tabs, tag, textarea, textfield, toggle, tooltip 등 약 57개다.
- 레이아웃은 `@atlaskit/primitives`(Box, Stack, Inline, Flex 등)가 맡는다([llms.txt](https://atlassian.design/llms.txt)).

### SEED Design (당근)

- **0.0.1 (2025-02-24)**: npm tarball의 `src/components` 기준 약 40개다. ActionButton, ActionChip, ActionSheet, Avatar, Badge, BottomSheet, Box, Callout, Checkbox, ChipTabs, ControlChip, Dialog, Fab, ExtendedFab, HelpBubble, InlineBanner, LinkContent, ProgressCircle, PullToRefresh, ReactionButton, SegmentedControl, SelectBox, Skeleton, Snackbar, Stack/Flex/Inline/Columns, Switch, Tabs, Text, TextField, ToggleButton, VisuallyHidden, MannerTempBadge 등이 있다. 모바일 앱 중심이라 BottomSheet, PullToRefresh, Fab이 처음부터 들어 있었다.
- **버전 흐름**: 1.0.0(2025-09-25), 2.0.0(2026-06-23), 3.0.0(2026-10-01). 업그레이드 가이드는 AI 마이그레이션 프롬프트를 함께 제공한다([v3 가이드](https://seed-design.io/llms/react/updates/upgrade/v3.txt)).
- **현재** ([React llms.txt](https://seed-design.io/react/llms.txt)): Menu, Popover, Select, Slider, Date Picker, Time Picker, Pagination 등이 추가됐다.
- 동작 레이어는 자체 headless 패키지 `@seed-design/react-*`(dialog, tabs, checkbox 등 약 40개)를 쓴다. `asChild`는 `@radix-ui/react-slot`을 쓴다(`npm view @seed-design/react dependencies`).

### Component 목록 비교표

○ = 있음, × = 없음, △ = 비슷한 것이 다른 이름으로 있음. "초기" 열은 위에서 확인한 시점 기준이다. Primer, Carbon, Atlassian은 초기 목록을 확인하지 못해 현재 기준이다.

| 범주 | Component | shadcn 초기 (2023-01) | shadcn 현재 | Radix Themes 1.0 | Primer (현재) | Carbon (현재) | Atlassian (현재) | SEED 0.0.1 | SEED 현재 |
|---|---|---|---|---|---|---|---|---|---|
| 액션 | Button | ○ | ○ | ○ | ○ | ○ | ○ | ○ ActionButton | ○ ActionButton |
| | IconButton | × (size=icon은 이후) | △ size=`icon` | ○ | ○ | ○ | ○ IconButton | △ layout=iconOnly | △ layout=iconOnly |
| | Link | × | × | ○ | ○ | ○ | ○ | △ LinkContent | × |
| 입력 | Input/TextField | ○ | ○ | ○ | ○ TextInput | ○ | ○ textfield | ○ | ○ |
| | Textarea | ○ | ○ | ○ | ○ | ○ | ○ | △ TextField | ○ |
| | Checkbox | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| | Radio | ○ | ○ | ○ | ○ | ○ | ○ | × | ○ |
| | Switch | ○ | ○ | ○ | ○ ToggleSwitch | ○ Toggle | ○ toggle | ○ | ○ |
| | Select | ○ | ○ | ○ | ○ | ○ (+Dropdown) | ○ | △ SelectBox | ○ |
| | Combobox/Autocomplete | × | ○ | × | ○ Autocomplete | ○ ComboBox | 확인 불가 | × | × |
| | Slider | ○ | ○ | ○ | × | ○ | ○ range | × | ○ |
| | Label/Field | ○ Label | ○ Field | × | ○ FormControl | ○ FormLabel 등 | ○ form | × | △ Field 계열 |
| 오버레이 | Dialog/Modal | ○ | ○ | ○ | ○ | ○ Modal | ○ modal-dialog | ○ | ○ |
| | AlertDialog | ○ | ○ | ○ | ○ ConfirmationDialog | × (Modal의 danger) | 확인 불가 | △ Dialog | ○ |
| | Popover | ○ | ○ | ○ | ○ | ○ | ○ popup | × | ○ |
| | Tooltip | ○ | ○ | ○ | ○ | ○ | ○ | △ HelpBubble | ○ |
| | Menu/Dropdown | ○ | ○ | ○ | ○ ActionMenu | ○ Menu/OverflowMenu | ○ dropdown-menu | △ ActionSheet | ○ |
| | BottomSheet/Drawer | × | ○ Drawer/Sheet | × | × | △ SidePanel | 확인 불가 | ○ | ○ |
| 내비게이션 | Tabs | ○ | ○ | ○ | △ UnderlineNav 등 | ○ | ○ | ○ | ○ |
| | Accordion | ○ | ○ | × | × | ○ | × | × | ○ |
| | Breadcrumb | × | ○ | × | ○ | ○ | ○ | × | × |
| | Pagination | × | ○ | × | ○ | ○ | ○ | × | ○ |
| 피드백 | Toast/Snackbar | × | ○ (sonner 기반) | × | × | ○ Notification | ○ flag | ○ Snackbar | ○ Snackbar |
| | Alert/Callout/Banner | × | ○ Alert | ○ Callout | ○ Banner | ○ Notification | ○ section-message | ○ Callout/InlineBanner | ○ |
| | Spinner/Loading | × | ○ | × | ○ | ○ Loading | ○ | △ ProgressCircle | ○ ProgressCircle |
| | Progress | ○ | ○ | × | ○ ProgressBar | ○ ProgressBar | ○ progress-bar | ○ ProgressCircle | ○ |
| | Skeleton | × | ○ | × | ○ | ○ | ○ | ○ | ○ |
| 표시 | Avatar | ○ | ○ | ○ | ○ | ○ UserAvatar | ○ | ○ | ○ |
| | Badge/Tag | × | ○ | ○ | ○ Label/CounterLabel | ○ Tag | ○ badge/lozenge/tag | ○ | ○ |
| | Card | × | ○ | ○ | × (draft) | ○ Tile/Card | × | × | × |
| | Table | × | ○ | ○ | ○ DataTable | ○ DataTable | ○ dynamic-table | × | × |
| | Separator/Divider | ○ | ○ | ○ | × | × | × | × | ○ Divider |
| 레이아웃·글자 | Box/Stack/Flex | × | × | ○ | ○ Stack/PageLayout | ○ Stack/Grid | ○ primitives | ○ | ○ |
| | Text/Heading | × | △ Typography | ○ | ○ | ○ | ○ heading | ○ Text | ○ Text |

출처: 위 각 시스템 절의 링크. "×"는 확인한 목록에 그 이름이나 비슷한 이름이 없다는 뜻이다.

## 3. 공통 API 관례

### 3.1 Button으로 본 variant와 size 이름

| 시스템 | 스타일 축 prop 이름과 값 | 크기 prop 이름과 값(기본값) | 출처 |
|---|---|---|---|
| shadcn 초기 | `variant`: default, destructive, outline, subtle, ghost, link | `size`: default, sm, lg | [2023-01 button.tsx](https://github.com/shadcn-ui/ui/blob/7b121b10abf2f67daf716f32cd6a8266ce3151ed/apps/www/components/ui/button.tsx) |
| shadcn 현재 (Radix base) | `variant`: default, destructive, outline, secondary, ghost, link | `size`: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg | [new-york-v4 button.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/button.tsx) |
| Radix Themes | `variant`: classic, solid, soft, surface, outline, ghost-offset, ghost (기본 solid) + `color`, `highContrast`, `radius` | `size`: "1"~"4" (기본 "2", 반응형 객체 가능) | [base-button.props.ts](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/_internal/base-button.props.ts), [Button 문서](https://www.radix-ui.com/themes/docs/components/button) |
| Primer | `variant`: default, primary, danger, invisible, link (기본 default) | `size`: small, medium, large (기본 medium) | [Button.docs.json](https://github.com/primer/react/blob/main/packages/react/src/Button/Button.docs.json) |
| Carbon | `kind`: primary, secondary, tertiary, ghost, danger, danger--primary, danger--ghost, danger--tertiary (기본 primary) | `size`: xs, sm, md, lg, xl, 2xl | [Button.tsx](https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/components/Button/Button.tsx) |
| Atlassian | `appearance`: default, primary, subtle, warning, danger, discovery, rovo | `spacing`: compact, default (size가 아닌 padding 축) | `@atlaskit/button` 25.7.1 `dist/types`, [llms-components.txt](https://atlassian.design/llms-components.txt) |
| SEED | `variant`: brandSolid, neutralSolid, neutralWeak, criticalSolid, brandOutline, neutralOutline, ghost (기본 brandSolid) + `layout`: withText, iconOnly | `size`: xsmall, small, medium, large (기본 medium) | [action-button.d.ts](https://github.com/daangn/seed-design/blob/dev/packages/css/recipes/action-button.d.ts) |

관찰한 내용:

- 스타일 축 이름은 `variant`가 가장 흔하다(shadcn, Radix Themes, Primer, SEED). Carbon은 `kind`, Atlassian은 `appearance`를 쓴다.
- 값 이름은 두 갈래다.
  - **강조도만 담는 이름**: primary, secondary, ghost. Primer와 Carbon이 여기에 속하고, 위험 동작은 danger 값을 따로 둔다.
  - **색 의도와 채움 방식을 함께 담는 이름**: SEED의 `brandSolid`, `neutralWeak`. Radix Themes는 이를 `variant`(채움 방식)와 `color`(색) 두 prop으로 나눴다.
- 크기 값 표기는 제각각이다. sm/md/lg 약어(shadcn, Carbon), small/medium/large 전체 단어(Primer, SEED), 숫자 단계 "1"~"4"(Radix Themes)가 있다. 아이콘 전용 버튼은 `size="icon"`(shadcn), 별도 IconButton(Radix Themes, Primer, Carbon, Atlassian), `layout="iconOnly"`(SEED)처럼 처리 방식이 갈린다.
- 로딩 상태는 Radix Themes(`loading`), Primer(`loading`, `loadingAnnouncement`), Atlassian(`isLoading`), SEED(`loading`)가 prop으로 제공한다. SEED 문서는 "loading은 disabled를 포함하지 않는다"고 따로 적는다([ActionButton 문서](https://seed-design.io/llms/react/components/action-button.txt)).
- boolean prop 이름에 `is` 접두를 붙이는 쪽은 Atlassian(`isDisabled`, `isLoading`, `isSelected`)과 React Aria(`isDisabled`)다. 나머지는 HTML 속성 이름(`disabled`)을 그대로 쓴다.

### 3.2 `className` 병합

| 시스템 | 방식 | 출처 |
|---|---|---|
| shadcn | `cn(buttonVariants({ variant, size, className }))`. cva 결과와 사용자 `className`을 tailwind-merge로 합쳐 충돌하는 Tailwind 클래스는 뒤의 것이 이긴다. 2026-09부터 `cn`은 `twMerge(clsx(...))`를 대신하는 npm 패키지다. | [button.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/button.tsx), [changelog cn](https://ui.shadcn.com/docs/changelog/2026-09-cn) |
| Carbon | `classnames(className, { 'cds--btn': true, ... })`. 이어 붙이기만 하고 충돌은 해소하지 않는다. 접두사는 `usePrefix()`로 바꿀 수 있다. | [ButtonBase.tsx](https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/components/Button/ButtonBase.tsx) |
| Atlassian | 새 Button 타입이 `className`과 `style`을 **Omit**한다. 대신 primitives에 `xcss`(cssMap)를 쓴다. | `@atlaskit/button` 25.7.1 `dist/types/new-button/variants/types.d.ts`, [llms-components.txt](https://atlassian.design/llms-components.txt) |
| Primer | v38에서 `sx`를 제거하고 styled-components 의존성을 뺐다. 이후 스타일 확장은 `className` 중심이다(병합 방식 세부는 확인 불가). | [CHANGELOG 38.0.0](https://github.com/primer/react/blob/main/packages/react/CHANGELOG.md) |
| Base UI | `className`에 문자열 또는 `(state) => string` 함수를 받는다. `render` 요소와 병합할 때 class 이름은 합쳐지고, render 요소 쪽이 앞에 온다. | context7 `/mui/base-ui/v1.9.0` (handbook/styling, checkbox types), [Composition](https://base-ui.com/react/handbook/composition) |
| React Aria | `className`과 `style`에 상태를 받는 함수를 넣을 수 있다. 기본 클래스(`react-aria-Tabs` 등)가 있고 `defaultClassName`으로 접근한다. 상태는 `data-*` 속성으로 노출해 Tailwind `data-[selected]:` 같은 변형으로 쓴다. Tailwind v4용 플러그인 `tailwindcss-react-aria-components` 2.x가 있다. | [Styling](https://react-spectrum.adobe.com/react-aria/styling.html) |

### 3.3 ref 전달

- React 19부터 함수 컴포넌트가 `ref`를 일반 prop으로 받을 수 있다. 그래서 shadcn은 2025-02 갱신에서 `forwardRef`를 모두 걷어냈다([changelog](https://ui.shadcn.com/docs/changelog/2025-02-tailwind-v4)). 현재 Button은 `React.ComponentProps<"button">`을 그대로 펼친다.
- Carbon은 여전히 `React.forwardRef`를 쓴다([Button.tsx](https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/components/Button/Button.tsx)). Primer Button 문서는 `ref`를 prop 목록에 적어 둔다([Button.docs.json](https://github.com/primer/react/blob/main/packages/react/src/Button/Button.docs.json)).
- headless 라이브러리는 모두 **조합 대상 컴포넌트가 ref를 받고 props를 DOM에 펼쳐야 한다**고 요구한다.
  - Radix: "Your component must spread props", "must forward ref"([Composition](https://www.radix-ui.com/primitives/docs/guides/composition)).
  - Base UI: "must forward the `ref`, and spread all the received props"([Composition](https://base-ui.com/react/handbook/composition)).
  - SEED도 같은 원칙을 적어 두었다([Composition](https://seed-design.io/llms/react/components/concepts/composition.txt)).
- Radix는 React 19 관련 버그 수정이 이어졌다. 예: Slot의 ref callback 무한 리렌더, React 19.2 focus 문제([Releases 2026-06-06, 2026-06-30](https://www.radix-ui.com/primitives/docs/overview/releases)).

### 3.4 `asChild`와 polymorphic 패턴

| 방식 | 쓰는 곳 | 형태 |
|---|---|---|
| `asChild` (Slot) | Radix Primitives, Radix Themes, shadcn(Radix base), Ark UI, SEED | `<Tooltip.Trigger asChild><a href="…" /></Tooltip.Trigger>`. 기본 요소를 렌더하지 않고 자식을 복제해 props와 동작을 합친다. |
| `render` prop | Base UI, shadcn(Base UI base), React Aria(일부) | Base UI: `<Menu.Trigger render={<MyButton />} />`, 또는 `(props, state) => …` 함수. React Aria: `<Link render={props => <NextLink {...props} />}>`처럼 라우터 링크 연동용이다. |
| `as` prop (polymorphic) | Primer(`as: React.ElementType`, 기본 'button'), Carbon(`PolymorphicComponentPropWithRef`) | 렌더할 요소 타입을 직접 넘긴다. |
| 별도 컴포넌트 | Atlassian(Button, LinkButton, IconButton 분리) | 요소별로 컴포넌트를 나눈다. |

출처: [Radix Composition](https://www.radix-ui.com/primitives/docs/guides/composition), [Ark Composition](https://ark-ui.com/docs/guides/composition), [Base UI Composition](https://base-ui.com/react/handbook/composition), context7 `/websites/react-aria_adobe`(Link, ListBox, Tabs의 `render`), [Primer Button.docs.json](https://github.com/primer/react/blob/main/packages/react/src/Button/Button.docs.json), [Carbon Button.tsx](https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/components/Button/Button.tsx), [llms-components.txt](https://atlassian.design/llms-components.txt).

- shadcn은 Base UI로 기본값을 바꾸면서 마이그레이션 항목에 "`asChild` is now `render`"를 넣었다. 같은 Component가 base에 따라 조합 API가 달라진다는 뜻이다([changelog](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)).
- Ark UI는 `ark.span asChild` 같은 factory로 자체 요소를 만들 수 있다([Ark Composition](https://ark-ui.com/docs/guides/composition)).
- SEED는 `asChild`가 바깥 요소만 바꾼다는 한계를 문서화했다. 일부 컴포넌트는 children을 내부 구조로 감싼다([Composition](https://seed-design.io/llms/react/components/concepts/composition.txt)).

### 3.5 controlled / uncontrolled 이름

| 라이브러리 | 열림 상태 | 값 상태 | 콜백 인자 |
|---|---|---|---|
| Radix Primitives | `open` / `defaultOpen` / `onOpenChange` | `value` / `defaultValue` / `onValueChange` | 값 그대로 |
| Base UI 1.9.0 | `open` / `defaultOpen` / `onOpenChange` | `value` / `defaultValue` / `onValueChange(value, eventDetails)` | 값과 eventDetails |
| Ark UI 5.x | `open` / `defaultOpen` / `onOpenChange(details)` | 같은 패턴 | 객체(`e.open`) |
| React Aria Components | 확인 불가 (이번 조회 결과에 Modal과 DialogTrigger의 열림 prop이 없음) | 선택 상태는 `selectedKey` / `defaultSelectedKey` / `onSelectionChange` | 값(Key) |

출처: context7 `/websites/radix-ui_primitives`(Tabs.Root, Dialog.Root), `/mui/base-ui/v1.9.0`(Field.Control), `/llmstxt/ark-ui_llms_txt`(Dialog.Root, Controlled Dialog), `/websites/react-aria_adobe`(Tabs, selection).

- 네 라이브러리 모두 `value`(제어)와 `default*`(비제어)를 짝으로 두는 React 관례를 따른다. 차이는 이름(`value` 대 `selectedKey`)과 콜백 인자 모양(값, 값과 이벤트 정보, details 객체)에 있다.
- Radix와 SEED는 내부에서 `@radix-ui/react-use-controllable-state`를 쓴다(SEED dependencies에 포함됨).

## 4. headless 라이브러리 비교

| 항목 | Radix Primitives | React Aria Components | Base UI | Ark UI |
|---|---|---|---|---|
| 만든 곳 | Radix(WorkOS) | Adobe (React Spectrum) | MUI. 문서 표현으로는 "Radix, Floating UI, Material UI를 만든 팀" | Chakra UI 팀 |
| 최신 버전 / 날짜 | `radix-ui` 1.8.1 / 2026-10-12 | 1.22.1 / 2026-10-09 | 1.9.0 / 2026-10-09 | 5.40.0 / 2026-10-29 |
| 안정 버전 시점 | 개별 패키지 1.0: 2022-07(`@radix-ui/react-dialog`) | 1.0.0: 2023-12-20 | 1.0.0: 2025-12-11 | 1.0.0: 2023-11-09, 5.0.0: 2025-03-06 |
| 릴리스 주기 | 2025-08-13 다음 릴리스가 2026-06-06이었다(약 10개월 공백, 공식 Releases 기준). 그 뒤 6~7월에 연속 릴리스. | 대략 월 1회 minor(2026-02~10 매달) | 2025-12 1.0 이후 1.9까지 minor가 잦음 | minor가 잦음(5.x 40번째 minor) |
| React 19 | 2024-06 "Full React 19 compatibility". 이후 19.2 관련 수정 계속 | peer `^19.0.0-rc.1` 포함 | peer `^19` | peer `>=18`. Dialog `hideMode: 'activity'`는 React 19 `<Activity>` 필요 |
| 조합 API | `asChild` (Slot) | `render` prop(링크와 라우터 연동), children 함수 | `render` prop (요소 또는 함수) | `asChild`, `ark` factory |
| 스타일 훅 | `data-state` 등 data 속성 | `className`/`style` 함수, data 속성, 기본 className, Tailwind 플러그인 | `className`/`style` 함수, data 속성(`data-checked` 등) | data 속성 (세부 확인 불가) |
| 컴포넌트 범위 | 약 30개. Accordion부터 Tooltip까지 일반 위젯, OTP Field, Password Toggle Field. Combobox와 DatePicker는 없음 | 가장 넓음. DatePicker, Calendar, ComboBox, Table, Tree, ColorPicker, DnD, Toast, NavigationTree, Sheet와 날짜·숫자 국제화 | 약 37개. Combobox, Autocomplete, Number Field, OTP Field, Drawer, Toast, Meter. DatePicker는 목록에 없음 | 약 50개. DatePicker, ColorPicker, FileUpload, TagsInput, Tour, Splitter 등 |
| 추가 특징 | 통합 패키지 `radix-ui`(2025-01)와 서브패스 import `radix-ui/accordion`(2026-07) | 훅(`react-aria`)과 컴포넌트 두 층. 테스트 유틸 문서 제공 | shadcn 새 프로젝트 기본값(2026-07) | Zag.js 상태 머신 기반(`@zag-js/*` 의존성 68개). React, Vue, Svelte, Solid 공통 |
| 주간 다운로드 | 약 2,678만(`radix-ui`) | 약 898만 | 약 2,836만 | 약 141만 |

출처:
- Radix: [Releases](https://www.radix-ui.com/primitives/docs/overview/releases), [Composition](https://www.radix-ui.com/primitives/docs/guides/composition), [저장소 packages/react](https://github.com/radix-ui/primitives/tree/main/packages/react)
- React Aria: [Releases](https://react-spectrum.adobe.com/react-aria/releases/index.html), [Styling](https://react-spectrum.adobe.com/react-aria/styling.html), [llms.txt](https://react-aria.adobe.com/llms.txt)
- Base UI: [Releases](https://base-ui.com/react/overview/releases), [llms.txt](https://base-ui.com/llms.txt), [Composition](https://base-ui.com/react/handbook/composition)
- Ark UI: [Composition](https://ark-ui.com/docs/guides/composition), [llms.txt](https://ark-ui.com/llms.txt), context7 `/llmstxt/ark-ui_llms_txt`
- shadcn 기본값: [changelog](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)
- 다운로드와 버전: npm

### 장단점 정리 (위 사실에서 도출)

- **Radix Primitives**
  - 장점: 가장 오래 쓰였고 의존 생태계가 크다(`@radix-ui/react-dialog` 단독 주간 9천만 이상). `asChild`는 SEED와 Radix Themes도 따르는 사실상 표준 패턴이다.
  - 단점: 2025-08부터 2026-06까지 릴리스 공백이 있었다. React 19 관련 ref와 focus 버그를 2026년에도 고치고 있다. Combobox와 DatePicker가 없다.
- **React Aria Components**
  - 장점: 다루는 범위(날짜, 테이블, 국제화, DnD)와 접근성 근거 문서가 가장 넓다. `className` 함수와 Tailwind 플러그인이 있어 Tailwind와 잘 맞는다. 릴리스 주기가 규칙적이다.
  - 단점: prop 이름 체계가 HTML이나 다른 라이브러리와 다르다(`isDisabled`, `onPress`, `selectedKey`). 이를 감싼 Component의 공개 API에 이 이름을 드러낼지 따로 정해야 한다.
- **Base UI**
  - 장점: 1.0 이후 업데이트가 활발하고, shadcn이 기본값으로 채택했다. `render` 함수로 상태에 따라 렌더를 바꾸기 쉽다. `className` 함수와 data 속성이 Tailwind와 맞는다.
  - 단점: 안정 버전이 나온 지 1년이 안 됐다(2025-12). 패키지 이름이 한 번 바뀌었다. `asChild`에서 `render`로 옮기면 조합 API가 바뀐다.
- **Ark UI**
  - 장점: 컴포넌트 수가 많다(ColorPicker, FileUpload, Tour 등). 상태 머신 기반이라 여러 프레임워크가 같은 동작을 공유한다.
  - 단점: Tide v0은 React 전용이라(ADR 0001) 다중 프레임워크 장점이 당장 쓰이지 않는다. Zag.js 의존성이 많고, 네 라이브러리 중 다운로드가 가장 적다.

## 5. Tide에 주는 시사점

결정은 하지 않는다. 공통 API 규칙 티켓과 Component 목록 티켓에서 다룰 선택지와 근거만 정리한다.

1. **v0 목록의 크기**: 출시 시점의 shadcn은 26개, Radix Themes 1.0은 약 44개(레이아웃과 타이포 포함), SEED 0.0.1은 약 40개였다. 세 시스템 모두 Button, Input/TextField, Checkbox, Switch, Dialog, Tabs, Avatar를 처음부터 넣었다. Toast, Table, Skeleton은 처음에 빠진 경우가 많았다(shadcn, Radix Themes). "초기에는 headless 라이브러리가 제공하는 위젯을 감싸는 것부터 시작한다"는 패턴이 보인다.
2. **variant 이름 체계**: 강조도만 담는 이름(primary/secondary/ghost)과 색 의도·채움 방식을 함께 담는 이름(SEED `brandSolid`, Radix Themes의 `variant`+`color`)이 갈린다. Tide의 Semantic Token 이름(`bg-primary` 등)과 어떻게 대응시킬지가 판단 기준이 될 수 있다.
3. **size 값 표기**: `sm`/`md`/`lg`, `small`/`medium`/`large`, 숫자 단계 중 하나를 고른다. Tailwind 문화와 가까운 쪽은 shadcn과 Carbon이 쓰는 약어다.
4. **className 병합**: Tailwind 기반이고(ADR 0002) 사용자가 `className`에 Utility class를 직접 쓰는 것이 목표다. 그러면 shadcn처럼 tailwind-merge 계열(`cn` 패키지 또는 `twMerge(clsx())`)로 충돌을 해소할지, Carbon처럼 이어 붙이기만 할지, Atlassian처럼 `className`을 막을지가 갈림길이다. 앞의 둘은 ADR 0002의 목표와 맞고, Atlassian 방식은 맞지 않는다.
5. **ref**: React 19를 최소 지원 버전으로 하면 shadcn처럼 `forwardRef` 없이 `ref`를 prop으로 받을 수 있다. React 18을 지원하려면 `forwardRef`가 필요하다. 지원 범위가 먼저 정해져야 한다.
6. **조합 패턴**: 고르는 headless 라이브러리에 따라 기본 조합 API가 정해진다. Radix와 Ark는 `asChild`, Base UI는 `render`, React Aria는 `render`와 함수 children을 쓴다. Tide가 공개 API를 라이브러리와 독립적으로 정할지(예: 감싸서 `asChild`로 통일), 라이브러리 것을 그대로 노출할지도 정해야 한다. shadcn은 base별로 API가 달라지는 길을 택했다.
7. **controlled/uncontrolled**: 네 라이브러리 모두 `value`/`default*`/`on*Change` 짝을 쓰지만 콜백 인자 모양이 다르다. Tide 공개 API에서 콜백 인자를 통일할지 정해야 한다.
8. **headless 후보**: 유지보수 활발도와 Tailwind 친화도만 보면 Base UI와 React Aria가 앞선다. 다만 Base UI는 안정화 1년 미만이다. 생태계 크기와 레퍼런스 일관성(SEED와 Radix Themes가 Slot과 `asChild`를 씀)은 Radix가 앞선다. 다루는 범위가 넓어야 하면(DatePicker 등) React Aria와 Ark가 유리하다. Ark의 다중 프레임워크 장점은 ADR 0001 범위에서는 쓰이지 않는다.

## 확인 불가 항목

- Primer, Carbon, Atlassian의 초기 버전 Component 목록
- Radix Themes 3.2, 3.3 릴리스 내용(공식 Releases 페이지에 없음)
- primer.style 사이트에 표시되는 lifecycle status(SPA라 가져오지 못함)
- Ark UI의 data 속성 체계 세부, React Aria Modal과 DialogTrigger의 열림 상태 prop 이름(이번 조회 결과에 없음)
- Atlassian의 Combobox, AlertDialog, Drawer 해당 컴포넌트 유무
