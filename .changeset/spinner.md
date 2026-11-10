---
"@tide-tds/components": patch
---

로딩 표시 Component `Spinner`를 더했다. 서버 컴포넌트로 쓸 수 있다.

- 역할은 `status`이고 접근 가능한 이름 「로딩 중」이 기본으로 붙는다. `aria-label`(또는 `aria-labelledby`)로 바꾼다.
- `size`는 `xs`·`sm` 14px, `md` 16px(기본값), `lg` 20px다. 같은 size Component의 텍스트 옆 아이콘 크기와 같다.
- 회전은 `animate-spin`이고 움직임 줄이기에서도 멈추지 않는다. 색은 `currentColor`라 주변 글자색을 따른다.
- 공통 size union 타입 `Size`(`xs`/`sm`/`md`/`lg`)를 루트에서 export한다.
