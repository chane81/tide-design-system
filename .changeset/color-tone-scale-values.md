---
"@tide-tds/foundation": minor
---

Primitive 색 스케일 값을 바꾸고 장식 계열 `purple`·`mint`를 더했습니다(ADR 0022). Token 이름은 그대로라 코드는 깨지지 않지만 화면 색이 달라집니다.

- blue·green·amber·red·cyan의 50·100·200·300·950을 계열마다 파스텔 바탕·테두리·글자에 맞춰 다시 정했습니다. blue·green·red는 600~900의 채도도 낮췄습니다(red만 상한이 조금 높습니다). amber 400은 `#ca9734`가 되어 연한 단계(50~400)가 노랑 쪽으로 옮겨 갔습니다. 400·500과 gray, 앵커 `blue-500`(`#3183f5`)은 그대로입니다.
- `purple`·`mint`는 Role이 없는 장식 계열입니다. 다른 계열처럼 `--tide-color-purple-*` Primitive, 계열 변수 묶음(`--tide-purple-solid` 등), `[data-color="purple"]` 규칙, Primitive Utility class(`bg-purple-500` 등)가 생기고 `ColorFamily`·`ColorFamilyName` 타입에 들어갑니다. `Role`에는 들어가지 않습니다. 의미 표시(성공, 경고 등)에는 Role을 씁니다.
- 대비 쌍은 light·dark 모두 기존 기준(텍스트 4.5:1, UI 3:1)을 통과합니다. 가장 빠듯한 쌍은 `text-on-solid` × `bg-success-solid` 4.70:1입니다.
