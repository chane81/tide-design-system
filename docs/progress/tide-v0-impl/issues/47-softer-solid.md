# 47: solid를 덜 진하게

Status: done
Blocked by: 46 (대비 하한을 상태별 세 등급으로)

## What to build

사용자가 solid가 너무 진하다고 해서, 티켓 46(ADR 0023)으로 solid 위 글자 하한을 4.0:1로 낮췄다. 이제 그 여유를 써서 solid를 덜 진하게 바꾼다. 2026-11-13 사용자 결정(고른 안: 각 계열 600을 OKLCH L +0.03, 채도 ×0.85(상한 0.12), 색상 유지).

- 모든 계열(blue, gray, green, amber, red, cyan, purple, mint)의 600만 바꾼다. 다른 단계와 슬롯 규칙은 그대로다.
- `solid-hover`·`solid-active`는 규칙(600 + black 14% / 20%)대로 따라 바뀐다.
- 600을 solid 말고 다른 곳(경계, 포커스 표시, 글자)에 쓰는 자리도 대비 등급을 지켜야 한다. 정지 상태 4.5:1 글자 쌍이 미달하면 그 글자만 다른 단계로 옮긴다.

## 수용 기준

- [x] 600 값을 바꾸고, 다시 계산해 사용자 표와 같은지 확인한다.
- [x] 600을 쓰는 다른 자리의 대비를 확인하고, 미달하면 매핑을 옮긴다.
- [x] solid 3단계 위 흰 글자가 light·dark 모두 4.0:1 이상이다.
- [x] 스케일 명도 순서(500 > 600 > 700) 테스트가 통과한다.
- [x] 스케일·호버 값 테스트, 대비 회귀 스냅숏을 갱신한다.
- [x] Storybook story의 axe 검사가 solid 위 글자를 Tide 등급(4.0)으로 검사한다.
- [x] ADR 0022·0023에 덧붙임, color.ts 주석, 접근성 기준 문서를 고친다.
- [x] changeset 판단.

## Comments

- 2026-11-13 완료.
  - **근거 버전**: vitest 5.1.0, storybook·@storybook/addon-a11y 10.6.6, axe-core 4.14.0(저장소 설치 버전). axe 설정은 axe-core API 문서(`axe.configure`의 `rules[].selector`, `checks[]`, 지원 CSS 선택자)와 Storybook 접근성 테스트 문서(`parameters.a11y.config`가 `axe.configure()`로 넘어감)로 확인했다. 새 check의 옵션은 설치된 axe-core 4.14.0 `color-contrast` check 기본값을 그대로 옮기고 `contrastRatio.normal.expected`만 4로 바꿨다.
  - **값 다시 계산**: sRGB ↔ OKLab(Björn Ottosson 행렬)으로 이전 600에서 L +0.03, C ×0.85(상한 0.12), H 유지를 다시 계산했다. 8개 모두 사용자 표와 한 글자도 다르지 않다(반올림 차이 없음).

    | 계열   | 600 이전  | 600 이후  | 흰 글자 대비(전 → 후) | solid-hover (대비) | solid-active (대비) | C(전 → 후)    |
    | ------ | --------- | --------- | --------------------- | ------------------ | ------------------- | ------------- |
    | blue   | `#3c70bb` | `#4e7aba` | 4.97 → 4.36           | `#4369a0` (5.57)   | `#3e6295` (6.20)    | 0.130 → 0.111 |
    | gray   | `#6b7179` | `#747a81` | 4.93 → 4.34           | `#64696f` (5.54)   | `#5d6267` (6.16)    | 0.014 → 0.013 |
    | green  | `#278445` | `#428a55` | 4.70 → 4.20           | `#397749` (5.37)   | `#356e44` (6.06)    | 0.129 → 0.109 |
    | amber  | `#976500` | `#9b702f` | 5.03 → 4.42           | `#856028` (5.67)   | `#7c5a26` (6.27)    | 0.115 → 0.098 |
    | red    | `#bb4039` | `#b55a51` | 5.38 → 4.62           | `#9c4d46` (5.89)   | `#914841` (6.55)    | 0.160 → 0.120 |
    | cyan   | `#007c9e` | `#3484a1` | 4.80 → 4.23           | `#2d728a` (5.40)   | `#2a6a81` (6.04)    | 0.104 → 0.088 |
    | purple | `#7d5cb0` | `#8469b0` | 5.21 → 4.54           | `#725a97` (5.79)   | `#6a548d` (6.43)    | 0.130 → 0.110 |
    | mint   | `#14817c` | `#3a8883` | 4.71 → 4.18           | `#327571` (5.36)   | `#2e6d69` (5.99)    | 0.090 → 0.077 |

    dark Theme도 solid는 600이고 위 글자는 흰색이라 대비가 같다. dark canvas(gray-950) 위 solid 바탕은 3.15~3.48:1로 이전보다 표면과 더 잘 구분된다(대비 의무는 없다).

  - **600의 다른 쓰임**:
    - `border`(light, Role·색 이름) × 표면 층: 4.20:1 이상(3:1 통과). dark는 400이라 그대로다.
    - `outline-focus`(light, blue-600) × 표면 층 4.36:1, × 역할 subtle 3.56:1 이상(3:1 통과).
    - **`text-muted`(light, gray-600) × 표면 층: 4.34:1로 4.5:1 미달.** 그래서 `text-muted` light를 gray-700(6.33:1)으로 옮겼다. gray-600은 solid·border 자리에만 남는다.
    - `text-disabled`(dark, gray-600)는 대비 검사 제외 Token이다. 조금 밝아져 dark에서 비활성 글자가 약간 더 보인다.
  - **스케일 명도 순서**: 모든 계열이 500 > 600 > 700을 지킨다. 다만 500→600 간격이 L 0.044~0.049, 600→700이 0.085~0.089로 고르지 않다(아래 판단 보류).
  - **Storybook axe 검사**: story 테스트의 axe `color-contrast`는 일반 글자에 4.5:1을 걸어, 새 solid 위 흰 글자(4.17~4.41, axe 반올림)가 31개 story에서 실패했다. 모두 흰 글자 × solid 600이었고 다른 위반은 없었다. `.storybook/preview.tsx`에서 axe를 둘로 나눴다.
    - 기본 `color-contrast`: `*-on-solid` class와 `data-contrast-tier="4"`가 없는 요소만(4.5:1 그대로).
    - 새 규칙 `tide-lower-tier-contrast`: 그 요소만 4.0:1(같은 `color-contrast-evaluate`, 같은 `color-contrast-matches`, `wcag2aa` tag).
    - 대비 쌍 표의 견본(`ContrastPairs`)은 inline style로 칠해 class가 없어 `data-contrast-tier`를 단다.
    - 새 규칙이 실제로 도는지 기대값을 잠시 4.5로 올려 Badge story가 `tide-lower-tier-contrast`로 실패하는 것을 확인하고 4로 되돌렸다.
  - **문서**: ADR 0022 §4에 값 표 덧붙임, ADR 0023 Consequences에 「이제 4.5 아래 쌍이 있다」 덧붙임, 접근성 기준 문서에 axe 검사 등급 한 줄, `color.ts` 상단 주석, `semantic.ts` text-muted 주석. Color.mdx는 600 hex를 직접 적지 않고 블록이 Token에서 읽어 따로 고칠 것이 없다. 색 스케일 타일의 글자색은 검정·흰색 중 대비가 높은 쪽을 자동으로 골라, red를 뺀 7개 계열의 600 타일 글자가 흰색에서 검정으로 바뀐다(검정 4.63~5.03 > 흰색 4.18~4.54). red-600은 흰색 4.62 > 검정 4.55라 흰색 그대로다. Button·Badge solid 글자는 `on-solid`(흰색)라 바뀌지 않는다.
  - **changeset**: `@tide-tds/foundation`·`@tide-tds/components` minor. Token 이름은 그대로지만 화면 색이 바뀌는 시각 변화이고 `text-muted` 매핑이 바뀐다(ADR 0022 Consequences의 「값이 바뀌면 0.x minor」 관례). components는 코드 변화가 없지만 fixed 묶음이고 버튼·배지 색이 바뀌어 changelog에 남긴다. `@tide-tds/docs` patch(axe 검사 설정).
  - **멈출 조건 확인**: 4.0 쌍 미달 없음(on-solid 최저 4.18). 정지 상태 4.5 쌍 미달은 `text-muted` light 하나이고, 매핑을 gray-700으로 옮겨 해결했다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**: [판단 보류 목록](../../tide-color-tone-impl/review-backlog.md) 「티켓 47」.
