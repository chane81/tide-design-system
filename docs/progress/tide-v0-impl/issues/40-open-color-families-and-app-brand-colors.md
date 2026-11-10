# 40: 열린 색 이름(color)과 앱 브랜드 색 계열

Status: done
Blocked by: 07 (motion·z-index Foundation)

## What to build

앱 개발자가 Component의 `color`로 Role(`primary`, `danger` 등)뿐 아니라 색 계열 이름(`gray`, `blue`, `green` 등)과 자기 앱의 브랜드 색 계열(예: `brand`)을 고른다. Tide가 색 계열을 추가하면 Foundation 한 곳만 고치면 되고, 앱은 Tide 패키지를 고치지 않고 브랜드 색을 더한다.

2026-11-10 사용자 결정: 실무에서는 Role 외의 여러 색을 버튼 등에 쓰고, 색 계열은 늘어난다. 앱 브랜드 색 추가도 필수다. 설계는 아래 C안(추천안)으로 정했다.

## 설계 (C안: 계열 변수 묶음 + `data-color` → accent 슬롯)

- 색 계열마다 Theme별 Semantic 변수 묶음을 생성한다(예: `--tide-blue-solid`, `-solid-hover`, `-solid-active`, `-subtle`, `-subtle-hover`, `-subtle-active`, `-text`, `-border`, `-on-solid`). Theme 블록(`[data-theme]`)이 계열 변수를 정한다.
- 매핑 규칙은 한 곳에 둔다: solid 600/700/800(두 Theme), subtle light 50/100/200 · dark 950/900/800, text light 800 · dark 200, border light 600 · dark 400, on-solid white. 계열별 덮어쓸 값(예: 노란 계열의 진한 on-solid)을 둘 수 있다.
- `[data-color="<이름>"]` 규칙은 accent 변수(`--tide-accent-*`)를 해당 계열 변수의 별칭으로 둔다. 새 Semantic utility: `bg-accent-solid/-hover/-active`, `bg-accent-subtle/-hover/-active`, `text-accent`, `text-accent-on-solid`, `border-accent`(정확한 목록은 구현에서 확정).
- Role은 「계열 + 덮어쓸 값」의 별칭이다. `neutral`은 `gray`와 **다른** 색이다(사용자 결정): dark subtle 900/800/700, text `default`, border `strong`을 덮어쓴다. `gray`는 일반 계열 규칙을 따른다.
- 기존 Role utility(`bg-primary-solid` 등)와 공개 계약은 유지한다. 계열 utility(`bg-blue-solid`)는 기본으로 노출하지 않는다.
- 타입: foundation에 `interface ColorRegistry`(Role + 색 계열)를 두고 `type Color = keyof ColorRegistry`. 계열을 더하면 타입이 자동으로 넓어진다.

## 앱 브랜드 색 (필수)

- foundation 서브패스에 `defineColorFamily({ name, scale, overrides })`를 둔다. 앱은 11단계 스케일 전체를 넘기고 필요할 때만 덮어쓸 값을 준다.
- CLI(예: `tide-color build brand.ts > brand.css`)가 같은 매핑 규칙으로 light/dark 변수와 `[data-color="brand"]` 규칙이 든 CSS를 만든다. 같은 대비 쌍 규칙으로 light·dark를 검사하고, 미달이면 exit 1로 실패한다(사용자 결정: 대비 CLI 포함). 기존 `contrastRatio`·대비 쌍 생성 로직을 다시 쓴다.
- 타입 확장: `declare module "@tide-tds/foundation" { interface ColorRegistry { brand: true } }`. `@tide-tds/components`에서 re-export한 interface도 augmentation이 되는지 설치된 TypeScript로 먼저 실험하고, 안 되면 foundation을 augmentation 대상으로 문서화한다.
- Component는 앱 계열 class를 쓰지 않으므로 Tailwind 자동 완성과 tailwind-merge 설정은 바뀌지 않는다. 앱이 `bg-brand-solid` 같은 계열 utility를 직접 `@theme`에 더하는 것은 선택 사항이고, Tide `cn`이 그 충돌을 해결하지 않는다고 문서에 경고한다.
- 검토하고 뺀 안: 앱이 hex 하나만 주고 CSS relative color로 단계를 만드는 방식(대비를 정적으로 검사할 수 없다).

## 수용 기준

- [x] ADR 0011: `color`는 열린 색 이름이고 `data-color` → accent 변수로 꽂는다. ADR 0003(공개 계약 추가)·0005(variant 맵 모양: 색 축이 `data-color`로 빠짐)를 정정한다. 대체·정정 표시를 단다. (ADR 0010은 티켓 13 브랜치에 이미 있다.)
- [x] 위 설계대로 계열 변수, Role 별칭, accent namespace, `[data-color]` 규칙을 `color.ts`/`semantic.ts`/빌드 스크립트에서 생성한다. 색 계열을 하나 더하는 테스트(테스트 전용 계열)로 타입·변수·대비 쌍이 자동으로 따라옴을 확인한다.
- [x] 대비 쌍을 계열마다 자동 생성하고, 기존 Role 대비 쌍 결과가 바뀌지 않았음을 회귀 테스트로 확인한다.
- [x] 요소 단위 `data-theme` 안의 `data-color`가 그 Theme 값을 따름을 browser 테스트로 단언한다.
- [x] `ColorRegistry`/`Color` 타입과 module augmentation 동작(테스트 또는 타입 테스트).
- [x] `defineColorFamily`와 대비 CLI(bin 엔트리), 미달 시 exit 1 테스트.
- [x] smoke에 앱 계열 하나를 넣어 소비 앱에서 CSS·타입이 동작함을 확인한다.
- [x] GLOSSARY: Role 정의의 「Component에서는 `color` prop으로 Role을 고른다」, Variant 항목의 「색은 Role로 고른다」를 고치고 「색 이름(Color)」·「accent 슬롯」 용어를 더한다. spec 공통 API 절의 `color` 정의, `data-color`, variant 맵 모양, 앱 확장점을 고친다.
- [x] 문서: Color Foundation MDX 갱신, 시작하기에 「브랜드 색 더하기」 페이지(문서 작성 기준 37을 따른다).
- [x] changeset(foundation minor).

## 후속

- Button(13)은 이 티켓 뒤에 variant 맵을 `Record<FillVariant, string>` + `data-color`로 바꾸고, `color`를 `Color` 전체로 넓힌다. Button은 `data-color`를 항상 붙여(기본 `primary`) 바깥 색을 물려받지 않는다.

## Comments

- 2026-11-10 구현 결정(설계 C안 그대로. 구현에서 확정한 것만 적는다)
  - 슬롯 9개: `solid`, `solid-hover`, `solid-active`, `subtle`, `subtle-hover`, `subtle-active`, `text`, `border`, `on-solid`. 규칙은 `packages/foundation/src/color-slot.ts` 한 곳(`slotRule`), 계열별 덮어쓸 값은 `familyOverrides`(지금은 비어 있음), Role 덮어쓸 값은 `semantic.ts`의 `roleOverrides`(neutral dark subtle 900/800/700)와 `roleSharedSlots`(neutral text→`text-default`, border→`border-strong`).
  - 변수 이름: 계열 `--tide-<계열>-<슬롯>`(6 × 9 = 54개), accent `--tide-accent-<슬롯>`(9개). `--tide-<Utility class 이름>` 규칙의 예외로 ADR 0011과 spec에 적었다. accent를 `--tide-bg-accent-solid`처럼 짓는 안도 봤지만, 계열 묶음과 슬롯 이름을 같게 두면 `[data-color="blue"] { --tide-accent-solid: var(--tide-blue-solid) }`로 대응이 바로 보여서 티켓의 `--tide-accent-*`를 따랐다.
  - accent Utility class 최종 9개: `bg-accent-solid`, `bg-accent-solid-hover`, `bg-accent-solid-active`, `bg-accent-subtle`, `bg-accent-subtle-hover`, `bg-accent-subtle-active`, `text-accent`, `text-accent-on-solid`, `border-accent`. `outline-accent`는 두지 않는다(포커스는 `outline-focus` 하나). 계열 class(`bg-blue-solid`)는 생기지 않음을 테스트로 막았다.
  - Role은 CSS에서도 계열 별칭이다(`--tide-bg-primary-solid: var(--tide-blue-solid)`). 덮어쓴 슬롯(neutral dark subtle)만 Primitive를 직접 가리킨다. TS `semantic` 객체는 Role 항목을 같은 규칙으로 생성하고, 타입 수준 계산으로 리터럴 타입(`semantic.background["primary-solid"].light: "blue-600"`)을 유지했다(smoke nodenext 검사 그대로 통과).
  - accent 기본값: Theme 블록마다 primary를 꽂는다. `[data-color]` 규칙은 Theme과 무관한 별칭이라 Theme 블록 뒤에 색 이름마다 한 번씩 둔다(우선순위가 같아 순서로 이긴다). 한계: `data-color` 바깥에 둔 요소 단위 `data-theme` 안쪽은 기본값(primary)으로 돌아간다. Component가 루트에 `data-color`를 항상 붙이면 문제가 없다(ADR 0011 Consequences).
  - `contrastPairs`(공개 export)는 바꾸지 않았다. 색 이름용 규칙은 `colorContrastRules`(text × 표면 층·subtle 3, on-solid × solid 3, border × 표면 층 = 12개)로 따로 두고 Tide 색 이름 12개 × 2 Theme = 288건을 검사한다. Role 대비 쌍과 모든 Semantic hex는 구현 전에 만든 스냅숏(`test/role-regression.test.ts`, 커밋 ed5d87c)으로 바뀌지 않았음을 확인했다.
  - `Color`/`ColorRegistry`는 foundation 루트와 components 루트에서 낸다. `ColorRegistry extends Record<Role | ColorFamily, true>`라 Tide가 계열을 더하면 타입이 따라온다.
  - 앱 확장: `@tide-tds/foundation/color-family`(`defineColorFamily`, `colorFamilyCss`, `checkColorFamily`, `colorFamilySlotHex`)와 bin `tide-color build <파일>`. default export는 계열 하나나 배열. 대비 미달이면 stdout에 아무것도 쓰지 않고 exit 1, 사용법 오류는 exit 2. 이름은 kebab-case이고 Tide 색 이름·`accent`·변수 이름 공간(`bg`, `text`, `font` 등)은 쓸 수 없다.
  - 앱은 pnpm에서 전이 의존성의 import·bin을 쓸 수 없으므로 `@tide-tds/foundation`을 components와 같은 버전으로 직접 설치한다고 문서에 적었다(티켓 39의 icons 직접 설치와 같은 이유).
- 2026-11-10 augmentation 실험(TypeScript 7.0.2, 설치본 `tsc`)
  - 가짜 패키지 둘(foundation에 interface, components에서 `export type { ColorRegistry } from`)로 `moduleResolution` bundler·nodenext 모두 확인했다. `declare module "@x/components"`와 `declare module "@x/foundation"` 둘 다 원래 interface에 합쳐졌다. augmentation이 없으면 `"brand"`가 TS2345로 실패하는 대조도 확인했다.
  - 그래서 문서의 augmentation 대상은 앱이 설치하는 `@tide-tds/components`로 했다. smoke(next build의 bundler tsc와 nodenext tsc)가 실제 tarball로 같은 것을 검사한다. foundation 테스트(`test/color-name.test.ts`)는 re-export 모듈(`../src/index.ts`)을 augmentation해서 `expectTypeOf<Color>()`로 확인한다.
- 2026-11-10 라이브러리 확인
  - tsdown 0.23.7: context7 `/rolldown/tsdown/v0.23.0` options/cleaning 「Multiple Builds」(설정 배열, 첫 빌드만 `clean: true`). CLI는 node 내장 모듈을 쓰므로 두 번째 설정을 `platform: "node"`로 묶었다(neutral에서는 `node:*`를 UNRESOLVED_IMPORT로 경고). `#!/usr/bin/env node`가 `dist/cli.js` 맨 위에 남는 것을 빌드 결과로 확인했다.
  - Node: context7 `/nodejs/node/v26.0.0` typescript.md·CHANGELOG_V23(23.6.0에서 type stripping 기본 켜짐, `node_modules` 안 파일은 지원하지 않음). 앱의 `brand.ts`는 `node_modules` 밖이라 읽을 수 있다.
  - tailwindcss 4.3.5 속성별 namespace와 tailwind-merge 3.7.0 `classGroups` 확장은 기존 방식(ADR 0003)을 그대로 쓰고, 컴파일 테스트·병합 테스트로 확인했다. tailwind-merge가 앱이 더한 `bg-brand-solid`를 분류하지 않는 것도 테스트로 고정했다.
- 2026-11-10 결과
  - 생성 CSS 크기: `tokens.css` 13,671 → 26,766 bytes, `tailwind.css` 11,964 → 12,549 bytes. 예시 앱 계열 하나(`brand`)의 CLI 출력은 2,071 bytes.
  - 테스트: foundation unit 433(테스트 전용 계열 `violet`을 Primitive에 더하는 `vi.doMock` 테스트 포함), components browser 6건 추가(요소 단위 `data-theme` 안의 `data-color`, neutral≠gray, 앱 계열 CSS를 Tide CSS 뒤에 넣은 경우. forced-colors instance 포함), smoke에 `tide-color build brand.ts`와 `[data-color=brand]`·accent class·augmentation 검사.
  - Button(13)은 건드리지 않았다. 후속 메모: variant 맵을 accent class로 바꾸고(`solid`: `bg-accent-solid hover:bg-accent-solid-hover active:bg-accent-solid-active text-accent-on-solid`, `subtle`: `bg-accent-subtle ... text-accent`, `outline`: `border-accent text-accent hover:bg-accent-subtle-hover`, `ghost`: `text-accent hover:bg-accent-subtle-hover`), 루트에 `data-color={color ?? "primary"}`를 붙이고 `color?: Color`로 넓힌다. Button story에 색 계열과 앱 계열 예시를 더한다.
