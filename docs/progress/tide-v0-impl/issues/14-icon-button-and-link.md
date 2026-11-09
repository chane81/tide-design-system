# 14: IconButton과 Link

Status: ready-for-agent
Blocked by: 13 (Button)

## What to build

앱 개발자가 아이콘만 있는 버튼을 `IconButton`으로 만들면 `aria-label`이 타입상 필수라 이름이 빠질 수 없다. 텍스트 링크는 `Link`로 쓰고 Next `Link`로 렌더할 수 있다.

## 수용 기준

### IconButton

- [ ] Button과 같은 채움 방식·Role·size 축을 쓰는 별도 Component다.
- [ ] `aria-label`은 타입상 필수다. 24×24 미만 size는 없다.
- [ ] 아이콘 크기는 크기 규칙 표의 IconButton 열(16/16/20/24px)을 따른다.
- [ ] press 축소와 끄는 prop은 Button에서 확정한 이름을 따른다.

### Link

- [ ] `render`로 Next `Link` 등으로 바꿀 수 있고 props, ref, className을 병합한다.
- [ ] 포커스 표시는 `focus-ring`이다. 링크 색 대비가 대비 쌍에 등록되어 있다.

### 테스트

- [ ] `browser`: IconButton의 이름, 크기 하한(24×24) 계산값, Link의 `render` 병합과 키보드 이동을 단언한다.
- [ ] `aria-label` 없는 IconButton이 타입 오류가 되는지 타입 테스트로 확인한다.

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
