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
