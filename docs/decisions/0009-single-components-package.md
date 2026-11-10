# Component는 `@tide-tds/components` 한 패키지로 두고 Target으로 나누지 않는다

근거 원칙: ② 명확함이 화려함보다 우선한다, ③ 단순함이 유연함보다 우선한다

[ADR 0006](0006-foundation-and-target-packages.md)의 Target 패키지 결정을 대체한다(2026-11-10 사용자 결정). Foundation 패키지(`@tide-tds/foundation`)에 대한 결정은 그대로다.

React Component는 **`@tide-tds/components`** 하나에 담는다. desktop·mobile 같은 사용 환경(ADR 0006의 Target)별로 패키지를 나누지 않는다. 터치 환경을 위한 크기나 밀도가 필요해지면 같은 패키지 안의 size·밀도 옵션으로 더한다. `@tide-tds/mobile` 이름 공간도 두지 않는다.

배포 패키지는 그대로 세 개다: `@tide-tds/foundation`, `@tide-tds/icons`, `@tide-tds/components`. 패키지 이름은 ADR 0006과 같은 방식으로, 무엇을 담았는지(Layer)를 드러낸다. foundation은 Foundation을, components는 Component를, icons는 아이콘을 담는다. 프레임워크 이름은 쓰지 않는다.

npm에 아직 배포하지 않았으므로(`@tide-tds/desktop`은 registry에 없다) 첫 publish(티켓 12) 전에 바꾼다. 이전 이름을 deprecate할 필요가 없다.

## 이유

- **이름이 오해를 부르지 않는다.** `desktop`은 "데스크톱 앱(Electron) 전용"이나 "모바일 브라우저에서는 동작하지 않음"으로 읽힌다. ADR 0006은 이것을 문서의 설명으로 막으려 했다. `components`는 그런 설명이 필요 없다.
- **Component 두 벌을 만들 계획이 없다.** ADR 0006에서도 두 Target은 같은 foundation을 쓰고 size 축과 Component 구성만 달랐다. 크기와 밀도의 차이는 Component 하나의 옵션으로 표현할 수 있다. 패키지를 나누면 같은 Component의 API·테스트·문서를 두 번 관리해야 한다.
- **앱 하나가 두 환경을 함께 쓴다.** 반응형 웹 앱은 한 화면 안에서 포인터와 터치를 모두 받는다. 패키지가 나뉘면 앱이 둘을 함께 설치하거나 화면마다 다른 import를 골라야 한다.

## 검토한 대안

- **`@tide-tds/desktop` 유지(ADR 0006)**: 이름 오해를 문서로 막아야 하고, mobile을 더할 때 Component가 두 벌이 된다.
- **`@tide-tds/react`**: 대부분의 디자인 시스템이 쓰는 이름이다. 하지만 지금 패키지 이름은 무엇을 담았는지(Layer)로 짓는다. react는 무엇으로 만들었는지(프레임워크)를 가리키므로 foundation·icons와 이름 짓는 방식이 섞인다. v0는 React 전용이라(ADR 0001) 프레임워크 이름이 구분해 주는 것도 없다.
- **`@tide-tds/ui`**: 짧지만, icons도 UI라서 무엇을 담았는지가 덜 분명하다.

## Consequences

- 패키지 폴더는 `packages/components`, import는 `@tide-tds/components`, CSS는 `@tide-tds/components/styles.css`다.
- size·밀도 옵션을 더할 때는 [Component 공통 API 규칙](../progress/tide-v0/issues/14-grilling-component-api.md)의 `size` 축(xs/sm/md/lg, 높이 24~48px)과 함께 다시 정한다. 지금은 Out of scope다.
- GLOSSARY의 Target 항목을 지운다. Component 묶음을 사용 환경으로 나누는 개념이 더는 없기 때문이다.
- [ADR 0007](0007-lucide-generated-icons-package.md)과 [ADR 0008](0008-fixed-versions-and-oidc-direct-publish.md) 본문의 `@tide-tds/desktop`(또는 desktop)은 `@tide-tds/components`로 읽는다. 두 ADR의 결정은 바뀌지 않는다.
- 나중에 React 외 프레임워크(Vue 등)를 지원하면 이름 규칙을 다시 정해야 한다. ADR 0006의 이 과제는 그대로 남는다(ADR 0001).
