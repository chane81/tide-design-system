# Component 공통 API 규칙 결정

Type: grilling
Status: resolved
Blocked by: 06, 03, 13

## Question

모든 Component가 따를 규칙을 결정한다. 대상은 size와 variant 이름, `className` 병합과 충돌 처리, ref 전달, polymorphic/`asChild` 패턴, controlled/uncontrolled 규칙, variant 정의 도구(cva 등) 사용 여부다.

### 참고 (다른 티켓에서 넘어온 것)

- 「컬러 Foundation 결정」: dark에서 raised(gray-900) 위의 neutral subtle은 기본 상태가 배경과 같은 색이다. 메뉴 항목처럼 raised 위에 놓이는 요소의 기본 상태와 hover 규칙을 여기서 정한다.
- 「Token 네이밍과 Utility class 노출 규칙 결정」: tailwind-merge 설정(색이 아닌 커스텀 이름)은 Token TS 원본에서 생성한다. 이 티켓에서는 Component가 그 설정을 어떻게 쓰는지(`cn()` 헬퍼 등)를 정한다. 강도 이름 `solid`/`subtle`은 Token에서 쓰는 이름이므로 Component `variant` 값과 맞출지도 여기서 정한다.
- 「타이포그래피 Foundation 결정」: Component 내부 텍스트는 텍스트 스타일 class(`text-label-md` 등)만 쓴다. Component `size`(sm/md/lg)와 `label-sm/md/lg`를 어떻게 짝지을지 여기서 정한다. 버튼과 입력창의 높이와 세로 정렬은 Pretendard 메트릭(hhea 1.19em) 기준으로 검증한다.
- 「v0 Foundation 범위 결정」: radius(`sm`/`md`/`lg`/`xl`/`full`)와 shadow 이름을 교체하므로 `extendTailwindMerge`에 등록해야 한다. 이 설정도 Token TS 원본에서 생성한다.
- 「접근성 동작 구현 방식 결정」: 접근성 동작은 React Aria hooks(`react-aria`, `react-stately`)로 가져오고 구조는 직접 만든다(ADR 0004). hook이 받는 이름(`isDisabled`, `onPress`, `selectedKey`)을 공개 API에 드러내지 않고 변환하는 규칙을 여기서 정한다. 조합 패턴(`asChild`/`render`/`as`)도 라이브러리 관례에 묶이지 않으므로 Tide가 직접 고른다.

## Answer

모든 Component가 따를 공통 API 규칙은 다음과 같다. variant 정의 도구와 조합 패턴의 근거와 대안은 [ADR 0005](../../../decisions/0005-hand-written-variant-maps-and-render-prop.md)에 있다. Component마다 어떤 값을 고를지, 기본값, padding, 로딩 같은 개별 상태는 spec 단계에서 정한다. 아래에 적은 라이브러리 버전은 2026-11-09에 npm과 context7로 확인했다.

### 1. React 버전과 ref

- React는 **19 이상**만 지원한다(peer `^19`). Next.js 16 App Router도 React 19를 쓴다.
- `forwardRef`는 쓰지 않는다. 모든 Component가 `ref`를 일반 prop으로 받아 **루트 DOM 요소**에 연결한다. 나머지 props도 루트에 펼친다.

### 2. 스타일 축: `variant` × `color` × `size`

- **`variant`**(채움 방식): `solid | subtle | outline | ghost`. `solid`와 `subtle`은 Token의 강도와 이름이 같다. `outline`과 `ghost`는 Component에만 있는 값이고 전용 bg Token이 없다. 용어는 GLOSSARY의 "Variant"에 적었다.
- **`color`**(Role): `neutral | primary | success | warning | danger | info`. `role`은 ARIA 속성과 이름이 겹쳐서 쓰지 않는다. `tone`과 `intent`는 GLOSSARY에서 쓰지 않기로 한 이름이다. HTML의 옛 `color` 속성 타입은 `Omit`으로 지운다.
- **`size`**: `xs | sm | md | lg`의 **4단계**다. 실무에서 sm만으로는 부족한 자리(촘촘한 표, 툴바, 필터 칩 등)가 있어서 xs를 둔다(사용자 경험에 근거한 결정).
- 세 축의 공통 union 타입(`Variant`, `Color`, `Size`)은 한 곳에서 정의한다. 각 Component는 필요한 값만 `Extract`로 고른다. 예를 들어 Button은 size 4단계를 모두 쓰고, Input은 `sm | md | lg`만 쓸 수 있다. 원칙 ③("variant와 size는 꼭 필요한 것만")을 타입으로 강제하는 방식이다.

### 3. size와 높이, 텍스트 스타일의 짝

| size | 높이          | 텍스트 스타일      |
| ---- | ------------- | ------------------ |
| `xs` | 24px (`h-6`)  | `label-sm` (12/16) |
| `sm` | 32px (`h-8`)  | `label-sm` (12/16) |
| `md` | 40px (`h-10`) | `label-md` (14/20) |
| `lg` | 48px (`h-12`) | `label-lg` (16/20) |

- 텍스트 스타일 label은 3단계 그대로 둔다. `label-xs`를 새로 만들지 않는다. xs와 sm은 높이와 padding만 다르다. 한글은 11px에서 가독성이 크게 떨어지고, 「타이포그래피 Foundation 결정」을 고치지 않아도 된다.
- **24px가 높이의 하한**이다. 이는 WCAG 2.2 2.5.8 Target Size(Minimum), 곧 24×24 CSS px 기준에 맞춘 값이다. xs `IconButton`도 24×24보다 작게 만들 수 없다.
- 한 줄에 나란히 놓이는 컨트롤(Button, Input, Select 등)은 같은 size면 높이가 같다.
- 세로 정렬은 고정 높이와 `items-center`로 한다. Pretendard 메트릭(hhea 1.19em) 기준의 시각 검증은 spec 단계에서 Storybook으로 한다.

### 4. `className` 병합

- `cn()`은 `clsx`와 `extendTailwindMerge`(Token TS 원본에서 생성한 설정)를 합친 것이다. 생성한 설정에는 radius, shadow, 텍스트 스타일 같은 커스텀 이름이 들어간다.
- 사용자의 `className`은 **항상 마지막**에 넣는다. 그래서 충돌하면 사용자 쪽이 이긴다.
- 앱도 같은 병합 규칙을 쓸 수 있도록 `cn`을 공개 export한다. 어느 패키지에서 export할지는 「모노레포 패키지 구조와 빌드 결정」에서 정한다.
- 참고 버전: `tailwind-merge` 3.7.0, `clsx` 2.1.1.

### 5. variant 정의 도구: 직접 작성

- cva와 tailwind-variants는 쓰지 않는다. 타입이 붙은 객체 맵(예: `Record<Variant, Record<Color, string>>`)과 `cn`으로 정의한다.
- 이렇게 정한 이유는 다음과 같다.
  - `class-variance-authority`는 0.7.1(2024-11) 이후 릴리스가 멈췄다. 후속인 `cva` 1.0은 아직 `1.0.0-beta.12`다.
  - `tailwind-variants` 4.0.1은 v3.3부터 tailwind-merge 대신 자체 병합 엔진을 기본 빌드에 넣었다. 기존 twMerge 설정은 "대체로 호환"된다고만 적혀 있다(공식 문서, context7). 쓰면 병합기가 두 개가 되고, ADR 0003이 생성하는 tailwind-merge 설정과 어긋날 위험이 있다.
  - 객체 맵은 의존성이 없다. 모든 조합(variant 4 × color 6)을 빠짐없이 채웠는지 타입 검사가 확인한다.

### 6. 조합 패턴: `render` prop

- 루트가 상호작용 요소 하나인 Component(Button, Link 등)만 `render` prop을 받는다. 예: `render={<Link href="/x" />}`.
- 요소를 넘기면 Tide가 props, ref, className을 그 요소에 병합한다.
- `asChild`(자식 요소 복제), `as`(polymorphic)는 쓰지 않는다. 함수 형태의 `render`는 v0에 넣지 않는다.

### 7. prop 이름 변환과 제어 상태

- 공개 API는 **HTML/React DOM 이름**을 쓴다.
  - boolean은 `disabled`, `readOnly`, `required`, `invalid`처럼 `is` 접두를 붙이지 않는다.
  - 이벤트는 `onClick`, `onChange`처럼 DOM 이름을 쓴다.
- React Aria 이름(`isDisabled`, `onPress`, `selectedKey`)은 공개 API에 드러내지 않고 내부에서 변환한다.
- 제어/비제어 상태는 다음 세 쌍으로 쓴다.
  - 값: `value` / `defaultValue` / `onValueChange(value)`
  - 열림: `open` / `defaultOpen` / `onOpenChange(open)`
  - 선택: `selectedKey`류도 `value`로 통일한다
- 콜백은 항상 **값 하나만** 인자로 받는다.

### 8. raised 위 항목의 상태 규칙

- raised 위에 놓이는 항목(메뉴 항목 등)은 두 Theme 모두 `ghost` 규칙을 따른다. 기본은 투명, hover는 `subtle-hover`, active는 `subtle-active`다.
- 선택된 항목처럼 계속 유지되는 상태는 `subtle-active`로 표시한다.
- 이 규칙으로 dark Theme에서 raised(gray-900)와 neutral subtle 기본값의 색이 같아지는 문제를 피한다(「컬러 Foundation 결정」에서 넘어온 문제).

### 9. 상태를 스타일에 노출하는 방식

- 네이티브 pseudo-class가 있는 상태는 그것을 쓴다: `hover:`, `focus-visible:`, `disabled:`.
- 네이티브로 표현할 수 없는 상태만 `data-*` 속성으로 노출한다: `data-selected`, `data-open`, `data-invalid`, `data-pressed`, `data-disabled`. 값 없이 존재 여부로 판단하는 boolean 속성이다.
- 사용자도 `className`에 `data-[selected]:…`처럼 이 속성을 쓸 수 있다.

### 10. 여러 부분으로 된 Component

- export는 `DialogTrigger`처럼 평평하게 한다. `Dialog.Trigger` 같은 namespace는 쓰지 않는다.
- 부분마다 자기 `className`을 받는다. `classNames` 객체 prop은 두지 않는다.
- 서버 컴포넌트에서 client 모듈의 namespace 속성에 접근할 때의 동작은 **확인하지 못했다**. 평평한 export를 쓰면 이 문제를 피하고 tree-shaking에도 유리하다.

### 11. 아이콘만 있는 버튼

- `size="icon"`처럼 size 값으로 처리하지 않는다. 별도 `IconButton`으로 만들고 `aria-label`을 **타입상 필수**로 둔다(원칙 ① > ③).

### 12. disabled

- 네이티브 `disabled`를 지원하는 요소(button, input 등)에는 그 속성을 그대로 쓴다.
- 지원하지 않는 요소(`render`로 바꾼 `<a>`, 메뉴 항목 등)에는 `aria-disabled="true"`와 `data-disabled`를 붙이고 이벤트를 막는다.
- `cursor-not-allowed`는 공통으로 적용한다.

### 13. props 타입과 `"use client"`

- 각 Component는 `XxxProps`를 export한다. 타입은 루트 요소의 props(예: `ComponentPropsWithRef<'button'>`)를 확장하고, 이름이 겹치는 것(`color` 등)은 `Omit`한다.
- `"use client"`는 hook, state, 이벤트 처리를 쓰는 Component 파일에만 붙인다. 표시만 하는 Component(Badge 등)는 서버 컴포넌트로 남긴다.

### 다른 티켓에 주는 영향

- 「v0 Component 목록과 우선순위 결정」: 목록에 `IconButton`을 넣는다면 `aria-label`을 필수로 둔다. size 4단계(xs~lg) 중 어떤 Component가 어느 단계를 쓰는지는 spec 단계에서 정한다.
- 「모노레포 패키지 구조와 빌드 결정」: `cn`과 공통 union 타입(`Variant`, `Color`, `Size`)을 어느 패키지에서 export할지 정한다. React peer 범위는 `^19`이다. 필요한 Component 파일에만 `"use client"`를 보존한다.
- 「radius·elevation·focus ring 형태 결정」: Component 높이는 24/32/40/48px이다. radius 단계를 size와 짝지을지 볼 때 이 값을 참고한다.

### 정정 (2026-11-09, 「v0 Component 목록과 우선순위 결정」)

- **Variant의 뜻을 넓힌다.** 이제 `variant`는 "Component마다 정의되는 주된 스타일 축"이다. 위 2절의 `solid | subtle | outline | ghost`는 그중 Button류 Component가 쓰는 **채움 방식** 값 집합이다. Typography의 `variant`는 텍스트 스타일 이름을 값으로 받는다. 그래서 공통 union 타입 `Variant`는 채움 방식을 드러내는 이름으로 바꾼다(예: `FillVariant`, 확정은 spec 단계에서). GLOSSARY를 함께 고쳤다.
- **`render` 범위를 넓힌다.** 6절의 "루트가 상호작용 요소 하나인 Component"를 "루트가 DOM 요소 하나인 Component"로 바꾼다. Typography가 `<p>`, `<span>`, `<label>` 등으로 렌더할 수 있어야 하기 때문이다. ADR 0005도 정정했다.

## Comments

- 2026-11-09 grilling 진행. Q1~Q16의 추천안을 대부분 그대로 채택했다. 사용자가 size를 4단계로 늘려 sm보다 작은 xs를 추가했다. 이유는 "실무에서 sm만으로는 커버가 되지 않는다"였다. 이어서 다음 두 가지를 확인했다.
  - 공통 Size 타입은 4단계로 두되, Component마다 3단계만 쓸 수도 있다.
  - xs의 텍스트 스타일은 `label-sm`을 함께 쓴다((a)안).
