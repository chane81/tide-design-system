---
"@tide-tds/components": minor
"@tide-tds/docs": patch
---

조작 요소 글자 크기를 맞췄다(ADR 0024).

- `sm`의 글자를 12px(`label-sm`)에서 14px(`label-md`)로 올렸다. Button `sm`, Input·Select·Combobox `sm`, Textarea `sm`(`caption` → `body-sm`)이 해당한다. 높이·padding·아이콘 크기는 그대로이고, `sm` 버튼은 글자 폭만큼 넓어진다. `xs`는 12px 그대로다.
- Switch 라벨을 Checkbox·Radio와 같은 `body-sm`/`body-md`/`body-lg`(보통 굵기)로 바꿨다. md 라벨은 14px에서 16px로 커진다.
- Menu·Select·Combobox 목록 항목을 `body-md`(높이 36px)에서 `body-sm`(높이 32px)으로 바꿔 트리거 글자 크기와 맞췄다.
