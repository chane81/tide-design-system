---
"@tide-tds/components": patch
---

`Popover`, `PopoverTrigger`, `PopoverContent`를 추가했습니다. 트리거 옆에 짧은 내용을 띄우는 client Component이고 React Aria hooks(`useOverlayTrigger`, `usePopover`, `useDialog`)로 만들었습니다. `Popover`는 열림 상태(`open`/`defaultOpen`/`onOpenChange(open)`)만 갖고 DOM이 없습니다. `PopoverTrigger`는 기본 `<button type="button">`이고 `render={<Button />}`로 Tide Button 모양을 씁니다. `PopoverContent`는 `role="dialog"`로 `document.body`에 portal되어 `z-popover`로 쌓이고, raised 표면·`shadow-md`·radius `lg`·투명 경계(고대비 모드에서 보임)입니다. `placement`(12가지, 기본 `bottom`)와 `offset`(기본 8px)을 받고, 공간이 모자라면 뒤집거나 높이를 줄여 트리거를 덮지 않습니다. 열면 포커스가 내용으로 가고 Esc·바깥 누름·트리거 다시 누름으로 닫히며 포커스가 트리거로 돌아옵니다. 등장은 opacity + blur 4px + 4px 이동(300ms), 퇴장은 그 절반(150ms)이고 움직임 줄이기에서는 opacity만 바뀝니다. 상태는 `data-open`·`data-placement`로 노출합니다.
