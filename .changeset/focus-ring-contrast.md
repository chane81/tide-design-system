---
"@tide-design/foundation": minor
"@tide-design/components": minor
---

`focus-ring`에 요소에 붙은 2px 링을 더해 테두리 없는 요소의 포커스 표시도 표면과 3:1 이상이 되게 했다(ADR 0034). 모양이 바뀌는 변경이다.

- `focus-ring`: 요소에 붙은 2px 링(accent `border`, light 600 / dark 400단계) + 그 바깥 3px halo(accent `subtle-border`)를 그린다. 퍼짐이 3px에서 5px가 됐다. primary 링 × 표면은 light 4.70:1, dark 5.57:1이다(이전 halo만일 때 1.46:1).
- 바탕이 accent `solid`인 요소에 `focus-ring`을 직접 썼다면 `focus-visible:inset-ring-2 focus-visible:inset-ring-(color:--tide-bg-canvas)`를 함께 붙인다. 링이 바탕과 같은 색이라 안쪽 canvas 2px 틈이 있어야 떨어져 보인다. Button·IconButton `solid`와 켜진 Switch는 Component가 붙인다.
- 여러 줄로 나뉜 링크도 줄마다 링을 닫는다(`box-decoration-break: clone`).
- Alert 닫기 버튼의 링은 파스텔 글자 색(on-subtle)이라 subtle 바탕과 4.5:1 이상이다.
- `focus-field`, `--tide-focus-ring-width`(3px), 포커스 색 규칙, forced-colors 동작은 그대로다. 대비 쌍에 `border-<Role> × bg-<Role>-subtle`(3:1)을 더했다.
