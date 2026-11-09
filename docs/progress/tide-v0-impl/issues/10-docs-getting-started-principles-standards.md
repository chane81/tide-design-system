# 10: 문서: 시작하기·원칙·기준

Status: done
Blocked by: 03 (Storybook과 브라우저 테스트 골격)

## What to build

앱 개발자가 Storybook 사이드바 맨 위의 「시작하기」를 따라 Next.js App Router 앱에 Tide를 설치하고, 폰트를 로드하고, Theme 전환을 붙인다. 원칙과 기준 문서는 저장소의 원문 그대로 Storybook에서 읽는다.

## 수용 기준

- [x] 사이드바 순서: 시작하기(설치, 폰트 로드, Theme 전환) → 원칙 → 기준 → Foundation → Component(이름순). v0는 한글만 쓴다.
- [x] 설치 페이지: `@tide-tds/desktop` 하나 설치, 앱 CSS 두 줄(`@import "tailwindcss"`와 Tide CSS), `transpilePackages` 불필요, 세 패키지를 같은 버전으로 두라는 안내, Tailwind 없이 tokens CSS만 쓰는 방법.
- [x] 폰트 로드 페이지: `next/font/local`과 CDN 동적 subset 예시.
- [x] Theme 전환 페이지: `data-theme` 속성 하나로 전환, 요소 단위 Theme, OS 다크 모드를 따를지는 앱이 정한다는 것, 전환 순간 transition 끄는 방법. ThemeProvider는 배포하지 않는다.
- [x] 원칙과 기준은 저장소의 `.md` 원문을 Markdown 블록으로 불러오고, 상대 링크를 Storybook 경로로 바꾼다. 원문을 고치면 문서에 반영된다.
- [x] 새 페이지가 `storybook` project 검사를 통과한다.

## Comments

- 2026-11-10 완료(브랜치 `ticket/10-docs-getting-started`).
  - **페이지**: `apps/docs/src/getting-started/`(설치 `Installation.mdx`, 폰트 로드 `FontLoading.mdx`, Theme 전환 `ThemeSwitching.mdx`), `src/principles/Principles.mdx`(`원칙/Tide 원칙`), `src/standards/Accessibility.mdx`(`기준/접근성`). 원문 불러오기는 `src/docs-blocks/`(`links.ts`, `RepoMarkdown.tsx`, `DocsAnchor.tsx`).
  - **사이드바 순서**: `parameters.options.storySort`의 `order: ["시작하기", ["설치", "폰트 로드", "Theme 전환"], "원칙", "기준", "Foundation", "Component"]`(storybook 10.6.6, context7 `/storybookjs/storybook/v10.6.5` `api/parameters.mdx`). 문서는 method 기본값을 `alphabetical`이라고 적지만 설치본 preview runtime의 `storySort`는 `options.method || "configure"`라서 `method: "alphabetical"`, `locales: "ko"`를 명시했다(Component 이름순). 최상위 단일 페이지(`원칙`)는 manager가 orphan으로 보고 그룹보다 위에 그려서(설치본 manager runtime `orphanIds`) `원칙/Tide 원칙`으로 그룹 아래에 두었다. 빌드한 사이드바 순서를 Playwright로 확인: 시작하기(설치, 폰트 로드, Theme 전환) → 원칙 → 기준 → Component.
  - **원문 불러오기**: `import source from "…/README.md?raw"`와 `<Markdown>`(addon-docs 10.6.6, context7 `api/doc-blocks/doc-block-markdown.mdx`). 설치본 `Markdown`은 `options`를 펼칠 때 `overrides`를 통째로 덮어쓰므로 기본 override(`CodeOrSourceMdx`, `HeadersMdx`)를 함께 넣고 `a`만 바꿨다. 상대 링크는 불러올 때만 바꾼다(원문은 GitHub에서도 맞게 둔다): Storybook에 실은 문서는 `?path=/docs/<id>`(context7 `writing-docs/mdx.mdx` "Linking to other stories and pages"), 나머지(ADR, GLOSSARY, progress 티켓)는 `https://github.com/chane81/tide-design-system/blob|tree/main/…`. `../standards/` 폴더 링크는 지금 기준이 하나뿐이라 `기준/접근성`으로 보낸다. 제목 id는 `slugify` 옵션으로 GitHub 규칙과 같게 만들어 원문의 앵커(`#-접근성이-…`)가 그대로 맞는다.
  - **외부 링크**: 문서는 preview iframe 안이라 GitHub 같은 사이트가 같은 탭으로 열리지 않는다. `DocsAnchor`가 `https?://`만 `target="_blank"`로 열고 나머지는 `AnchorMdx`(`?path=`는 channel `NAVIGATE_URL`, `#`은 페이지 안 이동)에 맡긴다. MDX의 Markdown 문법 링크에도 `parameters.docs.components.a`로 적용했다(설치본 DocsRenderer가 `defaultComponents`와 병합). 이 parameter는 공식 문서상 "officially supported는 아님"이다.
  - **원문 반영**: dev 서버에서 `docs/principles/README.md`를 고치면 페이지가 새로고침 없이 바뀌는 것을 Playwright로 확인했다(파일은 되돌림). turbo 캐시가 원문 변경을 놓치지 않게 `apps/docs/turbo.json`의 build·test `inputs`에 `$TURBO_ROOT$/docs/principles/**`, `$TURBO_ROOT$/docs/standards/**`를 넣었고, 원문만 고친 PR도 `--affected`에 잡히도록 루트 `futureFlags.affectedUsingTaskInputs`를 켰다(turbo 2.11.10, context7 `/vercel/turborepo/v2.11.10` `reference/configuration.mdx`, `package-configurations.mdx`). `docs/standards/accessibility.md`만 바꾸고 `--affected --dry`를 돌리면 `@tide-tds/docs#build`, `#test`가 선택되는 것을 확인했다.
  - **검사**: docs 앱에 Node `unit` project를 더했다(`src/**/*.test.ts`). 링크 변환·slug 단위 테스트와, 실제 원문 두 개를 바꾼 결과에 상대 링크가 남지 않고 GitHub로 보낸 저장소 경로가 실제로 있는지를 검사한다. `storybook` project는 MDX를 색인하므로 MDX 문법 오류는 실패로 잡힌다(일부러 깨뜨려 `MultipleIndexingError`로 실패하는 것을 확인 후 되돌림). 다만 story가 없는 글 페이지는 렌더·axe 검사 대상이 아니라서, 빌드 결과를 Playwright로 열어 다섯 페이지를 light/dark에서 axe(WCAG 2.0~2.2 AA 태그, axe-core 4.14.0)로 검사했고 위반은 없었다. 원칙 → 기준 링크 클릭 이동, 기준 → 원칙 앵커 링크 이동과 스크롤도 확인했다.
  - **설치 페이지 근거**: 앱 CSS 두 줄과 서버 컴포넌트 import는 티켓 02 smoke 템플릿(`apps/smoke-next/template`)과 같다. tarball 설치 → `next build`(Next 16.4.5) → tsc bundler·nodenext가 `transpilePackages` 없이 통과한다(이번 검증에서도 smoke 통과). 빌드 도구 이름은 적지 않았다(티켓 36). 「세 패키지 같은 버전」은 tide-v0 티켓 30의 fixed 결정을 따랐다. `@tide-tds/icons`가 desktop 의존성으로 함께 설치된다는 문장은 spec 기준이고, 실제 연결은 티켓 08에서 한다.
  - **폰트 로드 근거**: `next/font/local`의 `src`(호출 파일 기준 상대 경로), `weight`(가변 글꼴은 범위 문자열), `display`, `variable`(context7 `/vercel/next.js/v16.4.5` `api-reference/02-components/font.mdx`). next/font/local은 `declarations`에 font-family가 없으면 `@font-face`의 이름을 loader 변수 이름으로 넣고, postcss 단계에서 모든 `@font-face`를 그 이름 하나로 맞춘다(설치본 `@next/font/dist/local/loader.js`, `next-font-loader/postcss-next-font.js`). 그래서 Tide 스택의 `"Pretendard Variable"`로는 맞지 않아, 앱 CSS에서 `--tide-font-sans`의 맨 앞에 `var(--font-pretendard)`를 넣게 했다. CDN 예시는 Pretendard v1.3.9(최신 릴리스) jsDelivr 가변 동적 subset CSS이고, 이 CSS의 `@font-face` 92개가 모두 `font-family: 'Pretendard Variable'`, `font-weight: 45 920`인 것과 `PretendardVariable.woff2`(2,057,688 bytes) 경로를 직접 확인했다. 스택은 Pretendard README의 "어디서든 동일한 환경" 구성(이모지 글꼴 3개 포함)이다.
    - **05에서 확인할 것**: `--tide-font-sans`는 공개 계약 규칙(`--tide-<Utility class 이름>`, `font-sans`)으로 정한 이름이고 아직 foundation에 없다. 05에서 이름이나 스택이 달라지면 이 페이지를 함께 고친다. `:root`에서 덮어쓴 값이 이기는지도 05 구현 후 확인한다. 예시를 실제 Next 앱에서 돌려 보지는 않았다(글꼴 파일을 저장소에 둘 수 없어서). `declarations`로 font-family를 `Pretendard Variable`로 고정하는 방법도 있어 보이지만 postcss 단계의 이름 처리를 확인하지 못해 쓰지 않았다.
  - **Theme 전환 근거**: 인라인 스크립트 + `suppressHydrationWarning`은 Next.js 16.4.5 가이드 `preventing-flash-before-hydration.mdx`(context7)의 패턴에 OS 설정 fallback(`matchMedia`)을 더한 것이다. transition 끄기 함수는 문서 앱 preview의 `applyTheme`(티켓 03에서 Playwright로 확인)과 같은 방식이다. dark Token은 아직 없어서(04) 요소 단위 Theme 예시의 `bg-canvas`, `text-default`는 spec 이름을 따랐다.
  - **범위 밖으로 둔 것**: tide-v0 티켓 26의 「원칙별 Do/Don't Canvas를 MDX에서 덧붙인다」는 이 티켓의 수용 기준에 없어 하지 않았다.
  - **의존성**: 추가 없음(pnpm-lock.yaml 변경 없음). `minimumReleaseAge` 정책은 그대로다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `pnpm --filter @tide-tds/docs build`, `TURBO_SCM_BASE=main pnpm turbo run typecheck test build smoke --affected`(12개 태스크, 루트 turbo.json 변경으로 전체 선택) 통과. docs는 unit 9 tests + storybook 4 stories.
