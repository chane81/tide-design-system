---
"@tide-tds/components": patch
---

`Field`, `Input`, `Textarea`를 추가했습니다. `Field`에 `label`, `description`, `error`를 주면 안의 입력창에 `id`, `aria-describedby`, `aria-invalid`, `required`, `disabled`가 자동으로 연결됩니다. 오류 상태는 `aria-invalid="true"`와 `data-invalid`로 나타나고, 포커스 중에는 포커스 표시(`focus-field`)가 오류 색을 이깁니다. `Input`·`Textarea`는 네이티브 요소이고 `size`(`sm`/`md`/`lg`, 같은 size의 Button과 높이가 같음), `invalid`를 받습니다. `Field`는 서버 컴포넌트로 쓸 수 있습니다.
