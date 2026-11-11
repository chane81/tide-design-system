---
"@tide-tds/components": patch
---

`Tabs`, `TabList`, `Tab`, `TabPanel`을 추가했습니다. 같은 영역의 여러 패널 중 하나를 골라 보여 주는 client Component이고 React Aria hooks(`useTabList`, `useTab`, `useTabListState`)로 만들었습니다. `Tabs`는 루트 `<div>`이고 `value`/`defaultValue`(둘 중 하나는 필수)/`onValueChange(value)`, `orientation`(`horizontal` 기본·`vertical`), `activationMode`(`automatic` 기본·`manual`)를 받습니다. `TabList`는 `role="tablist"`이고 →←(세로면 ↓↑, 끝에서 처음으로 돎)·Home/End로 탭을 옮기며 비활성 탭은 건너뜁니다. RTL locale에서는 ←가 다음 탭입니다. `Tab`은 `<button type="button" role="tab">`이고 `value`(필수)와 `disabled`를 받으며, 같은 `value`의 `TabPanel`(`role="tabpanel"`, `tabIndex` 기본 `0`)과 `aria-controls`·`aria-labelledby`로 이어집니다. 고른 탭은 primary 글자와 2px `border-primary` 막대로 보이고(고대비 모드에서는 시스템 강조색), 막대는 opacity 150ms에 움직임 줄이기가 아니면 가운데에서 펼쳐집니다. 포커스 표시는 `focus-ring`입니다. 고른 탭의 패널만 렌더합니다. 상태는 `data-orientation`(루트)·`data-selected`(탭)·`:disabled`로 노출합니다.
