# dark Theme 파스텔 짝 결정

Type: grilling
Status: resolved
Blocked by: 01, 02

## Question

관찰한 화면에 dark 값이 없었다. 지금 Tide dark subtle은 950/900/800 바탕에 200 글자다.

정할 것:

- 파스텔 조합의 dark 짝(어둡고 색 있는 바탕 + 밝은 같은 색 글자 + 테두리)을 어느 단계로 매핑할지
- 두 번째 파스텔의 dark 값
- 대비 쌍 검사에 추가할 쌍

## Answer

참고 화면의 dark 값은 없어서 light 규칙(색 있는 바탕 + 같은 색 글자 + 덮기)을 뒤집어 정했다. 다섯 계열 모두 대비 쌍을 통과한다.

| 슬롯 | dark |
| --- | --- |
| `faint` | gray-950과 950을 50%씩 섞기 |
| `subtle` | 950 |
| `subtle-hover` / `subtle-active` | 950 + white 6% / 10% |
| `subtle-border` | 800 |
| `on-subtle` | 100 |
| `solid` / hover / active | 600 / 600 + black 14% / 20% (light와 같음) |
| `text` | 300 (지금 200. 새 200은 채도가 낮은 테두리색이라 링크가 회색빛이 됨) |
| `border` | 400 (그대로) |

- Button outline·ghost와 목록 항목의 무채색 호버·클릭은 dark에서 white 6%·10%를 덮는다. dark `text` 300은 그 위에서도 4.5:1을 넘어 포인터 상태 예외가 필요 없다.
- 슬롯 규칙에 「두 단계 섞기」(faint) 형태가 하나 더 생긴다.

## Comments

### 6라운드(2026-11-12)

- Q23 매핑, Q24 dark `text` 300, Q25 dark 무채색 호버 white 6%·10% 모두 추천안대로
