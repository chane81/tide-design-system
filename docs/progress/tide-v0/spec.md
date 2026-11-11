# Tide v0 spec

Status: ready-for-agent

근거: [Tide v0 지도](map.md)와 그 티켓 30개, ADR 0001~0008, [원칙](../../principles/README.md), [접근성 기준](../../standards/accessibility.md), [GLOSSARY](../../../GLOSSARY.md). 결정의 상세와 근거는 각 티켓의 `## Answer`에 있고, 이 문서는 그것을 구현할 수 있는 형태로 모은 것이다. 이 문서와 티켓이 어긋나면 티켓의 정정 절이 우선한다.

## Problem Statement

Next.js(App Router)로 웹 앱을 만드는 개발자는 한글 UI에 맞고, 접근성이 기본으로 보장되고, Tailwind로 바로 확장할 수 있는 디자인 시스템을 찾기 어렵다. 해외 디자인 시스템은 한글 타이포그래피(줄바꿈, 폰트 스택, 행간)를 고려하지 않는다. headless 라이브러리는 스타일을 처음부터 만들어야 한다. 스타일이 입혀진 라이브러리는 Tailwind 기본 팔레트와 섞여 색이 일관되지 않고, `className`으로 덮어쓸 때 충돌이 생긴다. light/dark Theme, 대비 기준, 키보드 동작은 앱마다 다시 확인해야 한다.

메인테이너(1인) 입장에서는 이 모든 것을 한 번에 만들 수 없다. 그래서 무엇을 어떤 순서로 만들고, 어떤 규칙으로 검증하고, 어떻게 배포할지가 정해져 있어야 에이전트에게 맡길 수 있다.

## Solution

`#3183f5`(blue)를 primary로 하는 범용 디자인 시스템 Tide v0를 npm `@tide-tds` scope로 공개 배포한다.

- 앱 개발자는 `@tide-tds/components`를 설치하고, 앱 CSS에 Tailwind와 Tide CSS를 import하는 두 줄만 쓴다. 그러면 Tide Token에 연결된 Utility class(`bg-primary-solid`, `text-body-md`, `rounded-md`, `z-modal` 등)와 Component 33개를 쓸 수 있다.
- 색은 Primitive와 Semantic 두 층의 Token으로 나뉜다. Component는 Semantic Token만 쓴다. `[data-theme]` 속성 하나로 light와 dark를 바꾼다.
- 모든 Component는 WCAG 2.2 AA를 최소 기준으로 삼는다. 접근성 동작은 React Aria hooks로 가져오고, 마크업과 스타일은 Tide가 직접 만든다.
- 아이콘은 `@tide-tds/icons`로 함께 배포한다. 사용자는 Tide 이름으로만 쓴다.
- 문서는 Storybook 하나로 만들어 릴리스마다 `tide-tds.lakegreen.net`에 배포한다.
- 원칙 4개(① 접근성 > 미려함, ② 명확함 > 화려함, ③ 단순함 > 유연함, ④ 발견할 수 있음 > 외워야 함)가 모든 판단의 우선순위다.

## User Stories

### 설치와 시작

1. 앱 개발자로서, `@tide-tds/components` 하나만 설치하면 foundation과 icons가 함께 설치되기를 원한다. 그래야 패키지 버전 조합을 따지지 않아도 된다.
2. 앱 개발자로서, 앱 CSS에 `@import "tailwindcss"`와 Tide CSS import 두 줄만 쓰면 Tide Utility class와 Component 스타일이 동작하기를 원한다. 그래야 설정 파일을 따로 만지지 않아도 된다.
3. Next.js App Router 개발자로서, `transpilePackages` 설정 없이 Tide를 import하기를 원한다. 그래야 기본 Next 설정 그대로 쓸 수 있다.
4. Next.js App Router 개발자로서, 서버 컴포넌트에서 표시용 Component(Badge, Card 등)를 그대로 쓰고, 상호작용 Component는 `"use client"` 경계가 이미 처리되어 있기를 원한다. 그래야 경계 오류를 직접 고치지 않아도 된다.
5. TypeScript 사용자로서, `moduleResolution: nodenext`에서도 Tide 타입이 해석되기를 원한다. 그래야 최신 TS 설정을 그대로 쓸 수 있다.
6. 앱 개발자로서, VS Code Tailwind IntelliSense에서 Tide class(`bg-primary-solid`, `text-body-md`)가 자동완성되기를 원한다. 그래야 Token 이름을 외우지 않아도 된다(④).
7. 앱 개발자로서, 자동완성에 Tailwind 기본 팔레트(`bg-blue-500`의 Tailwind 값, `text-xl`, `font-serif`)가 섞여 나오지 않기를 원한다. 그래야 Tide 밖의 값을 실수로 쓰지 않는다.
8. 앱 개발자로서, 문서의 「설치」 페이지에서 Next.js App Router 기준 설치 절차를 그대로 따라 하기를 원한다.
9. 앱 개발자로서, 세 패키지를 같은 버전으로 설치하라는 안내를 받기를 원한다. 그래야 foundation이 두 벌 설치되는 일을 피한다.

### 폰트와 타이포그래피

10. 앱 개발자로서, Tide가 Pretendard Variable을 우선하는 font-family 스택을 제공하기를 원한다. 웹폰트는 내가 로드한다(`next/font/local` 또는 CDN 동적 subset). 그래야 패키지가 무거워지지 않는다.
11. 앱 개발자로서, 문서의 「폰트 로드」 페이지에서 `next/font/local`과 CDN 예시를 보기를 원한다.
12. 앱 개발자로서, 텍스트 스타일 14개(`display-lg`/`md`, `heading-xl`~`xs`, `body-lg`/`md`/`sm`, `label-lg`/`md`/`sm`, `caption`)를 `text-<이름>` class 하나로 쓰기를 원한다. 크기, 행간, 굵기가 한 번에 정해진다.
13. 앱 개발자로서, `Typography` Component에 `variant="heading-lg"`를 주면 알맞은 기본 요소(`h2`)로 렌더되기를 원한다. 그래야 시맨틱 요소를 따로 고르지 않아도 된다.
14. 앱 개발자로서, "h2처럼 보이는 h3"가 필요할 때 `level`로 heading 수준만 바꾸기를 원한다. 그래야 문서 구조와 시각을 따로 맞출 수 있다.
15. 앱 개발자로서, Typography를 `label`이나 `span`으로 렌더해야 할 때 `render`로 요소를 바꾸기를 원한다.
16. 스크린리더 사용자로서, heading처럼 보이는 텍스트는 실제 heading 요소이기를 원한다. 그래야 제목으로 탐색할 수 있다(①).
17. 한글 사용자로서, 문단이 어절 단위로 줄바꿈되고, 긴 URL과 영문은 영역 밖으로 넘치지 않기를 원한다.
18. 저시력 사용자로서, 브라우저 글자 크기를 키우면 Tide 텍스트도 커지기를 원한다(rem 단위, WCAG 1.4.4).
19. 앱 개발자로서, 굵기 class가 Tide 5단계(300~700)만 자동완성되기를 원한다.
20. 앱 개발자로서, 숫자를 세로로 맞춰야 할 때 Tailwind `tabular-nums`를 그대로 쓰기를 원한다.

### 색과 Theme

21. 앱 개발자로서, 역할(Role) 6개(`neutral`, `primary`, `success`, `warning`, `danger`, `info`)와 강도(`solid`, `subtle`)로 배경, 글자, 테두리 색을 고르기를 원한다. 그래야 색의 의미가 일관된다(②).
22. 앱 개발자로서, hover와 active 색도 Token(`hover:bg-primary-solid-hover`)으로 쓰기를 원한다. 그래야 상태 색도 대비가 보장된다.
23. 앱 개발자로서, 의미 없는 조합(`text-bg-primary` 같은 것)이 class로 생기지 않기를 원한다.
24. 앱 개발자로서, 브랜드 색이 꼭 필요할 때 Primitive class(`bg-blue-500`)를 쓰되, 그 값이 Tide 스케일이기를 원한다.
25. 앱 개발자로서, `<html data-theme="dark">`처럼 속성 하나로 Theme을 바꾸기를 원한다. ThemeProvider는 필요 없어야 한다.
26. 앱 개발자로서, 페이지의 일부 영역만 다른 Theme으로 두기를 원한다(요소 단위 `data-theme`).
27. 앱 개발자로서, Tailwind `dark:` variant가 `data-theme="dark"`를 따르기를 원한다.
28. 앱 개발자로서, Theme을 바꿀 때 색 transition이 한꺼번에 번지는 현상을 막는 방법을 문서에서 보기를 원한다.
29. 앱 개발자로서, OS 다크 모드를 따를지는 앱이 정하기를 원한다. Tide CSS가 `prefers-color-scheme`으로 자동 전환하지 않아야 한다.
30. Tailwind를 쓰지 않는 사용자로서, `--tide-*` CSS 변수만 담긴 CSS를 import해 Token 값을 쓰기를 원한다.
31. 저시력 사용자로서, 실제로 함께 쓰이는 모든 글자·배경 조합이 4.5:1, UI 경계와 포커스 표시가 3:1 이상이기를 원한다. light와 dark 모두에서다.
32. 색각 이상 사용자로서, 상태(성공, 경고, 오류)가 색만이 아니라 아이콘 모양이나 텍스트로도 구분되기를 원한다(WCAG 1.4.1).
33. 메인테이너로서, Semantic Token을 추가했는데 대비 쌍을 등록하지 않으면 CI가 실패하기를 원한다. 그래야 대비 검사에서 빠지는 Token이 없다.
34. 메인테이너로서, Primitive hex를 손으로 조정해도 대비 검사가 다시 보장해 주기를 원한다.

### 모양, 깊이, 움직임, 쌓임

35. 앱 개발자로서, radius가 `sm`/`md`/`lg`/`xl`/`full` 5단계로만 자동완성되기를 원한다.
36. 앱 개발자로서, 그림자가 `shadow-sm`/`md`/`lg` 3단계이고 Theme에 따라 색이 바뀌기를 원한다. 그래야 Component에 Theme 분기를 두지 않아도 된다.
37. Windows 고대비 모드 사용자로서, popover와 dialog 경계가 그림자 없이도 보이기를 원한다.
38. 키보드 사용자로서, 버튼류에서는 Tab 이동 때 offset이 있는 ring을, 입력창에서는 테두리가 두꺼워지는 field 표시를, 목록 안 항목에서는 배경 강조(highlight)를 보기를 원한다.
39. 앱 개발자로서, 직접 만든 요소에도 `focus-visible:focus-ring`과 `focus:focus-field`로 Tide 포커스 표시를 쓰기를 원한다.
40. 오류 상태 입력창에 포커스한 키보드 사용자로서, 포커스 표시가 두 줄로 겹치지 않고 오류 메시지는 계속 보이기를 원한다.
41. 앱 개발자로서, `duration-fast`(150ms), `duration-normal`(300ms)을 쓰기를 원한다. 시간을 적지 않은 `transition-colors`도 Tide 기본값을 따라야 한다.
42. 자주 메뉴를 여는 사용자로서, Menu, Select 목록, Tooltip이 애니메이션 없이 바로 나타나기를 원한다. 사라질 때만 짧게 흐려진다.
43. 움직임 줄이기를 켠 사용자로서, 이동, 확대, blur 대신 opacity 전환만 보기를 원한다. Skeleton 깜빡임은 멈춰야 한다.
44. 앱 개발자로서, 쌓임 단계(`z-sticky` < `z-modal` < `z-popover` < `z-toast` < `z-tooltip`)를 class로 쓰고, 내 단계를 사이에 끼울 수 있기를 원한다(100 간격).
45. 앱 개발자로서, Dialog 안에서 연 Select 목록이 Dialog 위에 보이기를 원한다.
46. 키보드 사용자로서, sticky 헤더에 포커스된 요소가 완전히 가려지지 않기를 원한다. 그 방법(`scroll-padding-top`)이 문서에 있어야 한다.

### Component 공통 API

47. 앱 개발자로서, 모든 Component가 `ref`를 일반 prop으로 받아 루트 DOM 요소에 연결하기를 원한다(React 19).
48. 앱 개발자로서, Button류에서 `variant`(`solid`/`subtle`/`outline`/`ghost`), `color`(Role: Tide Role 6개와 앱이 더한 Role. [ADR 0016](../../decisions/0016-role-scoped-color-and-app-roles.md)), `size`(`xs`/`sm`/`md`/`lg`)로 스타일을 고르기를 원한다.
49. 앱 개발자로서, Component가 지원하지 않는 값(예: Input의 `xs`)은 타입 오류로 바로 알기를 원한다.
50. 앱 개발자로서, 같은 size의 Button, Input, Select가 한 줄에서 같은 높이(24/32/40/48px)이기를 원한다.
51. 앱 개발자로서, 내가 넘긴 `className`이 Tide class와 충돌하면 내 쪽이 이기기를 원한다(`p-2`가 기본 padding을 이김). 커스텀 이름(`rounded-md`, `text-body-md`, `shadow-lg`, `z-modal`, `duration-fast`)에서도 마찬가지여야 한다.
52. 앱 개발자로서, 같은 병합 규칙을 쓰는 `cn`을 import해 내 Component에도 쓰기를 원한다.
53. 앱 개발자로서, Button을 Next `Link`로 렌더해야 할 때 `render={<Link href="/x" />}`로 바꾸기를 원한다. props, ref, className은 병합되어야 한다.
54. 앱 개발자로서, prop 이름이 DOM 이름(`disabled`, `readOnly`, `required`, `invalid`, `onClick`, `onChange`)이기를 원한다. React Aria 이름(`isDisabled`, `onPress`)은 보이지 않아야 한다.
55. 앱 개발자로서, 제어/비제어 상태를 `value`/`defaultValue`/`onValueChange`, `open`/`defaultOpen`/`onOpenChange`로 일관되게 쓰기를 원한다. 콜백은 값 하나만 받는다.
56. 앱 개발자로서, 선택, 열림, 오류 같은 상태를 `data-[selected]:` 같은 variant로 덮어쓰기를 원한다.
57. 앱 개발자로서, 여러 부분으로 된 Component를 평평한 이름(`DialogTrigger`)으로 import하고, 부분마다 `className`을 주기를 원한다.
58. 앱 개발자로서, 각 Component의 props 타입(`ButtonProps` 등)을 import해 감싼 Component를 만들기를 원한다.
59. 스크린리더 사용자로서, 아이콘만 있는 버튼에 항상 이름이 있기를 원한다. `IconButton`은 `aria-label`이 타입상 필수여야 한다.
60. 포인터 사용자로서, 가장 작은 조작 요소도 24×24px 이상이기를 원한다(WCAG 2.5.8).
61. 사용자로서, 비활성 요소가 색만이 아니라 속성(`disabled`/`aria-disabled`)과 커서로도 비활성임을 알 수 있기를 원한다.
62. 사용자로서, Button을 누르면 살짝 줄어드는 반응을 보기를 원한다. 앱 개발자는 이것을 끌 수 있어야 한다.

### Component 목록 (단계별)

63. 앱 개발자로서, 스크린리더 전용 텍스트를 `VisuallyHidden`으로 넣기를 원한다.
64. 앱 개발자로서, 로딩 표시를 `Spinner`로 넣기를 원한다. 접근 가능한 이름도 붙어 있어야 한다.
65. 앱 개발자로서, `Button`, `IconButton`, `Link`를 Tide 스타일 축으로 쓰기를 원한다.
66. 앱 개발자로서, `Field`로 Input, Textarea, Select, Combobox, Checkbox 그룹에 label, 설명, 오류 메시지를 붙이기를 원한다. `id`, `aria-describedby`, `aria-invalid`는 자동으로 연결되어야 한다.
67. 스크린리더 사용자로서, 모든 입력창에 label이 있고 오류 메시지가 입력창에 연결되어 읽히기를 원한다.
68. 앱 개발자로서, `Input`, `Textarea`, `Checkbox`, `Radio`, `Switch`가 네이티브 HTML 요소라서 form 제출과 브라우저 기본 동작이 그대로 되기를 원한다.
69. 앱 개발자로서, `<input type="date">`를 Input 스타일로 쓰기를 원한다(v0에는 DatePicker가 없다).
70. 앱 개발자로서, `Badge`(상호작용 없는 상태 라벨), `Alert`, `Card`(surface), `Separator`, `Avatar`, `Skeleton`, `Progress`, `Table`(시맨틱 table), `Breadcrumb`, `Pagination`을 쓰기를 원한다.
71. 키보드 사용자로서, `Popover`, `Tooltip`, `Menu`, `Select`, `Combobox`, `Dialog`, `AlertDialog`, `Tabs`, `Accordion`, `Tag`가 WAI-ARIA 패턴대로 동작하기를 원한다. 화살표 탐색, Esc 닫기, 포커스 가두기와 복귀가 포함된다.
72. 앱 개발자로서, `Combobox`에 옵션 목록을 주면 입력값으로 클라이언트에서 필터링되기를 원한다(단일 선택).
73. 앱 개발자로서, 삭제 확인처럼 위험한 동작에 `AlertDialog`를 쓰기를 원한다.
74. 키보드 사용자로서, `Tag` 묶음에서 화살표로 이동하고 Delete 키로 지우기를 원한다.
75. 앱 개발자로서, `Toast`로 알림을 띄우기를 원한다. 영역(region), 큐, 자동 닫힘, 포커스 이동이 처리되어야 한다.
76. 사용자로서, 자동으로 닫히는 Toast가 5초 이상 보이고, hover나 focus 중에는 멈추기를 원한다. 액션이나 오류가 담긴 Toast는 자동으로 닫히지 않아야 한다(WCAG 2.2.1, 2.2.2).

### 아이콘

77. 앱 개발자로서, `@tide-tds/icons`에서 `PlusIcon`처럼 `Icon` 접미사가 붙은 이름으로 import하기를 원한다. 그래야 `Menu`, `Table` Component와 헷갈리지 않는다.
78. 앱 개발자로서, 아이콘 기본값이 16px, 선 두께 2px, `currentColor`이고, 크기를 바꿔도 렌더된 선 두께가 유지되기를 원한다.
79. 스크린리더 사용자로서, 장식용 아이콘은 읽히지 않고 `aria-label`을 준 아이콘만 이미지로 읽히기를 원한다.
80. 앱 개발자로서, Tide 아이콘 이름이 업스트림 사정으로 조용히 바뀌거나 사라지지 않기를 원한다.
81. 앱 개발자로서, 문서의 아이콘 페이지에서 이름과 태그로 검색하고, 클릭해서 import 문을 복사하기를 원한다.
82. 앱 개발자로서, 쓰지 않는 아이콘은 번들에 들어가지 않기를 원한다(tree-shaking).
83. 앱 개발자로서, Component의 아이콘 자리에 다른 아이콘 라이브러리의 요소(`ReactNode`)도 넣기를 원한다.

### 문서 (Storybook)

84. 앱 개발자로서, 사이드바가 시작하기 → 원칙 → 기준 → Foundation → Component 순서이기를 원한다. Component는 이름순이어야 한다.
85. 앱 개발자로서, Component 페이지마다 설명 → 사용 시점/쓰지 않을 때 → 예시 → Do/Don't → 접근성 → props 표가 같은 순서로 나오기를 원한다.
86. 앱 개발자로서, 문서 툴바에서 light/dark를 바꾸면 story와 글 페이지가 모두 바뀌기를 원한다.
87. 디자이너로서, Token 페이지에서 색 스케일과 대비비, 텍스트 스타일 14개, radius, 그림자(light/dark), motion 재생을 보기를 원한다. 값은 Token 원본에서 자동으로 그려져야 한다.
88. 앱 개발자로서, 원칙과 기준 문서를 Storybook에서 원문 그대로 읽기를 원한다.
89. 앱 개발자로서, 문서 사이트가 npm `latest`와 같은 버전을 설명하기를 원한다.

### 릴리스

90. 앱 개발자로서, 0.x 동안 caret 범위(`^0.2.0`)로 설치하면 breaking change를 받지 않기를 원한다. 0.x에서는 minor가 breaking이다.
91. 앱 개발자로서, CHANGELOG에서 공개 계약 변경과 시각 값 조정을 구분해 보기를 원한다.
92. 앱 개발자로서, npm 패키지에 provenance가 붙어 출처를 확인할 수 있기를 원한다.
93. 메인테이너로서, PR에 changeset만 넣으면 Version PR이 자동으로 관리되고, 그 PR을 머지하면 publish와 문서 배포가 이어지기를 원한다.
94. 메인테이너로서, `packages/*`를 건드린 PR에 changeset이 없으면 CI가 실패하기를 원한다.
95. 메인테이너로서, 아이콘 이름표에서 키가 빠졌는데 changeset이 minor가 아니면 CI가 실패하기를 원한다.

### 기여자와 에이전트

96. 기여 에이전트로서, Component 하나를 끝냈는지 판단할 수 있는 완료 기준을 원한다(Testing Decisions 참고).
97. 기여 에이전트로서, 라이브러리 API를 기억으로 추측하지 않고 설치된 버전의 문서로 확인한 뒤 근거 버전을 남기기를 원한다.
98. 메인테이너로서, 외부 Component 라이브러리를 도입해야 할 것 같으면 에이전트가 후보와 근거를 들고 먼저 묻기를 원한다(ADR 0004).

## Implementation Decisions

### 저장소와 패키지 ([ADR 0006](../../decisions/0006-foundation-and-target-packages.md), [ADR 0007](../../decisions/0007-lucide-generated-icons-package.md), [ADR 0008](../../decisions/0008-fixed-versions-and-oidc-direct-publish.md), [ADR 0009](../../decisions/0009-single-components-package.md))

- pnpm workspace 모노레포 위에 Turborepo를 쓴다. 배포 패키지는 세 개다.
  - `@tide-tds/foundation`: 프레임워크와 무관한 Token과 CSS
  - `@tide-tds/icons`: React 아이콘 Component
  - `@tide-tds/components`: React Component. desktop·mobile 같은 사용 환경별로 패키지를 나누지 않는다([ADR 0009](../../decisions/0009-single-components-package.md))
- private 앱은 두 개다. Storybook 문서 앱과 Next.js smoke test 앱.
- 별도의 설정 패키지나 utils 패키지는 두지 않는다. `cn`과 공통 union 타입은 components가 export한다.
- TypeScript 7.0.2 하나만 쓴다. 공통 tsconfig에서 `erasableSyntaxOnly`(enum 대신 union), `isolatedDeclarations`, `verbatimModuleSyntax`를 켠다. 상대 import에 `.ts`/`.tsx` 확장자를 붙이고 `rewriteRelativeImportExtensions`를 켠다.
- 배포 패키지 세 개는 tsdown 하나로 빌드한다. 원본 파일 단위를 유지하는 `unbundle` 모드로 ESM을 내고, d.ts는 `isolatedDeclarations` 기반 oxc로 만든다. dependencies·peerDependencies(서브패스 포함)는 번들에 넣지 않는다. exports는 `package.json`에서 손으로 관리한다([패키지 빌드를 tsdown으로 전환](../tide-v0-impl/issues/36-tsdown-build.md), 2026-11-10 사용자 결정으로 Vite 라이브러리 모드·`tsc` 빌드를 대체).
- 출력은 ESM 전용이다. 배포 패키지에는 `engines`를 두지 않는다. 저장소는 Node 26과 pnpm 12.18.0으로 고정한다.
- 의존성 버전은 pnpm 기본 catalog 하나로 관리하고 `catalogMode: strict`로 둔다. peer 범위와 내부 패키지는 catalog에 넣지 않는다. 0.x인 패키지(oxfmt, publint, tsdown)는 정확한 버전으로 고정한다.
- lint(oxlint)와 format(oxfmt)은 루트에서 저장소 전체를 한 번에 돌린다. type-aware 린팅은 쓰지 않는다.
- turbo 태스크는 `build`, `typecheck`, `test`, `smoke`, `dev` 다섯 개다. `dev`를 뺀 나머지는 모두 `^build`에 의존한다.

### `@tide-tds/foundation`

- **원본**: Token은 TS 객체(`as const`)가 원본이다. 대비 쌍 목록도 같은 곳에 둔다. 직접 만든 Node 스크립트가 원본에서 CSS와 tailwind-merge 설정을 만든다. JS와 d.ts는 tsdown(`unbundle`, oxc d.ts)으로 만들고, 생성 스크립트는 그 뒤에 실행한다. DTCG JSON은 만들지 않는다([ADR 0003](../../decisions/0003-token-source-and-utility-namespaces.md)).
- **공개 표면(exports)**:
  - 루트: Token 객체
  - tokens CSS: `--tide-*` 변수와 `[data-theme]` 덮어쓰기만 담는다. Tailwind 없이 쓰는 사용자의 공개 계약이다.
  - tailwind CSS: tokens CSS를 import한다. 그 위에 Tailwind 기본값 제거(`initial`), `@theme inline` 연결, `@custom-variant dark`, `@utility focus-ring`/`focus-field`, base CSS를 담는다.
  - tailwind-merge 설정: 타입만 import하는 순수 객체다. 런타임에서는 tailwind-merge에 의존하지 않는다.
  - color-family(`@tide-tds/foundation/color-family`): 앱 브랜드 색 계열 API(`defineColorFamily`)다. bin `tide-color build <파일>`이 같은 매핑 규칙으로 CSS를 만들고 대비를 검사한다(미달이면 exit 1). 앱은 이 API를 쓰려면 foundation을 직접 설치한다([ADR 0011](../../decisions/0011-open-color-names-data-color-accent.md), [티켓 40](../tide-v0-impl/issues/40-open-color-families-and-app-brand-colors.md)).
  - internal(`@tide-tds/foundation/internal`): 문서 앱 Token 블록과 빌드 스크립트가 쓰는 내부 도우미(대비 계산 등)다. 앱 개발자용이 아니고 공개 계약이 아니다. d.ts에 `@internal`로 표시하고 문서에 싣지 않는다([컬러 Foundation](../tide-v0-impl/issues/04-color-foundation.md), 2026-11-10 사용자 결정).
- **공개 계약**: `--tide-<Utility class 이름>`(kebab-case)이다. 예외로 색 계열 변수 `--tide-<계열>-<슬롯>`과 accent 슬롯 `--tide-accent-<슬롯>`은 Utility class가 없는 변수 묶음이라 색 이름과 슬롯으로 짓는다. Tailwind 변수는 `--tide-*`를 가리키는 내부 연결이고 공개 계약이 아니다.
- **컬러**:
  - Primitive 계열은 `blue`(primary), `gray`(neutral), `green`(success), `amber`(warning), `red`(danger), `cyan`(info)이고 단계는 50~950의 11단계다. 그 밖에 `white`, `black`이 있다.
  - 정본은 hex다. OKLCH L 계단으로 만든 초안을 손으로 조정해도 된다. `blue-500`은 `#3183f5`로 고정한다.
  - Tailwind 기본 팔레트는 지운다(`--color-*: initial`).
- **Semantic 색**: Tailwind 속성별 namespace(`--background-color-*`, `--text-color-*`, `--border-color-*`, `--outline-color-*`)로 노출한다.
  - `bg-<역할>-<solid|subtle>[-hover|-active]`. 강도는 생략하지 않는다.
  - `text-<역할>`, `border-<역할>`. neutral은 이 둘을 두지 않는다.
  - accent: `bg-accent-<solid|subtle>[-hover|-active]`, `text-accent`, `text-accent-on-solid`, `border-accent`. `data-color`가 고른 색 이름의 값을 쓴다(아래 「색 이름」). 색 계열 Utility class(`bg-blue-solid`)는 노출하지 않는다.
  - 공통: `bg-canvas`, `bg-surface`, `bg-raised`, `bg-disabled`, `bg-overlay`, `text-default`, `text-muted`, `text-disabled`, `text-on-solid`, `border-default`, `border-strong`, `border-raised`, `outline-focus`
  - shadow 색은 class로 노출하지 않는다. `--tide-shadow-color`만 둔다.
  - 예외: Tailwind의 gradient stop(`from-`/`via-`/`to-`)도 `--background-color`를 읽어서(tailwindcss 4.3.5) `from-canvas`, `via-primary-solid` 같은 class가 생긴다. 배경색을 그대로 gradient에 쓰는 것이라 뜻이 어긋나지 않으므로 「의미 없는 조합」의 예외로 인정한다. 막는 테스트는 두지 않는다(2026-11-10 사용자 결정).
- **매핑**([컬러 Foundation 결정](issues/09-grilling-color-foundation.md)):
  - solid / hover / active는 두 Theme 모두 600/700/800이다.
  - subtle은 light 50/100/200, dark 950/900/800이다. dark의 neutral만 900/800/700이다.
  - 역할 text는 light 800, dark 200이다. 역할 border는 light 600, dark 400이다.
  - 표면: canvas는 white / gray-950, surface는 canvas와 같은 색 + border, raised는 white(+shadow) / gray-900(+border)이다.
  - `border-raised`는 transparent / gray-800이다. raised 표면 경계를 Theme 분기 없이 쓰려고 둔다. 장식용 경계라 대비 검사에서 제외한다(2026-11-10 사용자 결정, [radius·Elevation·포커스 표시 Foundation](../tide-v0-impl/issues/06-radius-elevation-focus-foundation.md)).
  - focus-ring은 blue-600 / blue-400이다.
  - overlay는 gray-950의 alpha 50% / 70%다.
  - shadow 색은 gray-950 8% / black 30%다.
  - alpha는 overlay와 shadow에만 쓰고 8자리 hex로 쓴다.
- **Theme**: `:root`와 `[data-theme="light"]`는 light, `[data-theme="dark"]`는 dark다. 각각 `color-scheme`을 지정한다. `dark:` variant는 `data-theme=dark`를 따른다. `prefers-color-scheme` 자동 전환은 없다.
- **색 이름**([ADR 0011](../../decisions/0011-open-color-names-data-color-accent.md), [ADR 0016](../../decisions/0016-role-scoped-color-and-app-roles.md), [티켓 40](../tide-v0-impl/issues/40-open-color-families-and-app-brand-colors.md), [티켓 41](../tide-v0-impl/issues/41-role-scoped-color-and-app-roles.md)):
  - 색 이름(Color)은 Role과 색 계열이다. Role은 Tide Role 6개와 앱 Role이고 타입은 `interface RoleRegistry`·`type Role = keyof RoleRegistry`다. 색 계열은 Tide 색 계열 6개와 앱 장식 계열이고 타입은 `interface ColorFamilyRegistry`·`type ColorFamilyName = keyof ColorFamilyRegistry`다. `type Color = Role | ColorFamilyName`이다.
  - 앱은 `declare module "@tide-tds/components" { interface RoleRegistry { brand: true } }`(행동·의미 Component용)나 `interface ColorFamilyRegistry { brand: true }`(장식·분류 Component용)로 이름을 더한다. 둘 다 같은 `tide-color build` CSS를 쓴다.
  - Tide 안의 계산(Semantic Token 이름, 대비 쌍, `semantic` 객체 타입)은 닫힌 타입 `TideRole`·`ColorFamily`를 쓴다. 앱 Role에는 Role Token이 생기지 않는다.
  - 색 계열마다 Theme 블록이 변수 묶음 `--tide-<계열>-<슬롯>`을 정한다. 슬롯은 `solid`/`-hover`/`-active`, `subtle`/`-hover`/`-active`, `text`, `border`, `on-solid`다. 규칙은 위 매핑과 같고(on-solid는 white), 계열마다 덮어쓸 값을 둘 수 있다.
  - Role은 계열 + 덮어쓸 값의 별칭이다. Role Token은 계열 변수를 가리키고 덮어쓴 슬롯만 Primitive를 가리킨다. `neutral`은 `gray`와 다르다(dark subtle 900/800/700, text `default`, border `strong`).
  - `[data-color="<이름>"]`는 accent 슬롯 `--tide-accent-<슬롯>`을 그 색의 변수로 꽂는다. Theme 블록의 기본값은 primary다. `data-color`는 `data-theme`과 같은 요소나 그 안쪽에서 그 Theme 값을 따른다.
- **대비**: WCAG 2.x 대비비만 쓴다. 텍스트는 4.5:1, UI 경계와 포커스는 3:1이다. 대비 쌍 목록(128쌍 이상)을 light와 dark에서 모두 검사한다. 장식용 border, disabled, overlay, shadow는 검사에서 제외한다. 색 이름마다 같은 규칙(text × 표면 층·subtle 3단계, on-solid × solid 3단계, border × 표면 층)으로 light·dark를 검사하고, 앱 계열은 `tide-color`가 같은 규칙으로 검사한다.
- **타이포그래피**([타이포그래피 Foundation 결정](issues/11-grilling-typography.md)):
  - font-family는 `sans`(Pretendard Variable 우선 스택)와 `mono`(시스템 스택) 두 개만 둔다. 웹폰트와 `@font-face`는 넣지 않는다.
  - Primitive 크기는 12/14/16/18/20/24/32/40/48/56px이고 rem으로 쓴다. class로 노출하지 않는다.
  - 텍스트 스타일 14개를 `--text-<이름>`과 그 `--line-height`, `--font-weight` 하위 변수로 정의한다.

    | 스타일       | 크기/행간 (px) | 굵기 |
    | ------------ | -------------- | ---- |
    | `display-lg` | 56/64          | 700  |
    | `display-md` | 48/56          | 700  |
    | `heading-xl` | 40/48          | 700  |
    | `heading-lg` | 32/40          | 700  |
    | `heading-md` | 24/32          | 700  |
    | `heading-sm` | 20/28          | 600  |
    | `heading-xs` | 18/28          | 600  |
    | `body-lg`    | 18/28          | 400  |
    | `body-md`    | 16/24          | 400  |
    | `body-sm`    | 14/20          | 400  |
    | `label-lg`   | 16/20          | 500  |
    | `label-md`   | 14/20          | 500  |
    | `label-sm`   | 12/16          | 500  |
    | `caption`    | 12/16          | 400  |

  - 굵기는 300/400/500/600/700의 5개만 둔다. 자간은 0이다. Tailwind 기본 `text-*` 크기, `font-weight`, `font-serif`는 지운다. `leading-*`와 `tracking-*`는 남긴다.
  - base CSS에 `word-break: keep-all`과 `overflow-wrap: break-word`를 넣는다. 루트 font-size는 바꾸지 않는다.
  - 공개 계약: `--tide-font-sans`/`--tide-font-mono`, 굵기 `--tide-font-<light|normal|medium|semibold|bold>`, 텍스트 스타일 `--tide-text-<이름>`과 `--tide-text-<이름>--line-height`/`--font-weight`, Primitive 크기 `--tide-font-size-<px>`. 텍스트 스타일은 Primitive 크기와 굵기 변수를 참조한다([타이포그래피 Foundation](../tide-v0-impl/issues/05-typography-foundation.md)).
  - tailwind-merge: 텍스트 스타일(font-size group)은 앞에 온 행간(`leading-*`, Tailwind 기본)과 굵기(`font-*`, Tide 추가)를 지운다. 텍스트 스타일 뒤에 온 행간·굵기는 남는다.
- **간격과 breakpoint**: Tailwind 기본값을 그대로 쓴다. border width와 opacity에는 Token을 두지 않는다.
- **radius**: `sm` 4px, `md` 6px, `lg` 8px, `xl` 12px, `full`. 나머지 Tailwind 기본값은 지운다.
  - 쓰는 곳: 작은 표시 요소와 목록 안 항목은 `sm`, 조작 요소는 모든 size에서 `md`, 담는 요소(Card, Alert, Popover, 목록, Toast, Accordion)는 `lg`, Dialog류는 `xl`, 원·알약형은 `full`이다.
  - 중첩 규칙: 바깥 radius = 안쪽 radius + padding + border. 그래서 목록 padding은 3px다.
  - 공개 계약: `--tide-rounded-<단계>`(`--tide-<Utility class 이름>` 규칙). theme 변수가 없는 `rounded-none`은 남는다([radius·Elevation·포커스 표시 Foundation](../tide-v0-impl/issues/06-radius-elevation-focus-foundation.md)).
- **Elevation**: `shadow-sm`/`md`/`lg`이고 raised 표면에서만 쓴다. 단계마다 2레이어이고, 두 레이어 모두 `--tide-shadow-color`를 `color-mix`로 낮춰 쓴다.

  | 단계 | 가까운 레이어        | 먼 레이어               | 쓰는 곳                       |
  | ---- | -------------------- | ----------------------- | ----------------------------- |
  | `sm` | `0 1px 1px` 60%      | `0 1px 2px` 100%        | Switch thumb                  |
  | `md` | `0 1px 3px` 50%      | `0 4px 12px -2px` 100%  | Popover, 목록, Tooltip, Toast |
  | `lg` | `0 2px 6px -1px` 50% | `0 12px 24px -6px` 100% | Dialog류                      |
  - dark에서도 그림자를 그린다. light raised에도 투명 border 1px를 둔다(forced-colors에서 경계가 남게 하려고). raised 표면은 `border border-raised`로 쓴다.
  - 공개 계약: `--tide-shadow-<단계>`. `--tide-shadow-color`를 참조하므로 Theme 블록마다 다시 선언한다. Tailwind 기본 그림자(`--shadow-*`, `--inset-shadow-*`, `--drop-shadow-*`, `--text-shadow-*`)는 모두 지운다. theme 변수가 없는 `shadow-none`은 남는다([radius·Elevation·포커스 표시 Foundation](../tide-v0-impl/issues/06-radius-elevation-focus-foundation.md)).

- **포커스 표시**:
  - ring: `outline` 2px, offset 2px, `:focus-visible`. 버튼류와 나머지 전부에 쓴다.
  - field: border를 focus-ring 색으로 바꾸고, 늘어난 1px는 inset shadow로 그려 2px로 보이게 한다. 투명 outline을 함께 둔다. `:focus`(클릭 포함). 입력창과 Select·Combobox 트리거에 쓴다.
  - highlight: primary subtle 배경과 primary text 글자. 투명 outline을 함께 둔다. 목록 안 항목에 쓰고, hover도 같은 모양이다.
  - `focus-ring`과 `focus-field`를 `@utility`로 노출한다. `--tide-focus-ring-width`와 `--tide-focus-ring-offset`도 둔다.
  - error 입력창에서도 포커스 중에는 focus-field가 이겨야 한다. error+focus 조합을 명시적으로 정의한다. 오류 상태는 `aria-invalid="true"`로 나타내고, `focus-field`가 `[aria-invalid="true"]` 조합을 따로 적어 오류 border보다 우선한다([radius·Elevation·포커스 표시 Foundation](../tide-v0-impl/issues/06-radius-elevation-focus-foundation.md)).
- **motion**:
  - duration은 `fast` 150ms, `normal` 300ms다(`--transition-duration-*`). easing은 `out` 하나다.
  - `--default-transition-duration`과 `--default-transition-timing-function`을 Tide 값으로 지정한다.
  - 공개 계약: `--tide-duration-fast`, `--tide-duration-normal`, `--tide-ease-out`. Theme과 무관하므로 `:root` 블록에 둔다. `--default-transition-*`는 `--tide-duration-fast`, `--tide-ease-out`을 가리킨다. `ease-in`, `ease-in-out`과 숫자 duration(`duration-150`)은 Tailwind 기본값대로 남는다([motion·z-index Foundation](../tide-v0-impl/issues/07-motion-z-index-foundation.md)).
- **z-index**: `--z-index-*` namespace다. `sticky` 100, `modal` 200, `popover` 300, `toast` 400, `tooltip` 500. 공개 계약은 `--tide-z-*`다. 숫자 class(`z-0`, `z-10`)와 임의 값(`z-[250]`)은 남는다([motion·z-index Foundation](../tide-v0-impl/issues/07-motion-z-index-foundation.md)).
- **tailwind-merge 설정**: Token 원본에서 만든다. Tide가 새로 만든 이름(텍스트 스타일, radius, shadow, z-index, duration, Semantic 색 namespace)을 Tailwind 기본 그룹에 등록한다. 그래야 충돌을 해결할 수 있다.

### `@tide-tds/icons` ([ADR 0007](../../decisions/0007-lucide-generated-icons-package.md))

- **이름표**: `lucide-static`은 devDependency다. 패키지에 이름표 파일 하나를 커밋한다. 내용은 `Tide 이름 → lucide-static 원본 SVG 이름`의 짝이다. 처음에는 정식 Lucide 아이콘 2,029개로 자동으로 채우고, 그 뒤로는 이름표가 Tide 이름의 정본이다.
- **생성 스크립트**:
  - 이름표의 줄마다 Component를 만든다.
  - 원본 SVG가 없으면 빌드를 실패시킨다.
  - 이름표에 없는 새 SVG는 목록만 출력한다.
  - Lucide alias는 만들지 않는다.
  - 생성 결과는 커밋하지 않는다.
- **이름**: 모두 `Icon` 접미사가 붙는다.
- **props**:
  - `size`: px, 기본 16
  - `strokeWidth`: 기본 2, `vector-effect: non-scaling-stroke`
  - `aria-label`: 있으면 `role="img"`. 없으면 `aria-hidden="true"`, `focusable="false"`
  - 나머지 SVG 속성은 그대로 넘긴다. 색은 `currentColor`다.
- 손으로 쓰는 것은 공통 틀 하나뿐이다. 각 아이콘은 그 틀과 SVG 데이터를 합친 것이다.
- **빌드**: tsdown `unbundle`로 파일 단위로 나눠 tree-shaking이 되게 한다.
- **라이선스**: LICENSE에 Lucide ISC와 Feather MIT 고지 전문을 포함한다. 공개 API, 패키지 설명, Storybook 본문에는 Lucide를 드러내지 않는다. 감사 문구만 한 줄 둔다.
- **크기 규칙**(Component 안에서 쓸 때):

  | Component size | 텍스트 옆 아이콘 | IconButton 아이콘 |
  | -------------- | ---------------- | ----------------- |
  | `xs`           | 14px             | 16px              |
  | `sm`           | 14px             | 16px              |
  | `md`           | 16px             | 20px              |
  | `lg`           | 20px             | 24px              |
  - 선 두께는 label 옆에서 2px, body 옆에서 1.5px다.

- Tide Component 내부 아이콘은 항상 장식용이다.
- 상태 아이콘(info, success, warning, danger)은 모양으로도 서로 구분되어야 한다.

### `@tide-tds/components` 공통 API ([Component 공통 API 규칙 결정](issues/14-grilling-component-api.md), [ADR 0004](../../decisions/0004-react-aria-hooks-own-markup.md), [ADR 0005](../../decisions/0005-hand-written-variant-maps-and-render-prop.md))

- **exports**:
  - 루트: Component 33개, `cn`, 공통 union 타입, `XxxProps` 타입을 평평하게 export한다. Component별 서브패스는 없다.
  - styles CSS: foundation tailwind CSS를 import하고 `@source`로 패키지 자신을 등록한다.
  - 개발용 exports 조건 `@tide-tds/source`는 원본을 가리킨다(Storybook HMR용).
- **빌드**:
  - tsdown `unbundle`로 원본 파일 단위를 유지한다. `"use client"`는 필요한 원본 파일에만 직접 붙이고, 빌드 결과에 파일마다 그대로 남는다. `banner`로 일괄로 붙이지 않는다.
  - d.ts는 tsdown이 `isolatedDeclarations` 기반 oxc로 만든다.
  - `sideEffects`는 CSS만 둔다.
- **의존성**:
  - peer: `react ^19`, `react-dom ^19`, `tailwindcss ^4.3`
  - dependencies: foundation·icons(배포하면 정확한 버전), `react-aria`, `react-stately`, `clsx`, `tailwind-merge`
- **ref와 props**:
  - `forwardRef`는 쓰지 않는다. `ref`는 일반 prop이다.
  - props는 루트 DOM 요소의 props를 확장하고, 이름이 겹치는 HTML 속성(`color` 등)은 `Omit`한다.
- **스타일 축**:
  - `variant`는 Component마다 정의되는 주된 스타일 축이다. Button류는 채움 방식(`solid`/`subtle`/`outline`/`ghost`)을, Typography는 텍스트 스타일 이름을 값으로 받는다.
  - `color`가 받는 이름은 Component 종류가 정한다([ADR 0016](../../decisions/0016-role-scoped-color-and-app-roles.md)). 행동·의미 Component(Button, IconButton, Link, Checkbox·Radio, Switch, Alert, Toast)는 `Role`(앱 Role 포함)만 받는다. 장식·분류 Component(Badge, Tag, Avatar)는 `ColorFamilyName`을 받고, Role도 받을지는 그 Component 티켓에서 정한다(둘 다 받으면 `Color`). Badge는 둘 다 받는다(`Color`, 기본 `neutral`, [ADR 0017](../../decisions/0017-badge-color-accepts-role-and-color-family.md)). Component는 루트에 `data-color`를 항상 붙여서(기본 `primary`) 바깥 색을 물려받지 않는다([ADR 0011](../../decisions/0011-open-color-names-data-color-accent.md)). `size`는 `xs`/`sm`/`md`/`lg`다.
  - `Role`, `RoleRegistry`, `ColorFamilyName`, `ColorFamilyRegistry`, `Color`는 `@tide-tds/components`에서도 다시 낸다. 앱의 augmentation 대상은 `@tide-tds/components`다(앱이 설치하는 패키지).
  - 공통 union 타입은 한 곳에서 정의하고, Component마다 `Extract`로 필요한 값만 고른다.
  - 채움 방식 union 이름은 `Variant`가 아니라 채움 방식을 드러내는 이름(예: `FillVariant`)으로 한다.
- **size 표**:

  | size | 높이 | 텍스트 스타일 |
  | ---- | ---- | ------------- |
  | `xs` | 24px | `label-sm`    |
  | `sm` | 32px | `label-sm`    |
  | `md` | 40px | `label-md`    |
  | `lg` | 48px | `label-lg`    |
  - 높이는 24px 밑으로 내려가지 않는다. 같은 size의 컨트롤은 높이가 같다. 세로 정렬은 고정 높이와 `items-center`로 한다.

- **variant 정의**: 타입이 붙은 객체 맵과 `cn`으로 직접 쓴다. cva와 tailwind-variants는 쓰지 않는다. 모든 조합을 채웠는지는 타입 검사가 확인한다. 색 축은 맵에 두지 않는다. 맵은 `Record<FillVariant, string>`이고 accent class(`bg-accent-solid`, `text-accent` 등)로 쓰며, 색은 루트의 `data-color`가 정한다([ADR 0011](../../decisions/0011-open-color-names-data-color-accent.md)).
- **앱 확장점(색)**: 앱은 Tide 패키지를 고치지 않고 브랜드 색을 더한다. `defineColorFamily` → `tide-color build` → Tide CSS 다음에 import → `RoleRegistry`(Button 등에 쓸 때) 또는 `ColorFamilyRegistry`(Badge 등에 쓸 때) augmentation 순서다. Tide Role의 색을 바꾸려면 Role CSS 변수(`--tide-bg-primary-*`, `--tide-text-primary`, `--tide-border-primary` 등)를 Theme별로 덮어쓴다. 이 값은 대비 검사를 받지 않는다. 계열 변수(`--tide-blue-*`)는 덮어쓰지 않는다. Component는 앱 계열 class를 쓰지 않으므로 Tailwind 자동완성과 tailwind-merge 설정은 앱 계열에 따라 바뀌지 않는다.
- **className 병합**: `cn` = clsx + 생성된 설정으로 확장한 tailwind-merge. 사용자의 `className`은 항상 마지막에 넣는다.
- **`render` prop**:
  - 루트가 DOM 요소 하나인 Component만 받는다. 요소를 넘기면 props, ref, className을 병합한다.
  - `asChild`, `as`, 함수 형태의 `render`는 쓰지 않는다.
- **prop 이름**:
  - DOM 이름(`disabled`, `readOnly`, `required`, `invalid`, `onClick`, `onChange`)을 쓴다. React Aria 이름은 내부에서 변환한다.
  - 상태는 `value`/`defaultValue`/`onValueChange(value)`, `open`/`defaultOpen`/`onOpenChange(open)`이다. 선택도 `value`로 통일한다. 콜백 인자는 값 하나다.
- **상태 노출**:
  - 네이티브 pseudo-class가 있으면 그것을 쓴다(`hover:`, `focus-visible:`, `disabled:`).
  - 없으면 boolean `data-*` 속성으로 노출한다: `data-selected`, `data-open`, `data-invalid`, `data-pressed`, `data-disabled`.
- **disabled**: 네이티브 `disabled`를 지원하는 요소에는 그것을 쓴다. 지원하지 않는 요소에는 `aria-disabled="true"`와 `data-disabled`를 붙이고 이벤트를 막는다. `cursor-not-allowed`는 공통으로 적용한다.
- **커서**: 누를 수 있는 Component(Button류)는 활성 상태에서 `cursor-pointer`, 로딩 중에는 `cursor-wait`, 비활성에는 `cursor-not-allowed`다. Tailwind 4 preflight는 button 커서를 브라우저 기본값으로 두므로 Component가 직접 붙인다. `render`로 바꾼 요소도 같다([Button](../tide-v0-impl/issues/13-button.md)).
- **raised 위 항목**: ghost 규칙을 따른다. 기본은 투명, hover는 `subtle-hover`, 선택 유지는 `subtle-active`다. 목록 안 항목의 hover와 키보드 위치 표시는 highlight다.
- **여러 부분으로 된 Component**: 평평한 이름으로 export한다(`DialogTrigger`). 부분마다 `className`을 받는다. `classNames` 객체는 두지 않는다.
- **IconButton**: 별도 Component로 둔다. `aria-label`은 타입상 필수다. 24×24 미만은 없다.
- **press 축소**: Button과 IconButton은 활성 상태에서 누르면 0.96으로 줄어든다(`motion-safe:`일 때만). boolean prop `noPressScale`로 끌 수 있다(초안 `static`에서 바꿈, [ADR 0010](../../decisions/0010-press-scale-opt-out-prop-name.md)).
- **`"use client"`**: hook, state, 이벤트 처리를 쓰는 파일에만 붙인다. 표시만 하는 Component는 서버 컴포넌트로 남긴다.
- **접근성 동작**:
  - 네이티브로 완결되는 요소(Button, Input, Textarea, Checkbox, Radio, Switch, Table 등)에는 hook을 쓰지 않는다.
  - 위젯(Popover, Tooltip, Menu, Select, Combobox, Dialog, AlertDialog, Tabs, Accordion, Tag, Toast)은 React Aria hooks로 만든다.
  - `react-aria-components`, Base UI, Radix는 쓰지 않는다.
- **오버레이**:
  - top-layer는 쓰지 않는다. 모든 오버레이는 React Aria portal과 쌓임 단계 Token으로 쌓는다.
  - Component 내부의 겹침은 루트 `isolate`와 `z-0`/`z-1`로만 처리한다.
- **motion 적용**:

  | 구분    | Component                           | 나타날 때                                    | 사라질 때                       |
  | ------- | ----------------------------------- | -------------------------------------------- | ------------------------------- |
  | 자주 씀 | Menu, Select·Combobox 목록, Tooltip | 바로                                         | opacity `fast`                  |
  | 가끔 씀 | Popover, Toast                      | opacity + blur 4px + translate 4px, `normal` | 같은 조합을 절반 세기로, `fast` |
  | 가끔 씀 | Dialog류                            | opacity + scale 0.96 → 1, `normal`           | 같은 조합을 약하게, `fast`      |
  - 반복되는 목록 항목의 hover는 바로 바뀐다. 혼자 있는 조작 요소는 `transition-colors` `fast`다.
  - `transition-all`은 쓰지 않는다. keyframe은 Spinner·Skeleton에만 쓴다.
  - reduced-motion에서는 이동·확대·blur를 opacity로 바꾸고 Skeleton을 멈춘다.
  - 구현은 CSS transition, `@starting-style`, `allow-discrete`로 한다. 지원하지 않는 브라우저에서는 바로 나타나고 사라진다.

### Component 33개와 구현 순서 ([v0 Component 목록과 우선순위 결정](issues/15-grilling-component-list.md))

단계는 의존 순서다. 33개가 모두 끝나야 v0가 완료된다. 단계 하나가 끝날 때마다 minor 릴리스를 한 번 낸다.

| 단계          | Component                                                                                    | 방식               |
| ------------- | -------------------------------------------------------------------------------------------- | ------------------ |
| 1 기반        | VisuallyHidden, Typography, Spinner                                                          | 네이티브           |
| 2 액션·폼     | Button → IconButton → Link, Field → Input → Textarea → Checkbox → Radio → Switch             | 네이티브, `render` |
| 3 표시·피드백 | Badge, Alert, Card, Separator, Avatar, Skeleton, Progress, Table, Breadcrumb, Pagination     | 네이티브           |
| 4 hook 위젯   | Popover → Tooltip → Menu → Select → Combobox → Dialog → AlertDialog → Tabs → Accordion → Tag | React Aria hooks   |
| 5             | Toast                                                                                        | `useToast`         |

Component별로 이미 정한 범위:

- **Typography**: `variant`는 텍스트 스타일 이름이다. 기본 요소는 다음과 같다.

  | 스타일                                                    | 기본 요소                 |
  | --------------------------------------------------------- | ------------------------- |
  | `display-*`, `heading-xl`                                 | `h1`                      |
  | `heading-lg` / `heading-md` / `heading-sm` / `heading-xs` | `h2` / `h3` / `h4` / `h5` |
  | `body-*`, `caption`                                       | `p`                       |
  | `label-*`                                                 | `span`                    |
  - heading·display는 `level`(1~6)을 선택적으로 받고, 항상 `<h*>`로 렌더된다. 다른 요소가 필요하면 `render`를 쓴다.

- **Field**: label, 설명, 오류 메시지를 붙이고 `id`, `aria-describedby`, `aria-invalid`를 자동으로 연결한다. props 하나로 받고, 입력 Component는 context로 연결한다. 오류 상태는 `aria-invalid="true"`와 `data-invalid`다([ADR 0013](../../decisions/0013-field-props-and-context-connection.md)). 묶음(CheckboxGroup·RadioGroup)은 `group`을 주면 label이 `for` 없는 요소가 되고 묶음이 `aria-labelledby`로 이름을 받는다. `aria-invalid`는 묶음 안의 input마다 붙는다(ADR 0013 정정, [티켓 16](../tide-v0-impl/issues/16-checkbox-and-radio.md)).
- **Select**: `useSelect`로 만든다.
- **Combobox**: 클라이언트 필터링, 단일 선택(`useComboBox`). 비동기, 다중 선택, 가상화, 자유 입력은 없다.
- **Table**: 시맨틱 `<table>`(Table, Head, Row, Cell)이다. 정렬, 행 선택, 가상화는 없다.
- **Tag**: 지울 수 있는 라벨이다. 묶음 탐색과 Delete 제거는 `useTagGroup`이 맡는다. 상호작용이 없는 상태 표시는 Badge다.
- **AlertDialog**: Dialog 위의 얇은 변형이다.
- **Badge**: 상호작용 없는 상태·분류 라벨(`span`)이다. `color`는 `Color`(상태는 Role, 분류는 색 계열 이름, 기본 `neutral`), `variant`는 `subtle`/`solid`, `size`는 `sm`(20px)/`md`(24px), radius `sm`. 뜻은 텍스트(`children` 필수)로 전한다([티켓 19](../tide-v0-impl/issues/19-badge-card-separator.md)).
- **Alert**: 화면 안 상태 알림(`div`)이다. `color`는 `Role`(기본 `info`), radius `lg`, 역할 경계 + subtle 배경 + 역할 글자. info·success·warning·danger 상태 아이콘은 모양이 다르고 장식용이다. 기본은 역할 없는 정적 표시이고 `role`로 `alert`·`status`를 준다. 닫기는 제어형 `onClose`와 IconButton이다. 스타일은 Toast와 내부 모듈(`alert-style.ts`)로 나눠 쓴다([티켓 20](../tide-v0-impl/issues/20-alert.md)).
- **Card**: surface 표면 컨테이너이고 border만 쓴다. 그림자는 없다. radius `lg`, 여백 16px, 기본 `div`이고 `render`로 요소를 바꾼다.
- **Separator**: 네이티브 `<hr>`이다(`useSeparator` 없음). 기본은 separator 역할, 세로는 `aria-orientation`, `decorative`면 `role="none"`. 선은 장식용 `border-default`다.
- **Toast**:
  - 기본 위치는 아래 오른쪽이고 폭을 제한한다. 쌓임 단계는 `toast`다.
  - 자동으로 닫힐 때는 5초 이상 보이고, hover나 focus 중에는 멈춘다. 액션이나 오류가 있으면 자동으로 닫지 않는다.
  - Alert 스타일과 IconButton을 쓴다.
- **내부 아이콘**: Checkbox 체크와 indeterminate, Select·Combobox·Accordion chevron, Dialog·Toast·Alert·Tag 닫기, Pagination 화살표, Breadcrumb 구분자, 역할별 상태 아이콘, Avatar fallback.
- **이 spec에서 정하지 않은 것**: 각 Component의 세부 props(어떤 `variant`·`size` 값을 고를지, 기본값, padding, 로딩 같은 개별 상태). Component 구현 티켓에서 위 공통 규칙 안에서 정하고, Storybook props 표로 확정한다.

### 문서 앱 ([Storybook 문서 구성 결정](issues/26-grilling-storybook.md))

- Storybook 10.6.6이고 `reactDocgen`은 기본값 `react-docgen`으로 고정한다. Tailwind는 `@tailwindcss/vite`로 연결한다. components는 원본 조건으로, foundation은 빌드 결과로 resolve한다.
- **사이드바**: 시작하기(설치, 폰트 로드, Theme 전환) → 원칙 → 기준 → Foundation → Component(이름순). v0는 한글만 쓴다.
- **Component 페이지**: MDX 한 페이지이고 섹션 순서는 고정이다. 렌더되는 예시는 모두 CSF story로 만든다. MDX에는 글과 Canvas만 둔다.
- 원칙과 기준은 저장소의 `.md` 원문을 Markdown 블록으로 불러온다. 상대 링크는 Storybook 경로로 바꾼다.
- **Theme**: addon-themes(`data-theme`)로 바꾸고, globals 채널 구독으로 글 페이지에도 적용한다. 전환 순간에는 transition을 끈다. 기본은 light다.
- **Token 블록**: 5종(색 스케일과 대비비, 텍스트 스타일, radius, 그림자 light/dark, motion)을 직접 만든다. 모두 Token 원본을 import해 그린다.
- **아이콘 페이지**: 이름표의 이름과 Lucide `tags.json`으로 검색하고, 클릭하면 import 문을 복사한다. 가상화 없이 시작한다. 검색 메타데이터는 공개 API가 아니다.
- **가이드**: z-index 페이지에 `scroll-padding-top`, 아이콘 페이지에 사용 가이드, 시작하기에 Theme 전환 시 transition 끄기를 둔다.
- **배포**: Dokploy(`tide-tds.lakegreen.net`)에 Dockerfile(pnpm build → nginx)로 올린다. Autodeploy는 끄고, 릴리스 workflow의 마지막에 API로 배포한다.

### 릴리스 ([버전과 배포 정책 결정](issues/30-grilling-release.md), [ADR 0008](../../decisions/0008-fixed-versions-and-oidc-direct-publish.md))

- **도구**: changesets 3 + `changesets/action`(Version PR) + `@changesets/changelog-github`. 세 패키지를 `fixed`로 묶는다.
- **semver**: 0.x에서는 minor가 breaking이고 patch가 기능 추가와 수정이다. 0.x 동안 `major` changeset은 쓰지 않는다.
  - breaking: 공개 계약(`--tide-*`, Utility class 이름, 텍스트 스타일 이름, Component export·props·값·콜백, 아이콘 이름표 키)을 지우거나 이름·뜻을 바꾸는 것, peer 범위를 올리는 것
  - patch: 시각 값 조정
- **흐름**: changeset이 있는 PR → Version PR → 머지하면 전체 검사 → publish(OIDC, 이 job에만 `id-token: write`) → 실제로 publish되었을 때만 문서 배포. 문서 배포가 실패해도 npm 릴리스는 되돌리지 않는다.
- **CI 규칙**:
  - `packages/*`를 바꾼 PR에 changeset이 없으면 실패한다. 문서와 설정만 바꾼 PR은 empty changeset을 쓴다.
  - 아이콘 이름표에서 키가 빠졌는데 minor changeset이 없으면 실패한다.
- **기타**: prerelease dist-tag는 쓰지 않는다. CHANGELOG는 한글로 쓴다. tag는 패키지마다 만들고, GitHub Release는 릴리스당 하나로 합친다.
- **첫 publish**:
  1. 0.1.0을 로컬에서 2FA로 publish한다.
  2. `access: public`과 패키지 2FA 설정을 확인한다.
  3. 다음 CI 릴리스 직전에 세 패키지에 trusted publisher(직접 publish 허용)를 설정한다.
  4. 48시간 안에 CI 릴리스로 설정을 검증한다.

### 구현 중 확인할 것 (결정 때 확인하지 못한 사실)

- `rewriteRelativeImportExtensions`가 d.ts의 import 경로까지 바꾸는지. smoke test로 확인하고, 바꾸지 않으면 d.ts를 후처리한다.
- Vite 8에서 resolve 조건을 지정하는 옵션의 이름. 문서로 확인한다.
- foundation 테스트에서 Tailwind를 컴파일하는 API. 문서로 확인한다.
- React Aria **hooks**와 함께 사라질 때 애니메이션을 쓸 수 있는지. 어렵다면 바로 사라지게 둬도 v0 완료로 본다.
- `useOverlayPosition`이 트리거를 덮지 않는 위치를 보장하는지(WCAG 2.4.11). Popover 구현 때 확인한다.
- 실제 Windows 고대비 테마에서의 모습. v0 출시 전에 한 번 수동으로 확인한다.
- 라이브러리 API는 모두 설치된 버전의 문서(context7 또는 공식 문서)로 확인하고, 근거 버전을 코드 주석이나 문서에 남긴다.

## Testing Decisions

([테스트 전략 결정](issues/28-grilling-testing.md))

### 좋은 테스트의 기준

- 배포 패키지의 **공개 표면**만 테스트한다. 공개 표면은 Token export, 빌드한 CSS와 그것을 Tailwind로 컴파일한 결과, tailwind-merge 설정, `@tide-tds/components`·`@tide-tds/icons`에서 import한 Component, `pnpm pack` tarball이다. 내부 함수나 variant 맵의 구조는 직접 단언하지 않는다.
- Component 동작은 사용자가 보는 것으로 단언한다. 역할, 이름, ARIA 상태, 포커스 위치, 키보드 결과, 계산된 스타일이 그 대상이다. class 문자열 자체는 단언하지 않는다.
- 동작 단언은 `*.test.tsx`에만 둔다. story의 `play` 함수는 쓰지 않는다.
- jsdom과 happy-dom은 쓰지 않는다. 브라우저 동작은 실제 Chromium에서 본다.

### seam (Vitest projects 4층 + smoke)

| seam                         | 환경                                      | 대상                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ① 패키지 출력 (`unit`)       | Node                                      | foundation: 대비 쌍 전체(light/dark)와 미등록 Semantic Token 검출, 컴파일한 CSS에 기대한 class가 있는지와 없어야 할 class가 없는지(Semantic namespace, 텍스트 스타일 14개, 굵기 5개, radius, shadow, z-index, duration, `focus-ring`/`focus-field`), Tailwind 기본값 제거, `--tide-*` 공개 계약 목록, `cn`·tailwind-merge 충돌 해결. icons: 이름표 키와 실제 export 목록 일치, 이름표에서 키가 빠졌을 때 minor changeset 요구, 대표 아이콘 몇 개를 서버 렌더해 `aria-hidden`/`role="img"`/기본 크기/선 두께 확인 |
| ② Component 동작 (`browser`) | Vitest Browser Mode + Playwright Chromium | 키보드, ARIA, 포커스 이동·가두기·복귀, 제어/비제어, `data-*` 상태, `render` 병합, disabled 처리. 두 번째 instance(`forcedColors: 'active'`, `reducedMotion: 'reduce'`)에서 투명 border·outline이 보이는지, opacity 전환으로 바뀌는지를 계산값으로 단언                                                                                                                                                                                                                                                           |
| ③ story (`storybook`)        | addon-vitest + Chromium                   | 모든 story 렌더 smoke. a11y는 `test: 'error'`, `runOnly`는 `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`. 의도적으로 잘못된 Don't story만 끈다                                                                                                                                                                                                                                                                                                                                                          |
| ④ 배포 tarball (`smoke`)     | private Next.js App Router 앱             | tarball 설치 → `next build`(`"use client"` 경계, prerender) → `tsc`(nodenext d.ts 해석) → publint → CSS import와 `@source` 동작                                                                                                                                                                                                                                                                                                                                                                                  |

### Component 완료 기준 (6개)

Component 하나는 다음을 모두 만족해야 완료다.

1. `*.test.tsx`에 동작 단언이 있다(②).
2. 모든 예시가 story로 있고 a11y 검사를 통과한다(③).
3. 포커스 표시, forced-colors, reduced-motion 계산값을 단언한다(해당하는 경우).
4. MDX 문서가 고정된 섹션 순서를 따른다.
5. 쓰는 Token이 대비 쌍에 등록되어 있다(①).
6. smoke 앱에서 import해 빌드가 통과한다(④).

### CI

- PR마다 `turbo run typecheck test build smoke --affected`를 돌린다. 릴리스 workflow에서는 전체를 다시 돌린 뒤 publish한다.
- 브라우저는 Chromium만 쓴다. `.turbo` 캐시는 GitHub Actions cache에 둔다. 원격 캐시와 nightly job은 없다.

### Prior art

저장소에 아직 코드가 없다. 테스트 방식의 근거는 [테스트 조사](../../research/testing.md)의 실험이다(Vitest 5.1.0 Browser Mode, Playwright 1.65.0 `forcedColors`, axe-core 4.14.0). Next 소비 검증은 [Next.js 소비 흐름 end-to-end 검증](issues/19-prototype-nextjs-consumption.md)의 prototype 절차를 그대로 CI로 옮긴다.

## Out of Scope

- React 외 프레임워크용 Component (ADR 0001)
- 터치 환경을 위한 크기·밀도 옵션. 필요해지면 `@tide-tds/components` 안의 size·밀도 옵션으로 더한다. 별도 mobile 패키지는 두지 않는다 (ADR 0009)
- Storybook 외의 문서 사이트, 영문 문서와 영문 CHANGELOG
- v0 이후 후보 Component: Box/Stack/Flex/Grid, DatePicker/Calendar, DataTable, Combobox 확장(비동기·다중·가상화), Slider, Drawer/Sheet, 토글 Chip
- 오버레이의 top-layer(`<dialog>`, popover API) 전환
- 시각 회귀 테스트, Firefox·WebKit 테스트
- prerelease dist-tag(`next`, `canary`)
- 1.0 출시 시점과 기준
- ThemeProvider와 Theme 전환 유틸 배포(가이드만 제공)
- 웹폰트 파일과 `@font-face` 배포
- DTCG JSON Token 출력
- 특정 서비스 전용 Component

## Further Notes

- **작업 순서**:
  1. 저장소 골격(workspace, turbo, tsconfig, lint/format, CI)
  2. foundation(Token 원본, CSS 생성, ①의 테스트)
  3. icons(이름표, 생성, ①의 테스트)
  4. components 골격(`cn`, union 타입, 빌드, styles CSS)
  5. Storybook과 smoke 앱
  6. Component 1~5단계

  1단계 Component까지 끝나면 0.1.0을 로컬에서 publish한다.

- **문서 언어**: 문서, 주석, CHANGELOG는 한글로 쓴다. 변수명과 함수명은 영문이다.
- **용어**: GLOSSARY의 용어를 쓴다. 특히 색 이름과 Role(행동·의미 Component의 `color` prop), 색 계열, accent 슬롯, 강도(Token의 solid/subtle), 채움 방식(Component `variant`), 표면 층, Elevation, 쌓임 단계, 포커스 표시(ring/field/highlight), 공개 계약, 릴리스를 구분한다.
- **ADR**: 새 결정이 되돌리기 어렵고, 맥락 없이는 놀랍고, 실제로 trade-off가 있었다면 ADR로 남긴다. ADR에는 `근거 원칙:` 줄을 둔다.
- **외부 Component 라이브러리**: 도입이 필요해 보이면 구현을 멈추고 후보와 근거를 들고 사용자에게 묻는다(ADR 0004).
- 원칙별 Do/Don't 예시를 Storybook에서 실제 Component로 보여 주는 작업은 해당 Component가 나온 뒤에 원칙 페이지에 붙인다.
