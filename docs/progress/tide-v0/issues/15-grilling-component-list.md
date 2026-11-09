# v0 Component 목록과 우선순위 결정

Type: grilling
Status: resolved
Blocked by: 06, 07

## Question

v0에 넣을 Component 목록을 정하고, 구현 우선순위와 의존 순서를 정한다(예: Button 다음에 IconButton). 범위에서 뺀 Component도 이유와 함께 기록한다.

### 참고 (다른 티켓에서 넘어온 것)

- 「접근성 동작 구현 방식 결정」: 외부 컴포넌트 라이브러리는 쓰지 않는 것이 기본이다(ADR 0004). DatePicker처럼 외부 라이브러리가 필요해 보이는 Component를 v0에 넣으려면 먼저 사용자에게 묻는다. 네이티브 HTML로 완결되는 Component(Button, Input, Checkbox 등)와 React Aria hook이 필요한 위젯을 구분해 두면 우선순위를 정하기 쉽다.
- 「Component 공통 API 규칙 결정」: 아이콘만 있는 버튼은 `size` 값이 아니라 별도 `IconButton`으로 만들고, `aria-label`을 타입상 필수로 둔다. size는 4단계(`xs | sm | md | lg`)이고 Component마다 필요한 단계만 고른다.

## Answer

v0 Component는 **33개**다. 단계는 구현 순서이고 v0 포함 조건이 아니다. 33개가 모두 끝나야 v0가 완료된다. 단계마다 미리 publish할지(0.x 중간 릴리스)는 지도의 "버전과 배포 정책"에서 정한다. 아래 React Aria 패키지 버전은 2026-11-09에 npm에서 확인했다(`@react-aria/toast` 3.1.1, `@react-aria/tag` 3.9.1, `@react-aria/combobox` 3.16.1, `@react-aria/disclosure` 3.2.1).

### 우선순위 기준

먼저 **의존 순서**로 단계를 나누고, 같은 단계 안에서는 사용 빈도 순으로 둔다. 2단계에서 `variant × color × size`, `cn`, `render` 규칙을 먼저 검증한다. hook 위젯은 z-index와 portal 문제가 걸려 있어서 뒤로 미룬다. 화살표(→)는 앞의 Component가 뒤의 Component 안에서 쓰이거나, 뒤의 Component가 앞의 규칙을 그대로 따른다는 뜻이다.

| 단계          | Component                                                                                    | 구현 방식                    | 의존                                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1 기반        | VisuallyHidden, Typography, Spinner                                                          | 네이티브                     | IconButton과 Button 로딩 상태가 Spinner와 VisuallyHidden을 쓴다                                                                           |
| 2 액션·폼     | Button → IconButton → Link                                                                   | 네이티브, `render`           | IconButton은 Button 규칙 위에 만들고 `aria-label`이 필수다                                                                                |
| 2 액션·폼     | Field → Input → Textarea → Checkbox → Radio → Switch                                         | 네이티브                     | Field가 label, 설명, 에러 메시지와 `aria-*` 연결을 맡는다                                                                                 |
| 3 표시·피드백 | Badge, Alert, Card, Separator, Avatar, Skeleton, Progress, Table, Breadcrumb, Pagination     | 네이티브                     | Pagination은 IconButton을 쓴다                                                                                                            |
| 4 hook 위젯   | Popover → Tooltip → Menu → Select → Combobox → Dialog → AlertDialog → Tabs → Accordion → Tag | React Aria hooks             | Menu, Select, Combobox는 Popover 위에 만든다. Select와 Combobox는 Field를 쓴다. AlertDialog는 Dialog 위에 만든다. Tag는 IconButton을 쓴다 |
| 5             | Toast                                                                                        | React Aria hooks(`useToast`) | IconButton, Alert의 스타일, 오버레이 층을 쓴다                                                                                            |

### Component별 범위

- **Typography**: Heading과 Text를 하나로 합쳤다. `variant` 값은 텍스트 스타일 이름과 같다(`variant="body-md"`는 `text-body-md`와 같다). 스타일마다 기본 요소가 정해져 있다(아래 표). heading·display 스타일은 `level`(1~6)을 선택형으로 받는다. 그래서 "h2처럼 보이는 h3"는 `<Typography variant="heading-lg" level={3}>`처럼 쓴다. 다른 요소로 바꿀 때는 `render`를 쓴다(예: `render={<label />}`). heading·display 스타일은 항상 `<h*>`로 렌더되므로 "보이기만 하는 제목"이 생기지 않는다(원칙 ①).

  | 스타일                                                    | 기본 요소                 |
  | --------------------------------------------------------- | ------------------------- |
  | `display-lg`, `display-md`, `heading-xl`                  | `h1`                      |
  | `heading-lg` / `heading-md` / `heading-sm` / `heading-xs` | `h2` / `h3` / `h4` / `h5` |
  | `body-lg`, `body-md`, `body-sm`, `caption`                | `p`                       |
  | `label-lg`, `label-md`, `label-sm`                        | `span`                    |

- **Field**: Input, Textarea, Select, Combobox, Checkbox 그룹에 label, 설명, 에러 메시지를 붙인다. `id`, `aria-describedby`, `aria-invalid`도 자동으로 연결한다. label이 없는 입력창을 쓰기 어렵게 만드는 장치다(원칙 ①).
- **Select**: React Aria `useSelect`로 직접 만든다(ADR 0004).
- **Combobox**: 클라이언트에서 옵션을 필터링하고 단일 선택만 지원한다(`useComboBox`). 비동기 로딩, 다중 선택, 가상화, 자유 입력값 허용은 v0에 넣지 않는다.
- **Table**: 시맨틱 `<table>`에 스타일만 입힌다(Table, Head, Row, Cell). 정렬, 행 선택, 가상화는 없다. 네이티브로 완결되므로 hook을 쓰지 않는다.
- **Tag**: 라벨을 보여주고, 필요하면 x 버튼으로 지운다. 묶음의 키보드 탐색과 Delete 키 제거는 `useTagGroup`이 처리한다. 상호작용이 없는 상태 표시는 Badge가 맡는다.
- **Badge**: 상태 표시 라벨이다. 상호작용이 없다.
- **AlertDialog**: Dialog 위에 얇게 만든 변형이다. 삭제 확인처럼 위험한 동작에 쓴다.
- **Card**: 표면 층 `surface`를 보여주는 스타일 컨테이너다.
- **Toast**: 큐, 영역(region), 자동 닫힘, 포커스 이동을 `useToast`로 처리한다. 상태 관리가 가장 커서 마지막 단계에 둔다.
- **VisuallyHidden**: 스크린리더에만 보이는 텍스트다. IconButton 등이 내부에서 쓴다.

### v0에서 뺀 Component

모두 **v0 이후 후보**다. 영구 제외한 것은 없다.

| Component                                | 뺀 이유                                                                                                                                                                                                        |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Box, Stack, Flex, Grid                   | Tailwind Utility class와 할 일이 겹친다. 사용자가 "일단 빼자"고 해서 후보로 남긴다                                                                                                                             |
| DatePicker, Calendar                     | ADR 0004에 따라 외부 라이브러리를 먼저 검토해야 한다. hook으로 만들어도 Calendar 그리드, 한글 로케일, `@internationalized/date`까지 범위가 크다. 그동안 앱은 `<input type="date">`를 Input 스타일로 쓸 수 있다 |
| DataTable(정렬, 선택, 그리드 탐색)       | spec 하나로 끝나지 않을 만큼 크다. v0는 정적 Table만 둔다                                                                                                                                                      |
| Combobox 확장(비동기, 다중 선택, 가상화) | 그것만으로 spec 하나가 된다                                                                                                                                                                                    |
| Slider                                   | 범용 웹 앱에서 쓰는 빈도가 낮다                                                                                                                                                                                |
| Drawer, Sheet                            | Dialog의 위치 변형으로 나중에 추가할 수 있다                                                                                                                                                                   |
| 토글 Chip(필터 칩)                       | 사실상 toggle button이다. v0의 Tag는 제거할 수 있는 형태만 둔다                                                                                                                                                |

### 다른 문서에 준 영향

- **GLOSSARY**: Variant를 "Component마다 정의되는 주된 스타일 축"으로 다시 정의했다. 새 용어 "채움 방식"(`solid | subtle | outline | ghost`)을 추가했다. Tag와 Badge도 구분해 적었다.
- **ADR 0005 정정**: `render` 적용 범위를 "루트가 상호작용 요소 하나인 Component"에서 "루트가 DOM 요소 하나인 Component"로 넓혔다. Typography가 여기에 해당한다.
- **「Component 공통 API 규칙 결정」**: 공통 union 타입 `Variant`는 채움 방식 값 집합을 뜻하므로 이름을 바꾼다(예: `FillVariant`, 확정은 spec 단계에서). `render` 범위도 위처럼 넓어졌다.
- **「타이포그래피 Foundation 결정」 정정**: display 2개와 `heading-xs`를 추가해 텍스트 스타일이 11개에서 **14개**가 됐다. Primitive 크기는 48, 56을 더해 10개가 됐다. 상세는 그 티켓의 정정 절에 있다.
- **「아이콘 전략 결정」**: Component 내부에 필요한 아이콘은 다음과 같다. Checkbox 체크와 indeterminate, Select·Combobox·Accordion의 chevron, Dialog·Toast·Alert·Tag의 닫기(x), Pagination 화살표와 Breadcrumb 구분자, Alert·Toast의 역할별 상태 아이콘(info, success, warning, danger), Avatar fallback(사람).

## Comments

- 2026-11-09 grilling 진행. 처음에는 Box, Stack, Text, Heading, Combobox, Tag/Chip을 빼자고 추천했다. 사용자가 이 중 Text, Heading, Combobox, Tag를 넣었다. Box와 Stack은 한 번 넣었다가 다시 "일단 빼자"로 바꿨다.
- 처음에는 Heading을 따로 두고 `level`을 필수로 받자고 추천했다. 사용자가 MUI 방식대로 Typography 하나에 `variant`와 기본 요소 매핑을 두자고 했다. 그래서 GLOSSARY의 Variant 정의를 넓혔다. `level`은 선택형으로 바꿨다.
- 텍스트 스타일 이름을 두고 여러 번 오갔다. 사용자는 처음에 `display1`, `h1`~`h5`, `body1`~`body3` 같은 숫자 이름을 제안했다. 이후 기존 접미사 규칙(`display-lg`, `heading-xl` 등)으로 돌아왔다. 대신 heading은 5단계로 늘렸고(`heading-xs` 추가), display 2개를 새로 넣었다. label 3단계는 Button·Input size 표에 묶여 있어서 유지했다.
