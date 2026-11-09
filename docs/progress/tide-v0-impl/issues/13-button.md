# 13: Button

Status: ready-for-agent
Blocked by: 07 (motion·z-index Foundation), 08 (아이콘 패키지), 09 (Spinner), 12 (0.1.0 첫 publish)

## What to build

앱 개발자가 `Button`을 채움 방식(`variant`) × Role(`color`) × `size`로 고르고, Next `Link`로 렌더해야 하면 `render={<Link href="/x" />}`로 바꾼다. 누르면 살짝 줄어들고(끌 수 있음), 로딩 중에는 Spinner가 보인다. 2단계의 첫 Component이고 이후 버튼류의 기준이 된다.

## 수용 기준

- [ ] `variant`는 채움 방식 `solid`/`subtle`/`outline`/`ghost`이고 union 이름은 채움 방식을 드러낸다(예: `FillVariant`). 공통 union 타입은 한 곳에서 정의하고 `Extract`로 고른다.
- [ ] `color`는 Role 6개, `size`는 `xs`/`sm`/`md`/`lg`이고 높이 24/32/40/48px, 텍스트 스타일은 size 표를 따른다. radius는 모든 size에서 `md`다.
- [ ] variant 정의는 타입이 붙은 객체 맵과 `cn`으로 직접 쓰고(cva·tailwind-variants 없음), 모든 조합을 채웠는지 타입 검사가 확인한다.
- [ ] 텍스트 옆 아이콘 크기는 아이콘 크기 규칙 표를 따르고 내부 아이콘은 장식용이다. 아이콘 자리에 다른 라이브러리의 `ReactNode`도 들어간다.
- [ ] `render`: 요소를 넘기면 props, ref, className을 병합한다. `asChild`, `as`, 함수 형태는 없다.
- [ ] press 축소: 활성 상태에서 누르면 0.96으로 줄어든다(`motion-safe:`일 때만). boolean prop으로 끈다. prop 이름(초안 `static`)을 공통 규칙에 맞춰 확정하고 결정을 Comments에 남긴다(되돌리기 어려우면 ADR).
- [ ] 로딩 상태: Spinner를 보여 주고 접근 가능한 상태를 전달한다. 개별 동작은 이 티켓에서 정한다.
- [ ] disabled: 네이티브 `disabled`를 쓴다. `render`로 `disabled`를 지원하지 않는 요소가 되면 `aria-disabled="true"`, `data-disabled`, 이벤트 차단. `cursor-not-allowed`를 공통 적용한다.
- [ ] 포커스 표시는 `focus-ring`이다. 혼자 있는 조작 요소이므로 `transition-colors` `fast`다.
- [ ] `browser`: 역할·이름, 키보드 실행, `render` 병합(Next `Link`), disabled 처리, press 축소의 reduced-motion 계산값, 포커스 ring을 단언한다.

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
