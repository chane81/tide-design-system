# 09: Spinner

Status: done
Blocked by: 07 (motion·z-index Foundation)

## What to build

앱 개발자가 로딩 표시를 `Spinner`로 넣는다. 스크린리더 사용자는 접근 가능한 이름으로 로딩 중임을 듣는다. 움직임 줄이기를 켠 사용자에게도 회전은 유지된다(로딩 여부 자체가 정보이기 때문). 1단계의 마지막 Component다.

## 수용 기준

- [x] 접근 가능한 이름이 기본으로 붙고 바꿀 수 있다.
- [x] keyframe 회전을 쓴다(keyframe은 Spinner·Skeleton에만 허용). reduced-motion에서도 회전을 유지한다.
- [x] `browser`: 역할과 이름을 단언하고, reduced-motion instance에서 애니메이션이 유지되는지 계산값으로 단언한다.
- [x] Button 로딩 상태에서 쓸 수 있도록 크기를 size 체계에 맞춘다.

### 공통 API 규칙

- [x] `ref`는 일반 prop으로 받아 루트 DOM 요소에 연결한다(`forwardRef` 없음).
- [x] props는 루트 DOM 요소의 props를 확장하고 겹치는 HTML 속성은 `Omit`한다. `XxxProps` 타입을 루트에서 export한다.
- [x] prop 이름은 DOM 이름을 쓰고, React Aria 이름(`isDisabled`, `onPress` 등)은 드러내지 않는다.
- [x] 사용자 `className`은 `cn`의 마지막에 넣어 충돌 시 이긴다.
- [x] 상태는 네이티브 pseudo-class가 있으면 그것을, 없으면 boolean `data-*` 속성으로 노출한다.
- [x] `"use client"`는 hook·state·이벤트를 쓰는 파일에만 붙인다.
- [x] Semantic Token만 쓰고, 지원하지 않는 `variant`·`size` 값은 타입 오류가 된다.
- [x] 세부 props(값, 기본값, padding)는 공통 규칙 안에서 정하고 props 표로 확정한다.

### Component 완료 기준 (spec Testing Decisions)

- [x] `*.test.tsx`에 동작 단언이 있다(`browser` project).
- [x] 모든 예시가 story로 있고 a11y 검사를 통과한다(`storybook` project).
- [x] 포커스 표시, forced-colors, reduced-motion 계산값을 단언한다(해당하는 경우).
- [x] MDX 문서가 고정된 섹션 순서(설명 → 사용 시점/쓰지 않을 때 → 예시 → Do/Don't → 접근성 → props 표)를 따른다.
- [x] 쓰는 Token이 대비 쌍에 등록되어 있다(`unit` project).
- [x] smoke 앱에서 import해 빌드가 통과한다(`smoke`).

## Comments

- 2026-11-10 완료(브랜치 `ticket/09-spinner`).
  - **근거 버전**: react 19.3.1(@types/react 19.3.0), tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, storybook 10.6.6. 새 의존성은 없다. `pnpm-lock.yaml`·`pnpm-workspace.yaml`·`package.json`은 바꾸지 않았다.
  - **API 확인**: `animate-spin`과 `--animate-spin: spin 1s linear infinite`, `@keyframes spin { to { transform: rotate(360deg) } }`은 context7 `/tailwindlabs/tailwindcss.com`(animation.mdx, theme.mdx. 문서 사이트는 버전이 없어 v4 최신 문서)과 설치본 4.3.5 `theme.css` 438~447행으로 확인했다. Tide `tailwind.css`는 `--animate-*`를 지우지 않으므로 기본값이 그대로 쓰인다. 문서 예시는 `motion-safe:animate-spin`을 권하지만 Tide는 티켓 21 결정(Spinner 회전 유지)대로 감싸지 않는다. ref를 일반 prop으로 받는 것은 context7 `/reactjs/react.dev`(forwardRef.md, useRef.md). SVGAttributes에 `size`가 없음은 설치본 @types/react 19.3.0 `index.d.ts`로 확인해 `Omit`은 `children`만 한다.
  - **Spinner**(`packages/desktop/src/Spinner.tsx`): 루트는 `svg` 하나, `role="status"`, `aria-label` 기본 「로딩 중」(DOM 이름 그대로라 `aria-label`/`aria-labelledby`로 바꾼다), `focusable="false"`. 모양은 직접 그린 3/4 원호(`M12 3a9 9 0 1 1-9 9`, viewBox 24) 하나이고 stroke `currentColor` 2px(`vector-effect: non-scaling-stroke`, label 옆 아이콘 규칙). class는 `shrink-0 animate-spin` + size 맵(`xs`·`sm` `size-3.5`, `md` `size-4`, `lg` `size-5`: spec 아이콘 크기 규칙의 「텍스트 옆 아이콘」 열이라 Button 로딩 상태의 아이콘 자리에 그대로 들어간다) + 사용자 `className`(마지막). `"use client"` 없음(빌드 결과 `dist/Spinner.js`에도 없다). 상태가 없어 `data-*`도 없다.
  - **공통 union 타입**: `packages/desktop/src/types.ts`에 `Size`(`xs`/`sm`/`md`/`lg`)를 두고 루트에서 `export type`한다. Spinner는 `Extract<Size, …>`로 4개 모두 고른다. Button(티켓 13)이 같은 파일에 `FillVariant` 등을 더한다.
  - **테스트**: desktop `browser` 15개 × instance 2(`src/Spinner.test.tsx`): 역할·기본 이름, `aria-label`·`aria-labelledby`로 이름 바꾸기, 버튼 안에서 이름이 버튼 이름에 들어감(「저장 중 저장」)·포커스 안 받음, size 4개의 px 크기와 기본 md, 선 두께 2px, `@ts-expect-error`로 `size="xl"`·`children` 타입 오류, 회전 계산값(`animation-name: spin`, 1s, linear, infinite, running, `getAnimations()` running, 100ms 뒤 transform 변화)을 reduced-motion instance에서도 같게 단언(두 instance 분기 확인 포함), stroke가 `currentColor`(부모 `text-primary`)를 따르고 forced-colors에서도 투명이 아님, ref·props·className 병합(`size-8`이 `size-4`를 이김). smoke: 서버 컴포넌트 page에서 Spinner를 import하고 출력 CSS에 `.animate-spin`·`@keyframes spin`이 있는지(앱 코드에는 그 class를 쓰지 않는다).
  - **대조 실험**: class를 잠시 `motion-safe:animate-spin`으로 바꾸면 reduced-motion instance에서 회전 테스트가 `expected 'none' to be 'spin'`으로 실패했다. 되돌렸다.
  - **해당 없음**: 포커스 표시(포커스를 받지 않는다), 대비 쌍 등록(색 Token을 쓰지 않고 `currentColor`다. Typography와 같이 글자색 Token의 대비 쌍이 보장한다). forced-colors는 원호가 보이는지만 단언했다.
  - **문서**: `Component/Spinner`(`apps/docs/src/components/Spinner.mdx`, `Spinner.stories.tsx`). 설명 → 사용 시점/쓰지 않을 때 → 예시 → Do/Don't → 접근성 → props 순서, 예시 8개가 모두 story이고 storybook project가 렌더·axe를 통과했다(docs 48 → 56 tests). 접근성 절에 새로 넣은 `status` 영역을 바로 읽는지는 스크린 리더마다 다르므로 결과 알림은 처음부터 있던 알림 영역에 넣으라는 안내를 뒀다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/*/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force`(15개 태스크) 통과. foundation 364 tests, icons 18 tests, desktop 126 tests(96 → 126), docs 56 tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(새 changeset 1개, `@tide-tds/desktop` patch).
  - **판단 보류(추천안대로 구현)**:
    1. 역할 `status` + `aria-label`: spec은 「접근 가능한 이름」만 정했다. `progressbar`(값 없는 진행)는 Progress(티켓 22)와 겹치고 버튼 이름 계산에서 range 위젯이 브라우저마다 다르게 다뤄져 고르지 않았다. `img`는 알림 영역이 아니다. 버튼 안에 넣으면 `status` 의미는 사라지고 이름만 버튼 이름에 들어간다. Button 로딩 상태(티켓 13)에서 Spinner를 `aria-hidden`으로 숨길지 이름을 쓸지는 그 티켓에서 정한다.
    2. 기본 이름 「로딩 중」과 이름 prop을 `label`이 아닌 `aria-label`로 둔 것(DOM 이름 규칙).
    3. 공통 union 이름 `Size`와 위치 `types.ts`: spec은 「한 곳에서 정의」만 정했다.
    4. 회전 속도는 Tailwind 기본 `animate-spin`(1s linear)을 그대로 쓴다. Tide motion Token(`fast`/`normal`)은 transition용이라 쓰지 않았다. 트랙(옅은 원)은 두지 않았다.
