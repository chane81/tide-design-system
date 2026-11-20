---
"@tide-design/icons": minor
"@tide-design/components": minor
---

아이콘 기본 선 두께(`strokeWidth`)를 2에서 1.5로 바꿨다. 렌더 기준이라 크기와 상관없이 화면에서 1.5px로 그려진다.

- `strokeWidth`를 넘기지 않는 아이콘과 Component 안 아이콘(Button·Select·Combobox·Alert·Dialog 닫기 등)이 모두 얇아진다.
- 전 두께가 필요하면 `strokeWidth={2}`를 넘긴다. 굵은 글자 옆처럼 강조할 때, 14px 같은 작은 아이콘이 흐려 보일 때 고른다.
- Checkbox 체크·대시(3)와 Spinner(2px)는 그대로다.
