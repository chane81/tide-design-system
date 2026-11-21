# inset 바탕 안에 떠 있는 표시로 `bg-inset-raised`·`border-inset-raised` Token을 더한다

근거 원칙: ② 명확함이 화려함보다 우선한다

`box` 모양 Tabs(ADR 0038)의 고른 표시는 `bg-surface`였다. dark에서 탭 목록 바탕 `bg-inset`(gray-900)보다 표시 `bg-surface`(gray-950)가 어두워, 표시가 떠 보이지 않고 움푹 파여 보였다. dark 그림자는 약해 깊이를 되돌리지 못한다. 사용자는 dark에서 어색하다고 했고, 바탕보다 살짝 밝은 표시에 테두리를 둘러 경계를 보이는 모양을 골랐다(2026-11-21, 사용자 결정).

## 결정

- **`bg-inset-raised`(`--tide-bg-inset-raised`): light white, dark gray-800.** `bg-inset` 안에 떠 있는 표시의 바탕이다.
- **`border-inset-raised`(`--tide-border-inset-raised`): light 투명, dark gray-600.** 같은 표시의 1px 테두리다. `border-raised`처럼 장식용이라 대비 검사에서 뺀다.
- `box` 모양 Tabs의 고른 표시(`TabIndicator`)가 둘을 함께 쓴다.
- **대비 쌍(ADR 0023):** `text-primary` × `bg-inset-raised`는 4.5다(dark blue-300 × gray-800 4.52:1).

## 이유

- 떠 있는 표시는 바탕보다 밝아야 한다. light는 gray-50 위 white, dark는 gray-900 위 gray-800으로 두 Theme의 깊이 방향을 맞춘다.
- dark 회색 단계는 간격이 좁아 바탕만으로는 차이가 작다(gray-800 × gray-900 1.21:1). 테두리(gray-600 × gray-800 1.93:1)가 경계를 맡는다. light는 그림자가 경계를 맡아 테두리가 투명이다.
- 이름은 ADR 0039처럼 쓰임이 아니라 깊이로 짓는다. `inset` 짝이라 분할 버튼·토글 묶음 같은 같은 모양에도 쓴다.

## 고려한 대안

- **`bg-raised`·`border-raised`의 dark 값을 바꾸기:** Dialog·Popover·Tooltip·Menu 표면도 함께 바뀐다.
- **`bg-raised` + `border-raised` 그대로 쓰기:** dark 표시가 목록 바탕(gray-900)과 같은 색이고, 테두리(gray-800)도 1.21:1로 약하다.
- **Tabs에 `dark:` 분기:** 중첩 Theme에서 깨지고, Theme 분기는 Token이 맡는 관례를 벗어난다.
- **dark 표시를 gray-700으로:** 바탕과 차이는 커지지만 `text-primary` 대비가 3.42:1로 4.5에 못 미친다.

## 결과

- 공개 계약 `bg-inset-raised`·`border-inset-raised`와 각 CSS 변수가 생긴다. `@tide-design/foundation`은 minor, `@tide-design/components`는 patch다.
