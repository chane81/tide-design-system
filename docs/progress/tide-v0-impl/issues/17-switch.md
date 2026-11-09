# 17: Switch

Status: ready-for-agent
Blocked by: 15 (Field와 Input·Textarea)

## What to build

앱 개발자가 켜고 끄는 설정을 `Switch`로 쓴다. 네이티브 요소라 form 제출이 그대로 되고, 스크린리더는 스위치로 읽는다.

## 수용 기준

- [ ] 네이티브 요소 기반이고 hook을 쓰지 않는다. 스위치 역할로 읽힌다.
- [ ] thumb는 `shadow-sm`을 쓴다. 상태 변화는 `transition-colors`(`fast`)다.
- [ ] Field와 함께 label·설명을 붙일 수 있다.
- [ ] 조작 영역이 24×24px 이상이다. 포커스 표시는 `focus-ring`이다.
- [ ] `browser`: 역할·이름·켜짐 상태, Space 토글, 제어/비제어, disabled, forced-colors에서 켜짐 상태가 구분되는지 단언한다.

### 공통 API 규칙

- [ ] `ref`는 일반 prop으로 받아 루트 DOM 요소에 연결한다(`forwardRef` 없음).
- [ ] props는 루트 DOM 요소의 props를 확장하고 겹치는 HTML 속성은 `Omit`한다. `XxxProps` 타입을 루트에서 export한다.
- [ ] prop 이름은 DOM 이름을 쓰고, React Aria 이름(`isDisabled`, `onPress` 등)은 드러내지 않는다.
- [ ] 사용자 `className`은 `cn`의 마지막에 넣어 충돌 시 이긴다.
- [ ] 상태는 네이티브 pseudo-class가 있으면 그것을, 없으면 boolean `data-*` 속성으로 노출한다.
- [ ] `"use client"`는 hook·state·이벤트를 쓰는 파일에만 붙인다.
- [ ] Semantic Token만 쓰고, 지원하지 않는 `variant`·`size` 값은 타입 오류가 된다.
- [ ] 세부 props(값, 기본값, padding)는 공통 규칙 안에서 정하고 props 표로 확정한다.
- [ ] changeset을 포함한다.

### Component 완료 기준 (spec Testing Decisions)

- [ ] `*.test.tsx`에 동작 단언이 있다(`browser` project).
- [ ] 모든 예시가 story로 있고 a11y 검사를 통과한다(`storybook` project).
- [ ] 포커스 표시, forced-colors, reduced-motion 계산값을 단언한다(해당하는 경우).
- [ ] MDX 문서가 고정된 섹션 순서(설명 → 사용 시점/쓰지 않을 때 → 예시 → Do/Don't → 접근성 → props 표)를 따른다.
- [ ] 쓰는 Token이 대비 쌍에 등록되어 있다(`unit` project).
- [ ] smoke 앱에서 import해 빌드가 통과한다(`smoke`).

## Comments
