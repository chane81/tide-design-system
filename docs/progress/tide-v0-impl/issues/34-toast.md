# 34: Toast

Status: ready-for-agent
Blocked by: 25 (Popover), 26 (Tooltip), 27 (Menu), 28 (Select), 29 (Combobox), 30 (Dialog와 AlertDialog), 31 (Tabs), 32 (Accordion), 33 (Tag)

> 단계 경계: 4단계(25~33)가 끝난 뒤 사람이 Version PR을 머지해 0.4.0을 낸 다음에 시작한다(별도 티켓 없음).

## What to build

앱 개발자가 `Toast`로 알림을 띄운다. 영역(region), 큐, 자동 닫힘, 포커스 이동이 처리된다. 사용자는 자동으로 닫히는 Toast를 5초 이상 보고, hover나 focus 중에는 멈춘다. 액션이나 오류가 담긴 Toast는 자동으로 닫히지 않는다. 마지막 Component다.

## 수용 기준

- [ ] `useToast`로 만든다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [ ] 기본 위치는 아래 오른쪽이고 폭을 제한한다. `z-toast`로 쌓는다.
- [ ] 자동 닫힘은 5초 이상이고 hover·focus 중에는 멈춘다. 액션이나 오류가 있으면 자동으로 닫지 않는다(WCAG 2.2.1, 2.2.2).
- [ ] Alert 스타일과 IconButton(닫기)을 재사용한다. raised 표면, `shadow-md`, radius `lg`.
- [ ] 등장·퇴장 motion은 Popover와 같다(opacity + blur + translate). reduced-motion에서는 opacity만.
- [ ] `browser`: region 랜드마크, 알림 읽기, 큐, 자동 닫힘 시간과 hover/focus 정지, 액션·오류 Toast 유지, 닫기와 포커스 이동, reduced-motion 계산값을 단언한다.

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
