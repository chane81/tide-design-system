# @tide-tds/components

## 0.3.2

### 기능 추가와 수정 (patch)

- [`1a4ee7c`](https://github.com/chane81/tide-design-system/commit/1a4ee7cd932c535d01f5b999aab9176db199424a) [@chane81](https://github.com/chane81) - `Combobox`, `ComboboxItem`, `ComboboxSection`을 추가했습니다. 글자를 쳐서 옵션을 거르고 하나를 고르는 client Component이고 React Aria hooks(`useComboBox`, `useListBox`, `useOption`, `useListBoxSection`, `useFilter`)로 만들었습니다. `Combobox`는 `role="combobox"` 텍스트 `<input>`이고 Input·Select와 같은 `size`(`sm` 32px, `md` 40px, `lg` 48px)와 `focus-field` 포커스 표시, 입력 끝의 chevron 버튼(누르면 전체 목록, Tab 순서 밖)을 씁니다. 치면 목록이 열리고 친 글자가 들어 있는 옵션만 남습니다(대소문자·악센트 무시). ↓·↑로 열고 옮기며 Enter·누름·Tab으로 고르고, 포커스는 입력에 머뭅니다(가상 포커스). Esc는 닫고 입력을 고른 옵션 글자로 되돌리며, 고르지 않은 글자는 포커스가 떠나면 지워집니다. 거른 결과가 없으면 `emptyMessage`(기본 「결과가 없습니다」)가 보이고 결과 개수는 스크린리더에 알려집니다. 한글 IME 조합 중의 Enter·화살표는 목록 동작에 쓰지 않습니다. `value`(`string | null`)/`defaultValue`/`onValueChange(value)`(입력을 모두 지우면 `null`), `onOpenChange(open)`, `invalid`·`required`·`disabled`를 받고, `Field` 안에서는 label·설명·오류·`aria-invalid`가 자동으로 연결됩니다. `name`을 주면 숨은 input으로 고른 옵션의 `value`가 폼에 제출됩니다. 목록은 Select와 같은 표면·위치·motion으로 `document.body`에 portal되고 바깥을 막지 않습니다. 상태는 `data-open`·`data-invalid`·`data-placement`·`data-highlighted`·`data-selected`·`data-disabled`로 노출합니다.

- [`35d504f`](https://github.com/chane81/tide-design-system/commit/35d504fe1deceaa1deea86ded75b89d79ce8d489) [@chane81](https://github.com/chane81) - `Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`와 `AlertDialog`를 추가했습니다. 화면 가운데에 뜨는 모달 client Component이고 React Aria hooks(`useOverlayTrigger`, `useModalOverlay`, `useDialog`)로 만들었습니다. `DialogContent`는 `document.body`로 portal한 반투명 막(`bg-overlay`, `z-modal`) 안의 `role="dialog"` 요소이고 raised 표면·`shadow-lg`·radius `xl`·여백 24px, `size`(`sm` 24rem, `md` 32rem, `lg` 40rem)를 받습니다. 열면 포커스가 안으로 오고 Tab은 안에서 돌며, Esc·끝 위쪽 닫기 버튼(IconButton, 이름 「닫기」·`closeLabel`)·막 누름·`DialogClose`로 닫히면 포커스가 열기 전 요소로 돌아옵니다. 열린 동안 바깥은 `inert`이고 페이지 스크롤이 잠깁니다. `DialogTitle`·`DialogDescription`은 `aria-labelledby`·`aria-describedby`로 이어집니다. `AlertDialog`는 같은 부분 Component를 쓰는 얇은 변형으로, 내용이 `role="alertdialog"`가 되고 막 누름으로 닫히지 않으며 닫기 버튼이 없고 열리면 첫 버튼(취소)에 포커스가 옵니다. 등장은 opacity + scale 0.96 → 1(`normal`), 퇴장은 opacity + scale 0.98(`fast`)이고 움직임 줄이기에서는 opacity만 바뀝니다. Dialog 안에서 연 Select·Menu 목록과 Tooltip은 Dialog 위에 뜹니다. 상태는 `data-open`으로 노출합니다.

- [`e2d37d4`](https://github.com/chane81/tide-design-system/commit/e2d37d4d0a0736218addd826d10a4030abb6e1d0) [@chane81](https://github.com/chane81) - `Menu`, `MenuTrigger`, `MenuContent`, `MenuItem`, `MenuSection`을 추가했습니다. 트리거에 동작 목록을 띄우는 client Component이고 React Aria hooks(`useMenuTrigger`, `useMenu`, `useMenuItem`, `useMenuSection`)로 만들었습니다. `Menu`는 열림 상태(`open`/`defaultOpen`/`onOpenChange(open)`)만 갖고 DOM이 없습니다. `MenuTrigger`는 기본 `<button type="button">`이고 `render={<Button />}`·`render={<IconButton aria-label="…" />}`로 Tide 모양을 씁니다. `MenuContent`는 `role="menu"`로 `document.body`에 portal되어 `z-popover`로 쌓이고, raised 표면·`shadow-md`·radius `lg`에 여백 3px입니다. `placement`(12가지, 기본 `bottom start`)와 `offset`(기본 4px)을 받습니다. 화살표(끝에서 처음으로 돎)·Home/End·영문 글자로 항목을 옮기고 Enter·Space·누름으로 실행하며, 실행·Esc·바깥 누름·Tab으로 닫히면 포커스가 트리거로 돌아옵니다. `MenuItem`은 radius `sm` 항목이고 `onClick`(키보드 실행 포함), `disabled`, `textValue`를 받습니다. 키보드 위치와 hover는 highlight(primary subtle 배경, primary 글자, 고대비 모드에서는 시스템 색 outline)로 전환 없이 바로 바뀝니다. `MenuSection`은 `heading`(또는 `aria-label`)이 이름인 묶음이고 앞뒤에 구분선이 그려집니다. 바로 나타나고 사라질 때만 opacity가 150ms로 흐려집니다. 상태는 `data-open`·`data-placement`·`data-highlighted`·`data-disabled`로 노출합니다.

- [`ce65929`](https://github.com/chane81/tide-design-system/commit/ce659299c2b116544d61551cf5b3ced15999c524) [@chane81](https://github.com/chane81) - `Select`, `SelectItem`, `SelectSection`을 추가했습니다. 값 하나를 고르는 client Component이고 React Aria hooks(`useSelect`, `useListBox`, `useOption`, `useListBoxSection`, `HiddenSelect`)로 만들었습니다. `Select`는 입력창 모양의 트리거 `<button>`이고 Input과 같은 `size`(`sm` 32px, `md` 40px, `lg` 48px)와 `focus-field` 포커스 표시, 장식용 chevron을 씁니다. `value`(`string | null`)/`defaultValue`/`onValueChange(value)`, `open`/`defaultOpen`/`onOpenChange(open)`, `placeholder`(기본 「선택하세요」), `invalid`·`required`·`disabled`를 받고, `Field` 안에서는 label·설명·오류·`aria-invalid`가 자동으로 연결됩니다. `name`을 주면 숨은 `<select>`로 고른 값이 폼에 제출되고, `required`면 비어 있을 때 제출이 막히고 트리거로 포커스가 옵니다. 목록은 `role="listbox"`로 `document.body`에 portal되어 `z-popover`로 쌓이고(Dialog 위), Menu와 같은 raised 표면·여백 3px에 트리거보다 좁지 않습니다. 키보드는 Enter·Space·↓(고른 옵션)·↑(마지막 옵션)로 열고 화살표·Home/End·영문 글자로 옮기며 Enter·Space·누름으로 고릅니다. 닫힌 트리거에서 글자를 치면 바로 고릅니다. Esc·바깥 누름·Tab으로 닫히면 포커스가 트리거로 돌아옵니다. `SelectItem`은 `value`(필수)·`disabled`·`textValue`를 받고, 고른 옵션은 회색 배경과 체크 아이콘으로 보입니다. 상태는 `data-open`·`data-invalid`·`data-placement`·`data-highlighted`·`data-selected`·`data-disabled`로 노출합니다.

- [`2d1789d`](https://github.com/chane81/tide-design-system/commit/2d1789dac42e3e3ded07eeb915ac8300c3cf132a) [@chane81](https://github.com/chane81) - `Tooltip`, `TooltipTrigger`, `TooltipContent`를 추가했습니다. 트리거에 짧은 설명 한 줄을 붙이는 client Component이고 React Aria hooks(`useTooltipTrigger`, `useTooltip`, `useOverlayPosition`)로 만들었습니다. `Tooltip`은 열림 상태(`open`/`defaultOpen`/`onOpenChange(open)`)와 `delay`(기본 500ms), `closeDelay`(기본 300ms), `disabled`를 갖고 DOM이 없습니다. `TooltipTrigger`는 기본 `<button type="button">`이고 `render={<IconButton aria-label="…" />}`로 Tide 모양을 씁니다. 마우스를 올리면 `delay` 뒤에, 키보드 포커스면 바로 열리고, Esc·포커스 이탈·포인터 이탈·트리거 누름으로 닫힙니다. 열린 동안 트리거의 `aria-describedby`가 설명을 가리킵니다. `TooltipContent`는 `role="tooltip"`으로 `document.body`에 portal되어 `z-tooltip`으로 Dialog·Popover 위에 쌓이고, Popover와 같은 raised 표면·`shadow-md`에 여백 4px·8px, `text-body-sm`입니다. `placement`(12가지, 기본 `top`)와 `offset`(기본 4px)을 받습니다. 바로 나타나고 사라질 때만 opacity가 150ms로 흐려집니다. 상태는 `data-open`·`data-placement`로 노출합니다.
- 의존성 업데이트 []:
  - @tide-tds/foundation@0.3.2
  - @tide-tds/icons@0.3.2

## 0.3.1

### 기능 추가와 수정 (patch)

- [`db771a4`](https://github.com/chane81/tide-design-system/commit/db771a43d04f5abcf2ce0eaba1d07d0aecfeba79) [@chane81](https://github.com/chane81) - `Popover`, `PopoverTrigger`, `PopoverContent`를 추가했습니다. 트리거 옆에 짧은 내용을 띄우는 client Component이고 React Aria hooks(`useOverlayTrigger`, `usePopover`, `useDialog`)로 만들었습니다. `Popover`는 열림 상태(`open`/`defaultOpen`/`onOpenChange(open)`)만 갖고 DOM이 없습니다. `PopoverTrigger`는 기본 `<button type="button">`이고 `render={<Button />}`로 Tide Button 모양을 씁니다. `PopoverContent`는 `role="dialog"`로 `document.body`에 portal되어 `z-popover`로 쌓이고, raised 표면·`shadow-md`·radius `lg`·투명 경계(고대비 모드에서 보임)입니다. `placement`(12가지, 기본 `bottom`)와 `offset`(기본 8px)을 받고, 공간이 모자라면 뒤집거나 높이를 줄여 트리거를 덮지 않습니다. 열면 포커스가 내용으로 가고 Esc·바깥 누름·트리거 다시 누름으로 닫히며 포커스가 트리거로 돌아옵니다. 등장은 opacity + blur 4px + 4px 이동(300ms), 퇴장은 그 절반(150ms)이고 움직임 줄이기에서는 opacity만 바뀝니다. 상태는 `data-open`·`data-placement`로 노출합니다.
- 의존성 업데이트 []:
  - @tide-tds/foundation@0.3.1
  - @tide-tds/icons@0.3.1

## 0.3.0

### 호환되지 않는 변경 (minor)

- [`f6b1915`](https://github.com/chane81/tide-design-system/commit/f6b1915087cf93a854b63e8598370ff42d797af0) [@chane81](https://github.com/chane81) - 3단계 Component 묶음(0.3.0): Badge·Card·Separator, Alert, Avatar, Skeleton·Progress, Table, Breadcrumb·Pagination이 들어갑니다. 모두 `"use client"` 없이 서버 컴포넌트에서 렌더됩니다. 각 Component의 자세한 변경은 같은 릴리스의 다른 항목에 있습니다.

### 기능 추가와 수정 (patch)

- [`1dd619e`](https://github.com/chane81/tide-design-system/commit/1dd619e4812766f3784cd033c9d00ca6f67109d0) [@chane81](https://github.com/chane81) - `Alert`를 추가했습니다. 화면 안에서 상태나 알릴 내용을 보여 주는 표면(radius `lg`, 역할 경계와 subtle 배경)이고 `"use client"`가 없어 서버 컴포넌트에서 바로 씁니다. `color`는 Role만 받습니다(앱이 더한 Role 포함, 기본 `info`). `info`·`success`·`warning`·`danger`는 모양이 다른 상태 아이콘(장식용)을 쓰고, `neutral`·`primary`·앱 Role은 `info`와 같은 아이콘입니다. `title`(제목), `children`(본문), `role`(`"alert"`·`"status"`, 기본은 역할 없는 정적 표시), `onClose`(주면 닫기 IconButton이 생기는 제어형 콜백), `closeLabel`(기본 `"닫기"`)을 받습니다. foundation 대비 쌍에 역할 경계 × 같은 역할 subtle(3:1)과 포커스 표시 × 역할 subtle(3:1)을 더했습니다. 기존 Token 값은 바뀌지 않습니다.

- [`14230a6`](https://github.com/chane81/tide-design-system/commit/14230a62d00fe08e0c867856b4c5adb525915189) [@chane81](https://github.com/chane81) - `Avatar`를 추가했습니다. 사용자 이미지를 원(radius `full`) 안에 보여 주고, 이미지가 없거나 불러오지 못하면 사람 모양 fallback 아이콘이 보입니다. `"use client"`가 없어 서버 컴포넌트에서 바로 쓰고, 로드 실패 fallback도 JavaScript 없이 처리합니다(아이콘 위 층에 이미지를 CSS 배경으로 깔아, 실패하면 아무것도 그리지 않습니다). `alt`(필수, 주면 `role="img"`의 이름, `""`이면 장식용), `src`, `size`(`xs` 24px/`sm` 32px/`md` 40px/`lg` 48px, 기본 `md`), `color`(fallback 색, 색 계열 이름 `ColorFamilyName`만, 앱 장식 계열 포함, 기본 `gray`)를 받습니다. 눌러야 하면 Button이나 IconButton 안에 넣습니다.

- [`d57d6b0`](https://github.com/chane81/tide-design-system/commit/d57d6b0e3e1d3399f13be4db92a4362627a6d0c7) [@chane81](https://github.com/chane81) - `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbCurrent`와 `Pagination`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`를 추가했습니다. 둘 다 이름 있는 `<nav>` 탐색 영역(기본 「이동 경로」·「페이지 이동」)이고 `"use client"` 없이 서버 컴포넌트에서 바로 씁니다. Breadcrumb은 항목 앞에 읽히지 않는 구분자 아이콘을 붙이고, 현재 페이지(`BreadcrumbCurrent`)에 `aria-current="page"`를 붙입니다. Pagination 번호는 Button 모양의 링크(32px, `current`면 `aria-current="page"`)이고 이전/다음은 이름 있는 IconButton(화살표, `disabled` 지원)입니다. `BreadcrumbLink`·`PaginationLink`·이전/다음은 `render`로 Next `Link`를 받습니다. 색(`color`)·`variant`·`size` 축은 없습니다.

- [`f721899`](https://github.com/chane81/tide-design-system/commit/f721899f457d2166aeb7016f1e58473c2a222f84) [@chane81](https://github.com/chane81) - `Skeleton`과 `Progress`를 추가했습니다. 둘 다 `"use client"`가 없어 서버 컴포넌트에서 바로 씁니다. `Skeleton`은 내용이 오기 전 자리를 회색 모양으로 표시하고(`aria-hidden`이라 읽히지 않음), 깜빡임은 움직임 줄이기에서 멈춥니다. `variant`(`text` 기본, 높이 1em/`rect`, 높이는 `className`/`circle`), `size`(`circle`에만, Avatar와 같은 `xs` 24px~`lg` 48px, 기본 `md`)를 받습니다. `Progress`는 값을 아는 진행을 막대로 보여 주는 `role="progressbar"`이고 `aria-valuenow`·`aria-valuemin`·`aria-valuemax`를 노출합니다. `value`(필수, 0~`max`로 자름), `max`(기본 100), `size`(`sm` 4px/`md` 8px, 기본 `md`), `color`(Role만, 앱 Role 포함, 기본 `primary`)를 받고, `aria-label`이나 `aria-labelledby` 중 하나가 타입상 필수입니다. 값을 모르는 진행(indeterminate)은 두지 않으니 Spinner를 씁니다. 움직임 줄이기에서도 진행 표시는 그대로이고 너비 전환만 빠집니다.

- [`47ae615`](https://github.com/chane81/tide-design-system/commit/47ae615ed5b3023d2502867457ef3d2a95660312) [@chane81](https://github.com/chane81) - `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`을 추가했습니다. 시맨틱 `<table>`·`<thead>`·`<tbody>`·`<tr>`·`<th>`·`<td>`를 그대로 렌더하고 `"use client"`가 없어 서버 컴포넌트에서 바로 씁니다. 부분마다 자기 요소의 props와 `ref`, `className`(기본 class를 이김)을 받습니다. `TableHeaderCell`은 기본 `scope="col"`이고 행 머리에는 `scope="row"`를 줍니다. `TableBody` 바로 아래 행은 마우스를 올리면 transition 없이 배경이 바뀝니다(머리·바닥 행은 그대로). 숫자 열은 칸에 `className="tabular-nums text-end"`를 줍니다. 정렬·행 선택·가상화와 색(Role)·`variant`·`size` 축은 없습니다.
- 의존성 업데이트 [[`1dd619e`](https://github.com/chane81/tide-design-system/commit/1dd619e4812766f3784cd033c9d00ca6f67109d0)]:
  - @tide-tds/foundation@0.3.0
  - @tide-tds/icons@0.3.0

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
