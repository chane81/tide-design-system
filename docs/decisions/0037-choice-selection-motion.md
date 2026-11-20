# Checkbox는 채움 뒤에 체크를 그리고, Radio는 점을 튀어 나오게 하며, 첫 렌더에서는 움직이지 않는다

근거 원칙: ① 접근성이 미려함보다 우선한다, ② 명확함이 화려함보다 우선한다, ③ 단순함이 유연함보다 우선한다

사용자가 「체크박스나 라디오를 클릭할 때 펜으로 긋듯 체크가 그려지는 움직임」을 원했고, 참고할 UI 예시를 함께 줬다(2026-11-20). 지금까지 Checkbox·Radio 표시는 `display:none`→`block`으로 바로 나타났다. 선택은 자주 하는 조작이라 짧아야 하고, 페이지를 열 때 이미 체크된 상자가 줄줄이 그려지면 안 된다.

## 결정

### 시간 사양

| 대상                 | 나타날 때                                                                              | 사라질 때                                 | 움직임 줄이기    |
| -------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------- |
| Checkbox 채움        | scale 0.7→1 + opacity 0→1 `fast`(150ms), `ease-out`                                    | scale·opacity 거꾸로, `fast`, `ease-out`  | opacity `fast`만 |
| Checkbox 체크·가로줄 | `fast`(150ms) 지연 뒤 dash 그리기 + opacity 0→1 `fast`(150ms), `ease-out`              | 지연 없이 거꾸로 지우기 + opacity, `fast` | opacity `fast`만 |
| Radio 점             | scale 0→1 + opacity 0→1 `normal`(300ms), overshoot `cubic-bezier(0.34, 1.56, 0.64, 1)` | scale·opacity 1→0, `fast`, `ease-out`     | opacity `fast`만 |

### Checkbox

- **채움은 별도 레이어다.** input 뒤에 같은 크기·radius의 span(`data-fill`)을 겹쳐 accent solid로 칠한다. input border-box와 같아 테두리까지 덮으므로 커지는 동안 바깥 테두리가 링처럼 남지 않는다. scale과 opacity는 함께 `fast`로 바뀐다. 체크를 300ms로 그리면 하루에 수십 번 누르는 조작에서 느리게 느껴져(사용자 확인) 체크까지 300ms 안에 끝나게 줄였다.
- **체크는 채움이 찬 뒤에 그린다.** `pathLength="1"`인 path에 `stroke-dasharray: 1`을 두고 `stroke-dashoffset`을 1→0으로, opacity와 함께 바꾼다. 지연은 `fast`(150ms)다. Token에 지연 값이 없어 duration Token을 지연으로 쓴다. 가로줄(indeterminate)도 같다.
- **해제는 거꾸로 지운다.** 지연 없이 `fast`로 dash가 1로 돌아가며 opacity도 줄어든다. 채움도 같은 시간에 줄며 사라진다. 그리는 도중 다시 누르면 transition이 지금 값에서 되돌아간다.
- **선 두께는 화면 2px다(전에는 3).** 아이콘 기본 1.5(ADR 0036)보다 한 단계 굵게 해 채운 상자 안에서도 보이게 한다(2026-11-20, 사용자 결정).
- **표시는 전용 SVG다.** `@tide-design/icons`의 `CheckIcon`·`MinusIcon` 대신 `Checkbox/components/CheckboxMark.tsx`가 같은 Lucide path(`M20 6 9 17l-5-5`, `M5 12h14`)를 그린다. `vector-effect: non-scaling-stroke`를 쓰지 않고 화면 2px가 되게 두께를 viewBox 단위로 환산한다(`md` 16px → 3, `sm` 12px → 4).
- **색 규칙은 그대로다.** 오류면 채움이 danger solid 계열(hover·누름 포함)이다. 비활성·forced-colors에서는 채움 레이어가 숨고 input 바탕이 지금처럼 칠한다(비활성 회색, forced-colors Highlight).

### Radio

- **점은 0에서 살짝 넘쳤다가 자리 잡는다.** scale 0→1과 opacity를 `normal`(300ms) 동안 overshoot 곡선으로 바꾼다. 곡선의 최댓값은 약 1.098배라 가장 커져도 점(md 10px → 약 11px, sm 8px → 약 8.8px)이 2px 테두리 안쪽(md 16px, sm 12px)에 닿지 않는다.
- **사라지는 점은 overshoot 없이 줄어든다.** `fast`, `ease-out`이다.
- **overshoot 곡선은 Radio 상수에 둔다.** 쓰는 곳이 하나라 foundation `easing`(지금 `out`만 있다)에 더하지 않는다. 다른 Component도 쓰게 되면 Token으로 올린다.
- **바탕 채움 레이어는 두지 않는다.** Tide Radio는 canvas 바탕에 2px 테두리와 점으로 그린다(ADR 0035). 테두리 두께·색 변화는 지금처럼 `transition-colors`다.

### 함께

- **transition으로만 움직인다.** 표시와 채움을 늘 렌더하고(`display`를 바꾸지 않는다) 값을 `:checked`·`:indeterminate`에 묶는다. transition은 계산된 값이 **바뀔 때만** 돌므로, 처음 렌더할 때 이미 선택된 상자(`defaultChecked`, 제어 `checked`, `indeterminate`)는 그려진 채로 나온다.
- **키보드도 같다.** Space·방향키로 바꿔도 같은 transition이 돈다. 상태는 네이티브 input이 바로 바꾸고 움직임은 그 뒤를 따른다.
- **움직임 줄이기에서는 opacity만 바꾼다.** dash·scale은 `motion-safe:`로 감싼다. 바로 사라지게 하지는 않는다(Motion 문서 「움직임 줄이기」).
- **누름 축소는 넣지 않는다.** 루트·상자·원은 hover·누름에 크기가 변하지 않는다. 채움과 표시가 누름에 답한다.
- **변형은 하나다.** 스프링으로 튀어 오르는 pop 변형은 고려했으나 뺀다. 그리기 방식 하나만 둔다(③).

## 이유

- 채움이 먼저 차고 그 위에 체크가 그려지면 「상자가 찼다 → 체크됐다」 순서가 눈에 보인다. 색과 표시 모양이 함께 바뀌므로 움직임만으로 상태를 알리지 않는다(②).
- 해제를 거꾸로 지우면 그리기와 같은 길을 되돌아가 무엇이 풀렸는지 분명하다. 지연 없이 `fast`라 해제가 늦어 보이지 않는다.
- 첫 렌더에서 그려지면 목록·표를 열 때마다 수십 개가 동시에 움직인다. CSS animation은 요소가 보이기 시작할 때(`display:none`→`block`) 재생되지만, transition은 값이 바뀔 때만 돌아 마운트 여부 같은 상태를 따로 두지 않아도 된다. `display`를 바꾸면 그 순간 이전 계산 값이 없어 transition이 시작되지 않으므로 숨김은 opacity로 한다.
- non-scaling-stroke와 `pathLength`를 함께 쓰면 Chromium·Firefox·WebKit 모두 dash를 화면 픽셀로 계산해 `pathLength="1"` 기준 dash가 맞지 않았다(offset 1에서도 선이 남는다). 같은 화면 두께로 환산하면 세 브라우저에서 기존 아이콘과 픽셀이 같았다. `IconBase`는 props를 `<svg>`에만 넘겨 path에 `pathLength`를 둘 길도 없다. Radio 점을 아이콘 대신 span으로 바꾼 전례(ADR 0035)와 같은 판단이다.
- Radio는 채움이 없어 점 하나가 움직임을 맡는다. 짧은 overshoot가 「골랐다」는 반응을 채움 없이도 준다.
- 누름 축소는 Button·IconButton 관례이고 끄는 prop(`noPressScale`)까지 함께 정해져 있다(ADR 0010). 참고 예시는 Radio만 눌릴 때 작아졌는데, Checkbox와 Radio가 다르게 반응하면 같은 선택 컨트롤로 읽히지 않는다. 둘 다 넣지 않는다.

## 위험과 대응

- **체크된 상자의 포커스 테두리:** 채움이 테두리까지 덮어, 체크된 상자에서는 포커스 색 테두리 대신 바깥 3px halo만 보인다. halo가 포커스 표시를 맡는다(ADR 0032).
- **forced-colors:** 채움 레이어가 숨고 input이 Highlight로 칠한다. 표시는 opacity로만 숨어 선택된 상태에서 보인다. browser 테스트의 forced-colors instance가 확인한다.
- **움직임 줄이기와 forced-colors 테스트:** 두 번째 browser instance가 두 설정을 함께 켜 채움 레이어가 숨는다. 채움의 움직임 줄이기는 기본 instance에서 `emulateReducedMotion` 명령으로 확인한다.
- **앱이 값을 바꿔도 움직인다:** 첫 렌더 뒤 `checked`·`indeterminate`를 앱이 바꾸면(전체 선택 등) 사용자가 누른 것과 같게 움직인다. 바뀐 것을 보여 주는 쪽이라 그대로 둔다.

## 고려한 대안

- **CSS animation(keyframe) + `display` 전환:** 마운트할 때마다 재생된다. 첫 렌더를 막으려면 마운트 뒤에 class를 붙이는 상태가 필요하고, SSR 결과와 첫 클라이언트 렌더가 달라진다.
- **input의 `::before`로 채움 그리기:** `appearance: none` input의 가상 요소는 브라우저마다 그려지지 않을 수 있다. 형제 span이 확실하다.
- **해제할 때 거꾸로 지우지 않고 opacity로만 사라지기:** 처음 구현이었다. 그리기와 해제의 길이 달라 「무엇이 풀렸는지」가 덜 보여 바꿨다.
- **pop 변형(스프링 확대):** 그리기와 함께 두면 고를 방법이 둘이 된다(③).
- **`IconBase`에 path props 통로를 더하기:** 아이콘 패키지 공개 계약이 넓어지고, non-scaling-stroke와 `pathLength`가 함께 맞지 않는 문제는 그대로다.

## 결과

- Checkbox는 `@tide-design/icons`의 `CheckIcon`·`MinusIcon`을 쓰지 않는다. path 모양은 같고 화면 두께는 3px에서 2px로 얇아진다. ADR 0036 「결과」에 남겨 둔 체크 굵기 문제를 여기서 정한다.
- Checkbox 체크 채움은 input 바탕이 아니라 채움 레이어가 그린다(forced-colors 제외). 체크된 상자의 input 바탕은 canvas다.
- 공용 `choiceMarkClass`는 `hidden` 대신 `opacity-0 transition-opacity`다. Checkbox·Radio가 보이는 조건과 움직임 class를 각자 더한다.
- props와 이름(공개 계약)은 그대로이고 겉모습의 움직임이 더해진다. 눈에 띄는 변화라 `@tide-design/components` minor로 낸다.
