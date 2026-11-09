# radius·elevation·focus ring 형태 결정

Type: grilling
Status: resolved
Blocked by: 12

## Question

모양과 깊이를 나타내는 Foundation 값을 정한다.

- radius 5단계(`sm`/`md`/`lg`/`xl`/`full`)의 값과, Component 종류별로 어떤 단계를 쓸지에 대한 기본 규칙
- elevation: 그림자 단계 수, 각 단계의 offset·blur·spread, 표면 층(`canvas`/`surface`/`raised`)과의 매핑, dark Theme에서 그림자 대신 border를 쓰는 규칙과의 관계
- focus ring 형태: 두께, offset, radius를 따를지 여부. WCAG 2.4.11(AA)과 비텍스트 대비 3:1을 만족해야 함

### 참고 (다른 티켓에서 넘어온 것)

- 「v0 Foundation 범위 결정」: radius와 그림자는 Tailwind 기본값을 지우고 Tide 단계만 둔다. 모든 그림자는 `--tide-shadow-color`를 쓴다.
- 「컬러 Foundation 결정」: shadow 색의 alpha(light gray-950 12%, dark black 40%)는 여기서 다시 조정할 수 있다. dark에서 raised는 gray-900에 border를 더한다.
- 값을 눈으로 비교해야 하면 prototype 티켓을 새로 만든다.
- 「Component 공통 API 규칙 결정」: Component 높이는 size별로 xs 24, sm 32, md 40, lg 48px이다. radius 단계를 size와 짝지을지 볼 때 이 값을 참고한다.

## Answer

radius, elevation, 포커스 표시의 **규칙**을 정했다. 그림자 숫자는 「그림자·포커스 표시·motion 시각 비교」(24번)에서 light·dark를 눈으로 보고 확정했다. 새 ADR은 만들지 않았다(기존 Token 규칙 안에서 값과 사용 규칙만 정함).

### 1. radius

| 단계 | 값 | 쓰는 곳 |
|---|---|---|
| `sm` | 0.25rem (4px) | Checkbox, Badge, Tag, Tooltip, Skeleton(텍스트 줄), Table 안 작은 요소, Menu 항목·Select 옵션(목록 안) |
| `md` | 0.375rem (6px) | Button, IconButton, Input, Textarea, Select·Combobox 트리거, Tabs 항목 |
| `lg` | 0.5rem (8px) | Card, Alert, Popover, Menu·Select 목록, Toast, Accordion |
| `xl` | 0.75rem (12px) | Dialog, AlertDialog |
| `full` | 9999px | Avatar, Radio, Switch, Progress 막대, Spinner |

- 값은 Tailwind 기본값과 같다(④ 발견할 수 있음). 이름은 Tide 5단계만 남기고 나머지 기본값은 지운다(「v0 Foundation 범위 결정」).
- 규칙 문장: 작은 표시 요소는 `sm`, 조작 요소는 `md`, 담는 요소는 `lg`, 화면을 덮는 요소는 `xl`, 원·알약형은 `full`. 안쪽 요소가 바깥 컨테이너보다 더 둥글지 않게 한다.
- 중첩 규칙: 바깥과 안쪽 사이 간격이 고르면 **바깥 radius = 안쪽 radius + padding**(+ border 두께)이다. 그래서 Menu·Select 목록(`lg` 8px, raised라 border 1px)은 padding 3px, 그 안 항목은 `sm`(4px)이다(4 + 3 + 1 = 8). 바깥 가장자리에서 항목까지 간격은 border 포함 4px이다. padding이 24px를 넘거나 일부러 비대칭이면 각자 자기 단계를 쓴다.
- radius는 Component `size`와 짝짓지 않는다. 조작 요소는 xs(24px)부터 lg(48px)까지 모두 `md`다(③ 단순함). 24px에서 어색하면 24번 prototype에서 다시 본다.

### 2. Elevation(그림자)

- 그림자는 `raised` 표면 층에서만 쓴다. Card(`surface`)는 border만 쓴다.
- 3단계:
  - `sm`: Switch thumb처럼 작은 떠 있는 요소
  - `md`: Popover, Menu, Select·Combobox 목록, Tooltip, Toast
  - `lg`: Dialog, AlertDialog. overlay 위에 뜨므로 popover류보다 깊다(② 명확함)
- 단계마다 2레이어(가까운 짧은 그림자 + 먼 넓은 그림자)다. 두 레이어 모두 `--tide-shadow-color` 하나를 쓰고, 레이어별 진하기는 `color-mix(in srgb, var(--tide-shadow-color) N%, transparent)`로 낮춘다. 그래서 컬러 결정의 "shadow 색 Token은 하나" 규칙이 유지된다.
- dark Theme에서도 그림자를 그린다. 같은 `shadow-*` class가 Theme에 따라 색만 바뀐다(Component에 Theme 분기 없음, ③ 단순함). dark에서 잘 안 보이는 경계는 raised의 border가 맡는다.
- light의 raised에도 `border: 1px solid transparent`를 둔다. forced-colors 모드는 box-shadow를 모두 지우는데, 투명 border는 이 모드에서 시스템 색으로 그려져 경계가 남는다. 두 Theme 모두 border 1px라 크기도 같다. border 대신 `0 0 0 1px` 그림자를 테두리로 쓰는 방식은 이 이유로 쓰지 않는다.
- 확정 값(24번에서 3안 중 "옅게" 안을 골랐다). shadow 색의 alpha도 컬러 결정의 12%/40%에서 **light gray-950 8%, dark black 30%** 로 낮췄다. 아래 100%는 이 alpha 그대로라는 뜻이다:

  | 단계 | 가까운 레이어 | 먼 레이어 |
  |---|---|---|
  | `sm` | `0 1px 1px` 60% | `0 1px 2px` 100% |
  | `md` | `0 1px 3px` 50% | `0 4px 12px -2px` 100% |
  | `lg` | `0 2px 6px -1px` 50% | `0 12px 24px -6px` 100% |

### 3. 포커스 표시

토스증권 로그인 화면(입력창 포커스 시 offset 없이 테두리 색만 파랑으로 바뀜)을 참고해 나눴다. 처음에는 field와 ring 두 종류였고, 24번에서 목록 안 항목용 **highlight**를 더해 세 종류가 되었다. 용어는 GLOSSARY의 「포커스 표시」.

| 종류 | 대상 | 모양 | 언제 |
|---|---|---|---|
| **field** | Input, Textarea, Select·Combobox 트리거 | offset 없이 border를 focus-ring 색으로 바꾸고 두께를 1px → 2px로 늘린다. 늘어난 1px은 `inset` box-shadow로 그려 레이아웃이 흔들리지 않게 한다. `outline: 2px solid transparent`를 함께 둔다 | `:focus` (마우스 클릭 포함) |
| **ring** | Button, IconButton, Link, Checkbox, Radio, Switch, Tabs 항목 등 나머지 전부 | `outline` 2px, offset 2px. 요소의 radius를 따른다 | `:focus-visible` (키보드) |
| **highlight** | Menu 항목, Select·Combobox 옵션(목록 안 항목) | ring 없이 배경을 primary subtle, 글자를 primary text로 바꾼다. hover도 같은 모양이다. forced-colors 대비로 `outline: 2px solid transparent`를 둔다 | 키보드로 옮긴 항목(React Aria가 관리) + hover |

- 색은 컬러 결정 그대로다(light blue-600, dark blue-400). error 상태 입력창도 포커스를 받으면 focus-ring 색으로 바뀐다. error는 메시지, 아이콘, `aria-invalid`가 계속 알린다(색만으로 알리지 않음, WCAG 1.4.1).
- 두 종류로 나눈 이유:
  - 입력창은 field 방식이 가볍고 익숙하다.
  - solid 버튼은 배경(blue-600)과 ring 색이 같아서 offset 없이 그리면 ring이 묻힌다. 그래서 버튼류는 offset이 있는 ring을 쓴다.
  - 1px 회색 → 1px 파랑은 차이가 너무 작아 저시력 사용자에게 약하다. 그래서 field도 두께를 2px로 늘린다(① 접근성).
- 구현 주의: error 입력창의 danger border가 field 포커스 스타일보다 우선하면, 빨간 border 안쪽에 파란 inset 1px이 겹쳐 두 줄로 보인다(24번 prototype에서 실제로 생김). `focus-field`는 error 상태보다 우선해야 한다. 선택자 순서에 기대지 말고 error+focus 조합을 명시한다.
- forced-colors(Windows 고대비 모드)는 border 색과 box-shadow를 시스템 색으로 덮어쓴다. field에 둔 투명 outline이 이 모드에서만 보이므로 포커스 표시가 사라지지 않는다.
- WCAG 근거: 2.4.7 Focus Visible(AA)과 1.4.11 비텍스트 대비 3:1(AA). 크기·전후 대비 요건인 2.4.13 Focus Appearance는 AAA라 최소 기준이 아니다. 티켓에 적혀 있던 **2.4.11은 Focus Not Obscured(Minimum)**, 즉 포커스된 요소가 sticky 요소 등에 가려지지 않아야 한다는 기준이다. 모양이 아니라 겹침 문제이므로 「z-index 층 결정」(22번)으로 넘긴다.
- highlight를 쓰는 이유: 목록 padding(3px) 안에서 바깥 ring은 목록 가장자리와 옆 항목에 붙는다. 화살표 키로 움직이는 목록은 OS 메뉴처럼 배경으로 위치를 보이는 쪽이 익숙하다(④). AA 2.4.7은 포커스가 보이기만 하면 되고, 표시와 주변의 3:1 대비는 AAA 2.4.13 요건이다. 그래도 배경과 글자색을 함께 바꿔 알아보기 쉽게 한다.
- 대비 검사: ring은 offset 덕분에 canvas·raised와 맞닿으므로 기존 대비 쌍(focus-ring × canvas, raised)이 그대로 유효하다. field는 입력창 배경과 맞닿는데, 입력창 배경은 canvas 또는 raised와 같으므로 새 대비 쌍이 필요 없다.

### 4. Utility class 노출

- `focus-ring`: ring 모양. `focus-visible:focus-ring`처럼 쓴다.
- `focus-field`: field 모양. `focus:focus-field`처럼 쓴다. 이름이 Field Component와 짝이 맞는다.
- 둘 다 Tailwind `@utility`로 정의한다. `@utility`로 만든 class는 `hover:`, `focus:` 같은 variant와 함께 쓸 수 있다(Tailwind 4.3.5. 근거: tailwindcss.com 문서 「Adding custom styles › Adding custom utilities」).
- 공개 CSS 변수: `--tide-focus-ring-width`(2px), `--tide-focus-ring-offset`(2px).
- radius(`--radius-*`)와 그림자(`--shadow-*`)는 Tailwind 표준 namespace로 노출하므로 `rounded-md`, `shadow-lg`처럼 쓴다. 이름을 교체하므로 생성되는 tailwind-merge 설정에 들어가야 한다(「Component 공통 API 규칙 결정」).

### 다른 티켓에 주는 영향

- 「그림자·포커스 표시·motion 시각 비교」(24번, 새로 만듦): 그림자 초안 값, shadow alpha(12%/40%), 24px 조작 요소의 `md` radius, field·ring 모양을 light·dark에서 확인한다.
- 「z-index 층 결정」(22번): WCAG 2.4.11(포커스가 가려지지 않음)을 여기서 다룬다.

## Comments

- 2026-11-09 grilling 진행. 1라운드 Q1~Q6(radius 값, size와 짝짓지 않음, 종류별 매핑, 그림자 3단계, dark에서도 그림자, 2레이어)은 추천안대로 확정했다. 포커스 표시는 처음에 모든 Component에 outline 2px + offset 2px를 제안했으나, 사용자가 토스증권 로그인 화면처럼 두껍지 않고 색으로 구별하는 방식을 원해 입력형(field)과 나머지(ring)로 나눴다. 2라운드(error 상태, Utility class 이름, 그림자 초안과 prototype 분리)는 추천안대로 확정했다.
- 2026-11-09 「motion Foundation 결정」(21번) grilling에서 jakub.kr 자료(중첩 radius, forced-colors에서 그림자 경계)를 참고해 두 가지를 보완했다. Menu 항목·Select 옵션을 `md`에서 `sm`으로 바꾸고 목록 padding을 3px(border 1px 포함 4px)로 정했다. light raised에 투명 border를 더했다.
- 2026-11-09 「그림자·포커스 표시·motion 시각 비교」(24번)에서 값을 확정해 Answer를 고쳤다. 그림자는 "옅게" 안(alpha 8%/30%), 목록 안 항목은 highlight. 사용자는 처음에 버튼 포커스 ring을 없애자고 했으나 WCAG 2.4.7(AA) 위반이라 고르지 않았다. ring이 Tab 이동 때만 보인다는 점을 확인한 뒤 현재 규칙(outline 2px, offset 2px)을 유지했다.
