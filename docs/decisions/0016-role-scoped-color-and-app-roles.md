# 행동·의미 Component의 `color`는 Role만 받고, 앱 브랜드 색은 앱 Role로 더한다

근거 원칙: ① 접근성이 미려함보다 우선한다, ② 명확함이 화려함보다 우선한다, ③ 단순함이 유연함보다 우선한다

[ADR 0011](0011-open-color-names-data-color-accent.md)의 「`color`는 열린 색 이름이다」를 대체한다(2026-11-10 사용자 결정, [티켓 41](../progress/tide-v0-impl/issues/41-role-scoped-color-and-app-roles.md)). `data-color`, accent 슬롯, 계열 변수, `[data-color]` 규칙, `defineColorFamily`, `tide-color` CLI는 ADR 0011 그대로다.

Component의 `color`가 받는 이름은 Component 종류가 정한다.

| Component 종류 | 예                                                              | `color`가 받는 이름                      | 타입              |
| -------------- | --------------------------------------------------------------- | ---------------------------------------- | ----------------- |
| 행동·의미      | Button, IconButton, Link, Checkbox, Radio, Switch, Alert, Toast | Role(Tide Role 6개 + 앱 Role)            | `Role`            |
| 장식·분류      | Badge, Tag, Avatar                                              | 색 계열(Tide 색 계열 6개 + 앱 장식 계열) | `ColorFamilyName` |

장식·분류 Component가 Role도 함께 받을지(예: 상태를 뜻하는 Badge)는 그 Component 티켓(19·21·33)에서 정한다. 둘 다 받으면 `Color`(`Role | ColorFamilyName`)를 쓴다.

> 덧붙임(2026-11-10, [ADR 0017](0017-badge-color-accepts-role-and-color-family.md)): Badge는 Role도 받는다. Badge의 `color`는 `Color`다.
>
> 덧붙임(2026-11-11, 티켓 21, [ADR 0017 후속](0017-badge-color-accepts-role-and-color-family.md)): Avatar는 Role을 받지 않는다. Avatar의 `color`는 `ColorFamilyName`(기본 `gray`)이다.
>
> 덧붙임(2026-11-11, [티켓 22](../progress/tide-v0-impl/issues/22-skeleton-and-progress.md)): Progress는 행동·의미 Component로 본다. 진행 상태(진행 중·완료·실패)는 뜻이 있는 표시라 `color`는 `Role`(앱 Role 포함, 기본 `primary`)이고 색 계열 이름은 받지 않는다. Skeleton은 뜻 없는 회색 자리 표시라 `color`를 두지 않는다(`bg-neutral-subtle-active` 고정).

> 덧붙임(2026-11-11, [티켓 23](../progress/tide-v0-impl/issues/23-table.md)): Table은 데이터를 담는 구조 Component로 본다. 행동·의미도 장식·분류도 아니어서 `color`를 두지 않는다. 글자는 `text-default`, 행 구분선은 `border-default`, 본문 행 hover는 ghost 규칙의 neutral `subtle-hover`로 고정이다. 행·칸에 색으로 뜻을 붙이려면 안에 Badge를 넣는다.

> 덧붙임(2026-11-11, [티켓 24](../progress/tide-v0-impl/issues/24-breadcrumb-and-pagination.md)): Breadcrumb·Pagination은 탐색 구조 Component로 본다. 링크·버튼을 담지만 동작의 뜻(위험, 성공 등)이 없는 이동이라 `color`를 두지 않는다(③). Breadcrumb 링크는 `text-muted`(hover `text-default`), 현재 페이지는 `text-default`다. Pagination 번호·이전/다음은 neutral ghost, 현재 쪽 번호는 primary subtle로 고정이다. 앱 브랜드 색으로 현재 쪽을 칠하는 요구가 생기면 `Pagination`에 `color?: Role`을 더하는 것을 그때 검토한다.

> 덧붙임(2026-11-11, [티켓 25](../progress/tide-v0-impl/issues/25-popover.md)): Popover는 내용을 담는 오버레이 구조 Component로 본다. 뜻(위험, 성공)을 색으로 전하는 행동·의미 Component도, 분류용 장식 Component도 아니어서 `color`를 두지 않는다(③). 표면은 raised(`bg-raised`, `text-default`, `border-raised`)로 고정이다. 트리거의 색은 `render`로 준 Button·IconButton의 `color`(Role)가 정한다. 같은 판단을 Tooltip·Menu·Select·Combobox 목록·Dialog의 표면에도 쓴다(Toast는 Alert 스타일을 쓰는 행동·의미 Component라 `Role`).

> 덧붙임(2026-11-11, [티켓 26](../progress/tide-v0-impl/issues/26-tooltip.md)): Tooltip은 설명을 담는 오버레이 구조 Component로 본다(티켓 25 덧붙임의 판단 그대로). 설명 한 줄에 뜻을 색으로 싣지 않으므로 `color`를 두지 않는다(②, ③). 표면은 Popover와 같은 raised(`bg-raised`, `text-default`, `border-raised`) 고정이고, 트리거의 색은 `render`로 준 IconButton·Button의 `color`(Role)가 정한다. 경고처럼 뜻이 있는 내용은 Tooltip이 아니라 화면의 Alert로 둔다.

> 덧붙임(2026-11-11, [티켓 27](../progress/tide-v0-impl/issues/27-menu.md)): Menu는 동작을 담는 오버레이 구조 Component로 본다(티켓 25 덧붙임의 판단 그대로). 목록 표면은 raised 고정이고, 항목 상태는 정해진 Token(highlight `bg-primary-subtle`·`text-primary`, hover `bg-neutral-subtle-hover`, 선택 유지 `bg-neutral-subtle-active`)이라 `color`를 두지 않는다(③). 위험한 동작(삭제)을 danger 색으로 칠하는 항목 `color`는 v0에 두지 않는다. 필요해지면 행동·의미 쪽이므로 `Role`로 더한다. 트리거 색은 `render`로 준 Button·IconButton의 `color`(Role)다.

> 덧붙임(2026-11-11, [티켓 28](../progress/tide-v0-impl/issues/28-select.md)): Select는 값을 고르는 폼 입력 Component로 본다(Input·Textarea와 같은 쪽). 고른 값에 뜻(위험, 성공)을 색으로 싣지 않고, 상태는 정해진 Token(트리거 `border-strong`·오류 `border-danger`·`focus-field`, 목록은 Menu와 같은 raised 표면·highlight·`subtle-active`)이라 `color`를 두지 않는다(③). 오류 색은 `invalid`(Field `error`)가 정한다. 옵션에 색 표시가 필요하면 옵션 안에 Badge를 넣는다.

이렇게 바꾼 이유는 Atlassian Design System의 색 Foundation(<https://atlassian.design/foundations/color>)이다. Atlassian은 「Color roles are applied to buttons to differentiate between primary, secondary, warning, or dangerous actions」라고 Role을 버튼에 쓰고, accent 색은 「colors that don't have any specific meaning … exchange one accent color for another, and the experience would remain unchanged」라고 뜻이 없는 색으로 둔다. 뜻이 있는 동작(저장, 삭제)에 뜻이 없는 색을 고를 수 있으면 같은 동작이 화면마다 다른 색이 되고(②), 고를 값도 Role 6개에서 12개 이상으로 늘어난다(③).

- **등록 interface 두 개**: foundation이 `RoleRegistry`(Tide Role 6개)와 `ColorFamilyRegistry`(Tide 색 계열 6개)를 둔다. `Role = keyof RoleRegistry`, `ColorFamilyName = keyof ColorFamilyRegistry`, `Color = Role | ColorFamilyName`이다. ADR 0011의 `ColorRegistry`는 없앤다.
- **Tide 안의 계산은 닫힌 타입을 쓴다**: Semantic Token 이름, 대비 쌍, `semantic` 객체 타입은 `TideRole`(Tide Role 6개)과 `ColorFamily`(Primitive 계열)를 쓴다. 앱 Role에는 Role Token(`bg-brand-solid`)이 생기지 않으므로 앱이 augmentation해도 이 타입은 넓어지지 않는다.
- **앱 브랜드 색은 앱 Role로 더한다**: 앱은 `defineColorFamily`와 `tide-color build`로 `[data-color="brand"]` CSS를 만들고(대비 검사 포함), `RoleRegistry`에 `brand`를 더한다. 그러면 `<Button color="brand">`가 된다. 같은 CSS를 장식용으로도 쓰려면 `ColorFamilyRegistry`에도 더한다. CSS는 한 가지이고 타입 등록만 다르다.
- **Tide Role의 색 바꾸기는 기능이 아니다**: 앱이 `primary`의 색을 바꾸려면 Role CSS 변수(`--tide-bg-primary-solid`, `--tide-text-primary`, `--tide-border-primary` 등)를 Theme별로 덮어쓴다. Tide는 이 값을 검사하지 않는다. 문서에 방법과 「대비 검증 없음」 경고만 둔다. 계열 변수(`--tide-blue-*`)는 덮어쓰지 않는다. 다른 Role과 장식 계열이 함께 바뀐다.

## 검토한 대안

- **ADR 0011 그대로(모든 Component가 Role + 색 계열 + 앱 계열)**: 위 이유(②, ③)로 바꿨다.
- **앱 브랜드 색을 「앱 계열」로 두고 행동 Component가 앱 계열만 추가로 받기**: Role이 아닌 이름을 행동 Component가 받는 예외가 생긴다. 앱 브랜드 색도 앱 안에서는 뜻(「우리 서비스의 주 동작」)이 있으므로 Role로 등록하는 편이 규칙이 하나다.
- **Tide Role의 색을 바꾸는 API(예: `defineRoleColor`)**: 앱이 Role 변수를 덮어쓰면 되므로 기능을 더하지 않는다(③). 대비 검사가 필요하면 앱 Role을 더하는 쪽을 권한다.
- **등록 interface 하나(`ColorRegistry`)에 값으로 종류를 적기(`brand: "role"`)**: 타입이 조건부 매핑이 되고, 앱이 적는 값의 뜻을 외워야 한다(④).

## Consequences

- Button·IconButton·Link의 `color` 타입이 `Role`이다. `color="blue"`는 타입 오류다. 이후 행동·의미 Component(16 Checkbox·Radio, 17 Switch, 20 Alert, 34 Toast)도 `Role`을 쓴다.
- 공개 타입: `RoleRegistry`, `ColorFamilyRegistry`, `ColorFamilyName`, `TideRole`을 더하고 `ColorRegistry`를 뺀다. `Role`은 interface의 키가 되어 앱이 넓힐 수 있다. `Color`는 `Role | ColorFamilyName`이다. 아직 배포한 적 없는 타입만 바뀐다(npm 0.1.0에는 `ColorRegistry`가 없다).
- CSS, Utility class, `--tide-*` 변수, 대비 결과는 바뀌지 않는다(티켓 40 회귀 스냅숏).
- 앱 Role에는 Role Utility class가 없다. Component는 accent class로 칠하므로 필요하지 않다. 앱이 자기 마크업을 앱 Role로 칠하려면 `data-color="brand"`와 accent class를 쓴다.
- augmentation 대상은 앱이 설치한 `@tide-tds/components`다. re-export한 interface에 한 augmentation도 원래 interface에 합쳐진다(TypeScript 7.0.2, 티켓 40·41에서 확인).

> 덧붙임(2026-11-11, [티켓 29](../progress/tide-v0-impl/issues/29-combobox.md)): Combobox도 Select와 같은 폼 입력 Component로 본다. 입력·목록·결과 없음 글자의 색은 정해진 Token(입력 `border-strong`·오류 `border-danger`·`focus-field`, chevron·결과 없음 `text-muted`, 목록은 Select와 같다)이라 `color`를 두지 않는다(③).

> 덧붙임(2026-11-11, [티켓 30](../progress/tide-v0-impl/issues/30-dialog-and-alert-dialog.md)): Dialog·AlertDialog는 내용을 담는 오버레이 구조 Component로 본다(티켓 25 덧붙임의 판단 그대로). 표면은 raised 고정(`bg-raised`, `text-default`, `border-raised`, 설명 `text-muted`), 막은 `bg-overlay` 고정이고 `color`를 두지 않는다(③). AlertDialog의 「위험」은 Dialog 표면이 아니라 동작 버튼의 뜻이므로, 위험한 동작 버튼은 행동 Component인 Button의 `color="danger"`(Role)로 칠하고 취소는 `variant="ghost" color="neutral"`로 둔다(문서 Do/Don't). 닫기 IconButton은 ghost neutral 고정이다.

> 덧붙임(2026-11-11, [티켓 31](../progress/tide-v0-impl/issues/31-tabs.md)): Tabs는 같은 영역의 패널을 바꾸는 탐색 구조 Component로 본다(티켓 24 Breadcrumb·Pagination 덧붙임과 같은 판단). 탭을 고르는 것은 뜻(위험, 성공)이 있는 동작이 아니고 분류용 장식도 아니어서 `color`를 두지 않는다(③). 글자는 `text-muted`(hover `text-default`), 고른 탭은 `text-primary`와 `border-primary` 막대로 고정이다. 앱 브랜드 색으로 고른 탭을 칠하는 요구가 생기면 행동·의미 쪽처럼 `Tabs`에 `color?: Role`을 더하는 것을 그때 검토한다. 탭에 개수·상태 표시가 필요하면 탭 안에 Badge를 넣는다.

> 덧붙임(2026-11-11, [티켓 32](../progress/tide-v0-impl/issues/32-accordion.md)): Accordion은 내용을 펼치고 접는 구조 Component로 본다(Tabs·Breadcrumb·Pagination과 같은 판단). 펼치는 것은 뜻(위험, 성공)이 있는 동작이 아니고 분류용 장식도 아니어서 `color`를 두지 않는다(③). 제목은 `text-default`, chevron은 `text-muted`(hover `text-default`), hover 배경은 neutral `subtle-hover`로 고정이다. 항목에 개수·상태 표시가 필요하면 트리거 버튼 안 제목 글자 뒤에 Badge를 둔다(버튼 이름에 함께 읽힌다. APG는 제목 요소 안에 버튼 밖의 요소를 두지 않는다).
