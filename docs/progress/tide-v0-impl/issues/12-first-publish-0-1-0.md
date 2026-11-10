# 12: 0.1.0 첫 publish

Status: done
Blocked by: 05 (타이포그래피 Foundation과 Typography), 09 (Spinner), 10 (문서: 시작하기·원칙·기준), 11 (릴리스 파이프라인), 38 (`@tide-tds/desktop`을 `@tide-tds/components`로 바꾸기)

## What to build

1단계(Foundation 전체, 아이콘, VisuallyHidden·Typography·Spinner)를 0.1.0으로 npm에 처음 공개하고 문서 사이트를 처음 배포한다. npm trusted publisher는 패키지가 존재해야 설정할 수 있으므로 첫 publish는 메인테이너가 로컬에서 2FA로 한다.

## 수용 기준

- [x] 1단계 티켓(01~11)이 모두 `done`이다.
- [x] 세 패키지(`@tide-tds/foundation`, `@tide-tds/icons`, `@tide-tds/components`)를 0.1.0으로 로컬에서 2FA로 publish한다.
- [x] 세 패키지 모두 `access: public`이고 패키지 2FA 설정이 되어 있음을 확인한다.
- [x] components가 foundation·icons를 정확한 버전(0.1.0)으로 의존함을 npm에서 확인한다.
- [x] 새 Next 앱에 npm에서 설치해 설치 페이지 절차대로 동작함을 확인한다.
- [x] `tide-tds.lakegreen.net`에 문서를 첫 배포하고, 문서가 0.1.0을 설명한다.
- [x] trusted publisher는 아직 설정하지 않는다(18에서 다음 CI 릴리스 직전에 한다).

## Comments

- 2026-11-10 진행 기록(남은 것: 새 Next 앱 설치 확인 1건. 끝나면 `done`).
  - Version PR #1(0.0.0 → 0.1.0)을 머지하고, 로컬 main(86f6c9b)에서 `pnpm changeset publish`로 세 패키지 0.1.0을 publish했다. 세 패키지 모두 `public`, components는 foundation·icons를 `0.1.0` 정확한 버전으로 의존한다. 패키지 Publishing access는 「Require two-factor authentication and disallow bypass 2fa tokens」로 두었다.
  - 패키지별 git tag 3개를 push하고 GitHub Release `v0.1.0`을 만들었다(`scripts/release-notes.ts`로 본문 생성).
  - 문서: Dokploy 프로젝트 `tide-tds`에 앱 `docs`(id `osp8mxKB1MJ2n-9mh1P4e`)를 만들었다. GitHub App `Dokploy-2026-04-15-kfhynj`에 이 저장소 접근을 추가, 브랜치 `main`, Dockerfile `apps/docs/Dockerfile`, context `.`, Autodeploy 끔, 도메인 `tide-tds.lakegreen.net`(포트 80, HTTPS Let's Encrypt). 저장소 수준 variable `DOKPLOY_URL`·`DOKPLOY_APPLICATION_ID`, secret `DOKPLOY_API_KEY`(Environment `docs`가 아닌 저장소 수준에 두었고 docs job에서 읽힌다). Release workflow 수동 실행으로 첫 배포했고 사이트가 200으로 열린다.
  - publish에서 겪은 것(다음 사람용):
    - Claude Code의 `!` 실행은 비대화형이라 2FA를 받지 못한다(`ERR_PNPM_OTP_NON_INTERACTIVE`). 별도 터미널에서 실행하거나 `--otp`를 넘긴다. npm 로그인이 먼저 필요하다(`npm whoami`).
    - npm 웹 2FA 화면의 「Do not challenge npm publish … for the next 5 minutes」를 켜면 세 패키지를 한 번 인증으로 올린다.
    - 새 패키지는 npm이 placeholder `0.0.0-stage`를 먼저 공개하고, 실제 버전은 레지스트리 반영에 몇 분 걸린다(icons가 가장 늦었다). Staged Packages 승인은 필요 없었다.
    - Version PR 머지 뒤 Release workflow의 Playwright 설치 단계가 30분 가까이 멈춰 취소 후 재실행했다(재실행은 정상). 단계에 `timeout-minutes`를 두는 것을 검토한다.
    - GitHub Actions가 PR을 만들려면 저장소 설정 「Allow GitHub Actions to create and approve pull requests」가 켜져 있어야 한다(2026-11-10 켬).
- 2026-11-10 새 Next 앱 설치 확인(Next 16.4.5 Turbopack, Tailwind 4.3.5, React 19.3.0, pnpm 12): 설치 페이지 절차(components 설치, CSS 두 줄, layout, `cn`·VisuallyHidden)로 `next build`·`tsc --noEmit`·`next start`가 통과했다. Typography·Spinner·아이콘·`data-theme`도 HTML과 CSS에서 확인했다. Tailwind 기본 팔레트는 0개이고 foundation은 한 벌이다. 이로써 `done`.
  - 어긋난 점 1: pnpm에서는 components만 설치하면 `@tide-tds/icons`를 import할 수 없다(`Module not found: Can't resolve '@tide-tds/icons'`). 문서의 "같은 버전으로 직접 설치" 명령을 실행하면 통과한다. 문서 수정은 39로 넘긴다.
  - 어긋난 점 2: create-next-app 16.4 기본값은 `postcss.config.mjs` 대신 `@tailwindcss/turbopack`(`next.config.ts`의 `turbopack.rules`)을 쓴다. 동작은 정상이지만 "준비" 절이 `@tailwindcss/postcss`를 필수처럼 쓴다. 39에서 고친다.
