# 모노레포 툴링 조사

- 조사일: 2026-11-08
- 관련 티켓: [05-research-monorepo-tooling](../progress/tide-v0/issues/05-research-monorepo-tooling.md)
- 맥락: [ADR 0001](../decisions/0001-framework-agnostic-tokens-react-components.md), [ADR 0002](../decisions/0002-monorepo-tailwind.md)
- 방법: `npm view`로 레지스트리 버전을 확인한 뒤, context7(버전 지정 문서)과 공식 문서·패키지 메타데이터로 확인했다. 출처에서 직접 확인하지 못한 내용은 "확인 불가" 또는 "추론"으로 표시했다.

## 1. 최신 안정 버전 (npm `latest` 태그, 2026-11-08 기준)

| 패키지 | latest | 배포일 | 참고 (다른 dist-tag) |
| --- | --- | --- | --- |
| `vite` | 8.3.6 | 2026-11-05 | beta 8.3.0-beta.1 |
| `vitest` | 5.1.0 | 2026-11-02 | V4 4.1.12, V3 3.2.7 |
| `storybook` / `@storybook/react-vite` | 10.6.6 | 2026-11-05 | next 11.0.0-beta.0 |
| `typescript` | 7.0.2 | 2026-07-08 | beta 7.1.0-beta |
| `oxlint` | 1.92.0 | 2026-11-06 | |
| `oxfmt` | 0.77.0 | 2026-11-06 | 0.x 계열(1.0 미만) |
| `pnpm` | 12.18.0 | 2026-11-05 | latest-11 11.28.9, latest-10 10.34.9 |
| `@changesets/cli` | 3.0.3 | 2026-09-14 | maintenance-v2 2.31.1 |
| `tailwindcss` / `@tailwindcss/vite` | 4.3.5 | 2026-11-06 | v3-lts 3.4.19 |
| `@vitejs/plugin-react` | 6.2.1 | | |
| `vite-plugin-dts` | 5.1.2 | 2026-10-03 | |
| `tsdown` | 0.23.7 | 2026-11-06 | |
| `@storybook/addon-vitest` | 10.6.6 | | |
| `@vitest/browser-playwright` | 5.1.0 | | |
| `oxlint-tsgolint` | 7.0.2006 | | |
| `@typescript/typescript6` | 6.0.2 | | |

출처: `npm view <pkg> version`, `npm view <pkg> dist-tags`, `npm view <pkg> time`.

## 2. 서로의 호환성 (peerDependencies / engines)

| 패키지 | 요구 사항 | 출처 |
| --- | --- | --- |
| `@storybook/react-vite@10.6.6` | `vite ^5 \|\| ^6 \|\| ^7 \|\| ^8`, `react ^16.8 ~ ^19`, `typescript >= 4.9.x` | `npm view @storybook/react-vite peerDependencies` |
| `vitest@5.1.0` | `vite ^6.4.0 \|\| ^7 \|\| ^8` | `npm view vitest peerDependencies` |
| `@tailwindcss/vite@4.3.5` | `vite ^5.2.0 \|\| ^6 \|\| ^7 \|\| ^8` | `npm view @tailwindcss/vite peerDependencies` |
| `@vitejs/plugin-react@6.2.1` | `vite ^8.0.0` (Vite 8 전용) | `npm view @vitejs/plugin-react peerDependencies` |
| `@storybook/addon-vitest@10.6.6` | `vitest ^4 \|\| ^5`, `@vitest/browser-playwright ^4 \|\| ^5` | `npm view @storybook/addon-vitest peerDependencies` |
| `@changesets/cli@3.0.3` | engines: node `^22.11 \|\| ^24 \|\| >=26`, pnpm `>=10.0.0` | `npm view @changesets/cli engines` |
| `storybook@10.6.6` | engines: node `^22.12.0 \|\| ^24 \|\| >=26` | `npm view storybook engines` |
| `vite@8.3.6`, `vitest@5.1.0` | engines: node `^20.19.0 \|\| >=22.12.0` | `npm view vite engines` |

정리: 위 최신 버전끼리는 peer 범위상 충돌이 없다. Node는 가장 엄격한 쪽(Storybook 10, changesets 3)에 맞춰 **22.12 이상**이 필요하다. `@vitejs/plugin-react` 6은 Vite 8만 지원한다.

**TypeScript 7은 별도로 주의해야 한다.** 아래 6절을 본다.

## 3. Vite 라이브러리 모드 빌드 (근거: Vite v8.3.5 문서)

- `build.lib` 옵션으로 라이브러리를 빌드한다. 타입은 `{ entry, name?, formats?, fileName?, cssFileName? }`이다. 진입점이 하나면 기본 포맷은 `['es', 'umd']`, 여럿이면 `['es', 'cjs']`이고, `formats`로 바꿀 수 있다. ESM만 내려면 `formats: ['es']`로 지정한다.
- Vite 8에서는 번들러 옵션 키가 `build.rolldownOptions`다(공식 예제가 `rollupOptions`가 아니라 `rolldownOptions`를 쓴다). `react` 같은 peer 의존성은 `rolldownOptions.external`로 번들에서 뺀다.
- **CSS**: 라이브러리가 CSS를 import하면 JS 옆에 CSS 파일 하나로 묶인다(예: `dist/my-lib.css`). 이름은 `build.lib.cssFileName`으로 바꾼다. `package.json` `exports`에 `"./style.css": "./dist/my-lib.css"`처럼 노출하는 예제가 공식 문서에 있다.
- `package.json`에 `"type": "module"`이 없으면 확장자가 바뀐다(`.js`→`.mjs`, `.cjs`→`.js`).
- `import.meta.env.*`는 빌드 때 정적으로 치환되지만 `process.env.*`는 치환되지 않는다.
- 공식 문서는 "브라우저 대상이 아닌 라이브러리나 고급 빌드 흐름이 필요하면 [tsdown](https://tsdown.dev/)이나 Rolldown을 직접 쓰라"고 안내한다.
- **타입 선언(`.d.ts`)은 Vite가 만들지 않는다.** Vite 문서의 라이브러리 모드 절에는 d.ts 생성 기능이 없다. 별도 도구가 필요하다(4절).

출처:
- https://vite.dev/guide/build.html#library-mode
- https://github.com/vitejs/vite/blob/v8.3.5/docs/config/build-options.md (context7 `/vitejs/vite/v8.3.5`)

## 4. 타입 선언 생성 방식

| 방법 | 버전 | 동작 | TS 7과의 관계 |
| --- | --- | --- | --- |
| `vite-plugin-dts` | 5.1.2 | `unplugin-dts@1.1.2`의 Vite용 래퍼다. `bundleTypes` 옵션으로 선언 파일을 하나로 묶을 수 있다(peer: `@microsoft/api-extractor >=7`, 선택). | 의존성에 `@volar/typescript`가 있어 TypeScript 프로그래밍 API를 쓰는 구조다. TS 7.0은 API를 제공하지 않으므로(6절) TS 6 API가 필요할 것으로 **추론**한다. TS 7 지원 여부를 밝힌 공식 문서는 **확인 불가**. |
| `tsdown` (+ `rolldown-plugin-dts`) | tsdown 0.23.7 / rolldown-plugin-dts 0.30.0 | `tsconfig`의 `isolatedDeclarations`가 켜져 있으면 **oxc-transform**으로 d.ts를 만든다(매우 빠름). 꺼져 있으면 TypeScript 컴파일러를 쓴다. | `rolldown-plugin-dts` README의 생성기 표: `tsc`는 TS 5.x/6.x, `oxc`는 `isolatedDeclarations` 호환 코드, `tsgo`는 TS 7.1 이상(실험적, 7.0에서는 CLI로 폴백하며 deprecated). peer `typescript ^5 \|\| ^6 \|\| ~7.0 \|\| ~7.1.0-0`. |
| `tsc` 단독 (`--emitDeclarationOnly`) | TS 7.0.2 | 번들 없이 파일별 d.ts를 낸다. | TS 7의 `tsc` 자체는 CLI로 동작한다. 번들 결과와 경로를 맞추는 일은 직접 해야 한다. |

`isolatedDeclarations`를 켜면 내보내는 선언에 명시적 타입 표기가 필요하다(rolldown-plugin-dts README "Oxc" 절).

출처:
- https://github.com/qmhc/unplugin-dts (README), `npm view vite-plugin-dts dependencies`, `npm view unplugin-dts dependencies`
- https://tsdown.dev/options/dts
- `npm view rolldown-plugin-dts readme`, `npm view rolldown-plugin-dts peerDependencies`

## 5. Tailwind 연동 (근거: Tailwind CSS v4.3 문서, 패키지 4.3.5)

- Vite에서는 `tailwindcss`와 `@tailwindcss/vite`를 설치하고 `plugins: [tailwindcss()]`를 추가한 뒤 CSS에서 `@import "tailwindcss";`를 쓴다. 설정은 CSS 우선(`@theme`)이다.
- **기본 팔레트 교체**: `@theme { --color-*: initial; ... }`로 색 네임스페이스 전체를 비우고 자체 색만 남길 수 있다. `--*: initial`은 테마 전체를 비운다. 간격은 `--spacing` 하나로 숫자 유틸리티(`w-24` 등)를 계산한다. ADR 0002의 "팔레트 교체, 간격 숫자 규칙 유지"와 맞는다.
- **다른 변수 참조**: light/dark처럼 런타임에 바뀌는 CSS 변수를 가리킬 때는 `@theme inline`을 쓰라고 안내한다. 공식 예제는 `:root`와 `[data-theme="dark"]`에 변수를 두고 `@theme inline { --color-canvas: var(--acme-canvas-color); }`로 연결한다.
- **프로젝트 간 테마 공유**: 공식 문서 "Sharing across projects" 절은 `@theme`을 별도 CSS 파일에 두고 `@import`로 가져오라고 하며, "모노레포의 별도 패키지에 두거나 npm에 배포해도 된다"고 적는다.
- **라이브러리 클래스 스캔**: Tailwind는 기본적으로 `.gitignore`에 있는 경로(`node_modules` 포함)를 스캔하지 않는다. Tailwind로 만든 외부 라이브러리는 사용하는 앱이 `@source "../node_modules/@acmecorp/ui-lib";`처럼 명시적으로 등록해야 한다.
- `tailwindcss@4.3.5`의 `exports`에는 `./theme.css`, `./preflight.css`, `./utilities.css`가 따로 있다. 레이어를 골라서 import할 수 있다.
- **oxfmt의 Tailwind 클래스 정렬**: `.oxfmtrc.json`의 `sortTailwindcss`(기본은 꺼짐) 옵션이 `prettier-plugin-tailwindcss`를 대신한다. `stylesheet`, `functions: ["clsx", "cn"]` 같은 옵션이 있다.

출처:
- https://tailwindcss.com/docs/installation/using-vite
- https://tailwindcss.com/docs/theme (Overriding the default theme, Referencing other variables, Sharing across projects)
- https://tailwindcss.com/docs/detecting-classes-in-source-files (Explicitly registering sources)
- https://oxc.rs/docs/guide/usage/formatter/sorting.html

## 6. TypeScript 7 (근거: "Announcing TypeScript 7.0" 공식 블로그, 7.0.2)

- TS 7은 Go로 포팅한 네이티브 컴파일러다. 전체 빌드가 보통 8~12배 빨라진다고 한다.
- **7.0에는 프로그래밍 API가 없다.** 새 API는 7.1에서 나올 예정이다. API가 필요한 도구(예: typescript-eslint)를 위해 `@typescript/typescript6`(실행 파일 `tsc6`, TS 6.0 API를 다시 내보냄)를 함께 설치하는 방법을 안내한다. 예: `"typescript": "npm:@typescript/typescript6@^6.0.2"`와 `"@typescript/native": "npm:typescript@^7.0.2"`를 같이 둔다.
- **MDX 등 임베디드 언어**: 공식 블로그는 "Vue, MDX, Astro, Svelte 등을 쓰는 워크플로는 아직 TS 7을 활용하지 못할 가능성이 높다"며 해당 프로젝트는 당분간 TS 6을 쓰라고 권한다. Volar 같은 언어 서비스가 TS API에 의존하기 때문이다. 이는 에디터·타입체크 이야기다. Storybook이 MDX 문서를 빌드하는 데 TS 7이 영향을 주는지는 **확인 불가**.
- oxlint의 type-aware 린팅(`oxlint-tsgolint`)은 반대로 **TypeScript 7.0 이상이 필요**하다. `baseUrl` 같은 레거시 tsconfig 옵션은 지원하지 않는다.
- `@storybook/react-vite`의 peer는 `typescript >= 4.9.x`라 7도 범위에 들어간다. 다만 react-docgen 등 Storybook 내부 도구가 TS API를 쓰는지는 **확인 불가**.

출처:
- https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- https://oxc.rs/docs/guide/usage/linter/type-aware.html

## 7. Storybook + Vite + Tailwind (근거: Storybook v10.6.5 문서, 패키지 10.6.6)

- Storybook의 기본 빌더는 Vite 빌더다. 빌더는 Storybook 프로젝트 루트의 `vite.config.*`를 자동으로 찾아 병합한다. 공식 문서는 "가능하면 설정을 `vite.config`에 직접 두라"고 권한다. 다른 위치는 `core.builder.options.viteConfigPath`로 지정하고, 추가 조정은 `.storybook/main.ts`의 `viteFinal`(`mergeConfig` 사용)로 한다.
- 따라서 `@tailwindcss/vite`는 해당 앱의 `vite.config`에 넣어 두면 Storybook에도 적용된다(추론: 위 "자동 병합" 설명에 근거. Tailwind v4 전용 Storybook 레시피는 찾지 못했다).
- Tailwind 스타일은 `.storybook/preview.ts`에서 CSS 파일을 import해 모든 스토리에 적용한다. Storybook 공식 Tailwind 레시피는 Vite 사용자라면 PostCSS 설정 단계를 건너뛰어도 된다고 적는다.
- 테마 전환은 `@storybook/addon-themes`가 Tailwind용 가이드를 제공한다(light/dark Theme 확인용).
- **`@storybook/addon-vitest`**: 스토리를 Vitest 브라우저 모드(Playwright) 컴포넌트 테스트로 바꾼다. 요구 사항은 Vite 기반 프레임워크와 Vitest 3.0 이상이다. 기존 Vitest 테스트가 있으면 Vitest 4 이상에서는 `test.projects`로 별도 프로젝트를 두라고 권한다. 테마마다 프로젝트를 만들어 `initialGlobals: { theme }`로 light/dark를 각각 테스트하는 예제도 있다.
- Storybook 10의 Node 요구는 `^22.12.0 || ^24 || >=26`이다.

출처:
- https://storybook.js.org/docs/builders/vite
- https://storybook.js.org/recipes/tailwindcss
- https://github.com/storybookjs/storybook/blob/v10.6.5/code/addons/themes/docs/getting-started/tailwind.md (context7 `/storybookjs/storybook/v10.6.5`)
- https://storybook.js.org/docs/writing-tests/integrations/vitest-addon

## 8. Vitest projects 설정 (근거: Vitest v5.0.3 문서, 패키지 5.1.0)

- `test.workspace`는 `test.projects`로 바뀌었다(마이그레이션 문서). 별도 `vitest.workspace.ts` 파일은 Vitest 3.2 미만 방식이다.
- 루트 `vitest.config.ts`에서 `test: { projects: ['packages/*'] }`처럼 glob을 쓰면 각 폴더를 프로젝트로 본다. 설정 파일이 없어도 된다. 파일을 가리키는 경우 이름이 `vitest.config.*`, `vite.config.*`, `vitest.<name>.config.*` 규칙을 따라야 한다.
- **Vitest 5 변경점**: 인라인으로 정의한 프로젝트는 `extends`의 기본값이 `true`가 되어, 루트 설정(`plugins`, `resolve.alias` 포함)을 상속한다. 배열 옵션(`setupFiles` 등)은 덮어쓰지 않고 합친다. 파일·디렉터리로 참조한 프로젝트는 상속하지 않는다. 예전 동작이 필요하면 `extends: false`를 쓴다.
- 브라우저 모드는 `@vitest/browser-playwright`의 `playwright()` provider와 `instances: [{ browser: 'chromium' }]`로 설정한다. Node(unit) 프로젝트와 browser 프로젝트를 나란히 둘 수 있다.

출처:
- https://github.com/vitest-dev/vitest/blob/v5.0.3/docs/guide/projects.md
- https://github.com/vitest-dev/vitest/blob/v5.0.3/docs/guide/migration/index.md
- https://github.com/vitest-dev/vitest/blob/v5.0.3/docs/guide/browser/index.md
- (모두 context7 `/vitest-dev/vitest/v5.0.3`)

## 9. oxlint / oxfmt 성숙도

### oxlint (1.92.0)
- 2025-06에 v1.0 stable을 발표했다. 1.x 계열이다.
- 기본 규칙 872개, 자동 수정, multi-file 분석(`import/no-cycle` 등)을 지원한다. type-aware 린팅은 `oxlint-tsgolint`로 하며 TS 7.0 이상이 필요하다. ESLint 플러그인 호환용 JS plugins는 **alpha**다.

### oxfmt (0.77.0)
- 2025-12 alpha, 2026-02 **beta**를 발표했다. beta 발표 글 기준으로 Prettier의 JS/TS conformance 테스트를 100% 통과한다. Tailwind 클래스 정렬과 import 정렬이 내장되어 있고, JS/TS 외에 JSON, YAML, CSS, Markdown, **MDX** 등도 포맷한다.
- beta 글에 적힌 stable까지 남은 일: Prettier 플러그인 지원, xxx-in-js 포맷 개선, 안정성, 성능.
- 현재 포맷터 문서는 "Prettier v3.9.9와 다수 설정에서 호환"되며 기본 `printWidth`가 100(Prettier는 80)이라고 적는다. 예상과 다른 차이는 버그로 다룬다. Prettier 플러그인은 지원하지 않는다(인기 플러그인 일부는 네이티브로 구현했다). `oxfmt --migrate prettier`로 설정을 옮길 수 있다.
- npm 버전은 아직 0.x이다. 2026-02 beta 이후 **stable(1.0) 발표가 있었는지는 확인 불가**다. oxc.rs 블로그 목록은 클라이언트 렌더링이라 전체 목록을 읽지 못했고, 검색에서도 stable 글은 나오지 않았다.
- `@changesets/cli` 3의 `format` 옵션이 `"oxfmt"`를 지원한다(10절).

출처:
- https://oxc.rs/docs/guide/usage/linter.html, https://oxc.rs/blog/2025-06-10-oxlint-stable
- https://oxc.rs/docs/guide/usage/formatter.html
- https://oxc.rs/docs/guide/usage/formatter/migrate-from-prettier.html
- https://oxc.rs/blog/2025-12-01-oxfmt-alpha, https://oxc.rs/blog/2026-02-24-oxfmt-beta

## 10. pnpm workspace와 패키지 배포 (근거: pnpm 공식 문서, 12.18.0)

- `pnpm-workspace.yaml`의 `packages`로 워크스페이스를 선언한다.
- `workspace:` 프로토콜: `pnpm pack`·`pnpm publish` 때 실제 버전으로 바뀐다(`workspace:^` → `^1.5.0`, `workspace:*` → `1.5.0`).
- **catalog**: `pnpm-workspace.yaml`의 `catalog:`(이름 있는 catalog도 가능)에 버전 범위를 한 번만 적고, 각 `package.json`에서 `"react": "catalog:"`로 참조한다. `dependencies`, `devDependencies`, **`peerDependencies`**에서 쓸 수 있고 publish 때 실제 범위로 바뀐다. v12.2.0부터 catalog 항목에 `workspace:^`를 넣을 수 있다.

출처:
- https://pnpm.io/workspaces
- https://pnpm.io/catalogs

## 11. 릴리스 도구: changesets (근거: `@changesets/cli` CHANGELOG, 3.0.3)

- 3.0.0이 정식으로 나와 있다(현재 3.0.3, 2026-09-14). v2는 `maintenance-v2` 태그(2.31.1)로 유지보수 중이다.
- 3.0.0의 주요 breaking change:
  - Node `^22.11 || ^24 || >=26`, pnpm `>=10.0.0` 이상을 요구한다. 패키지를 ES module로 배포한다.
  - `changeset tag`를 `changeset git-tag`로 이름을 바꿨다.
  - `.changeset/config.json`의 `prettier` 옵션을 없애고 `format`을 새로 뒀다(`"auto"`, `"prettier"`, `"oxfmt"`, `"deno"`, `"dprint"`, `false`).
  - private 패키지는 기본적으로 버전을 올리지 않는다. Yarn Classic 지원을 없앴다.
  - peer dependency가 바뀌면 그 패키지에 의존하는 패키지도 버전이 올라간다(#2090).
- 3.0.0에 새로 생긴 것: `changeset pack`, `changeset publish --from-pack-dir`, `changeset publish-plan`, `--major/--minor/--patch` 플래그, 의존 관계 순서로 묶어 publish.
- changesets 외 릴리스 도구(release-please, semantic-release 등)는 이번 조사 범위에서 비교하지 않았다.

출처: https://github.com/changesets/changesets/blob/main/packages/cli/CHANGELOG.md

## 12. 확인하지 못한 것

- oxfmt stable(1.0) 발표 여부.
- `vite-plugin-dts` 5.x가 TypeScript 7.0만 설치된 환경에서 동작하는지(구조상 TS API가 필요할 것으로 추론만 했다).
- Storybook 10 내부(react-docgen, MDX 컴파일)가 TS 7.0과 함께 문제없이 동작하는지.
- Tailwind v4 전용 Storybook 공식 레시피(공식 레시피는 일반 Vite·PostCSS 기준이다).

## Tide에 주는 시사점

결정은 하지 않는다. 이후 티켓에서 판단할 거리만 정리한다.

1. **TypeScript 7과 6 중 무엇을 쓸지가 다른 선택을 좌우한다.** oxlint type-aware 린팅은 TS 7을 요구한다. 반면 d.ts 플러그인(vite-plugin-dts)과 MDX 에디터 지원은 TS 6 API에 기대고 있다. 공식 블로그가 안내한 TS 6/7 병행 설치(`@typescript/typescript6` 별칭)도 선택지다. TS 7.1(현재 beta)이 나오면 API 문제가 풀릴 가능성이 있다.
2. **d.ts 생성 도구를 따로 골라야 한다.** Vite 라이브러리 모드는 d.ts를 만들지 않는다. 후보는 `vite-plugin-dts`, tsdown(oxc + `isolatedDeclarations`), `tsc` 단독이다. Token 패키지는 프레임워크와 무관해서 Vite 공식 문서가 권하는 tsdown 쪽 사용 사례와도 맞을 수 있다. `isolatedDeclarations`를 켜면 내보내는 API에 명시적 타입이 필요하고, 이는 Component 공통 API 규칙에도 영향을 준다.
3. **Tailwind theme 노출은 공식이 안내하는 "공유 CSS 파일" 방식이 ADR 0002와 잘 맞는다.** Token 패키지가 `@theme`(색 네임스페이스는 `initial`로 비움, `--spacing`은 유지) CSS를 배포하고, light/dark는 `@theme inline`에서 CSS 변수를 참조하는 형태가 가능하다. 사용하는 앱은 `@source`로 Tide Component 패키지를 스캔해야 한다. 설치 안내 문서에 이 내용이 꼭 들어가야 한다.
4. **CSS export 형태를 정해야 한다.** Vite 라이브러리 모드는 CSS를 파일 하나로 묶고 `exports`의 `./style.css` 형태로 노출한다. 다만 Tide Component가 Tailwind 유틸리티를 쓰고 앱이 Tailwind를 peer로 가진다면, 미리 빌드한 CSS를 낼지 앱의 Tailwind가 소스를 스캔하게 할지 선택해야 한다.
5. **Storybook과 테스트는 하나의 Vite 설정 축으로 묶을 수 있다.** Storybook은 `vite.config`를 자동 병합하고, `@storybook/addon-vitest`는 Vitest `projects`에 browser 프로젝트로 붙는다. light/dark 테마별 프로젝트 예제가 있어 "테스트 전략" 티켓에 바로 쓸 수 있다. Vitest 5는 인라인 프로젝트가 루트 설정을 상속하는 것이 기본이라 설정이 단순해진다.
6. **oxfmt는 beta(0.x)다.** Tailwind 클래스 정렬과 MDX 포맷을 지원하고 changesets 3도 `format: "oxfmt"`를 지원해 Tide 스택과 잘 맞는다. 다만 1.0 전이므로 버전을 고정하는 정책을 고려할 만하다.
7. **기준선**: Node 22.12 이상, pnpm 10 이상(최신 12), Vite 8(rolldown 기반이라 `rolldownOptions`를 쓴다). 공통 버전은 pnpm `catalog:`로 한 곳에서 관리할 수 있고, `peerDependencies`에도 쓸 수 있다.
8. **릴리스**: changesets 3이 정식이다. pnpm `workspace:`·`catalog:` 치환, peer 변경 시 의존 패키지 버전 상승, private 패키지(Storybook 앱) 기본 제외가 Tide 구성(Token, Component, 문서 앱)과 맞는다. "버전과 배포 정책" 티켓의 출발점으로 쓸 수 있다.
