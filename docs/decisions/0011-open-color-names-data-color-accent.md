# `color`는 열린 색 이름이고, `data-color`로 accent 슬롯에 꽂는다

> **ADR 0016으로 일부 대체됨(2026-11-10)**: [행동·의미 Component의 `color`는 Role만 받고, 앱 브랜드 색은 앱 Role로 더한다](0016-role-scoped-color-and-app-roles.md). 「모든 Component의 `color`가 열린 색 이름을 받는다」와 `ColorRegistry` 타입은 더 이상 맞지 않다. `data-color`, accent 슬롯, 계열 변수, `defineColorFamily`, CLI는 그대로다. 아래 「정정 (2026-11-10, 티켓 41)」을 본다.

근거 원칙: ① 접근성이 미려함보다 우선한다, ③ 단순함이 유연함보다 우선한다, ④ 발견할 수 있음이 외워야 함보다 우선한다

Component의 `color`는 Role 6개만 받는 닫힌 값이 아니라 **색 이름(Color)**이다. 색 이름은 Role(`primary` 등), Tide 색 계열(`blue`, `gray` 등), 앱이 더한 브랜드 계열(`brand` 등)이다(2026-11-10 사용자 결정, [티켓 40](../progress/tide-v0-impl/issues/40-open-color-families-and-app-brand-colors.md)). 실무에서는 Role 밖의 색을 Button 등에 쓰고, 색 계열은 늘어나며, 앱 브랜드 색을 더하는 일도 필수이기 때문이다.

- **계열 변수 묶음**: 색 계열마다 Theme 블록이 슬롯 9개를 정한다. `--tide-<계열>-<슬롯>`이고 슬롯은 `solid`, `solid-hover`, `solid-active`, `subtle`, `subtle-hover`, `subtle-active`, `text`, `border`, `on-solid`다.
- **매핑 규칙은 한 곳**(`packages/foundation/src/color-slot.ts`): solid 600/700/800(두 Theme), subtle light 50/100/200 · dark 950/900/800, text light 800 · dark 200, border light 600 · dark 400, on-solid white. 계열마다 덮어쓸 값을 둘 수 있다.
- **accent 슬롯**: `[data-color="<색 이름>"]` 규칙이 `--tide-accent-<슬롯>`을 그 색 변수의 별칭으로 둔다. Theme 블록은 기본값으로 primary를 꽂는다. Utility class는 `bg-accent-solid`/`-solid-hover`/`-solid-active`, `bg-accent-subtle`/`-subtle-hover`/`-subtle-active`, `text-accent`, `text-accent-on-solid`, `border-accent` 9개다.
- **Role은 계열 별칭**이다. Role Token(`--tide-bg-primary-solid`)은 계열 변수(`--tide-blue-solid`)를 가리키고, 덮어쓴 슬롯만 Primitive를 직접 가리킨다. `neutral`은 `gray`와 다른 색이다. dark subtle 900/800/700을 덮어쓰고, text·border는 `text-default`·`border-strong`을 쓴다.
- **타입**: foundation의 `interface ColorRegistry`(Role + Tide 색 계열)에서 `type Color = keyof ColorRegistry`를 만든다. 앱은 module augmentation으로 이름을 더한다. components가 다시 낸 interface도 augmentation 대상이 된다(TypeScript 7.0.2로 확인).
- **앱 브랜드 계열**: `@tide-tds/foundation/color-family`의 `defineColorFamily({ name, scale, overrides })`와 `tide-color build` CLI가 같은 규칙으로 CSS를 만들고, 같은 대비 쌍 규칙으로 light·dark를 검사해 미달이면 exit 1로 실패한다.

## 검토한 대안

- **Role만 받기(기존)**: 계열 색과 앱 브랜드 색을 쓰려면 앱이 class를 직접 덮어써야 하고, 대비 검사와 Theme 매핑을 앱이 따로 맞춰야 한다.
- **variant × color 맵에 색 이름마다 class를 손으로 채우기**: 색이 늘 때마다 모든 Component 맵을 고쳐야 한다. 앱 계열은 Tide 패키지를 고치지 않고는 더할 수 없다.
- **계열 Utility class(`bg-blue-solid`)를 모두 노출**: 자동완성과 tailwind-merge 설정이 계열 수에 비례해 커진다. Component가 앱 계열 class를 알 수 없으므로 앱 계열에는 어차피 쓸 수 없다.
- **앱이 hex 하나만 주고 CSS relative color로 단계를 만들기**: 값이 런타임에 정해져 대비를 정적으로 검사할 수 없다(①).

## Consequences

- 공개 계약이 늘어난다: `--tide-<계열>-<슬롯>` 54개, `--tide-accent-<슬롯>` 9개, accent Utility class 9개, `[data-color]` 속성 값, `ColorRegistry`/`Color`/`ColorSlot` 타입, `@tide-tds/foundation/color-family` 서브패스, `tide-color` bin. 기존 Role Utility class와 `--tide-*` 이름은 그대로이고 값도 바뀌지 않는다(회귀 스냅숏).
- 계열 변수와 accent 슬롯은 `--tide-<Utility class 이름>` 규칙의 예외다. Utility class가 없는 변수 묶음이라 `--tide-<색 이름>-<슬롯>`으로 짓는다.
- accent 별칭은 `data-color`가 붙은 요소에서 계산된다. 그래서 `data-color`는 `data-theme`과 같은 요소나 그 안쪽에 둔다. `data-color` 바깥에 둔 요소 단위 `data-theme` 안쪽은 Theme 블록의 기본값(primary)으로 돌아간다. Component는 `data-color`를 항상 자기 루트에 붙여서 이 경우를 피한다.
- 앱 브랜드 CSS는 Tide CSS 다음에 불러온다. `[data-color]`와 Theme 블록은 선택자 우선순위가 같아서 순서로 이긴다.
- Tailwind 자동완성과 tailwind-merge 설정은 accent class 9개만 늘고, 앱 계열 수와 무관하다. 앱이 `@theme`에 계열 class를 직접 더하면 Tide `cn`은 그 충돌을 풀지 않는다(문서에 경고).
- 앱이 정의 API와 CLI를 쓰려면 `@tide-tds/foundation`을 직접 설치한다(pnpm은 전이 의존성의 bin과 import를 앱에 열지 않는다). 버전은 components와 같다(ADR 0008).

## 정정

- [ADR 0003](0003-token-source-and-utility-namespaces.md): 공개 계약에 계열 변수·accent 슬롯·`[data-color]` 규칙을 더한다. tokens CSS는 `[data-theme]` 덮어쓰기와 함께 `[data-color]` 규칙을 담는다.
- [ADR 0005](0005-hand-written-variant-maps-and-render-prop.md): variant 맵 모양에서 색 축이 빠진다. 맵은 `Record<FillVariant, string>`이고 accent class로 쓰며, 색은 Component 루트의 `data-color`가 정한다. 「variant 4 × color 6 조합을 맵에 모두 손으로 채운다」는 Consequence는 더 이상 맞지 않는다.

## 정정 (2026-11-10, 티켓 41)

사용자가 한 디자인 시스템의 색 Foundation을 보고 결정을 바꿨다. 그 시스템은 Role을 버튼에 써서 동작의 뜻(primary, warning, danger)을 구분하고, accent 색은 뜻이 없어 서로 바꿔도 경험이 같은 색으로 둔다. 그래서 `color`가 받는 이름은 Component 종류가 정한다([ADR 0016](0016-role-scoped-color-and-app-roles.md)).

- 행동·의미 Component(Button, IconButton, Link, Checkbox·Radio, Switch, Alert, Toast)의 `color`는 `Role`만 받는다. 색 계열 이름은 장식·분류 Component(Badge, Tag, Avatar)가 쓴다.
- 「**타입**」 항목: `ColorRegistry`를 `RoleRegistry`(Tide Role 6개)와 `ColorFamilyRegistry`(Tide 색 계열 6개)로 나눈다. `Role = keyof RoleRegistry`, `ColorFamilyName = keyof ColorFamilyRegistry`, `Color = Role | ColorFamilyName`이다.
- 「**앱 브랜드 계열**」 항목: 만드는 방법(`defineColorFamily`, `tide-color build`)은 그대로다. 행동·의미 Component에 쓰려면 `RoleRegistry`에, 장식용으로 쓰려면 `ColorFamilyRegistry`에 등록한다.
- Consequences의 `ColorRegistry`/`Color` 타입은 위 타입으로 읽는다. CSS 공개 계약과 대비 결과는 바뀌지 않는다.
