---
"@tide-tds/components": patch
---

`Avatar`를 추가했습니다. 사용자 이미지를 원(radius `full`) 안에 보여 주고, 이미지가 없거나 불러오지 못하면 사람 모양 fallback 아이콘이 보입니다. `"use client"`가 없어 서버 컴포넌트에서 바로 쓰고, 로드 실패 fallback도 JavaScript 없이 처리합니다(아이콘 위 층에 이미지를 CSS 배경으로 깔아, 실패하면 아무것도 그리지 않습니다). `alt`(필수, 주면 `role="img"`의 이름, `""`이면 장식용), `src`, `size`(`xs` 24px/`sm` 32px/`md` 40px/`lg` 48px, 기본 `md`), `color`(fallback 색, 색 계열 이름 `ColorFamilyName`만, 앱 장식 계열 포함, 기본 `gray`)를 받습니다. 눌러야 하면 Button이나 IconButton 안에 넣습니다.
