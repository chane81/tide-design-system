# Component 공통 API 규칙 결정

Type: grilling
Status: open
Blocked by: 06, 03, 13

## Question

모든 Component가 따를 규칙을 결정한다. 대상은 size와 variant 이름, `className` 병합과 충돌 처리, ref 전달, polymorphic/`asChild` 패턴, controlled/uncontrolled 규칙, variant 정의 도구(cva 등) 사용 여부다.

### 참고 (다른 티켓에서 넘어온 것)

- 「컬러 Foundation 결정」: dark에서 raised(gray-900) 위의 neutral subtle은 기본 상태가 배경과 같은 색이다. 메뉴 항목처럼 raised 위에 놓이는 요소의 기본 상태와 hover 규칙을 여기서 정한다.
- 「Token 네이밍과 Utility class 노출 규칙 결정」: tailwind-merge 설정(색이 아닌 커스텀 이름)은 Token TS 원본에서 생성한다. 이 티켓에서는 Component가 그 설정을 어떻게 쓰는지(`cn()` 헬퍼 등)를 정한다. 강도 이름 `solid`/`subtle`은 Token에서 쓰는 이름이므로 Component `variant` 값과 맞출지도 여기서 정한다.
- 「타이포그래피 Foundation 결정」: Component 내부 텍스트는 텍스트 스타일 class(`text-label-md` 등)만 쓴다. Component `size`(sm/md/lg)와 `label-sm/md/lg`를 어떻게 짝지을지 여기서 정한다. 버튼과 입력창의 높이와 세로 정렬은 Pretendard 메트릭(hhea 1.19em) 기준으로 검증한다.
