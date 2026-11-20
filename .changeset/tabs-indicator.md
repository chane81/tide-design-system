---
"@tide-design/components": minor
"@tide-design/foundation": patch
---

Tabs의 고른 표시가 탭을 바꾸면 이전 탭에서 새 탭으로 미끄러진다(300ms, ease-out). 누름과 키보드(화살표, Home·End)가 같게 움직이고, 움직임 줄이기에서는 바로 옮겨진다.

- `Tabs`에 `shape` prop을 더했다. `underline`(기본값)은 지금 밑줄 모양이고, `rounded`는 옅은 탭 목록 바탕 위에 고른 탭을 둥근 사각형 바탕으로 보인다. 루트에 `data-shape`가 붙는다.
- 처음 그릴 때, 탭 글자·창 크기가 바뀔 때, 숨었다가 보일 때는 움직이지 않고 바로 놓인다.
- `TabList` 안에 고른 표시 요소(`aria-hidden` span) 하나가 탭 앞에 생긴다.
- foundation: 대비 쌍 `text-muted` × `bg-neutral-subtle`(4.5:1)을 등록했다.
