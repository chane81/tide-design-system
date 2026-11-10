---
"@tide-tds/components": patch
---

`IconButton`과 `Link`를 추가했습니다.

- `IconButton`: 아이콘만 있는 버튼입니다. `aria-label`과 아이콘(`children`)이 필수입니다. Button과 같은 `variant`·`color`·`size`(`xs`~`lg`, 24/32/40/48px 정사각형, 아이콘 16/16/20/24px), `loading`, `disabled`, `noPressScale`, `render`를 받습니다.
- `Link`: 문장 안 텍스트 링크입니다. `color`(Role, 기본 `primary`)로 글자색을 고르고, 밑줄이 항상 있습니다. `render={<NextLink href="/x" />}`로 Next.js `Link`를 씁니다. 서버 컴포넌트에서 쓸 수 있습니다.
