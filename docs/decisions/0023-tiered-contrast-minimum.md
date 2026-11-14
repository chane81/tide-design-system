# 대비 하한을 상태별 세 등급(4.5 / 4.0 / 3)으로 나눈다

근거 원칙: ① 접근성이 미려함보다 우선한다, ② 명확함이 화려함보다 우선한다

> 이 ADR은 원칙 ①을 일부 양보한다. 정지 상태 글자의 4.5:1은 지키지만, 잠깐 지나가는 hover·누름 상태와 solid 위 글자는 하한을 4.0:1로 낮춘다. 사용자 결정(2026-11-12)이고, 아래 「Consequences」에 그 대가를 적는다.

대비 쌍의 하한은 지금까지 「글자 4.5:1, UI 요소 3:1」 두 가지였다([tide-v0 티켓 09](../progress/tide-v0/issues/09-grilling-color-foundation.md)의 대비 검증 규칙, [ADR 0022](0022-pastel-intensity-and-overlay-states.md)). 파스텔 색감([ADR 0022](0022-pastel-intensity-and-overlay-states.md))은 은은한 바탕과 덮기 방식 호버로 만드는데, 모든 글자 쌍에 4.5:1을 걸면 호버·누름처럼 잠깐 보이는 상태 때문에 기본 색까지 진하게 당겨야 한다. 실제로 ADR 0022는 `text` 600을 버리고 700을 골랐고, 티켓 02는 `text × subtle-hover·subtle-active` 쌍을, 티켓 03은 raised 위 Role 색 버튼을 4.5:1 미달로 막았다. 사용자는 「4.5:1 조건을 약간 완화시키자. 이 규칙만 지키다 보면 심미성을 놓칠 수 있다」며 상태별로 등급을 나누는 안을 골랐다([티켓 46](../progress/tide-v0-impl/issues/46-contrast-tiered-minimum.md)).

## 결정

대비 쌍의 하한(`minRatio`)은 세 등급이다.

| 등급                    | 하한  | 대상                                                                                                                                                                       |
| ----------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 정지 상태 글자          | 4.5:1 | 기본 상태에서 계속 보이는 글자. 표면 층 위 글자, `subtle`·`faint` 위 글자(`text × subtle`, `on-subtle × faint·subtle`), 선택 유지 바탕(`bg-neutral-subtle-active`) 위 글자 |
| 일시 상태·solid 위 글자 | 4.0:1 | hover·누름 배경 위 글자(`subtle-hover`·`subtle-active`, `bg-hover`·`bg-active` 합성), `solid` 3단계 위 글자(`on-solid`)                                                    |
| UI 요소                 | 3:1   | 경계, 포커스 표시, Switch thumb 같은 글자가 아닌 요소(WCAG 1.4.11)                                                                                                         |

- **한 짝은 한 번만 등록한다.** 같은 짝을 여러 쓰임이 쓰면 가장 엄한 등급으로 적는다. 예: `text-default × bg-neutral-subtle-active`는 Button subtle 누름(일시)이기도 하지만 Select·Combobox의 고른 옵션 바탕(정지)이라 4.5:1이다.
- **solid 위 글자는 상태와 관계없이 4.0:1이다.** Tide의 solid 위 글자는 버튼·배지·체크 표시 같은 짧은 label 글자(`text-label-*`, medium 굵기)다.
- **색 이름 규칙(`colorContrastRules`)도 같은 등급을 쓴다.** 앱 Role과 앱 장식 계열(`tide-color build`)도 같은 기준으로 검사한다.
- **Switch 꺼짐 누름 thumb**(`text-accent × subtle-active`)을 UI 요소 쌍(3:1)으로 등록한다. 티켓 02에서 글자 쌍을 지운 뒤 검사 밖에 있던 조합이다.
- **색 값은 바꾸지 않는다.** 이 ADR은 기준만 바꾼다. 스케일과 슬롯 규칙(ADR 0022)은 그대로다.
- 타입: 공개 타입 `ContrastPair["minRatio"]`가 `4.5 | 4 | 3`(`ContrastMinRatio`)이 된다.

## 검토한 대안

- **모든 글자 4.5:1 유지(지금 방식)**: WCAG 1.4.3을 가장 엄하게 지킨다. 하지만 호버·누름 하나 때문에 기본 색을 진하게 당기거나 쓰임을 막아야 하고, 파스텔 색감을 다듬을 여지가 거의 없다.
- **모든 글자 4.0:1로 낮추기**: 가장 단순하지만, 오래 읽는 본문과 기본 상태 글자까지 AA 아래로 내려간다. 원칙 ①과 정면으로 부딪힌다.
- **큰 글자 예외(3:1)만 쓰기**: WCAG가 인정하는 예외지만 Tide의 버튼·배지 글자는 14px 이하 medium이라 「큰 글자」(18pt, 또는 14pt bold)에 해당하지 않는다.
- **raised 위 `bg-hover`·`bg-active` 값을 따로 두기**: 티켓 03에서 미뤄 둔 보강안이다. Token이 늘고(③), 4.0:1 등급으로도 dark 누름 warning·danger가 남아 이것만으로 풀리지 않는다.

## Consequences

- **WCAG AA를 엄격하게 읽으면 일부 상태가 기준보다 낮을 수 있다.** WCAG 2.2 성공 기준 1.4.3은 상태를 가리지 않고 일반 텍스트에 4.5:1을 요구한다. 그래서 hover·누름 배경 위 글자와 solid 위 버튼 글자는 4.0:1~4.5:1 사이 값이 나와도 Tide 검사를 통과하고, 이 경우 1.4.3의 엄격한 해석에는 못 미친다. 이것은 심미성을 위해 고른 트레이드오프다. 지금 값(티켓 46 시점)에서 4.5:1 아래로 내려간 쌍은 없고(on-solid 최저 4.70:1), 앞으로 색을 다듬을 때 이 여유를 쓴다.
  - 덧붙임(2026-11-13, [tide-v0-impl 티켓 47](../progress/tide-v0-impl/issues/47-softer-solid.md)): solid(600)를 덜 진하게 바꿔 이 여유를 처음 썼다. on-solid × solid는 4.18~4.62:1(최저 mint 4.18, Role 중 최저 success 4.20)이라 이제 실제로 4.5:1 아래인 쌍이 있다. `solid-hover`·`solid-active`는 5.36:1 이상이다. Storybook의 axe 검사도 solid 위 글자는 4.0:1로 검사하도록 맞췄다([접근성 기준](../standards/accessibility.md)).
- **정지 상태 글자는 그대로 4.5:1이다.** 사용자가 오래 보는 글자와 기본 상태의 버튼·배지 subtle 글자는 AA를 지킨다.
- **raised 표면 안 Role 색 `outline`·`ghost`는 여전히 `neutral`을 권한다.** dark raised 위 누름 배경에서 `warning`(3.99:1)·`danger`(3.89:1)가 4.0:1에도 못 미친다. 수치는 [티켓 46](../progress/tide-v0-impl/issues/46-contrast-tiered-minimum.md)에 있다.
- **대비 쌍 수가 바뀐다.** Switch thumb 쌍 5개가 늘어 109개가 114개가 된다(4.5:1 39개, 4.0:1 43개, 3:1 32개). 대비비 값은 하나도 바뀌지 않는다.
- **문서가 등급을 보여 준다.** Color 문서 「대비」와 대비 쌍 표, 색 이름별 대비 표, 브랜드 색 문서의 검사 표가 세 등급을 적는다. Component 문서의 「4.5:1 이상」 문장 중 호버·누름·solid를 말하는 것은 4:1로 고친다.
- **[접근성 기준](../standards/accessibility.md)의 텍스트 대비 줄이 이 ADR을 가리킨다.**

> 덧붙임(2026-11-14, [ADR 0032](0032-unified-focus-halo.md)): UI 요소 3:1 등급은 포커스 테두리(accent `border` 슬롯)에만 적용한다. 포커스 halo(accent `subtle-border` 슬롯)는 3:1에 못 미치는 것을 알고 고른 모양이라 대비 검사에서 뺀다(파스텔 테두리 제외에 이유를 덧붙였다). Alert 닫기 버튼 등 subtle 바탕 위 조작 요소는 halo만 그려 `outline-focus × bg-*-subtle` 쌍 6개를 지웠다.
