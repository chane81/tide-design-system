---
"@tide-tds/foundation": patch
---

radius 5단계(`rounded-sm`/`md`/`lg`/`xl`/`full`), 그림자 3단계(`shadow-sm`/`md`/`lg`), 포커스 표시 utility `focus-ring`과 `focus-field`를 더했다. 직접 만든 요소에는 `focus-visible:focus-ring`, `focus:focus-field`로 쓴다.

- 공개 계약 CSS 변수: `--tide-rounded-<단계>`, `--tide-shadow-<단계>`, `--tide-focus-ring-width`, `--tide-focus-ring-offset`
- 그림자는 Theme에 따라 `--tide-shadow-color`만 바뀐다. dark에서도 그린다.
- 오류 입력창(`aria-invalid="true"`)에서도 포커스 중에는 `focus-field`가 이긴다.
- Tailwind 기본 radius(`rounded`, `rounded-xs`, `rounded-2xl`~`4xl`)와 그림자(`shadow`, `shadow-2xs`, `shadow-xs`, `shadow-xl`, `shadow-2xl`, `inset-shadow-*`, `drop-shadow-*`, `text-shadow-*`)를 지웠다.
- tailwind-merge 설정에 radius·그림자 이름을 등록해서 `className`의 `rounded-lg`, `shadow-lg`가 Tide class를 이긴다.
- Token 객체 `radius`, `shadow`, `focusRing`을 루트에서 export한다.
- Semantic Token `border-raised`(light 투명, dark gray-800)를 더했다. raised 표면은 `border border-raised`로 Theme 분기 없이 경계를 둔다.
