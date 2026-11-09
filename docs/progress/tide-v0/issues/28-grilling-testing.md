# 테스트 전략 결정

Type: grilling
Status: open
Blocked by: 26, 27

## Question

무엇을 어떤 도구로, 언제 검사할지 정한다.

- 테스트 층: Token(대비 쌍, Utility class 노출 확인), Component 동작(키보드, ARIA), 접근성 자동 검사, 시각 회귀, 소비 smoke test
- 각 층의 도구와 실행 환경(jsdom인지 실제 브라우저인지)
- stories를 테스트로 재사용할지(Storybook 결정과 연결)
- 시각 회귀를 v0에 넣을지, 넣는다면 도구와 기준 이미지 관리
- forced-colors, reduced-motion 확인을 자동화할지, 수동 체크리스트로 둘지
- CI에서 언제 돌릴지(PR마다, main 머지 후, publish 전)
- Component마다 "완료"로 볼 테스트 최소 기준(spec에서 쓸 Definition of Done)

### 참고 (다른 티켓에서 넘어온 것)

- 「테스트 도구와 방식 조사」(27번)의 결과를 근거로 쓴다.
- 「컬러 Foundation 결정」: 명시한 대비 쌍 128개를 WCAG 2.x 대비비로 CI에서 검사한다.
- 「Token 네이밍과 Utility class 노출 규칙 결정」: Semantic 색이 Tailwind 속성별 namespace로 노출되는지 CI로 확인한다.
- 「radius·elevation·focus ring 형태 결정」: error 입력창에서 field 포커스가 error보다 우선하는지 확인해야 한다(24번 prototype에서 실제로 깨졌던 부분).
- 「그림자·포커스 표시·motion 시각 비교」: forced-colors 모드는 확인하지 못했다.
