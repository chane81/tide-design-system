---
"@tide-design/foundation": patch
"@tide-design/components": minor
---

고른 `Radio`를 원 전체를 채우는 대신 canvas 바탕 + 2px accent 테두리 + 가운데 점(`md` 10px, `sm` 8px)으로 그린다(ADR 0035). props와 class 이름은 그대로라 코드는 고칠 것이 없다.

- hover·누름은 바탕만 accent subtle·subtle-active가 되고 테두리·점 색은 그대로다. 오류면 테두리가 danger, 비활성이면 회색이다. forced-colors에서는 테두리·점이 `Highlight`다.
- 버그 수정: 아무것도 고르지 않은 라디오 묶음(모든 radio가 `:indeterminate`)에서 Checkbox용 indeterminate 모양이 걸려 원이 모두 accent로 차던 문제를 고쳤다. 이제 회색 테두리의 빈 원이다.
- `Checkbox` 모양은 그대로다. 대비 쌍에 `border-<Role> × bg-<Role>-subtle-active`(3:1)를 더했다.
