# motion Foundation 결정

Type: grilling
Status: open
Blocked by: 12

## Question

전환 애니메이션에 쓸 Token을 정한다. duration 단계와 easing 종류(각각 최소한으로), `prefers-reduced-motion`에서 전환을 끌지 줄일지, Tailwind 표준 namespace에 어떻게 연결할지를 정한다.

### 참고 (다른 티켓에서 넘어온 것)

- 「v0 Foundation 범위 결정」: motion은 v0에 최소한으로 넣는다. 원칙 ① 접근성에 따라 reduced-motion 규칙이 필수다.
- Tailwind 4.3.x에서 duration과 easing의 theme namespace는 기억에 의존하지 말고 context7이나 공식 문서로 확인한다.
