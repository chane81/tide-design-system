# press 축소를 끄는 prop은 `noPressScale`이다

근거 원칙: ③ 단순함이 유연함보다 우선한다, ④ 발견할 수 있음이 외워야 함보다 우선한다

Button과 IconButton은 활성 상태에서 누르면 0.96으로 줄어든다(`motion-safe:`일 때만, [motion 결정](../progress/tide-v0/issues/21-grilling-motion.md)). 이것을 끄는 boolean prop의 이름은 초안 `static` 대신 **`noPressScale`** 로 한다. 기본값은 `false`이고 `<Button noPressScale>`처럼 쓴다. 이후 누름 반응이 있는 Component(IconButton 등)도 같은 이름을 쓴다(2026-11-10, 티켓 13).

- 공통 API 규칙은 boolean prop에 DOM 이름처럼 `is` 접두를 붙이지 않는다(ADR 0005, [Component 공통 API 규칙 결정](../progress/tide-v0/issues/14-grilling-component-api.md) 7절). 기본으로 켜진 동작을 끄는 boolean은 HTML에도 `no` 접두로 있다(`noValidate`, `noModule`). 그 관례를 따른다.
- 이름이 끄는 대상(누름 축소)을 그대로 말한다. 자동 완성에서 `no`를 치면 끄는 prop이 모여 보인다(④).
- 움직임 줄이기 설정에서는 이 prop과 관계없이 줄어들지 않는다. prop은 앱이 반응 자체를 끄고 싶을 때만 쓴다.

## 검토한 대안

- **`static`(초안)**: 짧지만 무엇이 정적인지 이름에서 알 수 없다. CSS `position: static`, React의 정적 렌더링과도 겹친다. 또 strict mode에서 예약어라 Component 안에서 `{ static }`으로 구조 분해할 수 없어 매번 이름을 바꿔 받아야 한다.
- **`pressScale`(기본 `true`)**: 긍정형이지만 끌 때 `pressScale={false}`로 써야 한다. 티켓은 「boolean prop으로 끈다」를 요구했고, 기본이 `true`인 boolean은 JSX 축약(`<Button pressScale>`)이 아무 효과가 없어 헷갈린다.
- **`disablePressScale`**: 뜻은 같지만 `disabled`와 앞부분이 같아 자동 완성에서 비활성 prop과 섞인다.

## Consequences

- 0.x 공개 API 이름이라 바꾸면 breaking(minor)이다. IconButton(티켓 14)이 같은 이름을 쓴다.
- 앞으로 기본으로 켜진 장식 동작을 끄는 prop이 생기면 같은 `no` 접두 규칙을 쓴다.
