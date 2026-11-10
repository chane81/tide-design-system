---
"@tide-tds/components": patch
---

`Checkbox`, `Radio`, `CheckboxGroup`, `RadioGroup`을 추가했습니다. 네이티브 체크박스·라디오라 Space 토글, 화살표 이동, form 제출이 그대로 됩니다. `size`(`sm`/`md`, 누르는 영역은 24×24px), `color`(Role, 루트 `data-color`, 기본 `primary`), `invalid`, `disabled`를 받고, Checkbox는 `indeterminate`를 받습니다. RadioGroup은 `name`과 `value`/`defaultValue`/`onValueChange`로 선택을 정합니다. `ref`와 HTML 속성은 input에, `className`·`style`은 루트 label에 붙습니다. `Field`에 `group`을 더했습니다. 묶음을 감싸면 label이 묶음 이름, 설명·오류가 묶음 설명이 되고, 오류 상태는 각 항목의 `aria-invalid="true"`로 붙습니다.
