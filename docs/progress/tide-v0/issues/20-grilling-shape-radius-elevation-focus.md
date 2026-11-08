# radius·elevation·focus ring 형태 결정

Type: grilling
Status: open
Blocked by: 12

## Question

모양과 깊이를 나타내는 Foundation 값을 정한다.

- radius 5단계(`sm`/`md`/`lg`/`xl`/`full`)의 값과, Component 종류별로 어떤 단계를 쓸지에 대한 기본 규칙
- elevation: 그림자 단계 수, 각 단계의 offset·blur·spread, 표면 층(`canvas`/`surface`/`raised`)과의 매핑, dark Theme에서 그림자 대신 border를 쓰는 규칙과의 관계
- focus ring 형태: 두께, offset, radius를 따를지 여부. WCAG 2.4.11(AA)과 비텍스트 대비 3:1을 만족해야 함

### 참고 (다른 티켓에서 넘어온 것)

- 「v0 Foundation 범위 결정」: radius와 그림자는 Tailwind 기본값을 지우고 Tide 단계만 둔다. 모든 그림자는 `--tide-shadow-color`를 쓴다.
- 「컬러 Foundation 결정」: shadow 색의 alpha(light gray-950 12%, dark black 40%)는 여기서 다시 조정할 수 있다. dark에서 raised는 gray-900에 border를 더한다.
- 값을 눈으로 비교해야 하면 prototype 티켓을 새로 만든다.
