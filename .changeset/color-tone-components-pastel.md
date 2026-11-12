---
"@tide-tds/components": minor
---

Component가 파스텔 글자·테두리와 색 없는 호버를 씁니다(ADR 0022).

- Badge: `subtle`은 파스텔 글자(`text-accent-on-subtle`)와 파스텔 테두리(`border-accent-subtle`)를 씁니다. 가장 옅은 바탕의 `variant="faint"`를 더했습니다(테두리 없음). `faint`는 Badge에만 있습니다.
- Tag는 파스텔 글자와 테두리, Avatar fallback은 파스텔 글자를 씁니다.
- Alert는 글자·아이콘이 파스텔 글자, 테두리가 파스텔 테두리입니다. 닫기 버튼은 파스텔 글자에 같은 색의 subtle 호버·누름 바탕입니다.
- Button·IconButton: `subtle`의 글자는 파스텔 글자입니다. `outline`·`ghost`의 호버·누름은 색 없이 덮는 `bg-hover`·`bg-active`입니다(글자는 그대로 Role 색).
- Menu·Select·Combobox 항목, Table 행, Accordion 트리거의 호버는 `bg-hover`입니다. highlight와 고른 옵션의 바탕은 그대로입니다.
- Toast의 닫기·액션 버튼은 Toast의 `color`와 관계없이 `neutral`입니다. raised 표면 위에서 Role 색 글자가 호버·누름 바탕에 대해 대비 기준을 넘지 못해서입니다. 상태 아이콘은 그대로 Role 색입니다.
