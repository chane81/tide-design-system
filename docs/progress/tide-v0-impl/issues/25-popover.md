# 25: Popover

Status: ready-for-agent
Blocked by: 19 (Badge·Card·Separator), 20 (Alert), 21 (Avatar), 22 (Skeleton과 Progress), 23 (Table), 24 (Breadcrumb과 Pagination)

> 단계 경계: 3단계(19~24)가 끝난 뒤 사람이 Version PR을 머지해 0.3.0을 낸 다음에 시작한다(별도 티켓 없음).

## What to build

앱 개발자가 `Popover`로 트리거 옆에 내용을 띄운다. 이 티켓은 4단계 모든 오버레이(Tooltip, Menu, Select, Combobox, Dialog, Toast)가 재사용할 기반(portal, 쌓임 단계, 등장·퇴장 motion, 위치)을 만든다. 키보드 사용자는 Esc로 닫고 포커스가 트리거로 돌아온다.

## 수용 기준

- [ ] React Aria hooks로 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [ ] top-layer(`<dialog>`, popover API)는 쓰지 않는다. React Aria portal과 `z-popover`로 쌓는다. Component 내부 겹침은 루트 `isolate`와 `z-0`/`z-1`로만 처리한다.
- [ ] raised 표면, `shadow-md`, radius `lg`, light 투명 border.
- [ ] 등장: opacity + blur 4px + translate 4px, `normal`. 퇴장: 같은 조합 절반 세기, `fast`. CSS transition, `@starting-style`, `allow-discrete`로 구현하고 `transition-all`은 쓰지 않는다. 지원하지 않는 브라우저에서는 바로 나타나고 사라진다.
- [ ] reduced-motion에서는 이동·blur를 opacity 전환으로 바꾼다.
- [ ] 이후 오버레이가 재사용할 수 있게 오버레이 공통 부분(portal, 쌓임, motion)을 나눈다.
- [ ] `open`/`defaultOpen`/`onOpenChange(open)`, `data-open` 노출.

### 구현 중 확인할 것

- [ ] React Aria hooks와 함께 사라질 때 애니메이션을 쓸 수 있는지 확인한다. 어렵다면 바로 사라지게 둬도 완료로 보고, 결과를 Comments에 남긴다.
- [ ] `useOverlayPosition`이 트리거를 덮지 않는 위치를 보장하는지(WCAG 2.4.11) 확인하고 결과를 Comments에 남긴다.

### 테스트

- [ ] `browser`: 열고 닫기(클릭, Esc, 바깥 클릭), 포커스 이동과 트리거로 복귀, 제어/비제어, 트리거를 덮지 않는 위치, forced-colors 경계, reduced-motion opacity 전환을 단언한다.

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
