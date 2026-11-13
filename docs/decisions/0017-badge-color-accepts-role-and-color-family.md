# Badge의 `color`는 Role과 색 계열 이름을 모두 받는다(`Color`)

근거 원칙: ② 명확함이 화려함보다 우선한다, ③ 단순함이 유연함보다 우선한다

[ADR 0016](0016-role-scoped-color-and-app-roles.md)의 표를 따른다. Badge는 장식·분류 Component라 색 계열 이름(`ColorFamilyName`)을 받는다. ADR 0016이 열어 둔 질문(「장식·분류 Component가 Role도 함께 받을지는 그 Component 티켓에서 정한다」)에 대해 [티켓 19](../progress/tide-v0-impl/issues/19-badge-card-separator.md)에서 **Badge는 Role도 받는다**로 정했다. 그래서 Badge의 `color`는 `Color`(`Role | ColorFamilyName`)다(2026-11-10 사용자 결정).

- **두 쓰임**: Badge는 상태(완료·지연·실패)와 분류(디자인·마케팅)를 모두 보여 준다(GLOSSARY 「Badge」). 상태는 뜻이 있는 색(Role), 분류는 뜻이 없는 색(색 계열)이다. 한 Component가 두 쓰임을 갖으므로 두 이름을 모두 받는다.
- **쓰는 규칙은 문서가 정한다**: 상태는 Role, 분류는 색 이름으로 고른다. 문서 Do/Don't에 적는다. 상태를 `green`·`red`로 칠하면 앱이 Role 색을 바꾸거나 앱 Role을 더해도 따라가지 않는다(②).
- **기본값은 `neutral`이다**: 다른 Component의 기본값은 `primary`지만, 뜻을 고르지 않은 라벨이 주 동작 색이면 「새로움·주목」으로 읽힌다. 루트에 `data-color`를 항상 붙이는 규칙(ADR 0011)은 그대로다.
- **앱 이름**: 앱이 `RoleRegistry`에 더한 Role과 `ColorFamilyRegistry`에 더한 장식 계열을 모두 받는다. 색은 `data-color` + accent 슬롯이라 Badge 코드는 이름 종류와 관계없이 같다.

## 검토한 대안

- **`ColorFamilyName`만(ADR 0016 표의 기본)**: 상태 라벨을 `success`·`danger`로 쓸 수 없어 상태의 뜻을 색 계열 이름으로 적게 된다. 앱 Role이나 Role 색 바꾸기를 따라가지 못한다.
- **`Role`만**: 분류 라벨을 칠할 수 없어 별도 Component가 필요해진다. 같은 모양의 라벨이 둘로 갈린다(③).

## Consequences

- `BadgeProps["color"]`는 `Color`다. 등록하지 않은 이름(예: `"purple-ish"`)만 타입 오류다.
- Badge 글자색 대비는 Role 대비 쌍(`text-<role>` × `bg-<role>-subtle`, `text-on-solid` × `bg-<role>-solid`)과 색 이름 규칙(`colorContrastRules`의 text × subtle, on-solid × solid)이 보장한다. Tide 색 계열 6개는 foundation이 이 규칙으로 light·dark를 검사하고, 앱 이름은 `tide-color`가 검사한다. foundation 대비 쌍은 늘지 않는다.
- Tag·Avatar(티켓 33·21)가 Role도 받을지는 각 티켓에서 따로 정한다.

> 후속(2026-11-11, [티켓 21](../progress/tide-v0-impl/issues/21-avatar.md)): **Avatar는 Role을 받지 않는다.** `AvatarProps["color"]`는 `ColorFamilyName`이고 기본값은 `gray`다. Avatar의 색은 fallback 배경과 아이콘에만 쓰이고, 사람을 구분하는 데 돕는 뜻 없는 장식 색이다. Badge처럼 상태를 전하는 두 번째 쓰임이 없어 ADR 0016 표의 기본을 그대로 따른다(③). 상태(온라인 등)를 보여 줘야 하면 Avatar의 색이 아니라 따로 표시를 둔다. `neutral`은 Role이라 받지 않고, 회색은 `gray`다.

> 후속(2026-11-11, [티켓 33](../progress/tide-v0-impl/issues/33-tag.md)): **Tag도 Role을 받지 않는다.** `TagProps["color"]`는 `ColorFamilyName`이고 기본값은 `gray`다. Tag의 쓰임(고른 필터, 입력한 키워드, 분류 라벨, 받는 사람·권한 묶음)은 모두 사용자가 고르거나 입력한 값이고, 색은 분류를 서로 구분하는 뜻 없는 장식이다. 서로 바꿔도 경험이 같다(ADR 0016의 accent 기준). Badge처럼 상태(완료·실패)를 전하는 두 번째 쓰임은 GLOSSARY가 Badge로 정해 두었고(「상호작용이 없는 상태 표시는 Badge」), 지우거나 옮겨 다니는 상태 라벨은 쓰임이 없다. 그래서 ADR 0016 표의 기본을 그대로 따른다(③). 상태를 칠하려고 Role이 필요해 보이면 Tag가 아니라 Badge를 쓴다(문서 Don't). 지우기 버튼은 행동 Component인 IconButton이지만 색 축을 따로 갖지 않는다. 글자색은 태그 글자(`text-current`)를, hover·누름 배경은 태그 색의 subtle-hover·subtle-active를 따른다. IconButton이 루트 `data-color`(Role)로 accent 슬롯을 바꾸므로, 태그 요소가 계산한 accent 값을 custom property(`--tag-remove-hover`·`--tag-remove-active`, 계산값으로 상속)로 넘긴다. 대비는 색 이름 규칙의 text × subtle 3단계(4.5:1)가 보장하고 foundation 대비 쌍은 늘지 않는다.

> 덧붙임(2026-11-12, [ADR 0023](0023-tiered-contrast-minimum.md)): Tag 글자는 ADR 0022 뒤로 on-subtle이고, 하한은 상태별 등급을 따른다. 태그 글자 × subtle은 4.5:1, 지우기 버튼의 subtle-hover·subtle-active 위는 일시 상태라 4.0:1이다. Badge `solid` 글자(on-solid × solid)는 4.0:1이다.
