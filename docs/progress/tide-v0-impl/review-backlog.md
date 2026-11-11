# 보정 대기 목록

2026-11-11 사용자 결정: 티켓을 먼저 끝까지 진행하고, 보정·수정은 그 뒤에 몰아서 한다. 각 티켓의 「판단 보류」 중 사용자가 아직 답하지 않은 항목을 여기 모은다. 항목은 추천안대로 구현되어 있다. 자세한 근거는 각 티켓 Comments에 있다.

## 19 Badge·Card·Separator

- Badge `variant`는 `subtle`/`solid` 2개(`outline` 없음), `size`는 `sm` 20px / `md` 24px.
- Card에 `padding` prop·하위 Component(`CardHeader` 등) 없음, 여백은 `className`.
- Card는 `render`로 요소를 바꾸고 기본은 역할 없는 `div`.
- Separator는 세로도 `<hr>`, 방향은 `data-orientation` 값 속성.
- Card 경계 `border-default`는 장식으로 보고 대비 검사 제외.

## 20 Alert

- 기본 `color`는 `info`(다른 Component는 `primary`, Badge는 `neutral`).
- `variant` 없음(subtle 하나).
- 제목은 `title` prop, 하위 Component 없음, heading 요소 아님.
- 앱 Role의 경계 × subtle, 포커스 링 × subtle을 `tide-color`가 검사하지 않음.
- 상태 아이콘을 바꾸는 `icon` prop 없음.
- 닫은 뒤 포커스 이동은 앱이 정함(문서만).
- 본문 Link를 같은 Role로 쓰라는 안내는 문서 Do만.
- 첫 cold 실행 import 실패(「Unexpected token '}'」) 원인 미확인, 재현 안 됨.

## 21 Avatar

- `alt` 필수, 장식용은 `""`.
- 기본 `gray`·`md`, 아이콘은 원의 약 60%.
- 이니셜 fallback, 상태 점, AvatarGroup 없음.
- IconButton 안에서는 IconButton 아이콘 칸 크기가 Avatar 크기를 덮음.
- (결정됨) CSS 배경 이미지 방식 유지. lazy·`srcSet`·Next `<Image>`가 필요하면 이미지 슬롯 확장을 별도 티켓으로.

## 22 Skeleton·Progress

- indeterminate Progress 없음(Spinner가 맡음).
- 트랙 × 표면 대비가 낮음(light 약 1.1). 막대 × 트랙만 보장.
- Progress size `sm` 4px / `md` 8px 두 개.
- union props story는 평평한 args 타입, Skeleton은 타입 단언.
- (결정됨) 막대 색은 accent `text` 슬롯 유지(A안). light에서 `primary` 막대가 `#3183f5`보다 진함. 브랜드 색에 맞추려면 foundation에 배경용 accent `border` 유틸리티와 border × subtle 3:1 규칙을 더하는 B안이 있다.

## 23 Table

- 부분 이름 `TableHead`(thead)·`TableHeaderCell`(th). shadcn과 다름.
- `TableHeaderCell` 기본 `scope="col"`, 행 머리는 앱이 `scope="row"`.
- `TableCaption`·`TableFoot` 없음(네이티브 `<caption>`·`<tfoot>`).
- 숫자 열은 prop 없이 `className="tabular-nums text-end"`.
- hover neutral `subtle-hover`, 머리 칸 글자 `text-default`(`text-muted`는 대비 쌍 추가 필요).
- 칸 높이 40px·가로 12px 한 가지, 밀도 축 없음.
- 가로 스크롤 감싸개 없음(문서 안내만).

## 24 Breadcrumb·Pagination

- 기본 이름(「이동 경로」·「페이지 이동」·「이전/다음 페이지」·「페이지 생략」), 이름 타입 필수 아님.
- 현재 페이지는 링크 아닌 `BreadcrumbCurrent`(span + aria-current).
- 구분자 자동(`BreadcrumbSeparator` 없음), 모양 바꾸기 없음.
- Breadcrumb 링크 `text-muted` + 항상 밑줄.
- `ol`·`ul`은 루트가 렌더(`BreadcrumbList`·`PaginationContent` 없음).
- 번호·이전/다음 32px 한 가지, 현재 쪽 primary subtle 고정, `color`·`size` 없음.
- 번호 hover는 Button 규칙(transition-colors), 「목록 항목 즉시 hover」로 보지 않음.
- 페이지 범위 계산 함수 비공개(문서 예시만).
- 처음·마지막 쪽 버튼 없음.

## 25 Popover

- 단계 경계: 0.3.0 Version PR 머지 전에 진행함. 0.3.0 머지 후 이 브랜치를 머지해야 Popover가 0.3.0에 섞이지 않음.
- 모달 popover(바깥 inert·스크롤 잠금·Tab 순환), 비모달 옵션 비공개(내부 `nonModal`만).
- 이름 fallback은 트리거 글자, `PopoverTitle`·`PopoverClose` 없음.
- 기본 트리거는 class 없는 `<button>`, Button 모양은 `render`.
- `placement` 기본 `bottom`, `offset` 8px, 여백 16px, `max-w-80`, `text-body-md`, arrow 없음.
- 내용 자신의 포커스 표시 없음(`outline-none`).
- 트리거의 `data-theme`을 portal로 옮김.
- 포커스 복귀는 퇴장 전환이 끝난 뒤(최대 150ms).
- 뒤집힌 경우 첫 프레임 등장 방향이 요청 placement 기준(4px).

## 26 Tooltip

- 「바로 나타남」은 motion으로 해석, hover `delay` 기본 500ms·`closeDelay` 300ms(prop 공개).
- 모달 Popover·Dialog의 inert 회피에 비공개 속성 `data-react-aria-top-layer` 사용.
- `placement` 기본 `top`, `offset` 4px, 여백 4px·8px, `text-body-sm`, `max-w-60`, radius `lg`, arrow 없음.
- 기본 트리거는 class 없는 `<button>`, 모양은 `render`. 비활성 요소 Tooltip 미지원(문서 안내).
- 트리거 스크롤 시 바로 닫음.
- 트리거에 `data-open` 없음.
- `trigger: focus`·`shouldCloseOnPress` 옵션 비공개.

## 27 Menu

- 항목 모으기는 React Stately 요소 방식(감싸기 불가), 서버 컴포넌트는 React lazy 내부 필드를 풀어 지원(ADR 0019).
- 실행 prop은 `onClick`(키보드 실행 포함), `Menu` 단위 `onAction` 없음.
- 위치를 옮기는 hover는 highlight, 키보드 위치가 따로 있을 때 다른 항목 hover는 neutral `subtle-hover`, 선택 유지는 neutral `subtle-active`.
- 위치 표시는 `:focus`가 아닌 `data-highlighted`.
- 선택 항목·하위 메뉴·링크 항목·단축키 표시·위험 항목 색·`closeOnClick` 없음.
- DismissButton 없음. Tab은 닫고 트리거로 포커스 복귀.
- 비활성 항목은 키보드 위치가 건너뜀(React Aria 기본).
- 한글 타입어헤드 미지원(IME, 문서 안내).
- `placement` 기본 `bottom start`, `offset` 4px, 폭 10~20rem, 항목 `text-body-md`·36px, 아이콘 16px.

## 28 Select

- 부분 Component 없이 단일 `Select`(루트 = 트리거 버튼), `placement`·`offset` 비공개(`bottom start` 4px).
- 역할은 React Aria 방식 `button` + `aria-haspopup="listbox"`(APG Select-Only Combobox의 `combobox` 아님).
- `required`는 네이티브 제약 검사(제출 막음·트리거 포커스·`aria-invalid`, 말풍선 없음). 보조기술에 필수 여부가 전해지지 않음(문서 안내).
- 고른 옵션에 체크 아이콘 추가(spec은 subtle-active만).
- `placeholder` 기본 「선택하세요」, `value`는 `string | null`, 비우기로는 `onValueChange`가 불리지 않음.
- 목록 폭 min = 트리거 폭(최소 10rem, 최대 20rem).
- listbox 안 구분선은 숨긴 장식 요소(Menu의 `separator`와 다름).
- `useCloseOnTab`이 Tab 전파를 멈춤(Menu에도 적용), Tab은 트리거로 포커스 복귀.
- 한글 타입어헤드 미지원, 옵션 300개 초과 시 hidden input(자동 완성 없음).

## 29 Combobox

- 루트는 입력 `<input>`, 감싸개 div(`w-full`)에는 props가 가지 않음.
- 결과 없음이면 목록을 닫지 않고 「결과가 없습니다」(`emptyMessage`)를 listbox 밖에 표시(React Aria 기본은 닫음).
- `onValueChange`는 `string | null`(입력을 모두 지우면 `null`), Select(`string`)와 다름.
- 열림 제어 없음(`onOpenChange`만), 입력 클릭만으로는 열리지 않음(`menuTrigger: "input"`).
- chevron·목록 이름·개수 안내 문구는 React Aria locale을 따름(한국어 고정 아님).
- 페이지 스크롤로 닫히며 입력이 되돌아감(React Aria non-modal 기본), 지운 직후 1프레임 안 입력 경합.
- 한글 「포함」 거르기의 조합 중간 글자 결과 줄어듦, 초성 검색 없음, Safari·Windows IME 실기기 미확인(Chromium CDP로 확인).
- 목록 폭 `min(입력 폭, 100vw − 24px)`(Select는 트리거 폭 그대로).
- Tab은 가상 포커스 옵션을 고르고 다음 요소로 이동(React Aria 동작).

## 30 Dialog·AlertDialog

- AlertDialog는 루트(`AlertDialog`)만 따로 두고 부분 Component는 Dialog의 것(`DialogTrigger`, `DialogContent` …)을 그대로 씀(`AlertDialogContent` 같은 별도 이름 없음).
- Dialog는 막 누름으로 닫힘(끄는 prop 없음), AlertDialog는 막 누름으로 닫히지 않음. Esc는 둘 다 닫음(APG Alert Dialog 예시).
- Dialog를 열면 Dialog 요소 자신에 포커스(React Aria 기본, `autoFocus`로 바꿈), AlertDialog는 첫 조작 요소(취소)에 포커스.
- 닫기 IconButton은 Dialog에 늘 있음(숨기는 prop 없음), DOM 끝(Tab 순서 마지막)에 두고 끝 위쪽에 그림. AlertDialog에는 없음.
- `aria-modal`을 붙이지 않음(React Aria가 Safari 버그로 빼고 바깥 `inert`로 모달을 만듦, APG는 `aria-modal="true"`).
- 트리거에 `aria-haspopup`이 없음(React Aria `useOverlayTrigger`가 dialog에 붙이지 않음).
- `size` sm 24rem·md 32rem·lg 40rem, 제목 `text-heading-sm`(`<h2>` 고정, 수준 바꾸는 prop 없음).
- 닫을 때 퇴장 중 포커스가 body로 빠졌다가 내용이 빠진 다음 프레임에 돌아옴(Popover와 같은 기존 동작).

## 31 Tabs

- 부분 이름은 ARIA 역할을 따른 `TabList`·`Tab`·`TabPanel`(`TabsList`·`TabsTrigger`·`TabsContent` 방식 아님).
- `value`나 `defaultValue` 하나가 타입상 필수(없으면 첫 탭인 React Aria와 다름).
- 고른 탭의 패널만 렌더(고르지 않은 패널 상태 사라짐, `forceMount` 없음).
- 패널 `tabIndex` 기본 0 고정(안의 조작 요소 여부로 바꾸지 않음, 앱이 `tabIndex={-1}`).
- 고른 표시 막대는 탭마다 그리고 가운데에서 펼쳐짐(미끄러지는 막대 없음).
- RTL 화살표 반전은 `I18nProvider` locale을 따름(`dir="rtl"`만으로는 안 바뀜).
- `size`·`variant`(밑줄형만)·루트 `disabled`·탭 목록 넘침 스크롤 없음.
- 세로 탭에서도 ←→ 동작(React Aria 기본, APG는 ↓↑만 적음).
- 탭 글자색은 전환 없이 바로 바뀜, 막대만 opacity `fast`.
