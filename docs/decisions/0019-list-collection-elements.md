# 목록 항목은 React Stately 컬렉션 요소(`getCollectionNode`)로 모으고, 서버 컴포넌트의 lazy 참조는 풀어 넘긴다

근거 원칙: ① 접근성이 미려함보다 우선한다, ③ 단순함이 유연함보다 우선한다

Menu·Select·Combobox는 항목 목록을 React Stately 상태(`useTreeState`, `useListState`, `useSelectState`, `useComboBoxState`)에 넘겨야 화살표·Home/End·타입어헤드·비활성 건너뛰기를 React Aria hooks가 해 준다. 이 상태들은 children 요소의 type에 붙은 `getCollectionNode`로 항목을 모은다(react-stately 3.51.0 `Item`·`Section`, 설치본 `CollectionBuilder` 소스로 확인). Tide는 이 방식을 그대로 쓴다(2026-11-11, [티켓 27](../progress/tide-v0-impl/issues/27-menu.md)).

- **항목 Component는 표시 요소다**: `MenuItem`·`MenuSection`(이후 Select·Combobox 옵션)은 `null`을 렌더하고, `list-collection.ts`의 `itemCollectionNode`·`sectionCollectionNode`를 `getCollectionNode`로 붙인다. 목록 Component가 컬렉션의 node를 돌며 node.props(앱이 항목에 준 props 그대로)로 마크업을 직접 그린다(ADR 0004). 공개 이름은 Tide 이름이고(`disabled`, `heading`), node에 넣을 때 React Stately 이름(`isDisabled`, `title` 자리의 `rendered`)으로 바꾼다.
- **타입어헤드 글자**: `textValue`가 없으면 children 안의 글자를 모은다. 아이콘과 글자를 함께 둔 항목도 경고 없이 타입어헤드가 된다.
- **서버 컴포넌트**: 서버 컴포넌트에서 만든 client Component 요소는 RSC payload에서 type이 React lazy 참조(`$L`)로 온다(next 16.4.5 react-server-dom-webpack client 소스 `createLazyChunkWrapper`로 확인). 컬렉션 빌더는 type의 `getCollectionNode`를 직접 보므로 그대로면 「Unknown element」 오류다. `resolveCollectionChildren`이 lazy type을 `_init(_payload)`로 풀어 실제 Component로 바꾸고 Fragment를 펼친다. 목록과 항목은 같은 모듈이라 목록이 렌더될 때는 이미 불러와져 있다.
- **제약**: 항목은 목록(또는 묶음) 바로 아래, Fragment·배열 안에만 둘 수 있다. 앱이 만든 Component로 항목을 감싸면 모이지 않는다. 문서 「앱이 할 일」에 적는다.

## 검토한 대안

- **react-aria의 DOM 기반 `CollectionBuilder`·`createLeafComponent`(react-aria-components가 쓰는 방식)**: 항목을 실제로 렌더해 모으므로 감싼 Component와 서버 컴포넌트에서도 동작한다. 그러나 hooks 문서에 쓰는 법이 없고(react-aria 3.53.1 문서는 `useTreeState` + `Item`을 안내한다), 상태 hook에 미리 만든 컬렉션을 넘기는 방법도 문서에 없다. 문서로 확인할 수 없는 내부 API에 목록 3개를 기대지 않는다(③).
- **항목을 데이터 배열(`items`)로만 받기**: 감싸기 문제가 없지만 아이콘·묶음·비활성 같은 항목 모양을 prop 모양으로 다시 정해야 하고, 다른 Tide Component(`<Card>` 안 children)와 쓰는 법이 달라진다.
- **항목이 스스로 렌더되며 자리 등록(Radix·Base UI 방식)**: React Aria 키보드 hook이 기대하는 컬렉션을 Tide가 다시 만들어야 한다(①, 검증된 동작을 버린다).
- **서버 컴포넌트에서는 쓰지 말라고만 안내**: Tide smoke 앱처럼 page가 서버 컴포넌트인 경우가 흔하고, 목록을 열 때야 오류가 나서 놓치기 쉽다.

## Consequences

- `_init`·`_payload`는 React의 공개 문서에 없는 lazy 객체 필드다. React 판을 올릴 때 Menu 테스트 「Fragment·배열·서버 컴포넌트의 lazy 참조로 온 항목도 모은다」가 이 동작을 지킨다. smoke 앱은 서버 컴포넌트 page에서 Menu를 prerender하지만 목록을 열지 않으므로 이 경로는 browser 테스트가 맡는다.
- Select(28)·Combobox(29)는 옵션·묶음 Component에 같은 함수를 붙이고, 고른 값(`value`)을 항목 key로 쓰는 방법을 그 티켓에서 정한다(지금 key는 React key 또는 자리 번호).

> 덧붙임(2026-11-11, [티켓 28](../progress/tide-v0-impl/issues/28-select.md)): Select가 옵션 key를 정했고 옵션 그리기를 공통 부분으로 나눴다. Menu 테스트는 그대로 통과한다.
>
> - **`value`가 key다(`valueItemCollectionNode`)**: 옵션 Component는 `itemCollectionNode`와 같은 node에 `key: props.value`를 더해 yield한다. 컬렉션 빌더는 yield한 node의 key를 요소 key·자리 번호보다 먼저 쓴다(react-stately 3.51.0 `CollectionBuilder.getFullNode`). 묶음은 key 없는 부분 node로 항목을 넘기므로 묶음 안 옵션 key에도 묶음 key가 붙지 않는다. 그래서 선택 key, 숨은 `<select>`의 option value, `onValueChange` 값이 모두 앱이 준 `value` 문자열이다. 공통 props는 `CollectionValueItemProps`(`value` 필수).
> - **`listbox.tsx`("use client")**: listbox 옵션·묶음을 그리는 `ListBoxNodes`와 `ListBoxOptionProps`·`ListBoxSectionProps`. 옵션은 `useOption`의 `isFocused`를 `data-highlighted`로(Combobox 가상 포커스에서도 같다), `isSelected`를 `data-selected`와 끝의 장식용 체크 아이콘으로, `isDisabled`를 `data-disabled`로 붙이고 class는 Menu와 같은 `listItemClass`다. Combobox(29)가 그대로 쓴다.
> - **listbox 안 구분선은 `separator` 역할이 아니다**: listbox의 자식은 option·group만 될 수 있어(storybook axe `aria-required-children`) 구분선은 `role="presentation"` + `aria-hidden`인 장식 요소다. 묶음 경계는 group이 알린다. Menu(menu 자식에 separator 허용)는 그대로 `role="separator"`다.
> - **서버 컴포넌트**: Select는 Menu와 달리 렌더할 때(서버 prerender 포함) 옵션을 모은다(트리거에 고른 값을 보이고 숨은 select를 그려야 하므로). smoke 앱의 서버 컴포넌트 page가 Field 안 Select를 prerender해 lazy 참조 옵션이 모이는 것을 확인했다.
