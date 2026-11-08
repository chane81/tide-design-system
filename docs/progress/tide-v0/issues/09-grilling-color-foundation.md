# 컬러 Foundation 결정

Type: grilling
Status: resolved
Blocked by: 08, 03

## Question

스케일 생성 방식, 단계 수, 앵커 단계, 중립색·상태색 초안은 [컬러 스케일 후보 시각 비교](08-prototype-color-scale.md)에서 정했다(A: OKLCH L 계단, 50~950, blue 500 = `#3183f5`). 이 티켓에서는 그 스케일 위에 Semantic 색 Token 목록(bg, text, border, 상태별), light와 dark 매핑(같은 스케일을 반전할지, dark 전용 스케일을 둘지), 대비 검증 규칙(CI 자동 검사 여부, APCA 병행 여부)을 결정한다.

## Answer

Semantic 색은 **역할(Role) 6개 × 속성 6개**로 구성한다. dark Theme은 **같은 스케일을 반전**해서 만든다. 대비는 **WCAG 2.x 대비비 하나만** 기준으로 삼고, 명시한 **대비 쌍** 목록을 vitest로 CI에서 검사한다. 아래 매핑으로 128쌍을 계산했고 모두 통과했다. 가장 빠듯한 조합은 success solid 600 위 흰 글자로 4.63:1이다.

> 아래 Token 이름은 모두 가칭이다. 실제 이름, prefix, Utility class 형태는 「Token 네이밍과 Utility class 노출 규칙 결정」에서 정한다. 이 티켓은 어떤 Token이 필요한지와 각 Token이 어느 Primitive를 참조하는지만 정한다.

### 기본 구조

- **역할**: `neutral`, `primary`, `success`, `warning`, `danger`, `info`(6개)
  - `secondary`/`accent`는 두지 않는다. 보조 강조는 `neutral`로 한다.
  - `info`(H 225)는 `primary`(H 257.8)와 구분해서 따로 둔다. 원칙 ② 명확함에 따른 결정이다.
- **속성**: `bg`, `text`, `border`, `focus-ring`, `overlay`, `shadow`
  - 아이콘은 별도 속성 없이 `text` 색(`currentColor`)을 따른다.
  - `shadow`는 그림자 **색**만 정한다. 크기, 블러, 단계 같은 형태는 elevation Foundation에서 정한다.
- **hover/active**는 계산하지 않고 별도 Semantic Token으로 둔다. 상태 색도 대비 검사와 자동완성 대상에 포함하기 위해서다.
- **Primitive 값은 hex(sRGB)가 정본**이다. OKLCH 생성 규칙(「컬러 스케일 후보 시각 비교」의 A)은 초안을 만드는 스크립트로만 쓴다. 저장한 hex는 손으로 조정해도 된다. 앵커 `#3183f5`는 원본 그대로 둔다.
- **dark Theme**: 같은 Primitive 스케일에서 참조 단계만 바꾼다. dark 전용 스케일이나 추가 단계(예: `975`)는 두지 않는다.

### 표면(surface) 계층

| 층 | 용도 | light | dark |
|---|---|---|---|
| canvas | 페이지 배경 | white | gray-950 |
| surface | 카드, 패널 | white(+border) | gray-950(+border) |
| raised | popover, dropdown, modal | white(+shadow) | gray-900(+border) |

dark에서는 그림자가 잘 보이지 않으므로, 높이를 주로 표면 밝기로 표현한다. dark에서 표면으로 쓰는 가장 밝은 단계는 900이다. 800을 표면으로 쓰면 역할 text와 muted text가 4.5:1에 못 미친다.

### 역할별 Token

| Token(가칭) | light | dark |
|---|---|---|
| bg solid / hover / active | 600 / 700 / 800 | 600 / 700 / 800 (light와 같음) |
| bg subtle / hover / active | 50 / 100 / 200 | 950 / 900 / 800 · **neutral만** 900 / 800 / 700 |
| text (역할색 글자) | 800 | 200 · neutral은 아래 `default`를 씀 |
| border (역할색 테두리) | 600 | 400 |

- solid는 두 Theme 모두 600을 쓴다. 흰 글자 대비가 5.05:1이기 때문이다. dark에서 hover를 밝은 쪽(500)으로 가면 흰 글자 대비가 3.69가 되므로, hover와 active는 두 Theme 모두 **진해지는 방향**으로 간다.
- blue 600과 dark canvas의 대비는 2.88이다. 버튼은 글자 라벨로 식별되므로 WCAG 1.4.11상 배경 경계에는 대비 요건이 없다.
- 역할 text를 700/300으로 두면 subtle-active(200/800) 위에서 4.5:1에 못 미치는 경우가 생겨 800/200으로 정했다(light success 4.22, dark success 4.48).
- dark neutral subtle은 950이 canvas와 같은 색이라 한 단계 밝혔다. 그 결과 raised(900) 위에서는 neutral subtle의 기본 상태가 배경과 같은 색이 된다. raised 위 요소(메뉴 항목 등)는 기본 상태를 투명하게 두고 hover부터 subtle을 쓴다. 이 사용 규칙은 「Component 공통 API 규칙 결정」에서 다룬다.

### 공통 Token

| Token(가칭) | light | dark | 대비 검사 |
|---|---|---|---|
| text default | gray-900 | gray-50 | 4.5:1 |
| text muted | gray-600 | gray-300 | 4.5:1 |
| text disabled | gray-400 | gray-600 | 제외 |
| on-solid (solid 위 글자, 모든 역할 공통) | white | white | 4.5:1 |
| border default (구분선, 장식용) | gray-200 | gray-800 | 제외 |
| border strong (입력창 등 UI 식별용) | gray-500 | gray-400 | 3:1 |
| focus-ring | blue-600 | blue-400 | canvas, raised 위 3:1 |
| bg disabled | gray-100 | gray-900 | 제외 |
| overlay (modal 배경) | gray-950, alpha 50% | gray-950, alpha 70% | — |
| shadow 색 | gray-950, alpha 12% | black, alpha 40% | — |

- focus-ring은 요소에서 offset을 두고 그려서 canvas나 surface와 맞닿게 한다. 오류 상태에서도 색을 바꾸지 않는다.
- alpha는 overlay와 shadow 두 Token에서만 쓴다. 값은 8자리 hex로 쓴다. Primitive에는 alpha 스케일을 두지 않는다.
- disabled는 대비 검사에서 제외한다. 대신 Component는 `disabled`/`aria-disabled` 속성과 cursor로도 비활성 상태를 표현해야 한다(원칙 ① "색만으로 상태 구분 금지").
- shadow의 alpha 값은 elevation을 결정할 때 다시 조정할 수 있다.

### 대비 검증 규칙

- 기준: WCAG 2.x 대비비만 쓴다. 텍스트는 4.5:1, UI 요소(border strong, 역할 border, focus-ring)는 3:1이다. APCA는 쓰지 않는다.
- 대상: 모든 text × 모든 bg 조합이 아니다. **실제로 함께 쓰는 쌍을 명시한 목록**이다. 목록은 Token 정의 옆에 둔다.
  - 역할 text × {canvas, raised, 같은 역할 subtle 3단계}
  - on-solid × 각 역할 solid 3단계
  - 역할 border, border strong, focus-ring × {canvas, raised}
  - default, muted × {canvas, raised}
- 검사 방식: vitest 테스트로 light와 dark 양쪽의 모든 쌍을 검사하고, 하나라도 기준에 못 미치면 CI를 실패시킨다. Semantic Token을 새로 추가할 때 쌍을 등록하지 않아도 테스트가 실패한다.
- 검사에서 제외하는 것: 장식용 테두리(border default), disabled, overlay, shadow.
- 이 결정에서 쓴 대비 수치는 「컬러 스케일 후보 시각 비교」의 초안 hex로 계산했다. 나중에 hex를 손으로 조정하면 위 테스트가 다시 보장한다.
