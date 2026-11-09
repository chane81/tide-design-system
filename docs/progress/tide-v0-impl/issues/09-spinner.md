# 09: Spinner

Status: ready-for-agent
Blocked by: 07 (motion·z-index Foundation)

## What to build

앱 개발자가 로딩 표시를 `Spinner`로 넣는다. 스크린리더 사용자는 접근 가능한 이름으로 로딩 중임을 듣는다. 움직임 줄이기를 켠 사용자에게도 회전은 유지된다(로딩 여부 자체가 정보이기 때문). 1단계의 마지막 Component다.

## 수용 기준

- [ ] 접근 가능한 이름이 기본으로 붙고 바꿀 수 있다.
- [ ] keyframe 회전을 쓴다(keyframe은 Spinner·Skeleton에만 허용). reduced-motion에서도 회전을 유지한다.
- [ ] `browser`: 역할과 이름을 단언하고, reduced-motion instance에서 애니메이션이 유지되는지 계산값으로 단언한다.
- [ ] Button 로딩 상태에서 쓸 수 있도록 크기를 size 체계에 맞춘다.

### 공통 API 규칙

- [ ] `ref`는 일반 prop으로 받아 루트 DOM 요소에 연결한다(`forwardRef` 없음).
- [ ] props는 루트 DOM 요소의 props를 확장하고 겹치는 HTML 속성은 `Omit`한다. `XxxProps` 타입을 루트에서 export한다.
- [ ] prop 이름은 DOM 이름을 쓰고, React Aria 이름(`isDisabled`, `onPress` 등)은 드러내지 않는다.
- [ ] 사용자 `className`은 `cn`의 마지막에 넣어 충돌 시 이긴다.
- [ ] 상태는 네이티브 pseudo-class가 있으면 그것을, 없으면 boolean `data-*` 속성으로 노출한다.
- [ ] `"use client"`는 hook·state·이벤트를 쓰는 파일에만 붙인다.
- [ ] Semantic Token만 쓰고, 지원하지 않는 `variant`·`size` 값은 타입 오류가 된다.
- [ ] 세부 props(값, 기본값, padding)는 공통 규칙 안에서 정하고 props 표로 확정한다.

### Component 완료 기준 (spec Testing Decisions)

- [ ] `*.test.tsx`에 동작 단언이 있다(`browser` project).
- [ ] 모든 예시가 story로 있고 a11y 검사를 통과한다(`storybook` project).
- [ ] 포커스 표시, forced-colors, reduced-motion 계산값을 단언한다(해당하는 경우).
- [ ] MDX 문서가 고정된 섹션 순서(설명 → 사용 시점/쓰지 않을 때 → 예시 → Do/Don't → 접근성 → props 표)를 따른다.
- [ ] 쓰는 Token이 대비 쌍에 등록되어 있다(`unit` project).
- [ ] smoke 앱에서 import해 빌드가 통과한다(`smoke`).

## Comments
