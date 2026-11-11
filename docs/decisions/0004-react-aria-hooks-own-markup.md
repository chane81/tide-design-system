# 접근성 동작은 React Aria hooks, 구조와 스타일은 직접 구현

근거 원칙: ① 접근성이 미려함보다 우선한다, ③ 단순함이 유연함보다 우선한다

Tide Component의 DOM, 마크업, 스타일은 Tide가 직접 만든다. 포커스 관리, 키보드 패턴, ARIA 같은 접근성 동작만 React Aria의 hooks 층(`react-aria` 3.53.1, 상태는 `react-stately` 3.51.0)에서 가져온다. 이 hook들은 DOM props(이벤트 핸들러, ARIA 속성, id)만 돌려주고, 요소와 구조는 호출하는 쪽이 정한다(react-aria.adobe.com/hooks, 2026-11 확인).

네이티브 HTML만으로 WAI-ARIA 패턴이 완결되는 요소(Button, Input, Textarea, Checkbox, Radio, Switch)에는 hook을 쓰지 않고 시맨틱 HTML을 쓴다. hook은 JS로 포커스 이동이나 키보드 패턴을 구현해야 하는 위젯(Dialog, Menu, Tabs, Select, Combobox, Popover, Tooltip 등)에만 쓴다.

외부 컴포넌트 라이브러리는 쓰지 않는 것이 기본이다. DatePicker처럼 외부 라이브러리가 필요해 보이면 에이전트는 후보와 근거를 정리해 먼저 사용자에게 묻고, 도입하기로 하면 ADR로 남긴다.

## 검토한 대안

- **Base UI(`@base-ui/react` 1.9.0)**: 릴리스가 활발하고 shadcn이 기본값으로 채택했다. 하지만 구조까지 라이브러리가 정하므로, 조합 API(`render`)와 DOM 구조가 Tide 공개 API에 스며든다.
- **`react-aria-components`**: 범위가 가장 넓다. 하지만 같은 이유로 구조를 라이브러리에 맡기게 된다. 또 `isDisabled`, `onPress` 같은 이름이 공개 API에 드러나기 쉽다.
- **Radix Primitives**: 생태계가 가장 크다. 하지만 약 10개월의 릴리스 공백이 있었고, React 19 관련 버그를 2026년에도 고치고 있다.
- **완전 직접 구현**: 의존성이 없다. 하지만 1인 프로젝트에서 스크린리더와 브라우저 조합별 버그를 혼자 감당해야 해서 ① 접근성에 가장 위험하다.

## Consequences

- 위젯마다 마크업과 스타일 코드를 Tide가 직접 쓴다. headless 컴포넌트를 감싸는 것보다 작성량은 늘지만, DOM 구조와 공개 API를 완전히 통제한다.
- React Aria의 prop 이름(`isDisabled`, `onPress`, `selectedKey`)은 hook을 호출하는 내부에서만 쓴다. 공개 API 이름으로 바꾸는 규칙은 Component 공통 API 규칙에서 정한다.
- React Aria 오버레이 hook은 기본적으로 `document.body`에 portal로 렌더한다(`UNSAFE_PortalProvider`로 바꿀 수 있음). 쌓임 순서 설계는 이것을 전제로 한다.
- 이 hook들은 클라이언트 전용이므로, hook을 쓰는 Component는 `"use client"` 경계 안에 둔다.

> 덧붙임(2026-11-11, [티켓 32](../progress/tide-v0-impl/issues/32-accordion.md)): Accordion은 네이티브 `<details>/<summary>` 대신 React Aria `useDisclosure`(+ `useDisclosureGroupState`·`useDisclosureState`·`useButton`, react-aria 3.53.1·react-stately 3.51.0)로 만든다. 네이티브 요소로 WAI-ARIA APG Accordion이 완결되지 않기 때문이다(이 ADR의 「네이티브로 완결되면 hook을 쓰지 않는다」 기준).
>
> | 비교         | `<details>/<summary>`                                                                                                           | `useDisclosure`                                                                     |
> | ------------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
> | APG 구조     | summary가 버튼 역할을 겸해 「제목 요소 안의 버튼」이 아니다. 제목을 summary 안에 넣으면 보조 기술에 따라 제목으로 읽히지 않는다 | `<hN>` 안의 `<button aria-expanded aria-controls>` + `region`(APG 그대로)           |
> | 서버 렌더    | 그대로 된다                                                                                                                     | 된다. 접힌 패널은 `hidden`으로 prerender되고 id는 React `useId`라 hydration과 같다  |
> | JS 없이 동작 | 열고 닫힌다                                                                                                                     | 안 된다(hydration 전에는 처음 상태로 고정). Tide 위젯은 모두 client라 같은 조건이다 |
> | 애니메이션   | `::details-content` + `interpolate-size`가 필요하고 Chromium 위주다                                                             | Tide는 높이 애니메이션을 넣지 않는다(motion 결정). chevron 회전만 CSS로 한다        |
> | 단일/다중    | `name` 속성(Baseline 2024)으로 단일 펼침. 제어 상태(`value`)는 `toggle` 이벤트가 바뀐 뒤 와서 막을 수 없다                      | `useDisclosureGroupState`로 단일·다중과 제어/비제어를 함께 다룬다                   |
> | 페이지 찾기  | 닫힌 내용도 찾으면 펼친다(Chromium)                                                                                             | hydration 뒤 `hidden="until-found"`와 `beforematch`로 같게 동작한다                 |
>
> 공개 이름은 React Aria 이름(`isExpanded`, `expandedKeys`, `allowsMultipleExpanded`)이 아니라 `value`·`defaultValue`·`onValueChange`·`multiple`·`disabled`다.
