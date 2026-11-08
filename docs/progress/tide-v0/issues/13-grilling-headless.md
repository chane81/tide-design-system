# 접근성 동작 구현 방식 결정

Type: grilling
Status: resolved
Blocked by: 06

## Question

Component의 접근성 동작(포커스 관리, 키보드 조작, ARIA)을 headless 라이브러리에 맡길지 직접 구현할지 결정한다. 라이브러리에 맡긴다면 어떤 것을 쓸지도 정한다.

## Answer

접근성 동작은 React Aria **hooks** 층에 맡기고, 구조와 스타일은 Tide가 직접 구현한다. headless 컴포넌트 라이브러리는 쓰지 않는다. 상세와 대안은 [ADR 0004](../../../decisions/0004-react-aria-hooks-own-markup.md)에 있다.

1. **구조와 스타일은 직접 구현한다.** DOM, 마크업, 스타일은 Tide가 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다.
2. **접근성 동작은 React Aria hooks로 가져온다.** `react-aria` 3.53.1과 `react-stately` 3.51.0(npm, 2026-11-09 확인). hook은 DOM props만 돌려준다.
3. **네이티브로 완결되는 요소에는 hook을 쓰지 않는다.** Button, Input, Textarea, Checkbox, Radio, Switch는 시맨틱 HTML로 만든다. 판단 기준은 "JS 없이 WAI-ARIA 패턴을 충족하는가"다. hook은 Dialog, Menu, Tabs, Select, Combobox, Popover, Tooltip 같은 위젯에만 쓴다.
4. **외부 컴포넌트 라이브러리는 쓰지 않는 것이 기본이다.** DatePicker처럼 필요해 보이는 경우에는 에이전트가 후보와 근거를 들고 먼저 사용자에게 묻는다. 도입하면 ADR로 남긴다. 참고로 React Aria hooks에도 `useDatePicker`, `useCalendar`가 있다(값은 `@internationalized/date` 3.12.4). 그래도 hook을 반드시 먼저 써야 하는 것은 아니다.

### 다른 티켓에 주는 영향

- 「Component 공통 API 규칙 결정」: React Aria prop 이름을 공개 API에 드러내지 않고 내부에서 변환하는 규칙을 정한다.
- 「모노레포 패키지 구조와 빌드 결정」: `react-aria`와 `react-stately`를 dependencies로 둘지 peer로 둘지 정한다. hook을 쓰는 Component의 `"use client"` 경계도 함께 본다.
- 「v0 Component 목록과 우선순위 결정」: DatePicker를 v0에 넣을지 정한다. 넣는다면 외부 라이브러리 검토를 사용자에게 묻는다.
- 「z-index 층 결정」: React Aria 오버레이는 기본적으로 `document.body`에 portal로 렌더한다. 따라서 z-index 층이 필요하다는 전제는 유지된다. 직접 만드는 마크업에서 top-layer(`<dialog>`, popover API)를 함께 쓸지는 그 티켓에서 판단한다.

## Comments

- 2026-11-09 grilling 진행. 처음에는 headless 라이브러리(Base UI)를 추천했다. 사용자가 "접근성은 React Aria, headless 라이브러리는 웬만하면 쓰지 말고 직접 구현"으로 방향을 바꿨다. 이를 React Aria hooks 층과 직접 구현의 조합으로 해석했고, 사용자가 확인했다. 외부 라이브러리 예외 규칙은 "hook이 없을 때만"이 아니라 "기본적으로 쓰지 않고, 필요하면 사용자에게 묻는다"로 정정됐다.
