# primary solid를 흰 글자 4.5:1 이상인 `#2f6fe0`으로 바꾸고 blue-600 한 단계만 손으로 고친다

근거 원칙: ① 접근성이 미려함보다 우선한다, ③ 단순함이 유연함보다 우선한다

0.12.0에서 blue 스케일을 앵커 `#148cfc` 기준으로 다시 만들면서 primary solid(blue-600)는 `#1e7bd8`이 되었다([ADR 0022 덧붙임 2026-11-14](0022-pastel-intensity-and-overlay-states.md)). 흰 글자 대비는 4.30:1로 solid 위 글자 하한 4.0:1([ADR 0023](0023-tiered-contrast-minimum.md))은 넘지만 WCAG 1.4.3 AA(4.5:1)에는 못 미친다. 소비 앱에서 써 보니 참고 디자인보다 탁한 파랑으로 보였다. 사용자는 여러 시안을 비교한 끝에 solid `#2f6fe0`(흰 글자 4.70:1)을 골랐다(2026-11-15, 사용자 결정).

## 결정

- **blue-600을 `#1e7bd8`에서 `#2f6fe0`으로 바꾼다.** 다른 blue 단계(50~500, 700~950)와 다른 계열은 그대로다. 앵커 500 `#148cfc`도 그대로다.
- 정본이 hex라 단계 하나를 손으로 고친다(`packages/foundation/src/color.ts`). 대비 쌍 검사가 다시 보장한다.
- 슬롯 규칙은 그대로다. `solid-hover`·`solid-active`는 600에 black 14%·20%를 덮은 값이라 따라 바뀐다.

| 단계 | 이전      | 이후      | OKLCH L / C / H       | 흰 글자 대비 |
| ---- | --------- | --------- | --------------------- | ------------ |
| 500  | `#148cfc` | 그대로    | 0.640 / 0.192 / 253.3 | 3.39         |
| 600  | `#1e7bd8` | `#2f6fe0` | 0.564 / 0.185 / 260.8 | 4.30 → 4.70  |
| 700  | `#0060b3` | 그대로    | 0.490 / 0.152 / 253.2 | 6.32         |

600을 쓰는 슬롯이 바뀐다. light·dark 값은 아래와 같다.

| 슬롯(blue 계열, primary·accent 기본)       | light 이전 → 이후            | dark 이전 → 이후             |
| ------------------------------------------ | ---------------------------- | ---------------------------- |
| `solid`(600)                               | `#1e7bd8` → `#2f6fe0` (4.70) | `#1e7bd8` → `#2f6fe0` (4.70) |
| `solid-hover`(600 + black 14%)             | `#1a6aba` → `#285fc1` (6.00) | `#1a6aba` → `#285fc1` (6.00) |
| `solid-active`(600 + black 20%)            | `#1862ad` → `#2659b3` (6.64) | `#1862ad` → `#2659b3` (6.64) |
| `border`(light 600, dark 400)              | `#1e7bd8` → `#2f6fe0`        | `#53a3fe` 그대로             |
| `outline-focus` Token(light 600, dark 400) | `#1e7bd8` → `#2f6fe0`        | `#53a3fe` 그대로             |

괄호는 흰 글자(`on-solid`) 대비다. light `border`·`outline-focus` × 표면은 4.30:1 → 4.70:1(raised 위도 같음)이다. `text`(700)·`subtle`·`faint`·`subtle-border`·`on-subtle`은 600을 쓰지 않아 그대로다.

## 고려한 대안

- **의미 Token만 바꾸기(blue 계열 `solid` 3단계와 light `border`만 `#2f6fe0` 계열로, Primitive blue-600은 그대로):** 소비 앱(tide-web)이 앱 쪽 덮어쓰기로 쓴 방식이다. Tide에서는 슬롯 값이 계열 단계·Primitive·덮기·섞기만 가리킬 수 있어(ADR 0011, `colorSlot.ts`) 스케일 밖 hex를 넣으려면 새 Primitive나 새 값 꼴을 만들어야 한다. `bg-blue-600`·`--tide-color-blue-600`이 `bg-primary-solid`와 다른 색이 되어 「Role은 계열 단계를 가리킨다」는 규칙도 깨진다.
- **blue 스케일 전체를 `#2f6fe0`의 색상(H 260.8) 쪽으로 다시 만들기:** 600이 스케일과 같은 색상에 놓인다. 하지만 하루 전 사용자가 고른 앵커 500 `#148cfc`(H 253.3)를 옮기거나 다른 단계만 색상을 바꿔야 하고, Badge·Alert·Tag의 파스텔 바탕(100·200)과 글자(700)까지 바뀐다. 사용자가 고른 것은 solid 하나다.
- **600을 스케일 색상(H 253.3)에 맞춰 4.5:1이 되도록 L만 내리기:** 스케일은 고르게 남지만 사용자가 고른 `#2f6fe0`이 아니다.
- **hover·active도 사용자 시안 값(`#1c5ccc`·`#1354c2`)으로 두기:** tide-web은 Tide의 단계 차이를 OKLCH 밝기(ΔL −0.059, −0.087)로 재고 채도·색상을 유지해 만들었다. Tide는 모든 계열이 「600 + black 14%·20%」 규칙 하나를 따르므로(ADR 0022 §2) 계열 덮어쓰기를 두지 않는다. 규칙 값은 채도가 조금 낮다(C 0.165·0.153, 시안은 0.186·0.184).

## 결과

- **600이 스케일의 색상에서 벗어난다.** 600만 H 260.8로 500·700(H 253)보다 약 7.5° 보라 쪽이다. L은 500(0.640)과 700(0.490) 사이라 밝기 순서는 지킨다. 스케일을 다시 만들 때는 이 예외부터 다시 판단한다.
- **채도 상한 예외가 더 커진다.** blue 600의 채도는 0.165 → 0.185로 solid 채도 상한(0.12, 티켓 47)을 더 넘는다. ADR 0022 덧붙임(2026-11-14)이 이미 blue만 예외로 두었다.
- 바뀌는 곳: Button·IconButton solid(hover·누름 포함)와 outline 테두리(light), solid Badge, 체크된 Checkbox·Radio(바탕·테두리), 켜진 Switch. primary(기본 accent)와 `data-color="blue"` 모두다. `border-primary`·`outline-focus`(light)와 `bg-blue-600` 같은 Primitive Utility도 바뀐다.
- 그대로인 곳: Alert·Tag·subtle·faint Badge(100·200·950단계), `text-primary`(700, Progress 막대·링크 글자), dark의 테두리(400). info는 cyan 계열이라 그대로다.
- **포커스 테두리 색(light)도 따라 바뀐다.** 포커스 테두리(입력창 계열, Checkbox·Radio 상자, outline 버튼)는 accent `border` 슬롯(light 600)이라 `#2f6fe0`이 된다. 포커스 모양·halo(200 / 800단계)·규칙([ADR 0032](0032-unified-focus-halo.md))은 그대로다.
- 시각 값 조정이라 patch다(CONTRIBUTING 「버전 규칙」). Token 이름·Utility class는 그대로다.
- tide-web의 앱 덮어쓰기를 지우면 solid·light border는 같은 값이고, hover·active만 `#1c5ccc`·`#1354c2`에서 `#285fc1`·`#2659b3`으로 조금 밝고 채도가 낮아진다.
