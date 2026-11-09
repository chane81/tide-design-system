# 패키지는 Foundation과 Target(desktop)으로 나눈다

근거 원칙: ② 명확함이 화려함보다 우선한다

배포 패키지는 두 개다.

- **`@tide-tds/foundation`**: 프레임워크와 무관한 Foundation 코드다. Token 원본(TS 객체), 생성 스크립트, `tokens.css`(`--tide-*`), `tailwind.css`(Tailwind 연동), tailwind-merge 설정을 담는다.
- **`@tide-tds/desktop`**: desktop Target용 React Component 패키지다.

패키지 이름은 무엇을 담았는지(Layer)와 어디에 최적화되었는지(Target, GLOSSARY 참고)를 드러내도록 정했다. 프레임워크 이름은 쓰지 않았다. 나중에 터치 중심의 모바일 웹 Component를 만들면 `@tide-tds/mobile`로 추가한다. 두 Target은 같은 foundation을 공유하고, size 축(desktop은 높이 24~48px)과 Component 구성만 다르다.

상세(exports, 빌드, 의존성)는 [모노레포 패키지 구조와 빌드 결정](../progress/tide-v0/issues/16-grilling-monorepo-structure.md)에 있다.

## 검토한 대안

- **`@tide-tds/tokens`**: 업계에서 흔히 쓰는 이름이다. 하지만 "token"은 인증 token이나 LLM token과 헷갈린다. 또 이 패키지에는 Token이 아닌 base CSS도 들어간다.
- **`@tide-tds/design-tokens`**: 뜻은 분명하지만, Token이 아닌 내용물과 이름이 어긋난다.
- **`@tide-tds/css`**: 짧다. 하지만 이 패키지는 JS도 export하므로 이름이 내용을 다 설명하지 못한다.
- **`@tide-tds/theme`**: GLOSSARY에서 Theme은 light/dark 묶음을 뜻하므로 충돌한다.
- **`@tide-tds/react`**: 대부분의 디자인 시스템이 쓰는 이름이다. 하지만 다른 Target을 추가하면 `react-mobile`처럼 축이 섞인다. v0는 React 전용이므로(ADR 0001) 프레임워크 이름이 구분해 주는 것도 없다.
- **`@tide-tds/react-native`를 염두에 둔 플랫폼 기준 이름**: 모바일을 React Native로 만든다면 이쪽이 맞다. 하지만 지금 생각하는 모바일은 같은 React + DOM + Tailwind로 만드는 웹이다.

## Consequences

- `desktop`이라는 이름 때문에 "데스크톱 앱(Electron) 전용"이나 "모바일 브라우저에서는 동작하지 않음"으로 오해할 수 있다. 문서에 "데스크톱 밀도의 웹 React Component이고, 모바일 브라우저에서도 동작한다"고 적는다.
- 나중에 React 외 프레임워크(Vue 등)를 지원한다면 `<target>-<framework>`처럼 이름 규칙을 새로 정해야 한다. 지금은 Out of scope다(ADR 0001).
- npm에 배포한 이름은 바꾸기 어렵다. 이름을 바꾸려면 새 패키지를 내고 이전 패키지는 deprecate해야 한다.
- foundation 패키지는 React에 의존하지 않는다(ADR 0001). 이것을 패키지 경계로 강제한다(ADR 0002).
