---
"@tide-tds/foundation": minor
"@tide-tds/components": minor
---

오류 입력창(`aria-invalid="true"`)의 포커스 표시를 오류 색으로 바꿨다(ADR 0026). 포커스 중에는 border와 inset 1px를 둘 다 `border-danger`로 그려 1px → 2px 빨강이 된다. 빨간 border 안쪽에 파란 포커스 inset이 겹쳐 보이던 문제(특히 `focus-field`를 variant 없이 쓸 때)가 없어진다. Input·Textarea·Select·Combobox가 함께 바뀐다.
