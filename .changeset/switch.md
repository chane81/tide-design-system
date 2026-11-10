---
"@tide-tds/components": patch
---

`Switch`를 추가했습니다. 네이티브 `<input type="checkbox" role="switch">`라 스크린리더가 「스위치」로 읽고, Space로 켜고 끄며, form 제출이 그대로 됩니다. `children`이 label이 되고, Field 안에 두면 Field의 label·설명·오류가 연결됩니다. `size`(`sm`/`md`/`lg`, track 28×16·36×20·44×24px), `color`(Role, 기본 `primary`, 루트에 `data-color`), `invalid`를 받습니다. `ref`와 HTML 속성은 input에, `className`·`style`은 바깥 `label`에 붙습니다. 고대비 모드에서는 켜진 track이 강조 시스템 색으로 채워지고, 움직임 줄이기에서는 thumb이 바로 자리를 바꿉니다.
