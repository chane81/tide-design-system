# 03: Storybook과 브라우저 테스트 골격

Status: ready-for-agent
Blocked by: 02 (Token에서 Next 앱까지 관통)

## What to build

문서 앱과 브라우저 테스트가 VisuallyHidden 하나로 끝까지 돈다. 앱 개발자는 Storybook에서 VisuallyHidden 페이지를 읽고 툴바로 light/dark를 바꿀 수 있다. 기여 에이전트는 이후 Component마다 `browser`(동작·forced-colors·reduced-motion)와 `storybook`(렌더·a11y) 검사를 같은 틀로 붙일 수 있다.

## 수용 기준

### 문서 앱

- [ ] Storybook 10.6.6이고 `reactDocgen`은 `react-docgen`으로 고정한다.
- [ ] Tailwind는 `@tailwindcss/vite`로 연결한다. desktop은 원본 조건(`@tide-tds/source`)으로, foundation은 빌드 결과로 resolve한다. desktop 원본을 고치면 HMR로 반영된다.
- [ ] Vite 8에서 resolve 조건을 지정하는 옵션 이름을 문서로 확인하고 근거 버전을 남긴다.
- [ ] Theme 툴바: addon-themes로 `data-theme`를 바꾸고 기본은 light다. globals 채널 구독으로 글(MDX) 페이지에도 Theme을 적용한다. 전환 순간에는 transition을 끈다.
- [ ] VisuallyHidden의 CSF story와 MDX 페이지가 있다. MDX에는 글과 Canvas만 둔다.

### 테스트 project

- [ ] `browser` project: Vitest Browser Mode + Playwright Chromium. 두 번째 instance는 `forcedColors: 'active'`, `reducedMotion: 'reduce'`다.
- [ ] `storybook` project: addon-vitest + Chromium으로 모든 story를 렌더한다. a11y는 `test: 'error'`, `runOnly`는 `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`다. 의도적으로 잘못된 Don't story만 a11y를 끄는 방법을 정해 둔다.
- [ ] 동작 단언은 `*.test.tsx`에만 둔다. story `play` 함수, jsdom, happy-dom은 쓰지 않는다.
- [ ] CI에서 두 project가 Chromium만으로 돈다.

### VisuallyHidden

- [ ] 화면에는 보이지 않지만 접근성 트리에서 이름으로 읽힘을 `browser`에서 단언한다.

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
