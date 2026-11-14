# Tide Design System

`#3183f5`(blue)를 primary로 삼는 범용 디자인 시스템. Principle, Foundation, Component 세 층(Layer)으로 이루어진다.

## 구조

**Layer (층)**:
Tide를 이루는 세 갈래인 Principle, Foundation, Component 중 하나. 아래 층이 위 층의 근거가 된다.
_Avoid_: 레벨, 카테고리

**Principle (원칙)**:
Tide의 모든 결정이 따르는 가치 판단 문장. 예: "명확함이 화려함보다 우선한다."
_Avoid_: 가이드라인, 철학, 규칙

**Standard (기준)**:
통과 여부를 측정할 수 있는 규칙. 예: WCAG 2.2 AA 대비 4.5:1. Principle은 가치 판단이고 Standard는 검증할 수 있는 규칙이다.
_Avoid_: 원칙(Principle과 혼동), 가이드

**Foundation (파운데이션)**:
컴포넌트가 가져다 쓰는 시각 언어. 컬러, 타이포그래피, 간격 등이 여기에 속한다.
_Avoid_: 스타일, 테마, 베이스

**Token (토큰)**:
Foundation을 코드로 표현한, 이름이 붙은 값 하나. Foundation 자체와는 다른 개념이다.
_Avoid_: 변수, 디자인 변수

**Component (컴포넌트)**:
Foundation을 조합해 만든, 재사용할 수 있는 UI 단위.
_Avoid_: 위젯, 엘리먼트

**접근성 동작 (Accessibility behavior)**:
Component가 키보드, 포커스, 보조기술에 반응하는 방식. 예: Dialog를 열면 포커스가 안으로 들어가고 닫으면 원래 자리로 돌아간다. 생김새(시각 표현)와 구분한다.
_Avoid_: a11y 로직, 인터랙션(시각 효과와 혼동)

## Token 종류

**Primitive Token**:
용도와 무관하게 값 자체를 가리키는 Token. 색 계열 이름은 용도가 아니라 색상으로 짓는다. 예: `blue-500`, `red-600`, spacing `24`.
_Avoid_: 원시값, base token, global token

**Semantic Token**:
용도를 이름으로 가지는 Token. 값은 Primitive Token을 참조하고, 테마가 바뀌면 참조 대상만 바뀐다. 예: `bg-primary-solid`, `text-muted`.
_Avoid_: alias token, 의미 토큰

**Utility class**:
Token에 연결된 Tailwind 클래스. 사용자가 `className`에 직접 쓴다. 예: `w-24`, `bg-primary-solid`.
_Avoid_: 헬퍼 클래스, 스타일 클래스

**Role (역할)**:
Semantic Token이 나타내는 의미 범주. Tide Role은 `neutral`, `primary`, `success`, `warning`, `danger`, `info` 여섯 가지다. 같은 Role의 Token은 같은 Primitive 계열을 참조한다. Role은 색 계열 하나에 덮어쓸 값을 얹은 별칭이다. 예: `primary`는 `blue`와 같고, `neutral`은 `gray`에서 dark subtle·글자·테두리를 덮어쓴 다른 색이다. 행동·의미 Component(Button, IconButton, Link 등)의 `color` prop은 Role만 받는다. 앱은 `RoleRegistry`를 module augmentation해서 자기 Role(예: `brand`)을 더한다. 앱 Role에는 Role Token(`bg-brand-solid`)이 없고 accent 슬롯으로만 칠한다.
_Avoid_: 컬러 그룹, intent, tone

**색 이름 (Color)**:
`data-color` 속성으로 고르는 이름. Role과 색 계열 둘로 나뉜다. Role은 뜻이 있는 색이라 행동·의미 Component가 쓰고, 색 계열(`blue`, `gray`, `green`, `amber`, `red`, `cyan`과 장식 전용 `purple`, `mint`)은 뜻이 없는 색이라 장식·분류 Component(Badge, Tag, Avatar 등)가 쓴다. Badge는 상태 라벨로도 쓰여 Role도 받는다(ADR 0017). Avatar·Tag는 색 계열만 받는다(티켓 21·33). 타입은 `Color = Role | ColorFamilyName`이고, 앱은 `RoleRegistry`나 `ColorFamilyRegistry`를 module augmentation해서 이름을 더한다.
_Avoid_: 팔레트, color scheme(`color-scheme` CSS와 혼동), tone

**accent 슬롯 (Accent slot)**:
`data-color`가 고른 색 이름(Role이나 색 계열)의 값을 받는 자리. `--tide-accent-<슬롯>` 변수 12개(`solid`/`-hover`/`-active`, `subtle`/`-hover`/`-active`, `faint`, `text`, `border`, `subtle-border`, `on-solid`, `on-subtle`)이고, `bg-accent-solid`, `text-accent`, `text-accent-on-subtle`, `border-accent-subtle` 같은 Utility class로 쓴다. `text`는 바탕 없이 쓰는 색 글자, `on-subtle`은 `subtle`·`faint` 바탕 위 글자다(ADR 0022). `data-color`가 없으면 `primary` 값을 받는다. 색 계열도 같은 슬롯 이름으로 변수 묶음(`--tide-blue-solid` 등)을 가진다. 앱 Role과 앱 장식 계열은 `tide-color build`가 만든 `[data-color]` 규칙으로 이 자리에 값을 꽂는다.
_Avoid_: accent color(색 하나로 오해), 강조색, theme color

**강도 (Emphasis)**:
같은 Role 안에서 배경색이 얼마나 강한지를 나타내는 구분. `solid`(진한 배경, 흰 글자), `subtle`(색이 보이는 파스텔 배경, 같은 색상의 아주 진한 글자, 한 톤 진한 테두리), `faint`(채도를 더 뺀 가장 옅은 배경, subtle과 같은 글자) 세 가지다(ADR 0022). 이름에 항상 적고 생략하지 않는다.
_Avoid_: variant(Component 스타일 축과 혼동), weight, tone

**덮기 (Overlay state)**:
호버·클릭 상태 색을 만드는 방법. 상태마다 다른 단계를 고르지 않고, 기본 색 위에 정해진 색을 n% 덮는다. 예: `subtle-hover` = light 100 + gray-950 4%, `solid-hover` = 600 + black 14%. 색이 없는 바탕의 호버는 `bg-hover`·`bg-active`(light gray-950 4%·8%, dark white 6%·10%)다. 덮은 값은 빌드할 때 hex로 계산해 Token에 넣는다(ADR 0022).
_Avoid_: tint, shade(방향이 정해진 말과 혼동), 오버레이(`bg-overlay` 막과 혼동)

**표면 층 (Surface level)**:
요소가 놓이는 바닥의 높이. `canvas`(페이지 배경), `surface`(카드, 패널), `raised`(popover, dropdown, modal) 세 가지다.
_Avoid_: elevation(그림자 형태 Foundation과 혼동), layer(Layer와 혼동)

**Elevation**:
그림자로 나타내는 깊이 단계. `sm`, `md`, `lg` 세 단계이고 `raised` 표면 층에서만 쓴다. 표면 층은 "어느 바닥에 놓이는가", Elevation은 "그 바닥이 얼마나 떠 보이는가"다.
_Avoid_: 표면 층, z-index(겹치는 순서와 혼동)

**쌓임 단계 (Stacking tier)**:
겹치는 요소가 화면 앞뒤로 놓이는 순서의 구분. 뒤에서부터 `sticky`, `modal`, `popover`, `toast`, `tooltip`이다. 표면 층은 "어느 바닥 위에 놓이는가", Elevation은 "얼마나 떠 보이는가", 쌓임 단계는 "무엇이 앞에 그려지는가"다.
_Avoid_: 층(Layer와 혼동), level(표면 층과 혼동), elevation(그림자와 혼동)

**포커스 표시 (Focus indicator)**:
포커스가 어느 요소에 있는지 보여주는 시각 표시. 세 종류다. **ring**은 요소 바깥에 간격을 두고 선을 그린다. **field**는 입력창의 테두리 색과 두께를 바꾼다. **highlight**는 목록 안 항목(Menu 항목, Select 옵션)의 배경과 글자색을 바꾼다. 입력창은 field, 목록 안 항목은 highlight, 나머지는 ring을 쓴다.
_Avoid_: focus ring(ring 한 종류만 가리킬 때만 씀), 포커스 테두리

**대비 쌍 (Contrast pair)**:
실제로 함께 쓰는 전경 Token과 배경 Token의 짝. 대비 검사는 모든 조합이 아니라 등록된 대비 쌍만 대상으로 한다. 쌍마다 하한 등급이 하나 있다.
_Avoid_: 색 조합, 컬러 페어

**하한 등급 (Contrast tier)**:
대비 쌍이 넘어야 하는 대비비 하한의 구분. **정지 상태 글자** 4.5:1, **일시 상태 글자**(hover·누름 배경 위)와 **solid 위 글자** 4.0:1, **UI 요소**(경계, 포커스 표시, thumb) 3:1 세 가지다(ADR 0023). 한 짝을 여러 쓰임이 쓰면 가장 엄한 등급을 적는다. 코드에서는 `minRatio`(`ContrastMinRatio`)다.
_Avoid_: 대비 레벨, AA·AAA(WCAG 적합 수준과 혼동)

**Theme**:
Semantic Token이 어떤 Primitive Token을 참조할지 정한 묶음. 예: light, dark.
_Avoid_: 모드, 스킨

**텍스트 스타일 (Text style)**:
글자 크기, 행간, 굵기를 용도에 맞게 하나로 묶은 Semantic Token. `display`, `heading`, `body`, `label`, `caption` 다섯 범주가 있다. 예: `text-body-md`, `text-label-sm`. `display`는 랜딩 페이지 같은 곳에 쓰는 가장 큰 제목이다. `label`은 버튼이나 입력창처럼 한 줄로 쓰는 UI 텍스트이고, `body`는 읽는 글이다.
_Avoid_: 타이포 토큰, font style, 텍스트 크기(크기 하나만 뜻하는 Primitive와 혼동)

## Component API

**Variant**:
Component마다 정의되는 주된 스타일 축. 값 집합은 Component 종류마다 다르다. 예를 들어 Button은 채움 방식을, Typography는 텍스트 스타일을 값으로 쓴다. 값은 새로 만들지 않고 Foundation에 이미 있는 이름을 쓴다. 색은 Variant가 아니라 색 이름(Color)으로 고른다.
_Avoid_: kind, appearance, 강도(Token 쪽 개념과 혼동)

**Tide props (OwnProps)**:
Component가 네이티브 HTML·SVG 속성 위에 더하거나 뜻을 바꾼 props. 공개 Props마다 `XxxOwnProps`로 따로 공개하고, `XxxProps`는 그것과 네이티브 props를 합친 것이다. Component JSDoc에 이름 목록이 있다(ADR 0031).
_Avoid_: custom props, 전용 props, htmlProps

**채움 방식 (Fill)**:
Button류 Component의 Variant 값 집합. `solid`, `subtle`, `outline`, `ghost` 네 가지다. `solid`와 `subtle`은 강도와 이름이 같고, `outline`과 `ghost`는 Component에만 있다.
_Avoid_: kind, appearance, 강도(Token 쪽 개념과 혼동)

**Badge (배지)**:
상태나 분류를 보여주는 짧은 라벨. 사용자와 상호작용하지 않는다. 상태는 Role, 분류는 색 계열 이름으로 색을 고른다(ADR 0017).
_Avoid_: lozenge, label(텍스트 스타일 label과 혼동)

**Alert (알림)**:
화면 안에 머무는 상태 알림 표면. 상태 아이콘, 제목, 본문, 닫기 버튼으로 이뤄지고 Role로 색을 고른다. 기본은 정적 표시이고, 새로 나타나 알려야 할 때만 live region 역할(`alert`·`status`)을 준다. 스스로 사라지는 알림은 Toast, 확인을 받아야 하는 알림은 AlertDialog다.
_Avoid_: Banner, Callout, Notice, SectionMessage

**Avatar (아바타)**:
사용자 이미지를 보여주는 원. 이미지가 없거나 불러오지 못하면 사람 모양 fallback 아이콘이 보인다. fallback 배경은 뜻이 없는 장식 색이라 색 계열 이름으로만 고른다(Role은 받지 않는다). 누르는 동작이 없고, 눌러야 하면 Button이나 IconButton 안에 넣는다.
_Avoid_: ProfileImage, UserIcon(아이콘 이름과 혼동)

**Skeleton (스켈레톤)**:
내용이 오기 전 그 자리를 회색 모양(글 한 줄, 사각형, 원)으로 표시하는 장식. 스크린 리더에는 읽히지 않고, 움직임 줄이기에서는 깜빡임이 멈춘다. 불러오는 중이라는 사실은 앱이 영역의 `aria-busy`나 문구로 알린다.
_Avoid_: Placeholder(input `placeholder`와 혼동), Shimmer, LoadingBox

**Progress (진행 막대)**:
전체 양을 아는 작업이 얼마나 진행됐는지 보여 주는 막대(`role="progressbar"`). 값을 모르는 기다림은 Spinner이고, 정해진 범위 안의 측정값(디스크 사용량 등)은 진행이 아니라 meter다. 진행 상태는 뜻이 있는 표시라 Role로 색을 고른다.
_Avoid_: ProgressBar, LoadingBar, Meter

**Table (표)**:
행과 열로 된 데이터를 시맨틱 `<table>`로 보여 주는 Component 묶음(`Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`). 칸은 같은 열의 머리 칸과 같은 행의 행 머리에 이어져 읽힌다. 정렬·행 선택·키보드 칸 이동이 없어 grid 위젯이 아니다. 화면 배치에는 쓰지 않는다. 머리 칸 부분 이름은 `<thead>`(`TableHead`)와 헷갈리지 않게 `TableHeaderCell`(`<th>`)이다.
_Avoid_: DataTable(정렬·선택이 있는 v0 이후 후보), Grid, DataGrid

**Breadcrumb (이동 경로)**:
현재 페이지가 사이트 구조에서 어디에 있는지 상위 페이지 링크로 보여 주는 탐색 영역(`Breadcrumb`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbCurrent`). 마지막 항목은 링크가 아닌 현재 페이지이고 `aria-current="page"`로 읽힌다. 항목 사이 구분자는 장식용 아이콘이라 읽히지 않는다. 지나온 순서(방문 기록)가 아니라 구조상의 위치다.
_Avoid_: 빵 부스러기, Path, Trail, 방문 기록

**Pagination (페이지 이동)**:
여러 쪽으로 나눈 목록에서 쪽 사이를 이동하는 탐색 영역(`Pagination`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`). 쪽 번호는 링크(Button 모양)이고 현재 쪽은 `aria-current="page"`, 이전/다음은 이름 있는 IconButton이다. 어떤 번호를 보일지는 앱이 정한다. 단계를 차례로 진행하는 표시(Stepper)와 다르다.
_Avoid_: Pager, Paginator, Stepper

**오버레이 (Overlay)**:
페이지 흐름 밖에 떠서 다른 내용 위에 그려지는 요소(Popover, Tooltip, Menu·Select·Combobox 목록, Dialog, Toast). `document.body`로 portal하고 쌓임 단계 class(`z-popover` 등)로 쌓으며 top-layer(`<dialog>`, popover API)는 쓰지 않는다. portal·위치·등장/퇴장 motion·DOM에서 빼는 시점은 오버레이 공통 부분(`overlay.tsx`, `overlay-style.ts`)이 맡고, 역할(dialog, menu, listbox, tooltip)은 각 Component가 정한다.
_Avoid_: 레이어(Layer와 혼동), 모달(바깥을 막는 성질 하나만 가리킴)

**Popover (팝오버)**:
트리거 옆에 짧은 내용을 띄우는 오버레이(`Popover`, `PopoverTrigger`, `PopoverContent`). 내용은 `dialog` 역할이고 버튼·입력 같은 조작 요소를 담을 수 있다. 누르면 열리고 Esc·바깥 누름으로 닫히며 포커스는 트리거로 돌아온다. 동작 목록은 Menu, 설명 한 줄은 Tooltip, 확인이 필요한 내용은 Dialog다.
_Avoid_: Dropdown(Menu·Select와 혼동), Popup, Flyout

**Dialog (다이얼로그)**:
화면 가운데에 뜨는 모달 오버레이(`Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`). 내용은 `dialog` 역할이고 반투명 막(backdrop, `bg-overlay`)이 뒤를 가린다. 열린 동안 바깥은 `inert`이고 페이지 스크롤이 잠기며 Tab은 안에서 돈다. Esc·닫기 버튼·막 누름으로 닫히고 포커스는 열기 전 요소로 돌아온다. 트리거 옆에 잠깐 띄우는 내용은 Popover다.
_Avoid_: Modal(바깥을 막는 성질 하나만 가리킴), Sheet, Lightbox

**AlertDialog (알림 다이얼로그)**:
삭제처럼 되돌릴 수 없는 동작을 확인받는 Dialog의 얇은 변형(`AlertDialog`, 부분 Component는 Dialog의 것). 내용은 `alertdialog` 역할이고 설명이 알릴 내용으로 읽힌다. 응답을 받아야 하므로 막 누름으로 닫히지 않고 닫기 버튼이 없으며, 열리면 첫 버튼(취소)에 포커스가 온다. 위험한 동작 버튼은 `color="danger"`다. 응답이 필요 없는 알림은 Alert·Toast다.
_Avoid_: Confirm(브라우저 `confirm()`과 혼동), Alert(화면 안 알림 Component)

**Menu (메뉴)**:
트리거를 누르면 동작 목록을 띄우는 오버레이(`Menu`, `MenuTrigger`, `MenuContent`, `MenuItem`, `MenuSection`). 목록은 `menu`, 항목은 `menuitem` 역할이고 화살표로 옮겨 다니며 Enter로 실행한다. 지금 위치는 highlight로 보인다. 실행하면 닫히고 포커스는 트리거로 돌아온다. 값 하나를 골라 보여 주고 폼에 넣는 것은 Select다.
_Avoid_: Dropdown(Select와 혼동), Context menu(오른쪽 클릭 메뉴는 v0에 없음), Action sheet

**Select (선택 상자)**:
값 하나를 고르는 입력(`Select`, `SelectItem`, `SelectSection`). 트리거는 입력창 모양의 버튼이고 고른 옵션이 보이며, 누르면 `listbox` 역할 목록이 열린다. 옵션(`option`)의 `value`가 고른 값이고 숨은 `<select>`로 폼에 제출된다. Field 안에서 label·설명·오류가 연결된다. 동작을 실행하는 목록은 Menu, 글자를 쳐서 거르는 것은 Combobox다.
_Avoid_: Dropdown(Menu와 혼동), Picker, 네이티브 select(모양을 Tide가 그리지 못함)

**Combobox (콤보박스)**:
글자를 쳐서 옵션을 거르고 하나를 고르는 입력(`Combobox`, `ComboboxItem`, `ComboboxSection`). 입력은 `combobox` 역할의 텍스트 입력이고 치면 친 글자가 들어 있는 옵션만 남은 `listbox`가 열린다. 포커스는 입력에 머물고 목록 안 위치는 가상 포커스(`aria-activedescendant`)다. 옵션의 `value`가 고른 값이고 숨은 input으로 폼에 제출되며, 목록 밖 글자는 값이 되지 않는다(자유 입력 없음). 옵션 몇 개 중 고르는 것은 Select다.
_Avoid_: Autocomplete(자유 입력을 받는 것으로 읽힘), Typeahead(Menu·Select의 글자 이동과 혼동), Search(검색 결과 화면과 혼동)

**Tooltip (툴팁)**:
트리거에 짧은 설명 한 줄을 붙이는 오버레이(`Tooltip`, `TooltipTrigger`, `TooltipContent`). 설명은 `tooltip` 역할이고 열린 동안 트리거의 `aria-describedby`가 가리킨다. 마우스를 올리면 잠깐 뒤에, 키보드 포커스면 바로 열리고 Esc·포커스 이탈·포인터 이탈로 닫힌다. 포커스를 받지 않고 조작 요소를 담지 않는다. 이름(`aria-label`)이 아니라 설명이다. 조작 요소가 필요하면 Popover다.
_Avoid_: Hint, Title 속성(브라우저 기본 툴팁), Popover

**Tabs (탭)**:
같은 영역에서 여러 패널 중 하나를 골라 보여 주는 묶음(`Tabs`, `TabList`, `Tab`, `TabPanel`). 탭 목록은 `tablist`, 탭은 `tab`, 내용은 `tabpanel` 역할이고 탭과 패널은 같은 `value`로 이어진다. 화살표로 탭을 옮기며 기본은 옮기면 바로 고른다(자동 활성화). 고른 탭은 글자색과 막대(고른 표시)로 보이고, 고른 탭의 패널만 보인다. 여러 묶음을 함께 펼치는 것은 Accordion, 다른 페이지로 가는 메뉴는 링크 목록이다.
_Avoid_: Segmented control(값을 고르는 입력과 혼동), Tab bar(앱 하단 내비게이션과 혼동), 탭 순서(키보드 Tab 이동과 혼동하므로 「탭」은 이 Component, 「Tab」은 키)

**Accordion (아코디언)**:
제목을 눌러 내용을 펼치고 접는 영역 묶음(`Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionPanel`). 트리거는 제목 요소 안의 버튼이고 `aria-expanded`로 펼침 상태를 알리며, 패널은 같은 항목의 트리거가 이름인 영역(`region`)이다. 기본은 한 번에 한 항목만 펼치고 `multiple`이면 여럿을 함께 펼친다. 펼침은 chevron 방향으로 보이고 높이 애니메이션은 없다. 하나만 골라 보여 주는 것은 Tabs다.
_Avoid_: Collapse·Collapsible(항목 하나짜리 펼침과 혼동), Disclosure(React Aria 내부 이름, 공개 API에 쓰지 않음), 펼침 메뉴(Menu와 혼동)

**Tag (태그)**:
사용자가 고르거나 입력한 값을 보여주는 짧은 라벨. 필요하면 지울 수 있다. 예: 선택한 필터, 입력한 키워드. 눌러서 켜고 끄는 칩과는 다르다. 묶음(`TagGroup`)은 이름 있는 `grid`이고 태그(`Tag`)는 `row`다. ←→로 옮기고 `onRemove`가 있으면 Delete·Backspace와 지우기 버튼으로 지우며, 지운 뒤 포커스는 옆 태그로 간다. 색은 뜻 없는 색 계열(`ColorFamilyName`, 기본 `gray`)만 받는다(티켓 33). 상호작용이 없는 상태 표시는 Badge다.
_Avoid_: Chip(토글 칩과 혼동), Badge

**Toast (토스트)**:
끝난 동작의 결과를 화면 아래 끝쪽에 잠깐 띄워 알리는 오버레이(`ToastQueue`, `ToastRegion`). 큐(`ToastQueue`)에 넣으면 영역(`region` 랜드마크)에 쌓여 보이고, 한 번에 보이는 수를 넘으면 기다린다. Toast 하나는 제목이 이름인 비모달 `alertdialog`이고 글자는 `alert`로 읽힌다. 5초 이상 보인 뒤 스스로 닫히며 영역에 hover·focus가 있는 동안 멈춘다. 액션이 있거나 오류(`danger`)면 스스로 닫히지 않는다. 화면에 머무는 알림은 Alert, 확인을 받아야 하는 알림은 AlertDialog다.
_Avoid_: Snackbar, Notification(브라우저 알림 API와 혼동), Flag

**묶음 (Group)**:
하나의 이름으로 함께 읽히는 선택 항목의 모음. `CheckboxGroup`(`role="group"`)과 `RadioGroup`(`role="radiogroup"`)이고, Field에 `group`을 주면 Field label이 묶음의 이름이 된다. 오류 상태는 묶음이 아니라 안의 항목마다 붙는다.
_Avoid_: 그룹(문서에서는 「묶음」으로 쓴다. Component 이름은 `Group`), fieldset

## 배포

**공개 계약 (Public contract)**:
사용자 코드가 이름으로 기대는 Tide의 표면. CSS 변수, Utility class 이름, 텍스트 스타일 이름, Component와 아이콘의 export·props가 여기에 속한다. 공개 계약을 지우거나 이름·뜻을 바꾸는 것이 breaking change다. 값의 시각적 조정은 공개 계약이 바뀌는 것이 아니다.
_Avoid_: public API(Component props만 떠올리게 함), 인터페이스

**릴리스 (Release)**:
Tide의 모든 배포 패키지를 같은 버전으로 함께 내는 한 번의 배포. 바뀐 것이 없는 패키지도 같은 버전으로 함께 나간다. 「TDS 릴리스」라고도 한다. Storybook 버전을 올리는 것은 「Storybook 릴리스」로 구분한다.
_Avoid_: 배포(문서 사이트 배포와 혼동), publish(패키지 하나의 동작)

**TDS**:
npm에 내는 세 배포 패키지(`@tide-design/foundation`, `@tide-design/icons`, `@tide-design/components`)의 묶음. changesets `fixed`로 언제나 같은 버전이다. Version PR 제목의 `[TDS]`가 이것이다.
_Avoid_: Tide 전체(Storybook을 포함하는 것처럼 읽힘)

**Storybook 버전 (Storybook version)**:
문서 앱 `@tide-design/docs`(`apps/docs`)의 버전. TDS와 따로 가는 semver이고, docs changeset으로만 오른다. 0.0.0은 아직 릴리스하지 않은 값이다. 릴리스되면 git tag `@tide-design/docs@<버전>`이 생기고 문서 사이트가 배포된다. 어느 TDS 버전을 설명하는지와는 상관없다(문서 사이트는 언제나 npm `latest`를 설명한다).
_Avoid_: 문서 버전(TDS 버전별 문서로 읽힘), docs 패키지 버전(npm에 내지 않음)

**Version PR**:
changesets/action이 main에 열어 두는 PR 하나(브랜치 `changeset-release/main`). 쌓인 changeset을 버전과 CHANGELOG로 바꾼 내용이고, 머지하면 릴리스가 이어진다. 제목은 든 묶음에 따라 `[TDS] Release x`, `[Storybook] Release y`, 둘 다면 가운뎃점으로 잇는다.
_Avoid_: 릴리스 PR(다른 저장소의 release 브랜치 PR과 혼동)
