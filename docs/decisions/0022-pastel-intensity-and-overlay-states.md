# 파스텔 강도와 덮기 방식 상태색으로 컬러 Foundation의 색감을 바꾼다

근거 원칙: ① 접근성이 미려함보다 우선한다, ② 명확함이 화려함보다 우선한다, ③ 단순함이 유연함보다 우선한다

solid가 너무 쨍하다는 피드백에서 시작해, 사용자가 고른 색감을 분석하고([파스텔 색감 조사](../research/pastel-color-tone.md)) [Tide 색감 조정 지도](../progress/tide-color-tone/map.md)의 티켓 01~05에서 정했다(2026-11-12, 사용자 결정). 색이 보이는 파스텔 바탕 위에 같은 색상의 아주 진한 글자를 얹고 한 톤 진한 테두리를 두르며, solid는 채도를 낮추고, 호버·클릭은 색을 바꾸지 않고 덮는다.

[ADR 0011](0011-open-color-names-data-color-accent.md)의 accent 슬롯 9개를 12개로 늘리고, [컬러 Foundation 결정](../progress/tide-v0/issues/09-grilling-color-foundation.md)의 슬롯 매핑·hover/active 값을 바꾼다. 「hover/active는 별도 Semantic Token으로 둔다」는 그대로다. Token 값을 계산하는 방법만 바뀐다.

## 결정

### 1. 슬롯과 강도

새 슬롯 셋을 `colorSlots`에 더한다. Role Token, accent 변수, 색 계열 변수, `[data-color]` 규칙, `defineColorFamily`의 덮어쓸 값에 기존 슬롯과 똑같이 붙는다.

| 슬롯            | 뜻                            | accent Utility class    | Role Token(예: primary)  |
| --------------- | ----------------------------- | ----------------------- | ------------------------ |
| `faint`         | 가장 약한 바탕(새 강도)       | `bg-accent-faint`       | `bg-primary-faint`       |
| `on-subtle`     | `subtle`·`faint` 바탕 위 글자 | `text-accent-on-subtle` | `text-primary-on-subtle` |
| `subtle-border` | 파스텔 테두리(꾸밈)           | `border-accent-subtle`  | `border-primary-subtle`  |

- **강도**는 `solid` > `subtle` > `faint` 세 가지가 된다. `faint`는 바탕 한 자리뿐이다(hover·active·전용 글자·테두리 없음). 이름은 `muted`(`text-muted`와 겹침)와 `soft`(다른 시스템에서 subtle보다 진한 뜻)를 피했다.
- **`text`**는 바탕 없이 쓰는 색 글자 전용이다(Link, Progress, Switch, Pagination, Toast, Button outline·ghost). **`border`**는 outline·선택 표시용으로 그대로다.
- **neutral**의 `on-subtle`은 `text-default`를 공유한다(`roleSharedSlots`).
- **`subtle-border`는 대비 검사에서 뺀다.** 배지·Alert는 바탕과 글자만으로 알아볼 수 있어 테두리가 꾸밈이다(WCAG 1.4.11 대상 아님). Alert의 「경계 3:1」 대비 쌍도 지운다.

Component 적용 범위:

| 슬롯            | Component                                             |
| --------------- | ----------------------------------------------------- |
| `on-subtle`     | Badge subtle·faint, Tag, Avatar, Alert, Button subtle |
| `subtle-border` | Badge subtle, Tag, Alert(`border-accent` 대신)        |
| `faint`         | Badge(`variant="faint"`)만                            |

### 2. 슬롯 규칙: 단계, 덮기, 섞기

슬롯은 지금처럼 스케일 단계를 가리킨다. 여기에 두 형태를 더한다.

- **덮기**: 단계 위에 색을 n% 덮은 값. 예: `100 + gray-950 4%`
- **섞기**: 두 단계를 반씩 섞은 값. 예: `gray-950과 950을 50%`

| 슬롯                             | light                  | dark                        |
| -------------------------------- | ---------------------- | --------------------------- |
| `faint`                          | 50                     | gray-950과 950을 50%씩 섞기 |
| `subtle`                         | 100                    | 950                         |
| `subtle-hover` / `subtle-active` | 100 + gray-950 4% / 8% | 950 + white 6% / 10%        |
| `subtle-border`                  | 200                    | 800                         |
| `on-subtle`                      | 950                    | 100                         |
| `solid`                          | 600                    | 600                         |
| `solid-hover` / `solid-active`   | 600 + black 14% / 20%  | 600 + black 14% / 20%       |
| `text`                           | 700 (지금 800)         | 300 (지금 200)              |
| `border`                         | 600                    | 400                         |
| `on-solid`                       | white                  | white                       |

덮은 값은 빌드할 때 hex로 계산해 Token에 넣는다. 그래서 대비 검사와 자동완성은 지금처럼 Token 단위로 된다.

### 3. 무채색 호버 Token

Button outline·ghost와 목록 항목(Menu, Table 행 등)의 호버·클릭은 색 없이 덮는다. 공통 Token 둘을 더한다.

| Token       | light           | dark         |
| ----------- | --------------- | ------------ |
| `bg-hover`  | gray-950 α 0.04 | white α 0.06 |
| `bg-active` | gray-950 α 0.08 | white α 0.10 |

이 바탕 위의 `text`(light 700, dark 300)는 모든 계열에서 4.5:1 이상이다(light 최저 5.15:1).

> 덧붙임(2026-11-12, [ADR 0023](0023-tiered-contrast-minimum.md)): 이 바탕은 hover·누름에만 쓰므로 그 위 글자의 하한은 일시 상태 등급 4.0:1로 바뀌었다. 값은 그대로다.

> 덧붙임(2026-11-13, [ADR 0025](0025-tinted-outline-ghost-states.md)): Button·IconButton의 Role 색 `outline`·`ghost`는 같은 색 `faint`·`subtle`로 채운다. 색 없이 덮는 방식은 neutral `outline`·`ghost`와 목록 항목·Table 행·Accordion 트리거에 남는다.

### 4. 스케일 값

- Role 계열 다섯(blue, green, amber, red, cyan)의 50·100·200·300·950을 계열마다 손으로 다시 맞춘다. 바탕 100은 L 0.945 안팎·C 0.02~0.05, 글자 950은 L 0.33~0.36이다. 계열마다 채도가 다른 것은 의도다.
- **solid 채도 상한**은 C 0.13이다(blue·green의 600~900). red만 0.16이다(0.13에서는 벽돌색이 되어 경고 느낌이 약했다). amber·cyan은 원래 낮아서 그대로다.
- **amber**의 연한 단계는 노랑 쪽으로 옮긴다(50~200 H 95, 300 H 88, 400 H 80). 500~950은 지금 amber(H 75)다. 파스텔은 노랗게 보이고 warning solid는 경고색으로 남는다. 노랑을 별도 계열로 두지 않는 이유는 파스텔에서 amber와 구분되지 않았기 때문이다.
- **앵커** blue-500 `#3183f5`는 바꾸지 않는다. 500은 어느 슬롯도 쓰지 않아서, 500→600 채도 끊김은 스케일 견본에서만 보인다.
- gray는 그대로다.
- 값 표: [02 결정](../progress/tide-color-tone/issues/02-grilling-scale-values.md), [05 결정](../progress/tide-color-tone/issues/05-grilling-purple-family.md)

> 덧붙임(2026-11-13, [tide-v0-impl 티켓 47](../progress/tide-v0-impl/issues/47-softer-solid.md)): solid가 아직 진하다는 사용자 판단으로 모든 계열(gray 포함)의 600을 덜 진하게 바꿨다. 이전 600에서 OKLCH L +0.03, 채도 ×0.85(상한 0.12), 색상 유지다. 흰 글자 대비는 4.18~4.62:1로 solid 위 글자 하한 4.0:1([ADR 0023](0023-tiered-contrast-minimum.md))을 넘는다. `solid-hover`·`solid-active`는 규칙(600 + black 14% / 20%)이 그대로라 값만 따라 바뀐다.
>
> | 계열   | 600 이전  | 600 이후  | 흰 글자 대비 | solid-hover | solid-active |
> | ------ | --------- | --------- | ------------ | ----------- | ------------ |
> | blue   | `#3c70bb` | `#4e7aba` | 4.36         | `#4369a0`   | `#3e6295`    |
> | gray   | `#6b7179` | `#747a81` | 4.34         | `#64696f`   | `#5d6267`    |
> | green  | `#278445` | `#428a55` | 4.20         | `#397749`   | `#356e44`    |
> | amber  | `#976500` | `#9b702f` | 4.42         | `#856028`   | `#7c5a26`    |
> | red    | `#bb4039` | `#b55a51` | 4.62         | `#9c4d46`   | `#914841`    |
> | cyan   | `#007c9e` | `#3484a1` | 4.23         | `#2d728a`   | `#2a6a81`    |
> | purple | `#7d5cb0` | `#8469b0` | 4.54         | `#725a97`   | `#6a548d`    |
> | mint   | `#14817c` | `#3a8883` | 4.18         | `#327571`   | `#2e6d69`    |
>
> 600을 쓰는 다른 자리도 함께 밝아진다. `border`(light)와 `outline-focus`(light)는 표면 위 4.20:1 이상, `outline-focus` × subtle은 3.56:1 이상으로 3:1을 넘는다(dark는 400이라 그대로). `text-muted`(light)는 gray-600이 흰 표면 위 4.34:1로 4.5:1에 못 미쳐 gray-700(6.33:1)으로 옮겼다.

> 덧붙임(2026-11-14, 사용자 결정): 파랑이 티미하다는 사용자 판단으로 **앵커 blue-500을 `#3183f5`에서 `#148cfc`로 바꾸고** blue 스케일 전체를 다시 만들었다. 위의 「앵커는 바꾸지 않는다」를 뒤집는다. 단계마다 OKLCH L은 이전 값을 두고, 색상을 H 253.3(새 앵커 쪽)으로 옮기고 채도를 올렸다. 600은 흰 글자 대비 4.3:1 안팎이 되도록 L을 골랐다. **blue 600의 채도는 0.165로 solid 채도 상한(0.13, 티켓 47에서 0.12)을 넘는다.** 다른 계열의 상한은 그대로다. 슬롯 규칙은 그대로라 덮기·섞기 값은 따라 바뀐다.
>
> | 단계 | 이전      | 이후      | OKLCH L / C   |
> | ---- | --------- | --------- | ------------- |
> | 50   | `#eff4fc` | `#ecf5ff` | 0.966 / 0.017 |
> | 100  | `#e3eefd` | `#e1eeff` | 0.944 / 0.027 |
> | 200  | `#c9d7eb` | `#bfd8f7` | 0.874 / 0.051 |
> | 300  | `#a7c0e3` | `#97c2f4` | 0.801 / 0.085 |
> | 400  | `#65a1f9` | `#53a3fe` | 0.706 / 0.155 |
> | 500  | `#3183f5` | `#148cfc` | 0.640 / 0.192 |
> | 600  | `#4e7aba` | `#1e7bd8` | 0.581 / 0.165 |
> | 700  | `#2b5fa8` | `#0060b3` | 0.490 / 0.152 |
> | 800  | `#184c93` | `#004e94` | 0.425 / 0.132 |
> | 900  | `#114080` | `#00427f` | 0.380 / 0.119 |
> | 950  | `#113465` | `#003568` | 0.330 / 0.103 |
>
> | 계열 | 600       | 흰 글자 대비 | solid-hover (대비) | solid-active (대비) | subtle-hover | subtle-active |
> | ---- | --------- | ------------ | ------------------ | ------------------- | ------------ | ------------- |
> | blue | `#1e7bd8` | 4.30         | `#1a6aba` (5.51)   | `#1862ad` (6.20)    | `#dae6f7`    | `#d2deee`     |
>
> light의 `text`(700) × 흰 표면 6.32:1, `on-subtle`(950) × `subtle`(100) 10.46:1이다. `border`·`outline-focus`(light 600)는 표면 위 4.30:1, `outline-focus` × subtle은 3.52:1 이상으로 3:1을 넘는다. 앵커 500의 흰 글자 대비는 3.39:1이라 앵커 위에 흰 글자를 올리지 않는 원칙은 그대로다.

### 5. 장식 계열 추가

Role이 없는 장식 계열 **`purple`**(H 300)과 **`mint`**(H 190)를 더한다. 같은 규칙을 따르고 장식·분류 Component(Badge, Tag, Avatar)가 쓴다. 의미 표시(성공, 경고 등)에는 Role을 쓴다고 문서에 적는다. mint는 cyan(info, H 226)과 파스텔에서도 구분된다.

## 검토한 대안

- **solid 채도만 낮추기**: 처음 요청에 가장 가깝지만, 사용자가 고른 색감의 핵심은 solid가 아니라 파스텔 바탕·글자 조합이었다.
- **기존 `text`·`border` 슬롯의 값을 바꾸기**: 슬롯을 늘리지 않아 단순하지만, Link·Checkbox처럼 바탕 없이 쓰는 색 글자·테두리까지 거의 검정·회색빛이 된다.
- **파스텔을 공식 하나로 만들기**: 계열마다 다른 채도(청록 글자 0.05, 빨강 글자 0.115)가 사라져 원래 색감이 나지 않았다.
- **hover·active를 스케일 단계로 두기(지금 방식)**: subtle 호버의 밝기 변화가 0.071로, 관찰한 덮기 방식(0.024)보다 세 배 크다. 단계로는 은은한 호버를 낼 수 없다.
- **`text` 600 + 포인터 상태 대비 예외 4.0:1**: 링크 밝기가 관찰과 같아지지만, 무채색 호버 위에서 9쌍이 4.5:1에 못 미쳐 원칙 ①과 부딪힌다. 견본을 본 뒤 700을 골랐다.
- **amber를 버리고 yellow로 warning 칠하기**: `amber` 이름이 공개 API라 깨지는 변경이고, 흰 글자를 얹는 노랑 solid는 올리브색이 되어 경고색으로 약하다.
- **스케일 밖에 슬롯 전용 값 두기**: `defineColorFamily`의 입력이 11단계 스케일 하나에서 늘어나야 한다(③).

## Consequences

- **CSS 변수와 Utility class가 늘어난다.** accent 슬롯이 12개가 되고, 색 계열 변수 묶음과 `[data-color]` 규칙도 같이 늘어난다. Role마다 Token 셋(`bg-<role>-faint`, `text-<role>-on-subtle`, `border-<role>-subtle`)과 공통 Token 둘(`bg-hover`, `bg-active`)이 생긴다. tailwind-merge 설정에도 등록한다.
- **값이 바뀐다.** 기존 Token 이름은 그대로라 코드는 깨지지 않지만 화면 색이 달라진다. 0.x의 minor로 낸다.
- **Component 변화.** Badge(`faint` 추가, subtle 글자·테두리), Tag, Avatar, Alert(테두리를 `subtle-border`로), Button subtle(글자), Button outline·ghost와 목록 항목의 호버(`bg-hover`·`bg-active`).
- **대비 쌍이 바뀐다.** `on-subtle` × `faint`·`subtle`·`subtle-hover`·`subtle-active`(4.5), `text` × `bg-hover`·`bg-active`(4.5)를 더하고, Alert 경계 쌍을 지운다. 덮기·섞기로 계산된 값도 검사한다.
  - 덧붙임(2026-11-12, [ADR 0023](0023-tiered-contrast-minimum.md)): 하한이 상태별 세 등급으로 바뀌었다. `subtle-hover`·`subtle-active`, `bg-hover`·`bg-active` 위 글자와 `on-solid` × `solid` 3단계는 4.0, 정지 상태 글자(`faint`·`subtle` 위)는 4.5 그대로다.
- **앱 계열(`defineColorFamily`)** 입력은 11단계 스케일 그대로다. 문서에 단계별 역할(50 faint, 100 파스텔 바탕, 200 테두리, 950 파스텔 글자, 600 solid, 700 링크)과 권장 밝기·채도 범위를 적는다. 대비 쌍 검사가 같은 규칙을 강제한다.
- **외부 제품 값은 저장소에 남기지 않는다.** 조사 문서에는 조합 규칙과 범위만 있고, Tide 값은 Tide가 정한 값이다.
