---
"@tide-tds/components": patch
---

`Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionPanel`을 추가했습니다. 제목을 눌러 내용을 펼치고 접는 client Component이고 React Aria hooks(`useDisclosure`, `useDisclosureGroupState`, `useDisclosureState`, `useButton`)로 만들었습니다. `Accordion`은 루트 `<div>`(radius `lg`, 장식용 경계)이고 `value`/`defaultValue`(펼친 항목 값 목록 `string[]`)/`onValueChange(value)`, `multiple`(기본 `false`: 한 번에 한 항목)을 받습니다. 펼친 항목을 다시 누르면 접힙니다. `AccordionItem`은 `value`(필수)와 `disabled`를 받습니다. `AccordionTrigger`는 제목 요소(`level`, 기본 `<h3>`) 안의 `<button type="button">`이고 `aria-expanded`·`aria-controls`로 패널과 이어지며 Enter·Space로 펼치고 접습니다. 끝의 장식용 chevron은 펼치면 180° 돌고(움직임 줄이기에서는 바로) 높이 애니메이션은 없습니다. `AccordionPanel`은 `role="region"`(또는 `group`)이고 트리거 글자가 이름이며, 접히면 숨고 브라우저 페이지 찾기로 펼쳐집니다(`hidden="until-found"`). 포커스 표시는 `focus-ring`입니다. 상태는 `data-open`(항목·트리거·패널)·`data-disabled`(항목)·`aria-expanded`·`:disabled`(트리거)로 노출합니다.
