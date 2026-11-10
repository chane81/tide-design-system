---
"@tide-tds/components": patch
---

`Button`을 추가했습니다. `variant`(채움 방식 `solid`/`subtle`/`outline`/`ghost`) × `color`(색 이름: Role 6개, 색 계열 6개, 앱이 더한 브랜드 계열) × `size`(`xs`~`lg`)로 모양을 고르고, `startIcon`·`endIcon`, `loading`, `disabled`, `render`(예: `render={<Link href="/x" />}`)를 받습니다. 루트에 `data-color`가 붙고(기본 `primary`) 바깥 색을 물려받지 않습니다. 누르면 살짝 줄어들고 `noPressScale`로 끕니다. 공통 union 타입 `FillVariant`와 `Role`도 루트에서 export합니다.
