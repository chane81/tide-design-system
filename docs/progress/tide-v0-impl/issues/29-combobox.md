# 29: Combobox

Status: ready-for-agent
Blocked by: 28 (Select)

## What to build

앱 개발자가 `Combobox`에 옵션 목록을 주면 입력값으로 클라이언트에서 필터링되고 하나를 고른다. 비동기, 다중 선택, 가상화, 자유 입력은 v0에 없다.

## 수용 기준

- [ ] React Aria hooks로 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [ ] `useComboBox`로 만든다. Select의 트리거·목록 규칙을 재사용한다.
- [ ] 입력값으로 옵션을 클라이언트 필터링한다. 단일 선택만 한다.
- [ ] `value`/`defaultValue`/`onValueChange(value)`. Field와 연결된다.
- [ ] 결과가 없을 때의 표시를 정한다.
- [ ] `browser`: 입력 필터링, 화살표 이동과 선택, Esc 닫기, 결과 개수나 상태 안내, Field 연결을 단언한다.

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
