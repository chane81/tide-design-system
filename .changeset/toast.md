---
"@tide-tds/components": patch
---

`ToastQueue`와 `ToastRegion`을 추가했습니다. 끝난 동작의 결과를 잠깐 알리는 Toast이며 React Aria hooks(`useToastRegion`, `useToast`, react-stately `ToastQueue`)로 만든 client 전용 API입니다. 모듈에서 `new ToastQueue({ maxVisible })`(기본 3개까지 보임, 넘으면 기다림)를 만들어 `<ToastRegion queue>`에 넘기고, 어디서든 `queue.add({ title, description, color, action, timeout, onClose, closeLabel })`로 띄웁니다(`queue.close(key)`·`clear()`로 닫음). 영역은 Toast가 있을 때만 `document.body`에 portal한 `region` 랜드마크(F6로 이동)이고 아래 끝쪽에 최대 폭 24rem, `z-toast`로 쌓이며 열린 Dialog·Popover 위에서도 읽히고 눌립니다. Toast는 제목이 이름인 `alertdialog` 안의 `alert` 글자이고, Alert 배치·상태 아이콘에 raised 표면·`shadow-md`·radius `lg`, 닫기 IconButton과 선택 액션 Button(outline)을 씁니다. `color`는 `Role`(기본 `info`)입니다. 자동 닫힘은 기본 5초이고 더 짧은 값은 5초로 올리며 영역에 hover·focus가 있는 동안 멈춥니다. 액션이 있거나 `danger`(오류)면 자동으로 닫지 않습니다. 닫힌 Toast의 포커스는 옆 Toast로, 마지막이면 영역에 들어오기 전 요소로 돌아갑니다. 등장·퇴장은 Popover와 같은 opacity + blur + 이동이고 움직임 줄이기에서는 opacity만 바뀝니다.
