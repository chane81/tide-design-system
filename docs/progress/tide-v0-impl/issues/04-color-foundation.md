# 04: 컬러 Foundation

Status: done
Blocked by: 03 (Storybook과 브라우저 테스트 골격), 36 (패키지 빌드를 tsdown으로 전환)

## What to build

앱 개발자가 Role 6개와 강도(`solid`/`subtle`)로 배경·글자·테두리 색을 class로 고르고, `data-theme` 속성 하나로 light/dark를 바꿀 수 있다. 실제로 함께 쓰이는 색 조합의 대비는 CI가 보장하고, 대비 쌍에 등록하지 않은 Semantic Token은 CI를 실패시킨다. 디자이너는 Storybook에서 색 스케일과 대비비를 본다.

## 수용 기준

### Primitive

- [x] 계열 `blue`(primary), `gray`(neutral), `green`(success), `amber`(warning), `red`(danger), `cyan`(info) 각 50~950의 11단계와 `white`, `black`이 있다.
- [x] 정본은 hex다. `blue-500`은 `#3183f5`다.
- [x] Tailwind 기본 팔레트를 지운다(`--color-*: initial`). `bg-blue-500`은 Tide 값이다.

### Semantic

- [x] Tailwind 속성별 namespace(`--background-color-*`, `--text-color-*`, `--border-color-*`, `--outline-color-*`)로 노출한다. 의미 없는 조합(`text-bg-primary` 등)은 생기지 않는다.
- [x] `bg-<역할>-<solid|subtle>[-hover|-active]`. 강도는 생략하지 않는다.
- [x] `text-<역할>`, `border-<역할>`. neutral은 이 둘을 두지 않는다.
- [x] 공통: `bg-canvas`, `bg-surface`, `bg-raised`, `bg-disabled`, `bg-overlay`, `text-default`, `text-muted`, `text-disabled`, `text-on-solid`, `border-default`, `border-strong`, `outline-focus`.
- [x] shadow 색은 class로 노출하지 않고 `--tide-shadow-color`만 둔다.
- [x] 매핑은 spec과 tide-v0 티켓 09(컬러 Foundation 결정)를 따른다: solid/hover/active 600/700/800, subtle light 50/100/200·dark 950/900/800(dark neutral만 900/800/700), 역할 text light 800·dark 200, 역할 border light 600·dark 400, 표면 층(canvas·surface·raised), focus-ring blue-600/blue-400, overlay gray-950 alpha 50%/70%, shadow 색 gray-950 8%/black 30%. alpha는 overlay와 shadow에만 8자리 hex로 쓴다.

### Theme

- [x] `:root`와 `[data-theme="light"]`는 light, `[data-theme="dark"]`는 dark이고 각각 `color-scheme`을 지정한다. 요소 단위 `data-theme`도 동작한다.
- [x] `dark:` variant는 `data-theme=dark`를 따른다. `prefers-color-scheme` 자동 전환은 없다.
- [x] 공개 계약은 `--tide-<Utility class 이름>`이고 tokens CSS만 import해도 쓸 수 있다.

### 테스트 (`unit`)

- [x] 대비 쌍 목록(128쌍 이상)을 light와 dark에서 모두 검사한다. 텍스트 4.5:1, UI 경계·포커스 3:1. 장식용 border, disabled, overlay, shadow는 제외한다.
- [x] 대비 쌍에 등록되지 않은 Semantic Token이 있으면 실패한다.
- [x] 컴파일한 CSS에 Semantic namespace class가 있고, Tailwind 기본 팔레트 class가 없다.
- [x] `--tide-*` 공개 계약 목록을 검사한다.
- [x] tailwind-merge 설정이 Semantic 색 namespace 충돌을 해결한다.

### 문서

- [x] 색 Token 블록: Token 원본을 import해 색 스케일과 대비비를 그린다.

## Comments

- 2026-11-10 완료(브랜치 `ticket/04-color-foundation`).
  - **근거 버전**: tailwindcss·@tailwindcss/node 4.3.5, tailwind-merge 3.7.0, storybook 10.6.6, tsdown 0.23.7. 새 의존성은 없다(색 계산 라이브러리를 쓰지 않고 WCAG 2.x 상대 휘도 공식을 직접 썼다. 선형화 경계는 WCAG 2.2 표기인 0.04045). `pnpm-lock.yaml`·`pnpm-workspace.yaml`은 바꾸지 않았다.
  - **API 확인**: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`와 `--color-*: initial`은 context7 `/tailwindlabs/tailwindcss.com`(dark-mode.mdx, colors.mdx. 문서 사이트는 버전이 없어 v4 최신 문서)로 확인했다. 속성별 namespace는 설치본 4.3.5 `dist/lib.mjs`의 themeKeys로 다시 확인했다: `bg`·`text`·`border`(모든 방향)·`outline`이 각 namespace를 읽고, `divide`는 `--divide-color` → `--border-color`, gradient stop(`from-`/`via-`/`to-`)도 `--background-color`를 읽는다. tailwind-merge는 context7 `/dcastil/tailwind-merge`(configuration.md, api-reference.md의 `override`/`extend`)와 설치본 3.7.0 `types.d.ts`의 `ConfigExtension`, `bundle-mjs.mjs`의 class group id(`bg-color`, `text-color`, `border-color(-x|-y|-s|-e|-bs|-be|-t|-r|-b|-l)`, `divide-color`, `outline-color`)로 확인했다. Canvas `sourceState: "none"`은 context7 `/storybookjs/storybook/v10.6.5` `doc-block-canvas.mdx`.
  - **Primitive**: tide-v0 티켓 08의 초안 hex를 그대로 정본으로 넣었다(손 조정 없음). 계열 이름은 색상(`green`, `amber`, `red`, `cyan`)이고 Role과의 대응은 `roleFamily`에 둔다. 공개 계약 이름은 02에서 정한 `--tide-color-<계열>-<단계>`, `--tide-color-white`/`black`이다.
  - **Semantic**: 58개(background 41, text 9, border 7, outline 1). 원본은 `as const` 리터럴로 전부 적었다(생성 함수 대신. 자동완성과 리뷰에서 매핑이 그대로 보이게). overlay와 shadow 색은 `{ primitive, alpha }`로 적고 빌드가 8자리 hex로 낸다(overlay `#28292c80`/`#28292cb3`, shadow `#28292c14`/`#0000004d`). 나머지는 `var(--tide-color-*)` 참조다.
  - **대비 쌍**: Theme당 78쌍, 합계 156쌍. 티켓 09 규칙에 surface(canvas와 같은 색이지만 다른 Token)와 「neutral subtle 3단계 위 `text-default`」(neutral은 역할 text가 없어서)를 더했다. 제외 목록(`border-default`, `bg-disabled`, `text-disabled`, `bg-overlay`)은 이유와 함께 `contrastExclusions`로 둔다. 가장 빠듯한 글자 쌍은 두 Theme 모두 `text-on-solid`/`bg-success-solid` 4.63:1, UI 경계는 dark `border-danger`/`bg-raised` 3.60:1(티켓 09 계산과 같음).
  - **미등록 검출 대조 실험**: `text-subtle`을 원본에 잠시 더하면 「모든 Semantic Token이 대비 쌍이나 제외 목록에 있다」가 `["text-subtle"]`로 실패하고, `bg-success-solid` light를 green-500으로 바꾸면 `text-on-solid / bg-success-solid` 쌍이 실패했다. 둘 다 되돌렸다.
  - **tailwind-merge**: theme `color`는 Primitive 이름만으로 `override`하고(02와 같음), Semantic 키는 namespace마다 그 namespace를 읽는 class group에만 `extend`했다. 그래서 `text-canvas`, `bg-muted`처럼 class가 없는 이름은 색으로 분류되지 않는다. border는 방향별 group과 `divide-color`에도 border 키를 넣었다.
  - **테스트**(foundation `unit`, 248 tests): `contrast.test.ts`(대비 쌍 156개, 미등록·중복·제외 목록), `tokens.test.ts`(`--tide-*` 공개 계약 목록을 spec에서 옮긴 기대 목록과 비교, Theme 선택자·`color-scheme`·`prefers-color-scheme` 없음, alpha는 overlay·shadow만, Role별 매핑), `tailwind.test.ts`(Semantic class 58개, hover·dark variant, 의미 없는 조합 18개 미생성, Tailwind 기본 전용 계열 20개 미생성, Tide 계열의 기본 oklch 값 없음), `tailwind-merge.test.ts`. 요소 단위 `data-theme`은 Theme 블록이 `:root`/`html`이 아닌 속성 선택자뿐인 것으로 단언했다.
  - **turbo**: foundation `test`가 dist를 읽는데 같은 패키지의 `build`(tsdown이 dist를 비움)와 동시에 돌아 `--force` 실행에서 간헐적으로 실패했다. `packages/foundation/turbo.json`에서 `test`가 `build`에도 의존하게 했다.
  - **문서**: `Foundation/컬러` 페이지(`apps/docs/src/foundations/Color.mdx`). 블록 `ColorScale`(계열·Role, 단계별 hex와 light/dark canvas 위 대비비), `ContrastPairs`(Theme별 표, 글자 쌍은 글자 미리보기, UI 경계 쌍은 선 미리보기), `ContrastExclusions`는 모두 `@tide-tds/foundation` 원본을 import해 그린다. story로 만들어 `storybook` project가 렌더·axe 검사를 하고, MDX는 글과 `Canvas`만 둔다. 빌드 결과를 Playwright로 열어 light/dark 모두 axe(WCAG 2.0~2.2 AA 태그) 위반 0을 확인했다. MDX의 GFM 표는 remark-gfm 설정이 없어서 목록으로 썼다.
  - **Theme 전환 페이지 보완**: `dark:` variant는 Tailwind 문서 형태라 조상 중 하나라도 dark면 적용된다. dark 안의 light 영역에서도 `dark:`가 적용되므로 영역 단위 Theme에는 Semantic Token class를 쓰라고 적었다.
  - **판단 보류(사용자 확인)**:
    1. foundation 루트 export에 Token 객체 외 함수(`primitiveHex`, `semanticHex`, `colorValueHex`, `semanticEntries`, `contrastRatio`)와 `contrastExclusions`, `roleFamily`, `shadowColor`를 더했다. 문서 블록이 빌드 결과(dist)만 import할 수 있어서다. spec 「공개 표면」은 「루트: Token 객체」라서 공개 계약이 넓어진다. 유지할지, 내부 서브패스로 옮길지 정해야 한다(spec은 고치지 않았다).
    2. gradient stop이 `--background-color`도 읽어서 `from-canvas`, `via-primary-solid` 같은 class가 생긴다(설치본 4.3.5 확인). 「의미 없는 조합은 생기지 않는다」의 예외로 둘지 정해야 한다. 지금은 테스트로 막지 않았고 tailwind-merge에도 등록하지 않았다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `pnpm turbo run typecheck test build smoke --force`(12개 태스크, 두 번 연속) 통과. foundation 248 tests, desktop 7 tests, docs 17 tests(unit 9 + storybook 8 stories), smoke 통과.
