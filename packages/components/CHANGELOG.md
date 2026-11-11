# @tide-tds/components

## 0.2.1

### 기능 추가와 수정 (patch)

- [`e563d96`](https://github.com/chane81/tide-design-system/commit/e563d964dff69893b34ab4a4dd377e6a7d37abe8) [@chane81](https://github.com/chane81) - `Badge`, `Card`, `Separator`를 추가했습니다. 셋 다 `"use client"`가 없어 서버 컴포넌트에서 바로 씁니다. `Badge`는 상호작용 없는 상태·분류 라벨(`span`)로, 뜻은 `children` 텍스트로 전하고 `color`는 색 이름(`Color`: 상태는 Role, 분류는 색 계열 이름, 앱이 더한 Role·장식 계열 포함, 기본 `neutral`), `variant`(`subtle`/`solid`), `size`(`sm` 20px/`md` 24px)를 받습니다. `Card`는 그림자 없이 경계만 있는 surface 표면(radius `lg`, 여백 16px)이고 `render`로 `article`·`section`·`li` 등으로 바꿉니다. `Separator`는 네이티브 `<hr>`로, 기본은 separator 역할이고 `orientation="vertical"`이면 `aria-orientation`, `decorative`면 `role="none"`이 붙습니다. 고대비 모드에서는 Badge·Card 경계와 Separator 선이 시스템 글자색으로 그려집니다.
- 의존성 업데이트 []:
  - @tide-tds/foundation@0.2.1
  - @tide-tds/icons@0.2.1

## 0.2.0

### 호환되지 않는 변경 (minor)

- [`0bed231`](https://github.com/chane81/tide-design-system/commit/0bed23130717e2d45da4f6ec76e0e1cdb37ad987) [@chane81](https://github.com/chane81) - 색 이름(Color)과 앱 브랜드 색 계열을 더했습니다. 기존 Role class(`bg-primary-solid` 등)와 `--tide-*` 변수는 이름과 값이 그대로입니다.

  - `@tide-tds/foundation`: `data-color`로 Role 6개와 색 계열 6개(`blue`, `gray`, `green`, `amber`, `red`, `cyan`) 중 하나를 고르고, accent class(`bg-accent-solid`, `bg-accent-subtle`, `text-accent`, `text-accent-on-solid`, `border-accent` 등)로 칠합니다. 색 계열마다 Theme별 변수 묶음(`--tide-blue-solid` 등)과 accent 변수(`--tide-accent-*`)가 생겼습니다.
  - `@tide-tds/foundation/color-family`: `defineColorFamily`로 앱 브랜드 계열을 정의하고 `tide-color build brand.ts > brand.css`로 CSS를 만듭니다. light·dark 대비를 검사해 기준에 못 미치면 exit 1로 실패합니다.

- [`3c1e391`](https://github.com/chane81/tide-design-system/commit/3c1e3912a7bc2f6682b1ad8fbf75d67894426df6) [@chane81](https://github.com/chane81) - Role과 색 계열 이름을 따로 등록합니다. Button·IconButton·Link의 `color`는 Role만 받습니다.

  - `@tide-tds/foundation`: `RoleRegistry`와 `ColorFamilyRegistry` interface, `ColorFamilyName`, `TideRole` 타입을 냅니다. `Role`은 `keyof RoleRegistry`이고, `Color`는 `Role | ColorFamilyName`입니다. 앱이 이름을 더하지 않으면 `Role`은 지금과 같은 6개입니다.
  - `@tide-tds/components`: 위 타입을 다시 냅니다. 앱은 `declare module "@tide-tds/components" { interface RoleRegistry { brand: true } }`로 Role을 더하고 `<Button color="brand">`로 씁니다. 색은 `tide-color build`로 만든 CSS를 씁니다. `blue`, `gray` 같은 색 계열 이름은 Badge·Tag 같은 장식 Component용입니다.

### 기능 추가와 수정 (patch)

- [`ae9a67f`](https://github.com/chane81/tide-design-system/commit/ae9a67fb424c12b51520e89dd70b164ffe08890d) [@chane81](https://github.com/chane81) - `Button`을 추가했습니다. `variant`(채움 방식 `solid`/`subtle`/`outline`/`ghost`) × `color`(Role: Tide Role 6개와 앱이 더한 Role) × `size`(`xs`~`lg`)로 모양을 고르고, `startIcon`·`endIcon`, `loading`, `disabled`, `render`(예: `render={<Link href="/x" />}`)를 받습니다. 루트에 `data-color`가 붙고(기본 `primary`) 바깥 색을 물려받지 않습니다. 누르면 살짝 줄어들고 `noPressScale`로 끕니다. 공통 union 타입 `FillVariant`와 `Role`도 루트에서 export합니다.

- [`5df88cd`](https://github.com/chane81/tide-design-system/commit/5df88cde3952ad539db5656b4f49d032c90a054d) [@chane81](https://github.com/chane81) - `Checkbox`, `Radio`, `CheckboxGroup`, `RadioGroup`을 추가했습니다. 네이티브 체크박스·라디오라 Space 토글, 화살표 이동, form 제출이 그대로 됩니다. `size`(`sm`/`md`, 누르는 영역은 24×24px), `color`(Role, 루트 `data-color`, 기본 `primary`), `invalid`, `disabled`를 받고, Checkbox는 `indeterminate`를 받습니다. RadioGroup은 `name`과 `value`/`defaultValue`/`onValueChange`로 선택을 정합니다. `ref`와 HTML 속성은 input에, `className`·`style`은 루트 label에 붙습니다. `Field`에 `group`을 더했습니다. 묶음을 감싸면 label이 묶음 이름, 설명·오류가 묶음 설명이 되고, 오류 상태는 각 항목의 `aria-invalid="true"`로 붙습니다.

- [`31cb71a`](https://github.com/chane81/tide-design-system/commit/31cb71a6c35714a9666f35ad0f88ce6c1bdbabef) [@chane81](https://github.com/chane81) - `Field`, `Input`, `Textarea`를 추가했습니다. `Field`에 `label`, `description`, `error`를 주면 안의 입력창에 `id`, `aria-describedby`, `aria-invalid`, `required`, `disabled`가 자동으로 연결됩니다. 오류 상태는 `aria-invalid="true"`와 `data-invalid`로 나타나고, 포커스 중에는 포커스 표시(`focus-field`)가 오류 색을 이깁니다. `Input`·`Textarea`는 네이티브 요소이고 `size`(`sm`/`md`/`lg`, 같은 size의 Button과 높이가 같음), `invalid`를 받습니다. `Field`는 서버 컴포넌트로 쓸 수 있습니다.

- [`ed2d2c9`](https://github.com/chane81/tide-design-system/commit/ed2d2c95ebfdd7a0ae2f3a6d74d401bf571db0ab) [@chane81](https://github.com/chane81) - `IconButton`과 `Link`를 추가했습니다.

  - `IconButton`: 아이콘만 있는 버튼입니다. `aria-label`과 아이콘(`children`)이 필수입니다. Button과 같은 `variant`·`color`·`size`(`xs`~`lg`, 24/32/40/48px 정사각형, 아이콘 16/16/20/24px), `loading`, `disabled`, `noPressScale`, `render`를 받습니다.
  - `Link`: 문장 안 텍스트 링크입니다. `color`(Role, 기본 `primary`)로 글자색을 고르고, 밑줄이 항상 있습니다. `render={<NextLink href="/x" />}`로 Next.js `Link`를 씁니다. 서버 컴포넌트에서 쓸 수 있습니다.

- [`df80986`](https://github.com/chane81/tide-design-system/commit/df80986f32e99f0a8971e9bd27faf7af6757e016) [@chane81](https://github.com/chane81) - `Switch`를 추가했습니다. 네이티브 `<input type="checkbox" role="switch">`라 스크린리더가 「스위치」로 읽고, Space로 켜고 끄며, form 제출이 그대로 됩니다. `children`이 label이 되고, Field 안에 두면 Field의 label·설명·오류가 연결됩니다. `size`(`sm`/`md`/`lg`, track 28×16·36×20·44×24px), `color`(Role, 기본 `primary`, 루트에 `data-color`), `invalid`를 받습니다. `ref`와 HTML 속성은 input에, `className`·`style`은 바깥 `label`에 붙습니다. 고대비 모드에서는 켜진 track이 강조 시스템 색으로 채워지고, 움직임 줄이기에서는 thumb이 바로 자리를 바꿉니다.
- 의존성 업데이트 [[`0bed231`](https://github.com/chane81/tide-design-system/commit/0bed23130717e2d45da4f6ec76e0e1cdb37ad987), [`3c1e391`](https://github.com/chane81/tide-design-system/commit/3c1e3912a7bc2f6682b1ad8fbf75d67894426df6)]:
  - @tide-tds/foundation@0.2.0
  - @tide-tds/icons@0.2.0

## 0.1.0

### 호환되지 않는 변경 (minor)

- [`81183fd`](https://github.com/chane81/tide-design-system/commit/81183fdd015ecf3c197ebe410fb9a4d9dc8a801b) [@chane81](https://github.com/chane81) - Tide 첫 공개 릴리스입니다. `@tide-tds/components` 하나를 설치하면 Foundation과 아이콘이 함께 설치됩니다. 설치 방법은 문서 사이트의 「시작하기」를 따릅니다.

  - `@tide-tds/foundation`: 컬러(Role 6개, light/dark Theme, 대비 검사), 타이포그래피, radius·그림자·포커스 표시, 움직임·쌓임 단계 Token과 Tailwind CSS 연동, tailwind-merge 설정을 제공합니다.
  - `@tide-tds/icons`: Lucide 기반 아이콘 2,029개를 Tide 이름(`PlusIcon` 등)으로 제공합니다. 쓰지 않는 아이콘은 번들에 들어가지 않습니다.
  - `@tide-tds/components`: `VisuallyHidden`, `Typography`, `Spinner`를 제공합니다. 모두 서버 컴포넌트로 쓸 수 있습니다.

### 기능 추가와 수정 (patch)

- [`f95340c`](https://github.com/chane81/tide-design-system/commit/f95340c6103fba5cdd0f107ebace97603a7c7825) [@chane81](https://github.com/chane81) - 로딩 표시 Component `Spinner`를 더했다. 서버 컴포넌트로 쓸 수 있다.

  - 역할은 `status`이고 접근 가능한 이름 「로딩 중」이 기본으로 붙는다. `aria-label`(또는 `aria-labelledby`)로 바꾼다.
  - `size`는 `xs`·`sm` 14px, `md` 16px(기본값), `lg` 20px다. 같은 size Component의 텍스트 옆 아이콘 크기와 같다.
  - 회전은 `animate-spin`이고 움직임 줄이기에서도 멈추지 않는다. 색은 `currentColor`라 주변 글자색을 따른다.
  - 공통 size union 타입 `Size`(`xs`/`sm`/`md`/`lg`)를 루트에서 export한다.

- 의존성 업데이트 [[`81183fd`](https://github.com/chane81/tide-design-system/commit/81183fdd015ecf3c197ebe410fb9a4d9dc8a801b), [`3c5ad7f`](https://github.com/chane81/tide-design-system/commit/3c5ad7f5a14ae2b4a432ce5bd34c783eb799e168), [`c3badd4`](https://github.com/chane81/tide-design-system/commit/c3badd47219db4e6a6263be2e6fa2c03669fdaa7)]:
  - @tide-tds/foundation@0.1.0
  - @tide-tds/icons@0.1.0
