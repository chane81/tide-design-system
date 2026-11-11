---
"@tide-tds/components": patch
---

`Tooltip`, `TooltipTrigger`, `TooltipContent`를 추가했습니다. 트리거에 짧은 설명 한 줄을 붙이는 client Component이고 React Aria hooks(`useTooltipTrigger`, `useTooltip`, `useOverlayPosition`)로 만들었습니다. `Tooltip`은 열림 상태(`open`/`defaultOpen`/`onOpenChange(open)`)와 `delay`(기본 500ms), `closeDelay`(기본 300ms), `disabled`를 갖고 DOM이 없습니다. `TooltipTrigger`는 기본 `<button type="button">`이고 `render={<IconButton aria-label="…" />}`로 Tide 모양을 씁니다. 마우스를 올리면 `delay` 뒤에, 키보드 포커스면 바로 열리고, Esc·포커스 이탈·포인터 이탈·트리거 누름으로 닫힙니다. 열린 동안 트리거의 `aria-describedby`가 설명을 가리킵니다. `TooltipContent`는 `role="tooltip"`으로 `document.body`에 portal되어 `z-tooltip`으로 Dialog·Popover 위에 쌓이고, Popover와 같은 raised 표면·`shadow-md`에 여백 4px·8px, `text-body-sm`입니다. `placement`(12가지, 기본 `top`)와 `offset`(기본 4px)을 받습니다. 바로 나타나고 사라질 때만 opacity가 150ms로 흐려집니다. 상태는 `data-open`·`data-placement`로 노출합니다.
