# 목록 항목의 위치 표시를 글자·배경 색 전환 `fast`로 바꾼다

근거 원칙: ② 명확함이 화려함보다 우선한다

Menu 항목, Select·Combobox 옵션의 위치 표시(hover·키보드 highlight)는 transition 없이 바로 바뀌었다. 반복되는 목록 항목은 hover가 바로 바뀐다는 motion 결정(티켓 21 「hover와 press」)을 따른 것이다. 사용자는 마우스를 올릴 때 하이라이트 색이 갑자기 바뀌어 보인다며 자연스럽게 나타나기를 원했다(2026-11-22, 사용자 결정).

## 결정

- **`listItemClass`에 `transition-[color,background-color]`를 둔다.** duration·easing은 적지 않아 기본값 `fast`(150ms)·`out`을 쓴다. 혼자 있는 조작 요소의 `transition-colors`와 같은 시간이다.
- **hover와 키보드 위치를 나누지 않는다.** Menu·Select·Combobox는 hover한 항목이 곧 위치(`data-highlighted`)라 두 경로가 같은 class를 거친다. `fast`가 가장 짧은 duration Token이고, 화살표로 빠르게 옮겨도 앞 항목은 그 자리에서 되돌아가며 사라진다.
- **움직임 줄이기에서도 유지한다.** 이동이 아니라 색 변화라서, hover 색 변화를 유지하는 motion 규칙(티켓 21)과 같다.
- Table 행의 hover는 그대로 바로 바뀐다.

> 덧붙임(2026-11-22): Table 본문 행의 hover와 Tabs 항목의 hover·선택 글자색도 목록과 똑같이 맞춘다(사용자 결정). `rowClass`·`tabBaseClass`에 `transition-[color,background-color]`를 두고 duration·easing은 기본값(`fast`·`out`)이다. Tabs는 포커스 표시가 box-shadow halo와 투명 outline이라 같은 이유로 `transition-colors`를 쓰지 않는다. 고른 표시(`TabIndicator`)의 이동 전환(ADR 0038)은 그대로이고, 행 경계·탭 목록 선은 상태로 바뀌지 않아 전환에 넣지 않는다. Accordion 트리거는 아직 바로 바뀐다.

> 덧붙임(2026-11-22): Accordion 트리거도 똑같이 맞춘다(사용자 결정). `triggerClass`에 `transition-[color,background-color]`를 두고 duration·easing은 기본값(`fast`·`out`)이다. 포커스 표시(`focus-ring`)는 전환에 넣지 않는다. hover에 함께 바뀌는 chevron 색도 `color`를 전환한다. chevron은 `motion-safe:transition-[rotate]`로 돌았는데 `transition-property`는 통째로 덮이므로 `transition-[color] motion-safe:transition-[color,rotate]`로 둔다. 움직임 줄이기에서는 색만 전환되고 회전은 바로 바뀐다. 패널은 여전히 높이 전환 없이 바로 펼쳐진다.

## 이유

- `transition-colors`는 `outline-color`를 포함한다. highlight는 forced-colors용 투명 outline을 함께 켜므로, outline 색이 currentColor에서 투명으로 전환되며 번쩍인다(ADR 0032·0034와 같은 문제). 그래서 글자·배경만 고른다. 체크 아이콘은 `currentColor`라 글자색을 따라간다.

## 결과

- 문서 앱 Foundation/Motion의 「반복되는 목록 항목은 바로」 설명과 Menu 문서의 「전환 없음」을 고친다.
- 색을 읽는 테스트는 전환이 끝날 때까지 기다린다(`expect.poll`).
