# @tide-tds/foundation

## 0.6.0

### 호환되지 않는 변경 (minor)

- [#17](https://github.com/chane81/tide-design-system/pull/17) [`5a628b0`](https://github.com/chane81/tide-design-system/commit/5a628b008205f3eeba345d8d005941ce4c4d9b90) [@chane81](https://github.com/chane81) - Primitive 색 스케일 값을 바꾸고 장식 계열 `purple`·`mint`를 더했습니다(ADR 0022). Token 이름은 그대로라 코드는 깨지지 않지만 화면 색이 달라집니다.

  - blue·green·amber·red·cyan의 50·100·200·300·950을 계열마다 파스텔 바탕·테두리·글자에 맞춰 다시 정했습니다. blue·green·red는 600~900의 채도도 낮췄습니다(red만 상한이 조금 높습니다). amber 400은 `#ca9734`가 되어 연한 단계(50~400)가 노랑 쪽으로 옮겨 갔습니다. 400·500과 gray, 앵커 `blue-500`(`#3183f5`)은 그대로입니다.
  - `purple`·`mint`는 Role이 없는 장식 계열입니다. 다른 계열처럼 `--tide-color-purple-*` Primitive, 계열 변수 묶음(`--tide-purple-solid` 등), `[data-color="purple"]` 규칙, Primitive Utility class(`bg-purple-500` 등)가 생기고 `ColorFamily`·`ColorFamilyName` 타입에 들어갑니다. `Role`에는 들어가지 않습니다. 의미 표시(성공, 경고 등)에는 Role을 씁니다.
  - 대비 쌍은 light·dark 모두 기존 기준(텍스트 4.5:1, UI 3:1)을 통과합니다. 가장 빠듯한 쌍은 `text-on-solid` × `bg-success-solid` 4.70:1입니다.

- [#20](https://github.com/chane81/tide-design-system/pull/20) [`edb3f2e`](https://github.com/chane81/tide-design-system/commit/edb3f2e94319c7c77f714e650ba7043263e521d2) [@chane81](https://github.com/chane81) - 슬롯 규칙을 넓히고 새 슬롯과 무채색 호버 Token을 더했습니다(ADR 0022). 기존 Token·Utility class 이름은 그대로라 코드는 깨지지 않지만 화면 색이 달라집니다.

  - 새 슬롯 `faint`(가장 옅은 바탕), `on-subtle`(subtle·faint 위 글자), `subtle-border`(파스텔 테두리)가 생겼습니다. accent Utility class `bg-accent-faint`, `text-accent-on-subtle`, `border-accent-subtle`과 Role Token `bg-<role>-faint`, `text-<role>-on-subtle`, `border-<role>-subtle`을 씁니다. neutral의 `on-subtle`은 `text-default`입니다.
  - 호버·클릭은 단계를 바꾸지 않고 덮습니다. light subtle은 100에 gray-950을 4%·8%, dark subtle은 950에 white를 6%·10%, solid는 600에 black을 14%·20% 덮은 값입니다. dark `faint`는 gray-950과 950을 반씩 섞은 값입니다. 모두 빌드할 때 hex로 계산해 CSS에 넣습니다.
  - `text`는 light 700, dark 300이 되었고 light `subtle`은 100이 되었습니다.
  - 색이 없는 바탕의 호버·클릭용 공통 Token `bg-hover`·`bg-active`를 더했습니다(light gray-950 4%·8%, dark white 6%·10%).
  - `defineColorFamily`의 덮어쓸 값에 덮기·섞기를 쓸 수 있고, `tide-color build`의 대비 검사가 새 쌍(on-subtle × faint·subtle 3단계, text × bg-hover·bg-active)으로 돕니다.
  - 대비 쌍은 light·dark 모두 기존 기준(텍스트 4.5:1, UI 3:1)을 통과합니다. 파스텔 테두리는 꾸밈이라 검사에서 뺐습니다.

## 0.5.1

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.5.0

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.4.0

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.3.2

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.3.1

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.3.0

### 기능 추가와 수정 (patch)

- [`1dd619e`](https://github.com/chane81/tide-design-system/commit/1dd619e4812766f3784cd033c9d00ca6f67109d0) [@chane81](https://github.com/chane81) - `Alert`를 추가했습니다. 화면 안에서 상태나 알릴 내용을 보여 주는 표면(radius `lg`, 역할 경계와 subtle 배경)이고 `"use client"`가 없어 서버 컴포넌트에서 바로 씁니다. `color`는 Role만 받습니다(앱이 더한 Role 포함, 기본 `info`). `info`·`success`·`warning`·`danger`는 모양이 다른 상태 아이콘(장식용)을 쓰고, `neutral`·`primary`·앱 Role은 `info`와 같은 아이콘입니다. `title`(제목), `children`(본문), `role`(`"alert"`·`"status"`, 기본은 역할 없는 정적 표시), `onClose`(주면 닫기 IconButton이 생기는 제어형 콜백), `closeLabel`(기본 `"닫기"`)을 받습니다. foundation 대비 쌍에 역할 경계 × 같은 역할 subtle(3:1)과 포커스 표시 × 역할 subtle(3:1)을 더했습니다. 기존 Token 값은 바뀌지 않습니다.

## 0.2.1

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.2.0

### 호환되지 않는 변경 (minor)

- [`0bed231`](https://github.com/chane81/tide-design-system/commit/0bed23130717e2d45da4f6ec76e0e1cdb37ad987) [@chane81](https://github.com/chane81) - 색 이름(Color)과 앱 브랜드 색 계열을 더했습니다. 기존 Role class(`bg-primary-solid` 등)와 `--tide-*` 변수는 이름과 값이 그대로입니다.

  - `@tide-tds/foundation`: `data-color`로 Role 6개와 색 계열 6개(`blue`, `gray`, `green`, `amber`, `red`, `cyan`) 중 하나를 고르고, accent class(`bg-accent-solid`, `bg-accent-subtle`, `text-accent`, `text-accent-on-solid`, `border-accent` 등)로 칠합니다. 색 계열마다 Theme별 변수 묶음(`--tide-blue-solid` 등)과 accent 변수(`--tide-accent-*`)가 생겼습니다.
  - `@tide-tds/foundation/color-family`: `defineColorFamily`로 앱 브랜드 계열을 정의하고 `tide-color build brand.ts > brand.css`로 CSS를 만듭니다. light·dark 대비를 검사해 기준에 못 미치면 exit 1로 실패합니다.

- [`3c1e391`](https://github.com/chane81/tide-design-system/commit/3c1e3912a7bc2f6682b1ad8fbf75d67894426df6) [@chane81](https://github.com/chane81) - Role과 색 계열 이름을 따로 등록합니다. Button·IconButton·Link의 `color`는 Role만 받습니다.

  - `@tide-tds/foundation`: `RoleRegistry`와 `ColorFamilyRegistry` interface, `ColorFamilyName`, `TideRole` 타입을 냅니다. `Role`은 `keyof RoleRegistry`이고, `Color`는 `Role | ColorFamilyName`입니다. 앱이 이름을 더하지 않으면 `Role`은 지금과 같은 6개입니다.
  - `@tide-tds/components`: 위 타입을 다시 냅니다. 앱은 `declare module "@tide-tds/components" { interface RoleRegistry { brand: true } }`로 Role을 더하고 `<Button color="brand">`로 씁니다. 색은 `tide-color build`로 만든 CSS를 씁니다. `blue`, `gray` 같은 색 계열 이름은 Badge·Tag 같은 장식 Component용입니다.

## 0.1.0

### 호환되지 않는 변경 (minor)

- [`81183fd`](https://github.com/chane81/tide-design-system/commit/81183fdd015ecf3c197ebe410fb9a4d9dc8a801b) [@chane81](https://github.com/chane81) - Tide 첫 공개 릴리스입니다. `@tide-tds/components` 하나를 설치하면 Foundation과 아이콘이 함께 설치됩니다. 설치 방법은 문서 사이트의 「시작하기」를 따릅니다.

  - `@tide-tds/foundation`: 컬러(Role 6개, light/dark Theme, 대비 검사), 타이포그래피, radius·그림자·포커스 표시, 움직임·쌓임 단계 Token과 Tailwind CSS 연동, tailwind-merge 설정을 제공합니다.
  - `@tide-tds/icons`: Lucide 기반 아이콘 2,029개를 Tide 이름(`PlusIcon` 등)으로 제공합니다. 쓰지 않는 아이콘은 번들에 들어가지 않습니다.
  - `@tide-tds/components`: `VisuallyHidden`, `Typography`, `Spinner`를 제공합니다. 모두 서버 컴포넌트로 쓸 수 있습니다.

### 기능 추가와 수정 (patch)

- [`3c5ad7f`](https://github.com/chane81/tide-design-system/commit/3c5ad7f5a14ae2b4a432ce5bd34c783eb799e168) [@chane81](https://github.com/chane81) - duration 2단계(`duration-fast` 150ms, `duration-normal` 300ms), easing `ease-out`, 쌓임 단계 5개(`z-sticky` 100, `z-modal` 200, `z-popover` 300, `z-toast` 400, `z-tooltip` 500)를 더했다. 시간을 적지 않은 `transition-colors` 등도 Tide 기본값(`fast`, `out`)을 따른다.

  - 공개 계약 CSS 변수: `--tide-duration-fast`, `--tide-duration-normal`, `--tide-ease-out`, `--tide-z-<단계>`
  - Tailwind 기본 transition 값(`--default-transition-duration` 150ms, `--default-transition-timing-function` `cubic-bezier(0.4, 0, 0.2, 1)`)을 `--tide-duration-fast`, `--tide-ease-out`으로 바꿨다. 시간을 적지 않은 transition의 곡선이 `ease-out`으로 바뀐다.
  - `ease-in`, `ease-in-out`, 숫자 class(`duration-150`, `z-10`)는 Tailwind 기본값대로 남는다.
  - 단계가 100 간격이라 앱 단계를 사이에 끼울 수 있다(예: `z-[250]`).
  - tailwind-merge 설정에 duration·쌓임 단계 이름을 등록해서 `className`의 `duration-normal`, `z-modal`이 Tide class를 이긴다.
  - Token 객체 `duration`, `easing`, `zIndex`를 루트에서 export한다.

- [`c3badd4`](https://github.com/chane81/tide-design-system/commit/c3badd47219db4e6a6263be2e6fa2c03669fdaa7) [@chane81](https://github.com/chane81) - radius 5단계(`rounded-sm`/`md`/`lg`/`xl`/`full`), 그림자 3단계(`shadow-sm`/`md`/`lg`), 포커스 표시 utility `focus-ring`과 `focus-field`를 더했다. 직접 만든 요소에는 `focus-visible:focus-ring`, `focus:focus-field`로 쓴다.

  - 공개 계약 CSS 변수: `--tide-rounded-<단계>`, `--tide-shadow-<단계>`, `--tide-focus-ring-width`, `--tide-focus-ring-offset`
  - 그림자는 Theme에 따라 `--tide-shadow-color`만 바뀐다. dark에서도 그린다.
  - 오류 입력창(`aria-invalid="true"`)에서도 포커스 중에는 `focus-field`가 이긴다.
  - Tailwind 기본 radius(`rounded`, `rounded-xs`, `rounded-2xl`~`4xl`)와 그림자(`shadow`, `shadow-2xs`, `shadow-xs`, `shadow-xl`, `shadow-2xl`, `inset-shadow-*`, `drop-shadow-*`, `text-shadow-*`)를 지웠다.
  - tailwind-merge 설정에 radius·그림자 이름을 등록해서 `className`의 `rounded-lg`, `shadow-lg`가 Tide class를 이긴다.
  - Token 객체 `radius`, `shadow`, `focusRing`을 루트에서 export한다.
  - Semantic Token `border-raised`(light 투명, dark gray-800)를 더했다. raised 표면은 `border border-raised`로 Theme 분기 없이 경계를 둔다.
