---
"@tide-design/components": minor
---

Checkbox·Radio를 고를 때 움직임을 더했다.

- Checkbox를 체크하면 체크 표시가 시작점에서 끝점으로 그려진다(300ms). indeterminate 가로줄도 왼쪽에서 오른쪽으로 그려진다. 해제하면 150ms 안에 사라진다.
- Radio를 고르면 점이 가운데에서 커지며 나타난다(150ms).
- 처음 렌더할 때 이미 선택된 상자·원은 움직이지 않는다.
- 움직임 줄이기(`prefers-reduced-motion: reduce`)에서는 opacity만 바뀐다.
- Checkbox 표시는 `@tide-design/icons` 아이콘 대신 같은 모양의 전용 SVG로 그린다. 화면 두께(3px)는 같다.
