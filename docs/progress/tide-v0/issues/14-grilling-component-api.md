# Component 공통 API 규칙 결정

Type: grilling
Status: open
Blocked by: 06, 03, 13

## Question

모든 Component가 따를 규칙을 결정한다. 대상은 size와 variant 이름, `className` 병합과 충돌 처리, ref 전달, polymorphic/`asChild` 패턴, controlled/uncontrolled 규칙, variant 정의 도구(cva 등) 사용 여부다.

### 참고 (다른 티켓에서 넘어온 것)

- 「컬러 Foundation 결정」: dark에서 raised(gray-900) 위의 neutral subtle은 기본 상태가 배경과 같은 색이다. 메뉴 항목처럼 raised 위에 놓이는 요소의 기본 상태와 hover 규칙을 여기서 정한다.
