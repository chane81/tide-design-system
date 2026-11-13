# 41: Component 종류별 color 범위와 앱 Role

Status: done
Blocked by: 40 (열린 색 이름과 앱 브랜드 색 계열), 14 (IconButton과 Link)

## What to build

행동·의미 Component(Button, IconButton, Link, 이후 Checkbox·Radio·Switch·Alert·Toast 등)의 `color`는 Role만 받는다. 색 계열 이름(`gray`, `blue` 등)은 Badge·Tag·Avatar 같은 장식·분류 Component가 쓴다. 앱이 브랜드 색으로 Button을 칠하고 싶으면 Role을 하나 더한다(예: `brand`). 앱 Role의 색은 `defineColorFamily`·`tide-color` CLI로 만들어 대비 검사를 받는다.

2026-11-10 사용자 결정: 티켓 40(ADR 0011)에서는 Button `color`가 Role, 색 계열 이름, 앱 브랜드 색을 모두 받았다. 사용자가 한 디자인 시스템의 색 Foundation을 보고 결정을 바꿨다. 그 시스템은 Role을 버튼에 써서 primary·secondary·warning·danger 동작을 구분하고, accent 색은 「특정한 뜻이 없는 색」이라 서로 바꿔도 경험이 같다고 설명한다. 뜻이 있는 동작에 뜻이 없는 색을 고르게 두면 같은 동작이 화면마다 다른 색이 된다.

## 설계

- foundation의 `ColorRegistry`(Role + 계열 한 덩어리)를 둘로 나눈다.
  - `RoleRegistry`: Tide Role 6개 + 앱 Role. `Role = keyof RoleRegistry`
  - 색 계열 등록(이름은 구현에서 정한다): Tide 색 계열 6개 + 앱 계열. 장식·분류 Component가 쓴다.
- 앱 Role 하나는 「`RoleRegistry` augmentation + `tide-color`로 만든 `[data-color="<이름>"]` CSS」다. 장식용 앱 계열은 같은 CSS에 계열 등록 augmentation을 한다. 같은 CSS를 두 방식이 함께 쓸 수 있다.
- 앱이 Tide Role의 색을 바꾸려면 Role CSS 변수(`--tide-bg-primary-*`, `--tide-text-primary`, `--tide-border-primary` 등)를 Theme별로 덮어쓴다. 별도 기능은 두지 않고, 문서에 방법과 「대비 검증 없음」 경고만 둔다. 계열 변수(`--tide-blue-*`)는 덮어쓰지 말라고 적는다.
- 티켓 40의 기반(`data-color`, accent 슬롯, 계열 변수, `[data-color]` 규칙, `defineColorFamily`, CLI)은 그대로다.

## 수용 기준

- [x] ADR 0011을 정정한다(정정 표시와 이유: 참고한 디자인 시스템 사례, Component 종류별 color 범위). 큰 변경이면 새 ADR(0016)로 대체한다.
- [x] foundation에 `RoleRegistry`와 색 계열 등록 interface를 두고 `Role = keyof RoleRegistry`. Tide 내부 계산(Semantic Token 이름, 대비 쌍)은 앱 Role로 넓어지지 않는다.
- [x] 기존 공개 계약(Role utility, `--tide-*` 변수)과 대비 결과가 바뀌지 않는다(회귀 스냅숏).
- [x] Button·IconButton·Link의 `color`가 `Role`(앱 Role 포함)이다. 색 계열 이름은 타입 오류다(타입 테스트).
- [x] 앱 Role(`brand`) browser 테스트와 story. 색 계열 이름 테스트·story는 걷어 낸다.
- [x] smoke의 `<Button color="brand">`가 앱 Role 방식(`RoleRegistry` augmentation)으로 통과한다.
- [x] 문서: GLOSSARY(Role, 색 이름, accent 슬롯), spec 공통 API 절, Color Foundation MDX, 시작하기 「브랜드 색 더하기」(앱 Role 추가, Role 변수 덮어쓰기와 경고), Button·IconButton·Link MDX의 색 절.
- [x] changeset(foundation·components).

## Comments

- 2026-11-10 결정(구현에서 확정한 것)
  - ADR은 0011을 고치지 않고 새 ADR 0016으로 일부 대체했다. `color` 범위(Component 종류별)와 타입 구조가 바뀌어 0011 본문 여러 곳이 맞지 않게 되었기 때문이다. 0011 맨 위에 「ADR 0016으로 일부 대체됨」, 끝에 「정정 (2026-11-10, 티켓 41)」을 달았다. `data-color`·accent·계열 변수·CLI 결정은 0011 그대로다.
  - 타입 구조(`packages/foundation/src/semantic.ts`):
    - `TideRole`(닫힘, 6개) → `interface RoleRegistry extends Record<TideRole, true>` → `type Role = keyof RoleRegistry`
    - `ColorFamily`(닫힘, Primitive 계열 6개, 기존 이름 유지) → `interface ColorFamilyRegistry extends Record<ColorFamily, true>` → `type ColorFamilyName = keyof ColorFamilyRegistry`
    - `type Color = Role | ColorFamilyName`(`data-color`가 받는 모든 이름). `ColorRegistry`는 없앴다.
    - `ColorFamily`를 열린 타입으로 바꾸지 않은 이유: `PrimitiveColorName`, `color` 객체, 계열 변수 생성이 이 타입에 기대고, 0.1.0에 이미 배포된 공개 타입이다.
  - Tide 안의 계산(`semantic` 객체 타입, `roleFamily`, `roleOverrides`, 대비 쌍, `roleSlotToken`, `isRole`, `TideColor`)은 `TideRole`을 쓴다. `Role`을 그대로 썼다면 앱이 `brand`를 더할 때 `semantic.background["brand-solid"]`가 타입에 생긴다. 대조 실험으로 확인했다: 테스트의 augmentation(`test-brand`)이 있는 상태에서 `RoleBackgroundTokens`를 `Role`로 되돌리면 tsc가 TS2344로 실패한다.
  - 앱 Role 등록과 장식 계열 등록은 CSS가 같다. `tide-color build`가 만드는 `[data-color="brand"]` + `--tide-brand-*`를 둘 다 쓰고, 타입 등록만 다르다. smoke는 `brand`를 두 registry에 모두 등록해 `Role`과 `ColorFamilyName` 양쪽에서 쓰고(next build의 bundler tsc), nodenext 검사 파일은 `RoleRegistry`에만 등록해 `ColorFamilyName = "brand"`가 오류임을 확인한다.
  - 장식·분류 Component가 Role도 받을지는 정하지 않았다(19·21·33에서 정한다). 둘 다 받으면 `Color`를 쓴다.
  - Tide Role 색 바꾸기: 기능 없이 문서(「브랜드 색 더하기」의 「Tide Role의 색을 바꿀 때」)만 두었다. 문서 예시가 실제로 동작하는지 Button browser 테스트로 확인했다(`[data-theme="light"] { --tide-bg-primary-solid: … }`를 Tide CSS 뒤에 넣으면 기본 Button의 accent가 바뀌고 `success`는 그대로).
- 2026-11-10 changeset 판단
  - 새 changeset `role-registry.md`: foundation minor, components minor. 공개 타입을 더하고(`RoleRegistry`, `ColorFamilyRegistry`, `ColorFamilyName`, `TideRole`) `Role`의 정의가 바뀐다. 앱이 augmentation하지 않으면 `Role`은 0.1.0과 같은 6개라 깨지는 변경이 아니다. 0.x에서 공개 API 추가는 minor로 낸다.
  - 미배포 changeset(button, icon-button-and-link, open-color-names-brand-colors)의 문구에서 `ColorRegistry`와 「색 계열을 받는 color」를 고쳤다. npm에는 0.1.0만 있고 열린 color는 배포된 적이 없으므로, 사용자가 본 적 없는 API의 제거를 changelog에 적지 않는다.
- 2026-11-10 라이브러리 확인
  - TypeScript 7.0.2(설치본 `tsc -v`): context7 `/microsoft/typescript/v7.0.2`의 module augmentation baseline(`moduleAugmentationExtendFileModule2`, `augmentExportEquals5`)으로 `declare module`이 모듈의 interface에 합쳐짐을 확인했다. re-export한 interface augmentation은 티켓 40 실험 결과를 따르고, 이번에 `RoleRegistry`·`ColorFamilyRegistry`로 다시 확인했다(foundation `test/color-name.test.ts`의 `expectTypeOf`, components browser 테스트의 `@ts-expect-error`, smoke의 bundler·nodenext tsc).
  - vitest 5.1.0: `expectTypeOf(...).toExtend`/`.not.toExtend`는 설치된 expect-type 1.4.0의 d.ts에서 확인했다(`toMatchTypeOf`는 deprecated).
  - Tailwind 4.3.5, Storybook 10.6.6: 새 API를 쓰지 않았다(기존 story 형식과 accent class 그대로).
- 2026-11-10 결과
  - CSS(`tokens.css`, `tailwind.css`), Utility class, `--tide-*` 변수, 대비 결과는 바뀌지 않았다. Role 회귀 스냅숏(`test/role-regression.test.ts`) 그대로 통과.
  - 테스트: foundation 436, components 338(browser 두 instance 포함), icons 18, docs 96. smoke 통과(`brand: 대비 쌍 24개 중 24개 통과`).
  - 15·16·17 브랜치가 rebase할 때: `color` prop은 `Role`(`./types.ts`)을 쓴다. 테스트 augmentation은 `interface RoleRegistry { brand: true }`이다. 색 계열 이름(`gray` 등) 테스트·story는 두지 않는다. `components/src/index.ts`의 타입 export 줄이 바뀌었으므로 충돌하면 `Color, ColorFamilyName, ColorFamilyRegistry, FillVariant, Role, RoleRegistry, Size`를 유지한다. foundation 안에서 Tide Role만 다루는 계산은 `TideRole`을 쓴다.
