---
"@tide-tds/foundation": minor
"@tide-tds/components": minor
---

Button·IconButton `outline`·`ghost`의 호버·누름을 같은 색 파스텔로 채운다(ADR 0025). 호버는 `faint`, 누름은 `subtle`이고 글자 색은 그대로다. `neutral`만 지금처럼 색 없이 덮는다(`bg-hover`·`bg-active`). 대비 쌍에 `text × faint`(4.5:1)를 더하고 쓰지 않게 된 Role 글자 × `bg-hover`·`bg-active`를 지웠다. 앱 계열(`tide-color build`)도 `text × faint`를 4.5:1로 검사한다.
