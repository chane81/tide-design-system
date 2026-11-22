# 목록 항목의 위치 표시를 글자·배경 색 전환 `fast`로 바꾼다

근거 원칙: ② 명확함이 화려함보다 우선한다

Menu 항목, Select·Combobox 옵션의 위치 표시(hover·키보드 highlight)는 transition 없이 바로 바뀌었다. 반복되는 목록 항목은 hover가 바로 바뀐다는 motion 결정(티켓 21 「hover와 press」)을 따른 것이다. 사용자는 마우스를 올릴 때 하이라이트 색이 갑자기 바뀌어 보인다며 자연스럽게 나타나기를 원했다(2026-11-22, 사용자 결정).

## 결정

- **`listItemClass`에 `transition-[color,background-color]`를 둔다.** duration·easing은 적지 않아 기본값 `fast`(150ms)·`out`을 쓴다. 혼자 있는 조작 요소의 `transition-colors`와 같은 시간이다.
- **hover와 키보드 위치를 나누지 않는다.** Menu·Select·Combobox는 hover한 항목이 곧 위치(`data-highlighted`)라 두 경로가 같은 class를 거친다. `fast`가 가장 짧은 duration Token이고, 화살표로 빠르게 옮겨도 앞 항목은 그 자리에서 되돌아가며 사라진다.
- **움직임 줄이기에서도 유지한다.** 이동이 아니라 색 변화라서, hover 색 변화를 유지하는 motion 규칙(티켓 21)과 같다.
- Table 행의 hover는 그대로 바로 바뀐다.

## 이유

- `transition-colors`는 `outline-color`를 포함한다. highlight는 forced-colors용 투명 outline을 함께 켜므로, outline 색이 currentColor에서 투명으로 전환되며 번쩍인다(ADR 0032·0034와 같은 문제). 그래서 글자·배경만 고른다. 체크 아이콘은 `currentColor`라 글자색을 따라간다.

## 결과

- 문서 앱 Foundation/Motion의 「반복되는 목록 항목은 바로」 설명과 Menu 문서의 「전환 없음」을 고친다.
- 색을 읽는 테스트는 전환이 끝날 때까지 기다린다(`expect.poll`).
