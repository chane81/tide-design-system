---
"@tide-tds/components": patch
---

`Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`을 추가했습니다. 시맨틱 `<table>`·`<thead>`·`<tbody>`·`<tr>`·`<th>`·`<td>`를 그대로 렌더하고 `"use client"`가 없어 서버 컴포넌트에서 바로 씁니다. 부분마다 자기 요소의 props와 `ref`, `className`(기본 class를 이김)을 받습니다. `TableHeaderCell`은 기본 `scope="col"`이고 행 머리에는 `scope="row"`를 줍니다. `TableBody` 바로 아래 행은 마우스를 올리면 transition 없이 배경이 바뀝니다(머리·바닥 행은 그대로). 숫자 열은 칸에 `className="tabular-nums text-end"`를 줍니다. 정렬·행 선택·가상화와 색(Role)·`variant`·`size` 축은 없습니다.
