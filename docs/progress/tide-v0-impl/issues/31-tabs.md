# 31: Tabs

Status: ready-for-agent
Blocked by: 19 (Badge·Card·Separator), 20 (Alert), 21 (Avatar), 22 (Skeleton과 Progress), 23 (Table), 24 (Breadcrumb과 Pagination)

> 단계 경계: 3단계(19~24)가 끝난 뒤 사람이 Version PR을 머지해 0.3.0을 낸 다음에 시작한다(별도 티켓 없음).

## What to build

앱 개발자가 `Tabs`로 같은 영역의 여러 패널을 바꾼다. 키보드 사용자는 화살표로 탭을 옮기고 ring 포커스를 본다.

## 수용 기준

- [ ] React Aria hooks로 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [ ] 화살표·Home/End로 탭을 이동하고 탭과 패널이 연결된다.
- [ ] 포커스 표시는 `focus-ring`이다. 선택 상태는 `data-selected`로 노출하고 색만이 아닌 표시로도 구분된다.
- [ ] `value`/`defaultValue`/`onValueChange(value)`.
- [ ] 부분 Component를 평평한 이름으로 export한다.
- [ ] `browser`: tablist/tab/tabpanel 역할, 키보드 탐색, 제어/비제어, ring 계산값, forced-colors에서 선택 탭 구분을 단언한다.

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
