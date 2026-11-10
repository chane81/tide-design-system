---
"@tide-tds/components": patch
---

`Badge`, `Card`, `Separator`를 추가했습니다. 셋 다 `"use client"`가 없어 서버 컴포넌트에서 바로 씁니다. `Badge`는 상호작용 없는 상태 라벨(`span`)로, 상태는 `children` 텍스트로 전하고 `color`는 Role(기본 `neutral`, 앱 Role 포함, 색 계열 이름은 받지 않음), `variant`(`subtle`/`solid`), `size`(`sm` 20px/`md` 24px)를 받습니다. `Card`는 그림자 없이 경계만 있는 surface 표면(radius `lg`, 여백 16px)이고 `render`로 `article`·`section`·`li` 등으로 바꿉니다. `Separator`는 네이티브 `<hr>`로, 기본은 separator 역할이고 `orientation="vertical"`이면 `aria-orientation`, `decorative`면 `role="none"`이 붙습니다. 고대비 모드에서는 Badge·Card 경계와 Separator 선이 시스템 글자색으로 그려집니다.
