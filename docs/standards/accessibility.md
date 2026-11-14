# 접근성 기준

Tide의 Foundation과 Component는 WCAG 2.2 AA와 Tide가 덧붙인 규칙을 지킨다.

근거 원칙: [① 접근성이 미려함보다 우선한다](../principles/README.md#-접근성이-미려함보다-우선한다--accessible-over-beautiful)

Tide의 최소 기준은 **WCAG 2.2 AA**다([W3C 권고안](https://www.w3.org/TR/WCAG22/)). 아래 표는 Tide의 Foundation과 Component에 직접 영향을 주는 항목만 골라 정리한 것이다. 세부 판정은 원문을 따른다.

| 항목                 | WCAG 성공 기준                                                                                                | 수준 | Tide에서 지킬 것                                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 텍스트 대비          | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)                      | AA   | 일반 텍스트는 4.5:1 이상, 큰 텍스트는 3:1 이상. Tide는 정지 상태 글자에 4.5:1을 지키고, hover·누름 같은 일시 상태 글자와 solid 위 글자는 4.0:1로 둔다([ADR 0023](../decisions/0023-tiered-contrast-minimum.md), 아래 참고) |
| UI 요소 대비         | [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)                     | AA   | 입력 테두리, 아이콘, 포커스 표시는 인접한 색과 3:1 이상                                                                                                                                                                    |
| 색에만 의존하지 않기 | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)                                | A    | error, success 같은 상태는 색과 함께 아이콘이나 텍스트로도 표시한다                                                                                                                                                        |
| 키보드               | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard)                                        | A    | 모든 상호작용 Component는 키보드만으로 조작할 수 있어야 한다                                                                                                                                                               |
| 포커스 표시          | [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)                              | AA   | 포커스 링을 제거하지 않는다                                                                                                                                                                                                |
| 포커스 가림          | [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum) | AA   | sticky 영역이나 overlay가 포커스된 요소를 완전히 가리지 않는다                                                                                                                                                             |
| 터치 영역            | [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)                | AA   | 클릭 대상은 24×24 CSS px 이상(예외 조건은 원문 참고)                                                                                                                                                                       |

## Tide가 덧붙이는 규칙

다음은 AA 필수 항목이 아니지만 Tide가 스스로 정한 기준이다.

- 클릭할 수 있는 Component의 높이는 24px(size `xs`)보다 작게 만들지 않는다. 아이콘만 있는 버튼도 24×24 이상이다. 2.5.8의 예외 조건(간격 확보 등)에 기대지 않고 크기 자체로 기준을 맞춘다.
- `prefers-reduced-motion: reduce` 설정을 존중한다. 이 설정이 켜져 있으면 장식 목적의 모션은 끈다(원칙 ②와도 이어짐).
- 대비 검증은 손으로 하지 않고 자동으로 한다. 기준은 WCAG 2.x 대비비 하나만 쓰고, APCA는 쓰지 않는다.
- 검사 대상은 실제로 함께 쓰는 전경/배경 Token 쌍을 명시한 목록(대비 쌍)이다. light와 dark 모두에서 하나라도 기준에 못 미치면 CI가 실패한다.
- 대비 쌍의 하한은 세 등급이다([ADR 0023](../decisions/0023-tiered-contrast-minimum.md)). 정지 상태 글자 4.5:1, hover·누름 같은 일시 상태 글자와 solid 위 글자 4.0:1, 경계·포커스 표시·thumb 같은 UI 요소 3:1이다. 일시 상태와 solid 위 글자의 4.0:1은 1.4.3을 엄격하게 읽은 기준(상태 구분 없이 4.5:1)보다 낮을 수 있는, 심미성을 위해 고른 Tide의 완화다.
- 포커스 halo(요소 accent의 200단계, dark 800단계)는 표면과 3:1에 못 미친다(light 흰 표면 위 약 1.5:1). 테두리가 있는 요소는 3:1 포커스 테두리가 함께 바뀌지만 테두리가 없는 요소는 halo가 유일한 표시라, 1.4.11을 엄격하게 읽으면 미달인 Tide의 예외다([ADR 0032](../decisions/0032-unified-focus-halo.md)).
- Storybook story의 axe 검사(color-contrast)도 같은 등급을 따른다. solid 위 글자(`*-on-solid` class)와 대비 쌍 견본의 4.0:1 등급(`data-contrast-tier="4"`)은 4.0:1로, 나머지 글자는 axe 기본 4.5:1로 검사한다(`apps/docs/.storybook/preview.tsx`, [티켓 47](../progress/tide-v0-impl/issues/47-softer-solid.md)).
  - hover·누름 같은 일시 상태 글자는 axe 4.0:1 규칙에 따로 표시하지 않는다. axe는 렌더된 정지 화면만 검사해 hover·누름 상태 색을 보지 않으므로, 일시 상태의 4.0:1은 대비 쌍 검사(CI)가 맡는다([티켓 48](../progress/tide-v0-impl/issues/48-softer-solid-followup.md)).
- 장식용 테두리(구분선 등), disabled 상태, overlay, shadow는 대비 검사에서 제외한다. disabled는 색 외에 `disabled`/`aria-disabled` 속성과 cursor로도 표현한다.

> 이 표의 성공 기준 번호와 수준은 2026-11-08에 W3C 문서를 기준으로 작성했다. 실제 구현에 들어가기 전에 원문을 다시 확인한다.
