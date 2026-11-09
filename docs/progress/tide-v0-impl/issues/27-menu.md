# 27: Menu

Status: ready-for-agent
Blocked by: 25 (Popover)

## What to build

앱 개발자가 `Menu`로 동작 목록을 띄운다. 키보드 사용자는 화살표로 이동하고 Enter로 실행하며, 현재 위치는 배경 강조(highlight)로 보인다. 이 티켓의 목록 규칙을 Select와 Combobox가 재사용한다.

## 수용 기준

- [ ] React Aria hooks로 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [ ] Popover 기반을 재사용한다. 자주 쓰는 오버레이이므로 바로 나타나고 사라질 때만 opacity `fast`.
- [ ] 목록: raised 표면, `shadow-md`, radius `lg`, padding 3px. 항목 radius `sm`(중첩 규칙).
- [ ] 항목의 hover와 키보드 위치 표시는 highlight(primary subtle 배경 + primary text, 투명 outline)이고 transition 없이 즉시 바뀐다.
- [ ] raised 위 항목 규칙: 기본 투명, hover `subtle-hover`, 선택 유지 `subtle-active`.
- [ ] 이후 Select·Combobox가 재사용할 수 있게 목록·항목 부분을 나눈다.
- [ ] `browser`: 메뉴 역할, 화살표·Home/End 탐색, Enter 실행, Esc 닫기와 포커스 복귀, highlight 계산값, forced-colors에서 highlight 위치가 보이는지 단언한다.

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
