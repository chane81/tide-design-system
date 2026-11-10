# 06: radius·Elevation·포커스 표시 Foundation

Status: done
Blocked by: 05 (타이포그래피 Foundation과 Typography)

## What to build

앱 개발자가 radius 5단계와 그림자 3단계를 class로 쓰고, 그림자는 Theme에 따라 저절로 색이 바뀐다. 직접 만든 요소에도 `focus-visible:focus-ring`, `focus:focus-field`로 Tide 포커스 표시를 붙일 수 있다. Windows 고대비 모드에서도 raised 표면의 경계와 포커스 표시가 남는다.

## 수용 기준

### radius

- [x] `sm` 4px, `md` 6px, `lg` 8px, `xl` 12px, `full`. 나머지 Tailwind 기본값은 지운다.

### Elevation

- [x] `shadow-sm`/`md`/`lg`. 단계마다 2레이어이고 두 레이어 모두 `--tide-shadow-color`를 `color-mix`로 낮춰 쓴다. 값은 spec 표를 따른다.
- [x] dark에서도 그림자를 그린다. light raised에도 투명 border 1px를 둔다.

### 포커스 표시

- [x] `focus-ring`: `outline` 2px, offset 2px. `--tide-focus-ring-width`, `--tide-focus-ring-offset`을 둔다.
- [x] `focus-field`: border를 focus-ring 색으로 바꾸고 늘어난 1px는 inset shadow로 그려 2px로 보이게 한다. 투명 outline을 함께 둔다.
- [x] 둘 다 `@utility`로 노출한다.
- [x] error 입력창에서도 포커스 중에는 focus-field가 이긴다. error+focus 조합을 명시적으로 정의한다.

### tailwind-merge

- [x] radius, shadow 이름을 Tailwind 기본 그룹에 등록해 사용자 `className`이 이긴다(`rounded-md`, `shadow-lg`).

### 테스트

- [x] `unit`: 컴파일한 CSS에 radius 5개, shadow 3개, `focus-ring`/`focus-field`가 있고 지운 기본값이 없다.
- [x] `browser`(forced-colors instance): light raised 투명 border와 포커스 투명 outline이 보이는지 계산값으로 단언한다. error+focus 조합의 계산값을 단언한다.

### 문서

- [x] radius 블록과 그림자 블록(light/dark)을 Token 원본에서 그린다.

## Comments

- 2026-11-10 완료(브랜치 `ticket/06-radius-elevation-focus`).
  - **근거 버전**: tailwindcss·@tailwindcss/node·@tailwindcss/vite 4.3.5, tailwind-merge 3.7.0, vitest·@vitest/browser-playwright 5.1.0, playwright 1.65.0, storybook 10.6.6, tsdown 0.23.7. 새 의존성은 없다. `pnpm-lock.yaml`·`pnpm-workspace.yaml`·`package.json`은 바꾸지 않았다.
  - **API 확인**: `--shadow-*`·`--radius-*` namespace, `--<namespace>-*: initial`, `@utility` 안의 CSS nesting(`&[...]`)은 context7 `/tailwindlabs/tailwindcss.com`(theme.mdx, adding-custom-styles.mdx. 문서 사이트는 버전이 없어 v4 최신 문서). 실제 출력은 설치본 4.3.5로 컴파일해 다시 확인했다: `--radius-*: initial`은 `rounded`(단계 없음)·`xs`·`2xl`~`4xl`을 지우고 `rounded-none`(theme 변수가 없는 class)은 남긴다. `--radius-full`을 정의하면 `rounded-full`이 그 값을 쓴다. `--shadow-*: initial`은 단계 없는 `shadow`도 지우고 `shadow-none`은 남긴다. `shadow-md`의 값이 `var(--tide-shadow-md)` 하나면 Tailwind가 색을 `--tw-shadow-color`로 바꾸지 않는다(`--tw-shadow: var(--tide-shadow-md)`). `aria-invalid:` variant는 기본 제공이고 `[aria-invalid="true"]`(0,2,0)로 나온다. `focus:focus-field`는 `.focus\:focus-field:focus { &[aria-invalid="true"] {…} }`로 나온다. tailwind-merge는 설치본 3.7.0 `bundle-mjs.mjs`의 theme 키(`radius`, `shadow`, `inset-shadow`, `drop-shadow`, `text-shadow`)와 class group(`rounded`의 `''`/`none`/`full` 고정값, `shadow`의 `''`/`none`/`inner`)으로 확인했다. `userEvent.tab()`/`click()`은 설치본 @vitest/browser 5.1.0 `context.d.ts`.
  - **Token**(`packages/foundation/src/shape.ts`): `radius`(5단계, rem·full 9999px), `shadow`(단계마다 `{ x, y, blur, spread, mix }` 레이어 2개, spec 표 그대로), `focusRing`(`width`/`offset` 2px). 루트 export에 Token 객체 3개와 타입(`RadiusName`, `ShadowName`, `ShadowLayer`)을 더했고, 레이어를 CSS 값으로 만드는 `shadowCss`는 internal로 냈다. 100% 레이어도 `color-mix(… 100%, transparent)`로 써서 「두 레이어 모두 color-mix」를 그대로 따랐다.
  - **공개 계약**(tokens.css): `--tide-rounded-<단계>`, `--tide-focus-ring-width`/`offset`은 Theme 무관 `:root` 블록. `--tide-shadow-<단계>`는 Theme 블록(`:root, [data-theme="light"]`과 `[data-theme="dark"]`)마다 같은 값으로 다시 선언한다. 사용자 정의 속성의 `var()`는 선언한 요소에서 계산되어 상속되므로 `:root`에만 두면 요소 단위 `data-theme="dark"` 안에서도 light shadow 색이 남기 때문이다. 이름은 `--tide-<Utility class 이름>` 규칙(`rounded-md` → `--tide-rounded-md`)을 따랐다. spec radius·Elevation 항목에 공개 계약 한 줄씩 더했다.
  - **tailwind.css**: `@theme inline`에 `--radius-*`·`--shadow-*`·`--inset-shadow-*`·`--drop-shadow-*`·`--text-shadow-*: initial`과 연결을 더했다. `@utility focus-ring`(outline `var(--tide-focus-ring-width)` solid `var(--tide-outline-focus)`, offset), `@utility focus-field`(border 색, `inset 0 0 0 1px`, 투명 outline 2px, 그리고 `&[aria-invalid="true"]`에서 border 색·inset을 다시 적음).
  - **error+focus 대조 실험**: `&[aria-invalid="true"]` 블록을 dist에서 잠시 지우면 browser 테스트가 `rgb(211, 0, 22)`(red-600, 오류 border)를 받아 실패했다. Tailwind가 `aria-invalid:` 규칙을 `focus:` 뒤에 두기 때문이다. 되돌렸다.
  - **tailwind-merge**: theme `radius`를 5단계, `shadow`를 3단계로 `override`하고 `inset-shadow`·`drop-shadow`·`text-shadow`는 빈 목록으로 바꿨다. 그래서 `rounded-sm rounded-md` → `rounded-md`, `shadow-md shadow-none` → `shadow-none`이고, 지운 `rounded-2xl`·`shadow-xl`·`drop-shadow-*`는 분류하지 않는다.
  - **raised 투명 border**: 처음 구현은 Token 없이 `border border-transparent dark:border-default`였다. 사용자 결정(아래 판단 보류였던 것 1)으로 Semantic `border-raised`를 더해 `border border-raised`로 바꿨다.
  - **테스트**: foundation `unit` 333 tests(304 → 333). `tokens.test.ts`(공개 계약 목록, radius 5개 값, 포커스 ring 2px/2px, 그림자 3단계를 spec 표의 문자열로 비교, 두 Theme 블록에 같은 값), `tailwind.test.ts`(radius 5개·방향별, shadow 3개·dark variant, 지운 기본 class 25개와 theme 변수, `rounded-none`·`shadow-none` 남음, `focus-ring`/`focus-field` 본문과 variant, error+focus 조합 규칙), `tailwind-merge.test.ts`, `exports.test.ts`. desktop `browser`(`src/foundation-shape.test.tsx`, chromium과 forced-colors instance에서 6개씩): light raised(투명 border 1px, radius 8px, 그림자 두 레이어 기하와 alpha 0.04/0.08), dark(border gray-800, alpha 0.15/0.3), 요소 단위 Theme에서 같은 기하·다른 색, `focus-ring`(Tab으로 포커스, outline 2px·offset 2px·blue-600), `focus-field`(클릭, border·inset blue-600, 투명 outline 2px), error+focus(포커스 전 red-600, 포커스 중 blue-600 border·inset, 포커스가 빠지면 red-600으로 돌아옴). forced-colors instance에서는 box-shadow `none`, 투명 border·outline이 투명이 아닌 색인지 단언한다. desktop `unit`의 `cn`에 radius·그림자 경우를 더했다. smoke: 앱 코드에 raised·`focus-visible:focus-ring`·`focus:focus-field`를 쓰고 출력 CSS에 `.rounded-lg`·`--tide-rounded-lg`·`.shadow-md`·`--tide-shadow-md`·두 utility가 있고 `--radius-2xl`·`--shadow-xl`이 없는지.
  - **문서**: `Foundation/모양과 깊이`(`apps/docs/src/foundations/Shape.mdx`). 블록 `Radii`(5단계, px·rem, 쓰는 곳), `Shadows`(light/dark 패널을 요소 단위 `data-theme`로 나란히, raised 표면 위 3단계와 CSS 값), `FocusIndicators`(ring, field, 오류 입력창 field를 두 Theme에서 고정 표시)는 Token 원본을 import하고 미리보기는 공개 계약 변수를 inline style로 쓴다. storybook project가 렌더·axe를 통과했다(docs 42 → 45 tests).
  - **판단 보류였던 것(2026-11-10 사용자 결정으로 반영)**:
    1. raised border: 추천안대로 Semantic `border-raised`(light `transparent`, dark gray-800 = prototype `prototype/24-shadow-focus-motion`의 dark raised border)를 더했다. raised 표면은 `border border-raised`로 쓰고 Theme 분기(`dark:`)가 없다. 원본은 `SemanticColorValue`에 `"transparent"`를 더해 적고 CSS에는 `transparent` 키워드로 낸다(8자리 hex가 아니므로 「alpha는 overlay와 shadow에만」 규칙은 그대로다. internal `colorValueHex`는 `#00000000`을 돌려준다). 대비 검사에서는 `contrastExclusions`에 「raised 표면의 장식용 경계, 표면 구분은 그림자와 배경 밝기가 맡고 대비 의무가 없다」로 제외했다. tailwind-merge는 border 계열 group에 Semantic border 키가 자동으로 들어가 `border-transparent border-raised` → `border-raised`. 공개 계약 `--tide-border-raised`를 tokens 검사에 더했다. browser 테스트에 「dark 페이지 안의 light 영역에서도 투명」을 더했고, 예전 `dark:` 조합으로 돌리면 이 테스트가 `rgb(215, 216, 218)`(gray-200)을 받아 실패하는 것을 확인한 뒤 되돌렸다. spec 공통 Semantic 목록·매핑, 컬러 문서 테두리 목록, 모양과 깊이 문서, smoke(`.border-raised`, `--tide-border-raised`), changeset 요약을 맞췄다.
    2. 그림자 기본값 제거 범위(`inset-shadow-*`·`drop-shadow-*`·`text-shadow-*`까지): 현재 구현 유지.
    3. 오류 상태 표시 `aria-invalid="true"`: 현재 구현 유지.
    4. `focus-field` 투명 outline 두께에 `--tide-focus-ring-width`를 함께 씀: 현재 구현 유지.
  - **해당 없음**: highlight(목록 안 항목) 포커스 표시는 utility가 아니라 Component가 그린다(spec이 `@utility`로 노출하는 것은 ring·field 둘). Menu·Select 티켓에서 다룬다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/*/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force`(15개 태스크) 통과. foundation 333 tests, icons 18 tests, desktop 83 tests, docs 45 tests, smoke 「smoke 통과」, tarball publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(새 changeset 1개, `@tide-tds/foundation` patch).
  - **사용자 결정 반영 뒤 로컬 검증**: `pnpm lint`, `pnpm format:check`, dist·storybook-static을 지운 뒤 `pnpm turbo run typecheck test build smoke --force`(15개 태스크) 통과. foundation 334 tests, icons 18 tests, desktop 85 tests(browser는 instance마다 7개), docs 45 tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 통과.
