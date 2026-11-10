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
