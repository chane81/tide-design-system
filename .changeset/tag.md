---
"@tide-tds/components": patch
---

`TagGroup`과 `Tag`를 추가했습니다. 사용자가 고르거나 입력한 값을 보여 주고 지울 수 있는 라벨 묶음이며, React Aria hooks(`useTagGroup`, `useTag`, `useListState`)로 만든 client Component입니다. `TagGroup`은 `role="grid"`(태그가 없으면 `group`)이고 이름(`aria-label` 또는 `aria-labelledby`)이 타입상 필수입니다. ←→(끝에서 처음으로 돌고 RTL locale은 반대)·Home/End로 태그를 옮기고 비활성 태그는 건너뛰며, Tab 자리는 하나입니다. `onRemove(value)`를 주면 Delete·Backspace와 끝의 지우기 IconButton(24×24, 이름은 「`removeLabel`(기본 「제거」) + 태그 글자」)으로 지우고, 지운 뒤 포커스는 다음(없으면 앞) 태그로 옮겨 갑니다. `Tag`는 `value`·`children`(필수), `disabled`, 색 계열 `color`(`ColorFamilyName`, 기본 `gray`, Role은 받지 않음)를 받고 높이 32px·radius `sm`·subtle 배경입니다. 포커스 표시는 `focus-ring`이고 상태는 `aria-disabled`·`data-color`로 노출합니다.
