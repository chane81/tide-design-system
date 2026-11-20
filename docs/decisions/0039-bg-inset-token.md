# 안에 표시가 떠 있는 움푹한 바탕으로 `bg-inset` Token을 더한다

근거 원칙: ② 명확함이 화려함보다 우선한다, ③ 단순함이 유연함보다 우선한다

`box` 모양 Tabs(ADR 0038)의 탭 목록 바탕은 처음에 `bg-neutral-subtle`(light gray-100, dark gray-900)이었다. 사용자는 light에서 한 단계 옅기를 원했다(2026-11-20, 사용자 결정). light gray-50, dark gray-900 짝을 가진 Token이 없었다. `bg-neutral-faint`는 dark가 gray-950이라 고른 표시(`bg-surface`, dark gray-950)와 같은 색이 된다. Component는 `dark:` variant를 쓰지 않는다(중첩 Theme에서 깨진다). 그래서 새 Semantic Token을 더한다.

## 결정

- **`bg-inset`(`--tide-bg-inset`): light gray-50, dark gray-900.** 표면 층(`canvas`·`surface`·`raised`) 옆의 공통 배경 Token이다. 표면보다 한 단계 들어간 바탕이고, 그 안에 `surface` 표시가 떠 있는 곳(`box` 모양 Tabs 탭 목록)에 쓴다.
- **대비 쌍(ADR 0023):** `text-default`·`text-muted`·`text-primary` × `bg-inset`은 4.5, 포커스 링 `border-primary` × `bg-inset`은 3이다. `text-primary`는 고른 표시가 이동하는 동안 새 탭 글자가 바탕 위에 있어서 함께 등록한다.
- **Tabs `box` 모양만을 위해 넣었던 `text-muted` × `bg-neutral-subtle` 쌍은 지운다.** 다른 Component는 그 짝을 쓰지 않는다.

## 이유

- 표시가 떠 있는 바탕은 표시보다 어두워야(light) 표시가 떠 보인다. light에서 흰 표시 아래 gray-50은 흰 페이지와 가장 가까운 회색이라 옅으면서도 영역이 보인다. dark에서는 표시(gray-950)보다 밝은 gray-900이라 구분된다.
- Theme 분기는 Token이 맡는다. Component에 `dark:`를 쓰면 dark 페이지 안의 light 영역에서도 켜진다.
- 이름은 쓰임(누름·고름)이 아니라 바탕의 깊이로 짓는다. 표면 층 이름(`canvas`·`surface`·`raised`)처럼 높이를 말해, 분할 버튼·토글 묶음 같은 같은 모양에도 쓸 수 있다. Tailwind 위치 utility(`inset-*`)·`inset-shadow-*`와는 접두사(`bg-`)가 달라 겹치지 않는다(tailwind-merge 테스트로 확인).

## 고려한 대안

- **`bg-neutral-faint`의 dark 값을 gray-900으로 덮기:** Badge와 누를 수 있는 요소의 hover(`pressableClass`)도 이 Token을 써서 겉모습이 함께 바뀐다.
- **바탕 `bg-neutral-faint` + 표시 `bg-raised`:** Token을 더하지 않아도 되지만 dark 바탕이 페이지(canvas)와 같아져 탭 목록 영역이 사라진다.
- **`dark:` 분기:** 중첩 Theme에서 깨지고, Component 관례(Theme 분기는 Token)를 벗어난다.

## 결과

- 공개 계약 `bg-inset`·`--tide-bg-inset`이 생긴다. Token을 더하는 것이므로 `@tide-design/foundation`은 minor다.
- Token 목록 문서(Foundation/Color 「공통 Token」)와 GLOSSARY 표면 층 항목에 inset을 적는다.
- light gray-50 바탕은 흰 페이지 위에서 옅다. 영역 경계가 약하다는 의견이 나오면 값을 gray-100으로 되돌리지 않고, 먼저 표시 쪽(경계·그림자)으로 보정한다.

## 정정 (2026-11-20)

- `box` Tabs 탭 목록이 투명 바탕 + 외곽선으로 바뀌어(ADR 0038 정정) 이 Token을 쓰는 Tide Component가 없다. 공개 계약이므로 Token과 대비 쌍은 그대로 둔다.
