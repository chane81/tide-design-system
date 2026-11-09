# pnpm workspace 모노레포 + Tailwind 기반 스타일링

근거 원칙: ④ 발견할 수 있음이 외워야 함보다 우선한다

Tide는 pnpm workspace 모노레포로 구성한다. Token 패키지(프레임워크 무관), React Component 패키지, Storybook 문서 앱으로 나눈다. 스타일링은 Tailwind로 한다. 사용자가 React에서 `className="w-24"`, `bg-primary`처럼 Tide Token에 연결된 Utility class를 직접 쓰고, 에디터 자동완성으로 찾을 수 있게 하는 것이 목표다. 처음에는 단일 패키지로 정했다가 모노레포로 바꿨다. ADR 0001에서 정한 "Token은 React에 의존하지 않는다"는 제약을 패키지 경계로 강제하기 위해서다. 스타일링 방식으로는 CSS Modules와 vanilla-extract도 검토했다.

## Consequences

- Tide Component를 쓰는 앱도 Tailwind를 peer 의존성으로 설치해야 한다. 앱은 Tide의 theme CSS를 import한다.
- Tailwind 기본 컬러 팔레트는 제거하고 Tide 컬러로 교체한다. 간격은 Tailwind 숫자 규칙(`w-24` 형태)을 그대로 쓴다.
- 패키지 이름, npm scope, Tailwind 버전과 theme 노출 방식은 리서치로 확인한 뒤 확정한다. → 패키지 이름은 [ADR 0006](0006-foundation-and-target-packages.md)에서 `@tide-tds/foundation`과 `@tide-tds/desktop`으로 정했다(2026-11-09).
