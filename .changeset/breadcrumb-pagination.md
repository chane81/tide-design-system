---
"@tide-tds/components": patch
---

`Breadcrumb`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbCurrent`와 `Pagination`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`를 추가했습니다. 둘 다 이름 있는 `<nav>` 탐색 영역(기본 「이동 경로」·「페이지 이동」)이고 `"use client"` 없이 서버 컴포넌트에서 바로 씁니다. Breadcrumb은 항목 앞에 읽히지 않는 구분자 아이콘을 붙이고, 현재 페이지(`BreadcrumbCurrent`)에 `aria-current="page"`를 붙입니다. Pagination 번호는 Button 모양의 링크(32px, `current`면 `aria-current="page"`)이고 이전/다음은 이름 있는 IconButton(화살표, `disabled` 지원)입니다. `BreadcrumbLink`·`PaginationLink`·이전/다음은 `render`로 Next `Link`를 받습니다. 색(`color`)·`variant`·`size` 축은 없습니다.
