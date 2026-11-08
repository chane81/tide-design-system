# v0 Component 목록과 우선순위 결정

Type: grilling
Status: open
Blocked by: 06, 07

## Question

v0에 넣을 Component 목록을 정하고, 구현 우선순위와 의존 순서를 정한다(예: Button 다음에 IconButton). 범위에서 뺀 Component도 이유와 함께 기록한다.

### 참고 (다른 티켓에서 넘어온 것)

- 「접근성 동작 구현 방식 결정」: 외부 컴포넌트 라이브러리는 쓰지 않는 것이 기본이다(ADR 0004). DatePicker처럼 외부 라이브러리가 필요해 보이는 Component를 v0에 넣으려면 먼저 사용자에게 묻는다. 네이티브 HTML로 완결되는 Component(Button, Input, Checkbox 등)와 React Aria hook이 필요한 위젯을 구분해 두면 우선순위를 정하기 쉽다.
- 「Component 공통 API 규칙 결정」: 아이콘만 있는 버튼은 `size` 값이 아니라 별도 `IconButton`으로 만들고, `aria-label`을 타입상 필수로 둔다. size는 4단계(`xs | sm | md | lg`)이고 Component마다 필요한 단계만 고른다.
