---
"@tide-tds/foundation": minor
---

대비 하한을 상태별 세 등급으로 나눴다(ADR 0023). 정지 상태 글자는 4.5:1, hover·누름 같은 일시 상태 글자와 solid 위 글자(`on-solid`)는 4:1, 경계·포커스 표시·thumb 같은 UI 요소는 3:1이다. 공개 타입 `ContrastMinRatio`(`4.5 | 4 | 3`)를 더했고 `ContrastPair["minRatio"]`가 이 타입이 된다. `contrastPairs`의 등급이 바뀌고 Switch 꺼짐 누름 thumb 쌍 5개(3:1)가 늘었다. `tide-color build`도 같은 등급으로 앱 계열을 검사한다. 색 값은 바뀌지 않는다.
