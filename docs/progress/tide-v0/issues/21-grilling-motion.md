# motion Foundation 결정

Type: grilling
Status: resolved
Blocked by: 12

## Question

전환 애니메이션에 쓸 Token을 정한다. duration 단계와 easing 종류(각각 최소한으로), `prefers-reduced-motion`에서 전환을 끌지 줄일지, Tailwind 표준 namespace에 어떻게 연결할지를 정한다.

### 참고 (다른 티켓에서 넘어온 것)

- 「v0 Foundation 범위 결정」: motion은 v0에 최소한으로 넣는다. 원칙 ① 접근성에 따라 reduced-motion 규칙이 필수다.
- Tailwind 4.3.x에서 duration과 easing의 theme namespace는 기억에 의존하지 말고 context7이나 공식 문서로 확인한다.

## Answer

motion은 **적게, 자주 쓰는 곳일수록 더 적게** 쓴다. 참고 자료는 jakub.kr의 글(「Less is more, more or less」, 「Details that make interfaces feel better」)과 스킬 저장소 `jakubkrehel/skills`(커밋 `659cc4e`, `better-ui`, `better-accessibility`)다. Tailwind 동작은 tailwindcss **4.3.5** npm 패키지 소스(`dist/lib.mjs`, `theme.css`)로 확인했다. 새 ADR은 만들지 않았다.

### 1. Token

| 종류 | 이름 | 값 | 쓰는 곳 |
|---|---|---|---|
| duration | `fast` | 150ms | hover·press, 색 전환, Switch thumb, 오버레이가 사라질 때 |
| duration | `normal` | 300ms | 가끔 쓰는 오버레이가 나타날 때 |
| easing | `out` | `cubic-bezier(0, 0, 0.2, 1)` (Tailwind `ease-out`과 같음) | Tide Component 전부. 나타날 때와 사라질 때 모두 |

- 들어올 때는 길게, 나갈 때는 짧게만 구분한다. Dialog만 따로 느리게 둘 근거가 없다(③ 단순함).
- easing은 하나다. Tailwind의 `ease-in`, `ease-in-out`은 지우지 않고 남겨 앱 코드가 쓸 수 있게 한다.

### 2. Tailwind 노출

- tailwindcss 4.3.5에서 `duration-*` class는 `--transition-duration-*` namespace를 찾고, 없으면 숫자를 ms로 해석한다. 그래서 `--transition-duration-fast`, `--transition-duration-normal`을 등록해 `duration-fast`, `duration-normal`로 쓴다. 숫자 해석(`duration-150`)은 끌 수 없으므로 숫자 간격처럼 그대로 둔다.
- easing namespace는 `--ease-*`다. 기본 `--ease-out`을 그대로 쓴다.
- `--default-transition-duration`(기본 150ms)과 `--default-transition-timing-function`(기본 `cubic-bezier(0.4, 0, 0.2, 1)`)을 각각 `fast`와 `out`으로 지정한다. `transition-colors`처럼 시간을 적지 않은 class가 Tide 기본값을 따르게 하기 위해서다.
- 공개 계약은 ADR 0003에 맞춰 `--tide-duration-fast`, `--tide-duration-normal`, `--tide-ease-out`이다. `fast`, `normal`은 새 이름이므로 생성되는 tailwind-merge 설정에 들어간다.

### 3. 무엇을 움직이는가 (사용 빈도로 나눔)

하루에 수백 번 여닫는 UI에 300ms 애니메이션을 넣으면, 사용자는 1년에 몇 시간을 애니메이션을 기다리는 데 쓴다(jakub.kr 「Less is more」의 macOS 우클릭 메뉴 예). 그래서 자주 쓰는 UI는 바로 반응하게 한다(② 명확함).

| 구분 | Component | 나타날 때 | 사라질 때 |
|---|---|---|---|
| 자주 씀 | Menu, Select·Combobox 목록, Tooltip | 바로(애니메이션 없음) | opacity만, `fast` |
| 가끔 씀 | Popover, Toast | opacity + blur 4px + translate **4px**, `normal` | 같은 조합을 약하게(거리·blur 절반), `fast` |
| 가끔 씀 | Dialog, AlertDialog | opacity + scale 0.96 → 1, `normal`. 큰 면적이라 blur는 넣지 않음 | 같은 조합을 약하게, `fast` |

- Popover는 트리거에서 멀어지는 방향으로, Toast는 아래에서 위로 움직인다.
- 구현은 CSS transition, `@starting-style`, `transition-behavior: allow-discrete`로 한다. 지원하지 않는 브라우저에서는 그냥 바로 나타나고 사라진다(jakub 문서 기준 `@starting-style`·discrete transition은 Baseline 2024, `overlay` 속성은 Chromium 전용).
- 사라질 때 애니메이션을 React Aria **hooks**와 함께 쓸 수 있는지는 확인하지 못했다. React Aria 문서의 `data-exiting`은 React Aria Components 기준이다. spec 단계에서 확인하고, 어렵다면 바로 사라지게 둬도 v0 완료로 본다.
- 이동 거리는 24번에서 4·8·12px를 비교해 **4px**로 정했다(jakub 값 12px는 Popover에 컸다). blur 4px와 Dialog scale 0.96은 그대로다.
- 넣지 않는 것: Accordion 높이 애니메이션(펼치면 바로 보임), 페이지 전환.

### 4. hover와 press

- 반복되는 목록 항목(Menu 항목, Select 옵션, Table 행, Tabs 항목)은 hover 배경이 **바로** 바뀐다. transition이 없다. Menu 항목과 Select·Combobox 옵션의 hover는 키보드 위치 표시(highlight, primary subtle)와 같은 모양이다(20번 보완).
- 혼자 있는 조작 요소(Button, IconButton, Link, Checkbox, Switch, Input 테두리)는 `transition-colors` + `fast`.
- Button과 IconButton은 누르면 `scale 0.96`으로 줄어든다(`enabled:active:scale-[0.96]`, `fast`, `out`). disabled는 줄어들지 않는다. 끄고 싶을 때를 위해 boolean prop `static`을 둔다. 이름이 공통 API 규칙(DOM 이름 우선, ADR 0005)과 맞는지는 Button spec에서 다시 본다.
- tailwindcss 4.3.5의 `hover:` variant는 `@media (hover: hover)` 안에서 컴파일된다. 터치 기기에서 탭한 뒤 hover 스타일이 눌린 채로 남지 않으므로 따로 처리하지 않는다.

### 5. 작성 규칙

- 상태 변화(hover, toggle, 열기·닫기)는 CSS transition으로 한다. 중간에 반대로 바뀌어도 그 자리에서 되돌아가기 때문이다. keyframe은 Spinner·Skeleton처럼 계속 도는 것에만 쓴다.
- `transition-all`은 쓰지 않는다. `transition-colors`, `transition-[opacity,translate,scale]`처럼 속성을 적는다.
- 애니메이션이 유일한 신호가 되면 안 된다. 상태가 바뀌면 색, 아이콘, 라벨 중 하나가 함께 바뀐다.

### 6. `prefers-reduced-motion`

- 이동, 확대·축소, blur(오버레이 등장, press 축소 포함)는 `motion-safe:`일 때만 쓴다.
- 줄이기를 원하는 사용자에게는 그 자리를 opacity 전환(`fast`)으로 바꾼다. 바로 사라지게 하지 않는다.
- 유지: Spinner 회전, Progress, hover 색 변화, 포커스 표시.
- 멈춤: Skeleton 깜빡임. 반복 장식이고 회색 블록만으로도 로딩 중임을 알 수 있다.
- WCAG 2.3.3(Animation from Interactions)은 AAA라 최소 기준은 아니지만, 원칙 ① 접근성에 따라 v0 규칙으로 둔다.

### 7. Theme 전환

Theme을 바꾸는 순간 색 transition이 한꺼번에 일어나 화면이 번져 보인다. Tide는 ThemeProvider를 두지 않으므로(`[data-theme]`) 유틸을 배포하지 않는다. 대신 Storybook 문서에 가이드를 둔다: 전환 직전에 `transition: none !important` 스타일을 넣고, 강제로 스타일을 반영한 뒤, 다음 프레임에 뺀다. next-themes는 `disableTransitionOnChange`로 같은 일을 한다. Storybook 자체의 Theme 전환에도 같은 방법을 쓴다.

### 다른 티켓에 주는 영향

- 「radius·elevation·focus ring 형태 결정」(20번): 같은 자료를 참고해 보완했다(목록 안 항목 radius `sm`과 목록 padding, light raised의 투명 border).
- 「그림자·포커스 표시·motion 시각 비교」(24번): 오버레이 등장·퇴장 값(blur 4px, translate 12px, scale 0.96)과 press 축소를 함께 확인한다.
- 지도의 「Storybook 문서 구성」: Theme 전환 가이드 페이지가 들어간다.
- Toast spec 참고(motion은 아니지만 같은 자료에서 나옴): 자동으로 닫히는 Toast는 5초 이상 보이고, hover나 focus 중에는 타이머가 멈춘다. 액션이나 오류가 담긴 Toast는 자동으로 닫지 않는다(WCAG 2.2.1, 2.2.2).

## Comments

- 2026-11-09 grilling 진행. 처음에는 duration 3단계(150/250/350ms), easing 3개, 모든 오버레이 등장 애니메이션을 제안했다. 사용자가 jakub.kr의 스킬과 글을 참고하라고 해서 다시 제안했다. duration 2단계, easing 1개, 사용 빈도에 따라 오버레이를 나누는 규칙, press 축소, 목록 항목 hover를 바로 바꾸는 규칙으로 바꿨고, 사용자가 추천안대로 확정했다. 같은 자료로 20번의 radius 중첩 규칙과 forced-colors 경계도 보완했다.
- 2026-11-09 「그림자·포커스 표시·motion 시각 비교」(24번)에서 값을 확정해 Answer를 고쳤다. Popover·Toast 이동 거리 12px → 4px.
