# 아이콘 전략 결정

Type: grilling
Status: open
Blocked by: 12, 15

## Question

v0 Component 안에서 쓸 아이콘과, 사용자에게 제공할 아이콘을 어떻게 마련할지 정한다. 대상은 직접 제작할지 외부 세트를 쓸지(라이선스 포함), 배포 형식(React Component, SVG sprite 등)과 패키지 위치, 크기 규칙(텍스트 스타일과의 짝), 접근성 처리(장식용 아이콘과 의미가 있는 아이콘의 구분)다.

### 참고 (다른 티켓에서 넘어온 것)

- 「v0 Foundation 범위 결정」: 아이콘은 v0에 넣는다.
- 「컬러 Foundation 결정」: 아이콘 색은 별도 속성 없이 `currentColor`를 따른다.
- 「v0 Component 목록과 우선순위 결정」: Component 내부에 필요한 아이콘은 다음과 같다. Checkbox 체크와 indeterminate, Select·Combobox·Accordion의 chevron, Dialog·Toast·Alert·Tag의 닫기(x), Pagination 화살표와 Breadcrumb 구분자, Alert·Toast의 역할별 상태 아이콘(info, success, warning, danger), Avatar fallback(사람).
- 「모노레포 패키지 구조와 빌드 결정」: 배포 패키지는 `@tide-tds/foundation`(프레임워크 무관)과 `@tide-tds/desktop`(React) 두 개다. 아이콘을 둘 중 어디에 둘지, 아니면 별도 패키지(예: `@tide-tds/icons`)로 둘지 여기서 정한다. React Component 형식이면 foundation에는 둘 수 없다(ADR 0001).
