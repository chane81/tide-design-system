# 05: 타이포그래피 Foundation과 Typography

Status: ready-for-agent
Blocked by: 04 (컬러 Foundation)

## What to build

앱 개발자가 `text-body-md` 같은 class 하나로 크기·행간·굵기를 한 번에 정하고, `Typography` Component로 알맞은 시맨틱 요소를 자동으로 얻는다. 한글 문단은 어절 단위로 줄바꿈되고, 브라우저 글자 크기를 키우면 함께 커진다. 자동완성에는 Tide 값만 나온다.

## 수용 기준

### Foundation

- [ ] font-family는 `sans`(Pretendard Variable 우선 스택)와 `mono`(시스템 스택) 두 개만 둔다. 웹폰트와 `@font-face`는 넣지 않는다.
- [ ] Primitive 크기(12/14/16/18/20/24/32/40/48/56px)는 rem으로 쓰고 class로 노출하지 않는다.
- [ ] 텍스트 스타일 14개를 `--text-<이름>`과 `--line-height`, `--font-weight` 하위 변수로 정의한다. 값은 spec 표를 따른다.
- [ ] 굵기는 300/400/500/600/700 5개만 둔다. 자간은 0이다.
- [ ] Tailwind 기본 `text-*` 크기, `font-weight`, `font-serif`를 지운다. `leading-*`, `tracking-*`, `tabular-nums`는 남는다.
- [ ] base CSS에 `word-break: keep-all`과 `overflow-wrap: break-word`를 넣는다. 루트 font-size는 바꾸지 않는다.
- [ ] tailwind-merge 설정이 텍스트 스타일 이름 충돌을 해결한다(`text-body-md`와 색 class가 서로 지우지 않음).

### Typography Component

- [ ] `variant`는 텍스트 스타일 이름이다. 기본 요소: `display-*`·`heading-xl` → `h1`, `heading-lg`/`md`/`sm`/`xs` → `h2`/`h3`/`h4`/`h5`, `body-*`·`caption` → `p`, `label-*` → `span`.
- [ ] heading·display는 `level`(1~6)을 선택적으로 받고 항상 `<h*>`로 렌더된다.
- [ ] `render`로 다른 요소를 넘기면 props, ref, className을 병합한다.

### 테스트

- [ ] `unit`: 컴파일한 CSS에 텍스트 스타일 14개와 굵기 5개가 있고, Tailwind 기본 크기·굵기·`font-serif`가 없다.
- [ ] `browser`: 기본 요소, `level`, `render` 병합을 역할과 요소로 단언한다.

### 문서

- [ ] 텍스트 스타일 블록: Token 원본에서 14개를 그린다.

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
