# 01: 저장소 골격

Status: done
Blocked by: 없음 (바로 시작 가능)

## What to build

메인테이너와 에이전트가 패키지를 추가하기 전에, 빈 패키지만으로 install·typecheck·lint·format이 돌고 PR CI가 통과하는 모노레포를 만든다. 이후 모든 티켓은 이 골격 위에서 같은 명령, 같은 버전 규칙으로 작업한다.

## 수용 기준

- [x] pnpm workspace 위에 Turborepo를 쓴다. 배포 패키지 3개(`@tide-tds/foundation`, `@tide-tds/icons`, `@tide-tds/desktop`)와 private 앱 2개(Storybook 문서 앱, Next.js smoke 앱)의 자리가 빈 패키지로 있다.
- [x] 별도의 설정 패키지나 utils 패키지는 두지 않는다.
- [x] 의존성 버전은 pnpm 기본 catalog 하나로 관리하고 `catalogMode: strict`로 둔다. peer 범위와 내부 패키지는 catalog에 넣지 않는다. 0.x인 oxfmt만 정확한 버전으로 고정한다.
- [x] turbo 태스크는 `build`, `typecheck`, `test`, `smoke`, `dev` 다섯 개이고, `dev`를 뺀 나머지는 모두 `^build`에 의존한다.
- [x] TypeScript 7.0.2 하나만 쓴다. 공통 tsconfig에서 `erasableSyntaxOnly`, `isolatedDeclarations`, `verbatimModuleSyntax`, `rewriteRelativeImportExtensions`를 켠다.
- [x] 출력은 ESM 전용이다. 배포 패키지에는 `engines`를 두지 않는다.
- [x] 저장소는 Node 26과 pnpm 12.18.0으로 고정한다.
- [x] oxlint와 oxfmt를 루트에서 저장소 전체에 한 번에 돌린다. type-aware 린팅은 쓰지 않는다.
- [x] PR CI가 `turbo run typecheck test build smoke --affected`와 lint·format 검사를 돌리고, 빈 패키지 상태에서 통과한다. `.turbo` 캐시는 GitHub Actions cache에 둔다(원격 캐시·nightly 없음).
- [x] 쓴 도구(pnpm catalog, turbo, tsconfig 옵션, oxlint, oxfmt)의 설정은 설치 버전 문서로 확인하고 근거 버전을 Comments에 남긴다.

## Comments

- 2026-11-10 완료(브랜치 `ticket/01-repo-skeleton`).
  - 버전(npm, 2026-11-10): pnpm 12.18.0, turbo 2.11.10, typescript 7.0.2, oxlint 1.93.0, oxfmt 0.78.0. Node는 `.node-version`의 26.
  - pnpm 고정: 루트 `packageManager: pnpm@12.18.0`. pnpm 12는 실행 중인 버전이 다르면 선언된 버전을 내려받아 실행한다(`pmOnFail` 기본값 `download`, context7 `/pnpm/pnpm/v12.15.0` `settings/cli.md`). 로컬 12.11.2로 install했을 때 12.18.0으로 전환되었고, lockfile에 `packageManagerDependencies`가 기록되었다. Node 26에는 corepack이 없어서 이 방식이 맞다.
  - `catalogMode: strict` 확인: catalog 밖 버전을 `pnpm add`하면 `ERR_PNPM_CATALOG_VERSION_MISMATCH`로 거부된다.
  - turbo: 태스크 5개 키 이름은 turbo 2.11.10 문서 기준. CI의 `actions/checkout`은 base 브랜치를 원격 ref로만 가져오므로 `futureFlags.githubActionsRemoteBaseRefFallback: true`를 켰다(context7 `/vercel/turborepo/v2.11.10` `reference/configuration.mdx`). `.turbo`는 `actions/cache`로 캐시한다(같은 문서의 GitHub Actions 가이드).
  - CI 액션: `actions/checkout@v7`, `pnpm/action-setup@v6`(version 생략 시 `packageManager`를 읽음, context7 `/pnpm/action-setup`), `actions/setup-node@v7`, `actions/cache@v6`. 각 저장소의 최신 릴리스 태그로 확인했다.
  - oxlint: `.oxlintrc.json`, `correctness` 카테고리를 error로, `--deny-warnings`로 경고도 실패. oxfmt: `.oxfmtrc.json`에 `ignorePatterns`. 설정 형식은 context7 `/websites/oxc_rs` 기준.
  - oxfmt를 처음 돌리면서 기존 문서 30개의 Markdown 표 구분선 정렬과 코드 블록 따옴표가 바뀌었다. 공백과 따옴표 외의 내용 변경은 없음을 `git diff -w`로 확인하고 별도 커밋으로 분리했다. 이후 문서를 고치면 `pnpm format`을 돌린다.
  - 빈 패키지는 `src/index.ts`(`export {}`)만 두고 `typecheck`(`tsc --noEmit`)만 정의했다. tsconfig 공통 옵션은 TS 7.0.2 `tsc`가 오류 없이 받아들였다.
  - 로컬 검증: `pnpm lint`, `pnpm format:check`, `TURBO_SCM_BASE=main pnpm turbo run typecheck test build smoke --affected` 모두 통과. GitHub에서의 실제 PR CI 실행은 첫 PR에서 확인해야 한다.
