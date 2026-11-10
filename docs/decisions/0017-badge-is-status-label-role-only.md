# Badge는 상태 라벨이라 `color`는 Role만 받는다

근거 원칙: ① 접근성이 미려함보다 우선한다, ② 명확함이 화려함보다 우선한다, ③ 단순함이 유연함보다 우선한다

[ADR 0016](0016-role-scoped-color-and-app-roles.md)의 표는 Badge를 장식·분류 Component(`ColorFamilyName`)에 두고, Role도 받을지는 [티켓 19](../progress/tide-v0-impl/issues/19-badge-card-separator.md)에서 정하라고 했다. 티켓 19에서 **Badge를 의미 Component로 옮겨 `color`를 `Role`(Tide Role 6개 + 앱 Role)만 받게** 했다(2026-11-10, 코디네이터가 전한 사용자 결정). 색 계열 이름(`blue`, `gray` 등)은 타입 오류다.

- **Badge가 하는 일**: spec과 GLOSSARY에서 Badge는 「상호작용 없는 상태 라벨」이다. 완료·지연·실패처럼 뜻이 있는 상태를 보여 주고, 같은 상태는 어느 화면에서나 같은 색이어야 한다(②). 뜻이 있는 색은 Role이다(ADR 0016의 Atlassian 근거와 같다).
- **기본값은 `neutral`이다**: 다른 Component의 기본값은 `primary`지만, 뜻을 고르지 않은 상태 라벨이 파랑(주 동작 색)이면 「새로움·주목」으로 읽힌다. 뜻이 없는 상태는 `neutral`이 맞다. 루트에 `data-color`를 항상 붙이는 규칙(ADR 0011)은 그대로다.
- **뜻 없는 분류 색은 다른 Component가 맡는다**: 카테고리마다 다른 색을 칠하는 일은 Tag·Avatar(티켓 33·21)처럼 색 계열을 받는 Component가 맡는다. Badge가 둘 다(`Color`) 받으면 상태와 분류가 한 Component에 섞여 고를 값이 12개 이상으로 늘어난다(③).

## 검토한 대안

- **ADR 0016 표 그대로 `ColorFamilyName`만**: 상태의 뜻(성공·위험)을 색 계열(`green`·`red`)로 적게 되어, 앱 Role(`brand`)이나 Role 색 바꾸기(Role CSS 변수 덮어쓰기)를 따라가지 못한다.
- **`Color`(Role + 색 계열) 둘 다**: 유연하지만 같은 「완료」를 `success`와 `green`으로 칠할 수 있어 화면마다 달라진다(②, ③).

## Consequences

- `BadgeProps["color"]`는 `Role`이다. 앱 Role은 `RoleRegistry` augmentation으로 받는다. 앱 장식 계열(`ColorFamilyRegistry`)만 등록한 이름은 Badge에 쓸 수 없다.
- ADR 0016 표의 「장식·분류: Badge, Tag, Avatar」에서 Badge가 빠지고 「행동·의미」로 간다. spec 「스타일 축」, 「앱 확장점(색)」, GLOSSARY 「색 이름」을 함께 고쳤다.
- Badge 글자색 대비는 Role 대비 쌍(`text-<role>` × `bg-<role>-subtle`, `text-on-solid` × `bg-<role>-solid`)과 앱 Role 규칙(`colorContrastRules`)이 보장한다. foundation 대비 쌍은 늘지 않는다.
