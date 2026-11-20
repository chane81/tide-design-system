# Tabs의 고른 표시는 탭 목록에 하나만 두어 새 탭으로 미끄러지게 하고, `shape`로 밑줄·둥근 바탕을 고른다

근거 원칙: ② 명확함이 화려함보다 우선한다, ① 접근성이 미려함보다 우선한다

지금 Tabs는 탭마다 `::after` 막대를 두고, 고른 탭의 막대만 가운데에서 펼친다(150ms). 탭을 바꾸면 이전 막대가 사라지고 새 막대가 따로 나타나서, 어디에서 어디로 옮겼는지가 보이지 않는다. 사용자는 고른 표시가 이전 탭에서 새 탭으로 미끄러지기를, 그리고 밑줄 말고 둥근 사각형 바탕 모양도 고를 수 있기를 원했다(2026-11-20, 사용자 요청).

## 결정

- **고른 표시는 `TabList` 안에 하나만 둔다.** `TabIndicator`(`aria-hidden`)가 탭보다 앞에 놓여 탭 글자 아래에 그려진다. `useTabIndicator`가 고른 탭의 위치·크기를 재어 CSS 변수(`--tab-indicator-x·y·width·height`)로 적는다.
- **고른 탭이 바뀔 때만 미끄러진다.** `translate`·`width`·`height`를 `duration-normal`(300ms) `ease-out`으로 전환한다. 넘치지 않고 opacity는 그대로다. 누름과 키보드(화살표, Home·End)가 같은 길을 탄다.
- **그 밖의 자리 변화는 transition 없이 놓는다.** 첫 렌더, 탭 글자·글꼴·창 크기 변화(`ResizeObserver`), 숨었다가 보일 때다. 크기 변화까지 미끄러지면 창을 줄일 때 표시가 탭을 늦게 따라와 어긋나 보인다.
- **재기 전에는 고른 탭이 자기 표시로 보인다.** 서버 렌더와 숨은 채 마운트(`display: none` 조상)는 잴 수 없다. 그동안 `TabList`에 `data-measured`가 없고, 고른 탭이 예전처럼 자기 `::after` 막대(underline)나 바탕·그림자(rounded)를 갖는다. 재고 나면 `data-measured`가 붙어 탭 자체 표시가 숨고 `TabIndicator`가 보인다. 고른 탭은 어느 때든 색만이 아니라 모양으로 구분된다.
- **움직임 줄이기에서는 바로 옮긴다.** 전환은 `motion-safe:`에만 둔다. 이동하는 표시는 opacity로 바꿀 수 없어(같은 요소가 두 자리에 있을 수 없다) 바로 옮기는 것이 이동을 빼는 방법이다.
- **`shape?: "underline" | "rounded"`, 기본값 `underline`.** `Tabs` 루트가 받아 context로 내리고 루트에 `data-shape`로 붙인다. prop 이름은 Badge의 `shape`와 같다.
  - `underline`: 지금 모양이다. 탭 목록 구분선(`border-default`) 위 2px 밑줄(`border-primary`).
  - `rounded`: 탭 목록에 `bg-inset` 바탕(light gray-50, dark gray-900, ADR 0039), `p-1`, `rounded-lg`를 두고 구분선은 없앤다. 탭 목록은 탭 폭만큼만 선다(`self-start`). 고른 표시는 `rounded-md` 사각형이고 `bg-surface` + `border-raised` 1px + `shadow-sm`이다.
- **forced-colors에서는 두 모양 모두 `Highlight`로 그린다.** underline은 밑줄 경계색, rounded는 2px 테두리다. rounded는 바탕을 빼서(`transparent`) 시스템 글자색과의 대비를 시스템이 정하게 한다.

## 이유

- 표시가 이전 탭에서 새 탭으로 옮겨 가면, 바뀐 것이 무엇이고 어디로 갔는지가 한눈에 보인다. 위치를 알리는 움직임이라 꾸밈보다 정보다(②). 300ms는 「나타날 때」 길이와 같고, 탭은 Menu 항목처럼 수백 번 반복하는 조작이 아니다.
- 표시를 하나만 두면 어느 순간이든 고른 표시가 하나다. 탭마다 막대를 두고 opacity를 엇갈리면 전환 동안 두 막대가 함께 보인다.
- rounded 고른 표시가 `bg-raised`가 아니라 `bg-surface`인 이유: dark에서 `bg-raised`(gray-900)는 탭 목록 바탕 `bg-inset`(gray-900)과 같은 색이라 경계 1px로만 구분된다. `bg-surface`는 light 흰색, dark gray-950이라 두 Theme 모두 바탕 밝기로 구분된다. 경계는 raised 관례(`border-raised` + 그림자)를 따른다.
- 대비(ADR 0023): 탭 글자 `text-muted`·`text-default`·`text-primary` × `bg-inset`은 4.5, 포커스 링 `border-primary` × `bg-inset`은 3으로 등록했다(ADR 0039). 고른 탭 글자 `text-primary` × `bg-surface`는 이미 4.5로 등록되어 있다.

## 고려한 대안

- **CSS anchor positioning:** 탭을 anchor로 두면 재는 코드 없이 표시를 붙일 수 있다. 다만 고른 anchor가 바뀔 때 위치가 전환되는지, Chromium·Firefox·WebKit에서 어디까지 지원되는지를 1차 자료로 확인하지 못했다. Tide 테스트는 Chromium만 돈다. 근거 없이 쓰지 않고 측정 방식으로 한다. 세 엔진 지원이 확인되면 다시 본다.
- **스프링 곡선(넘치지 않는 값):** CSS transition만으로는 스프링을 그대로 쓸 수 없고(`linear()` 근사는 Token에 없는 곡선이 하나 더 생긴다), Tide Component는 `ease-out` 하나만 쓴다(Motion 규칙). 넘치지 않는 스프링과 ease-out은 겉보기 차이가 작다.
- **`scale-x`로 길이 전환:** 레이아웃을 다시 계산하지 않아 싸지만, rounded의 모서리 radius가 함께 늘어나 일그러진다. 두 모양을 같은 방식으로 다루려고 `width`·`height`를 전환한다. 탭 목록 하나의 작은 요소라 비용이 작다.
- **값 이름 `pill`·`segmented`:** `pill`은 Badge에서 완전한 반원 모서리를 뜻한다. `segmented`는 다른 Component(분할 버튼)처럼 읽힌다. 모양 그대로 `underline`·`rounded`로 둔다.

## 결과

- 겉모습과 움직임이 바뀌고 `shape` prop이 생기므로 `@tide-design/components` minor로 낸다. 기본값은 지금 모양이다.
- 고른 탭이 바뀌는 300ms 동안 새 탭 글자(`text-primary`)는 아직 표시가 닿지 않은 바탕 위에 있다. rounded에서는 `bg-inset` 위 `text-primary`인 순간이 있어 이 짝(5.80 / 5.45)도 4.5 쌍으로 등록했다.
- 패널 전환(옆으로 미끄러짐, blur, 높이 애니메이션)은 범위 밖이다. 패널은 지금처럼 바로 바뀐다.
- 조상의 transform scale·zoom(Dialog 등장 scale 등)은 화면 좌표를 바꾼다. 재는 값을 탭 목록의 레이아웃 크기 대비 비율로 나눠 레이아웃 길이로 되돌린다.
- `TabList` 안에 탭이 아닌 요소(`aria-hidden` span)가 하나 생긴다. 앱이 `TabList` 자식 순서에 기대는 CSS(`:first-child` 등)를 쓰면 영향을 받는다.
