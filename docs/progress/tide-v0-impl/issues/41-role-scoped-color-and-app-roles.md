# 41: Component 종류별 color 범위와 앱 Role

Status: claimed
Blocked by: 40 (열린 색 이름과 앱 브랜드 색 계열), 14 (IconButton과 Link)

## What to build

행동·의미 Component(Button, IconButton, Link, 이후 Checkbox·Radio·Switch·Alert·Toast 등)의 `color`는 Role만 받는다. 색 계열 이름(`gray`, `blue` 등)은 Badge·Tag·Avatar 같은 장식·분류 Component가 쓴다. 앱이 브랜드 색으로 Button을 칠하고 싶으면 Role을 하나 더한다(예: `brand`). 앱 Role의 색은 `defineColorFamily`·`tide-color` CLI로 만들어 대비 검사를 받는다.

2026-11-10 사용자 결정: 티켓 40(ADR 0011)에서는 Button `color`가 Role, 색 계열 이름, 앱 브랜드 색을 모두 받았다. 사용자가 Atlassian Design System의 색 Foundation(<https://atlassian.design/foundations/color>)을 보고 결정을 바꿨다. Atlassian은 Role을 버튼에 써서 primary·secondary·warning·danger 동작을 구분하고, accent 색은 「특정한 뜻이 없는 색」이라 서로 바꿔도 경험이 같다고 설명한다. 뜻이 있는 동작에 뜻이 없는 색을 고르게 두면 같은 동작이 화면마다 다른 색이 된다.

## 설계

- foundation의 `ColorRegistry`(Role + 계열 한 덩어리)를 둘로 나눈다.
  - `RoleRegistry`: Tide Role 6개 + 앱 Role. `Role = keyof RoleRegistry`
  - 색 계열 등록(이름은 구현에서 정한다): Tide 색 계열 6개 + 앱 계열. 장식·분류 Component가 쓴다.
- 앱 Role 하나는 「`RoleRegistry` augmentation + `tide-color`로 만든 `[data-color="<이름>"]` CSS」다. 장식용 앱 계열은 같은 CSS에 계열 등록 augmentation을 한다. 같은 CSS를 두 방식이 함께 쓸 수 있다.
- 앱이 Tide Role의 색을 바꾸려면 Role CSS 변수(`--tide-bg-primary-*`, `--tide-text-primary`, `--tide-border-primary` 등)를 Theme별로 덮어쓴다. 별도 기능은 두지 않고, 문서에 방법과 「대비 검증 없음」 경고만 둔다. 계열 변수(`--tide-blue-*`)는 덮어쓰지 말라고 적는다.
- 티켓 40의 기반(`data-color`, accent 슬롯, 계열 변수, `[data-color]` 규칙, `defineColorFamily`, CLI)은 그대로다.

## 수용 기준

- [ ] ADR 0011을 정정한다(정정 표시와 이유: Atlassian 사례, Component 종류별 color 범위). 큰 변경이면 새 ADR(0016)로 대체한다.
- [ ] foundation에 `RoleRegistry`와 색 계열 등록 interface를 두고 `Role = keyof RoleRegistry`. Tide 내부 계산(Semantic Token 이름, 대비 쌍)은 앱 Role로 넓어지지 않는다.
- [ ] 기존 공개 계약(Role utility, `--tide-*` 변수)과 대비 결과가 바뀌지 않는다(회귀 스냅숏).
- [ ] Button·IconButton·Link의 `color`가 `Role`(앱 Role 포함)이다. 색 계열 이름은 타입 오류다(타입 테스트).
- [ ] 앱 Role(`brand`) browser 테스트와 story. 색 계열 이름 테스트·story는 걷어 낸다.
- [ ] smoke의 `<Button color="brand">`가 앱 Role 방식(`RoleRegistry` augmentation)으로 통과한다.
- [ ] 문서: GLOSSARY(Role, 색 이름, accent 슬롯), spec 공통 API 절, Color Foundation MDX, 시작하기 「브랜드 색 더하기」(앱 Role 추가, Role 변수 덮어쓰기와 경고), Button·IconButton·Link MDX의 색 절.
- [ ] changeset(foundation·components).

## Comments
