# Checkbox는 체크 표시를 그리고, Radio는 점을 키우며, 첫 렌더에서는 움직이지 않는다

근거 원칙: ① 접근성이 미려함보다 우선한다, ② 명확함이 화려함보다 우선한다

사용자가 「체크박스나 라디오를 클릭할 때 펜으로 긋듯 체크가 그려지는 움직임」을 원했다(2026-11-20). 지금까지 Checkbox·Radio 표시는 `display:none`→`block`으로 바로 나타났다. 선택은 자주 하는 조작이라 짧고 약해야 하고, 페이지를 열 때 이미 체크된 상자가 줄줄이 그려지면 안 된다.

## 결정

- **Checkbox 체크·가로줄은 그린다.** `pathLength="1"`인 path에 `stroke-dasharray: 1`을 두고 `stroke-dashoffset`을 1→0으로 바꾼다. `normal`(300ms), `ease-out`이다. 체크는 시작점에서 끝점으로, 가로줄은 왼쪽에서 오른쪽으로 그려진다. opacity는 바로 1이 된다.
- **Checkbox 해제는 거꾸로 지우지 않는다.** opacity `fast`(150ms)로 사라지고, dash는 사라진 뒤(`fast` 지연)에 되감는다.
- **Radio 점은 가운데에서 커진다.** opacity 0→1과 `scale` 0.5→1, `fast`, `ease-out`이다. 해제된 점은 같은 조합을 거꾸로 돈다.
- **transition으로만 움직인다.** 표시는 늘 렌더하고(`display`를 바꾸지 않는다) opacity·dashoffset·scale을 `:checked`·`:indeterminate`에 묶는다. transition은 계산된 값이 **바뀔 때만** 돌므로, 처음 렌더할 때 이미 선택된 상자(`defaultChecked`, 제어 `checked`, `indeterminate`)는 그려진 채로 나온다.
- **움직임 줄이기에서는 opacity만 바꾼다.** dash와 scale은 `motion-safe:`로 감싼다. 바로 사라지게 하지는 않는다(Motion 문서 「움직임 줄이기」).
- **Checkbox 표시는 전용 SVG다.** `@tide-design/icons`의 `CheckIcon`·`MinusIcon` 대신 `Checkbox/components/CheckboxMark.tsx`가 같은 Lucide path(`M20 6 9 17l-5-5`, `M5 12h14`)를 그린다. `vector-effect: non-scaling-stroke`를 쓰지 않고, 화면 2px가 되게 선 두께를 viewBox 단위로 환산한다(`md` 16px → 3, `sm` 12px → 4).
- **선 두께는 화면 2px다(전에는 3).** 아이콘 기본 1.5(ADR 0036)보다 한 단계 굵게 해 채운 상자 안에서도 보이게 하고, 3은 주변 아이콘보다 두 배 굵어 두꺼워 보였다(2026-11-20, 사용자 결정).
- **누름 축소는 넣지 않는다.** Tide의 누름 축소(`scale-96`)는 Button·IconButton의 관례이고 끄는 prop(`noPressScale`)까지 함께 정해져 있다(ADR 0010). Checkbox·Radio·Switch에는 없다.

## 이유

- 표시를 그리는 움직임은 무엇이 바뀌었는지(체크됨)를 그 자리에서 보여 준다. 색과 표시 모양이 함께 바뀌므로 움직임만으로 상태를 알리지 않는다(②).
- 거꾸로 지우는 해제는 「다시 체크되는 중」으로 읽힐 수 있고 시간이 두 배로 든다. 사라질 때는 `fast`라는 Motion 규칙을 따른다.
- 첫 렌더에서 그려지면 목록·표를 열 때마다 수십 개가 동시에 움직인다. CSS animation은 요소가 보이기 시작할 때(`display:none`→`block`) 재생되지만, transition은 값이 바뀔 때만 돌아 별도 상태(마운트 여부 등)를 두지 않아도 된다.
- `display`를 바꾸면 그 순간 요소에 이전 계산 값이 없어 transition이 시작되지 않는다. 그래서 숨김을 opacity로 바꿨다. 표시는 `pointer-events-none`과 `aria-hidden`이라 보이지 않을 때 영향이 없다.
- non-scaling-stroke와 `pathLength`를 함께 쓰면 Chromium·Firefox·WebKit 모두 dash를 화면 픽셀로 계산해, `pathLength="1"` 기준 dash가 맞지 않았다(offset 1에서도 선이 남는다). 같은 화면 두께로 환산하면 세 브라우저에서 기존 아이콘과 픽셀이 같았다. `IconBase`는 props를 `<svg>`에만 넘겨 path에 `pathLength`를 둘 길도 없다. Radio 점을 아이콘 대신 span으로 바꾼 전례(ADR 0035)와 같은 판단이다.
- 체크박스는 표·목록에서 한꺼번에 많이 누른다. 누를 때마다 상자가 줄어들면 표시 그리기와 겹쳐 움직임이 두 겹이 된다. 체크 그리기 하나로 누른 반응은 충분하다.

## 위험과 대응

- **forced-colors:** 표시는 opacity로만 숨으므로 선택된 상태에서 opacity 1이고, 색은 지금처럼 시스템 색(HighlightText·Highlight)이다. browser 테스트의 forced-colors instance가 확인한다.
- **빠르게 여러 번 누르기:** 그리는 중에 해제하면 그 자리에서 opacity로 사라지고, 다시 체크하면 남은 dash 값에서 이어 그린다. 거꾸로 지우는 모습은 나오지 않는다.
- **앱이 값을 바꿔도 움직인다:** 첫 렌더 뒤 `checked`·`indeterminate`를 앱이 바꾸면(전체 선택 등) 사용자가 누른 것과 같게 그려진다. 바뀐 것을 보여 주는 쪽이라 그대로 둔다.

## 고려한 대안

- **CSS animation(keyframe) + `display` 전환:** 짧지만 마운트할 때마다 재생된다. 첫 렌더를 막으려면 마운트 뒤에 class를 붙이는 상태가 필요하고, SSR 결과와 첫 클라이언트 렌더가 달라진다.
- **`IconBase`에 path props 통로를 더하기:** 아이콘 패키지 공개 계약이 넓어지고, non-scaling-stroke와 `pathLength`가 함께 맞지 않는 문제는 그대로다.
- **Radio도 테두리부터 그리기:** 고른 원은 테두리 두께와 점으로 상태를 알린다(ADR 0035). 점 하나만 움직여도 충분하다.

## 결과

- Checkbox는 `@tide-design/icons`의 `CheckIcon`·`MinusIcon`을 쓰지 않는다. path 모양은 같고 화면 두께는 3px에서 2px로 얇아진다. ADR 0036 「결과」에 남겨 둔 체크 굵기 문제를 여기서 정한다.
- 공용 `choiceMarkClass`는 `hidden` 대신 `opacity-0 transition-opacity`다. Checkbox·Radio가 보이는 조건과 움직임 class를 각자 더한다.
- props와 이름(공개 계약)은 그대로이고 겉모습의 움직임이 더해진다. 눈에 띄는 변화라 `@tide-design/components` minor로 낸다.
