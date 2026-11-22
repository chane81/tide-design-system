---
"@tide-design/components": minor
---

**Breaking:** 공개 Component `Typography`와 `TypographyProps`, `TypographyOwnProps`를 제거한다. 시맨틱 태그에 텍스트 스타일 class를 붙여 쓴다. 제목 단계는 문서 구조로, 크기는 class로 고른다. `text-*` class와 `TextStyleName`은 그대로다.

이전 방법: `<Typography variant="heading-lg">제목</Typography>` → `<h2 className="text-heading-lg">제목</h2>`
