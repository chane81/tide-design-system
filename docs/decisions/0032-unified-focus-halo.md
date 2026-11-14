# 포커스 표시를 간격 없는 3px halo 하나로 통일한다

근거 원칙: ② 명확함이 화려함보다 우선한다, ③ 단순함이 유연함보다 우선한다

포커스 표시가 두 모양이었다. `focus-ring`은 outline 2px + offset 2px로 요소에서 띄운 선이고, `focus-field`는 테두리 색 + inset 1px로 테두리가 2px처럼 두꺼워지는 표시였다. 같은 화면에서 버튼과 입력창의 포커스가 다르게 보였다. 사용자는 이를 한 모양으로 통일하자고 했다(2026-11-14, 사용자 결정).

## 결정

- 모양은 하나다. 요소에 간격 없이 붙은 **3px halo**(`box-shadow: 0 0 0 3px <halo 색>`)를 바깥에 그린다.
- 테두리가 있는 요소(입력창 계열, Checkbox·Radio 상자, outline 버튼)는 테두리 색도 focus 색(`outline-focus`, light blue-600 / dark blue-400)으로 바뀐다. 테두리 두께는 1px 그대로다(inset 1px는 없앤다).
- 테두리가 없거나 꾸밈용인 요소(solid·subtle·ghost 버튼, 링크, 탭, Accordion 트리거, Switch, Tag, Toast)는 halo만 그린다. Switch는 track에 경계가 있지만 halo만 둔다(사용자 결정).
- halo 색은 primary 계열 200단계다. 새 Semantic Token `outline-focus-halo`(light blue-200 `#bfd8f7`, dark blue-800 `#004e94`)를 둔다.
- 오류 입력창(`aria-invalid="true"`)은 같은 모양을 빨강으로 그린다. 테두리는 `border-danger`, halo는 새 Token `outline-danger-halo`(light red-200, dark red-800)다. 포커스가 없으면 `border-danger`만 남는다([ADR 0026](0026-error-focus-danger-field.md)의 "오류 색으로" 결정은 유지하고 두께 변화만 halo로 바뀐다).
- Utility class 이름은 그대로 둔다. `focus-ring`은 "halo만", `focus-field`는 "테두리 색 + halo"로 뜻이 바뀐다. 보이는 때(`focus:`·`focus-visible:`)는 쓰는 쪽 variant가 정하고 그대로다.
- `--tide-focus-ring-width`는 halo 두께로 3px가 된다. halo에는 간격이 없으므로 `--tide-focus-ring-offset`과 `focusRing.offset`은 지운다.
- 고대비 모드(forced-colors)는 box-shadow를 지우므로, 두 utility 모두 forced-colors 안에서만 투명 outline(halo 두께)을 둬 시스템 색 링이 그려지게 한다. 평소에 두지 않는 이유는 그대로다(transition-colors가 outline 색을 전환해 클릭 직후 번쩍인다). 브라우저 기본 `:focus-visible` offset도 0으로 지워 이 outline이 요소에 붙는다.
- halo는 Tailwind ring 합성 자리에 그린다. `shadow-*`(Toast 표면 등)와 함께 써도 그림자가 지워지지 않는다.

## 고려한 대안

- **utility 하나로 합치기(`focus-ring`이 테두리 색까지 바꿈):** CSS로는 요소에 보이는 테두리가 있는지 알 수 없다. solid·ghost 버튼처럼 투명 border를 둔 요소에서 파란 1px 테두리가 생겨 "테두리 없는 요소는 halo만"과 어긋난다. 그래서 둘을 남기고 Button·IconButton은 variant별로 고른다(outline만 `focus-field`).
- **새 이름(`focus-halo` 등)을 만들고 기존 이름을 지우기:** 모양이 바뀌어도 "테두리 없는 쪽 / 테두리 있는 쪽" 구분은 그대로라 이름을 바꿀 이유가 약하다. 앱 코드 수정만 늘어난다.
- **`--tide-focus-ring-offset`을 `0`으로 남기기:** 쓰이지 않는 공개 변수가 남는다. 지우더라도 앱이 `outline-offset: var(--tide-focus-ring-offset)`을 쓰고 있으면 값이 기본값 0으로 떨어져 새 모양(간격 없음)과 같아진다.
- **halo 전용 Semantic namespace(`ring-*`) 더하기:** 속성별 namespace([ADR 0003](0003-token-source-and-utility-namespaces.md))로는 맞지만 namespace 타입·문서 표·tailwind-merge 설정이 함께 늘어난다. 포커스 표시 색을 모아 둔 `outline` namespace에 둔다.

## 결과

- 공개 계약의 뜻이 바뀌고(`focus-ring`·`focus-field` 모양, `--tide-focus-ring-width` 값) 이름 하나가 지워져(`--tide-focus-ring-offset`) minor(breaking)다(CONTRIBUTING 「버전 규칙」).
- **대비:** halo × 표면은 3:1에 못 미친다(light 흰 표면 위 약 1.5:1). 사용자가 알고 고른 모양이라 두 halo Token을 `contrastExclusions`에 이유와 함께 둔다. 테두리가 있는 요소는 focus 테두리 × 표면 3:1 쌍이 그대로 지킨다. 테두리가 없는 요소는 halo가 유일한 표시라 WCAG 1.4.11(비텍스트 대비)을 엄격하게 읽으면 미달이다.
- **원칙 충돌:** 원칙 문서의 「충돌할 때」(번호가 작은 원칙을 따른다)대로라면 ① 접근성이 ② 명확함보다 앞선다. 이 결정은 그 규칙의 예외로, 사용자가 대비 미달을 알고 고른 것이다. halo 색이나 두께를 다시 볼 때는 이 예외부터 다시 판단한다.
- [ADR 0023](0023-tiered-contrast-minimum.md)의 UI 요소 3:1 등급은 포커스 테두리에만 적용되고 halo에는 적용되지 않는다.
- Alert 닫기 버튼(ghost)처럼 subtle 바탕 위 조작 요소는 이제 halo만 그려, `outline-focus × bg-*-subtle` 대비 쌍을 지웠다.
- Checkbox·Radio는 `focus-field`라 오류 상태에서 포커스하면 테두리와 halo가 빨강이다. Switch는 `focus-ring`이라 오류 상태에서도 halo는 파랑이다.
- Checkbox·Radio·Switch는 forced-colors에서 `forced-color-adjust: none`이라 halo가 지워지지 않는다. halo 변수를 `Highlight`로 바꿔 시스템 색으로 남긴다.
