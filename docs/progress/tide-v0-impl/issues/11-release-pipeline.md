# 11: 릴리스 파이프라인

Status: done
Blocked by: 02 (Token에서 Next 앱까지 관통), 08 (아이콘 패키지)

## What to build

메인테이너가 PR에 changeset만 넣으면 Version PR이 자동으로 관리되고, 그 PR을 머지하면 전체 검사 → npm publish(OIDC) → 문서 배포가 이어진다. changeset을 빠뜨리거나 아이콘 이름표 키를 지우면서 minor를 안 쓰면 CI가 막는다. 첫 publish(12)와 trusted publisher 설정(18)은 사람이 하므로, 이 티켓은 그 전까지 동작할 수 있는 상태로 만든다.

## 수용 기준

- [x] changesets 3 + `changesets/action`(Version PR) + `@changesets/changelog-github`. 세 패키지를 `fixed`로 묶는다. CHANGELOG는 한글로 쓴다.
- [x] 0.x 동안 `major` changeset을 쓰지 않는다는 규칙과 breaking/patch 기준(spec 릴리스 절)을 기여 문서에 둔다.
- [x] `packages/*`를 바꾼 PR에 changeset이 없으면 CI가 실패한다. 문서·설정만 바꾼 PR은 empty changeset으로 통과한다.
- [x] 아이콘 이름표에서 키가 빠졌는데 minor changeset이 없으면 CI가 실패한다(`unit` 또는 CI 검사).
- [x] 릴리스 workflow: Version PR 머지 → 전체 `typecheck test build smoke` → publish(OIDC). `id-token: write`는 publish job에만 준다. provenance가 붙는다.
- [x] tag는 패키지마다 만들고 GitHub Release는 릴리스당 하나로 합친다. prerelease dist-tag는 쓰지 않는다.
- [x] 문서 배포: Dockerfile(pnpm build → nginx)과 Dokploy API 호출 단계. 실제로 publish되었을 때만 실행하고, 실패해도 npm 릴리스는 되돌리지 않는다. Dokploy Autodeploy는 끈 상태를 전제로 한다(설정은 사람이 확인).
- [x] 필요한 secret 이름과 사람이 할 설정을 Comments에 정리한다.
- [x] changesets, GitHub Actions, npm OIDC 관련 API는 설치·현재 버전 문서로 확인하고 근거 버전을 남긴다.

## Comments

- 2026-11-10 완료(브랜치 `ticket/11-release-pipeline`).
  - **API 근거 버전**: context7은 `/changesets/changesets`, `/changesets/action`을 찾았지만 버전 구분이 없어 v3·v2 문서인지 확인할 수 없었다. 그래서 1차 자료를 직접 봤다.
    - `@changesets/cli` 3.0.3, `@changesets/changelog-github` 1.0.1: 설치본(README, `dist`의 status·publish·pack·git-tag 구현, `@changesets/types` 7.0.0 `Config`, `@changesets/config` 4.0.1 `schema.json`, `@changesets/apply-release-plan` 8.1.1의 CHANGELOG 제목 생성).
    - `changesets/action` v2.1.2(2026-09-07, 최신): tag의 `action.yml`, README, 하위 액션 `select-mode`·`version`·`pack`·`publish`의 `action.yml`·README·`src`. v2는 Changesets v3 전용이다.
    - changesets.dev 「Automating Changesets」(2026-11-10 조회): Trusted Publishing 예시(select-mode → version / pack → publish, `id-token: write`는 publish job에만, `persist-credentials: false`, `package-manager-cache: false`), 「Blocking」(`changeset status --since main`, `changeset --empty`), Version PR 건너뛰기 조건.
    - npm 「Trusted publishing for npm packages」(docs.npmjs.com, 2026-11-10 조회): 설정 항목(org/user, repository, workflow 파일 이름, environment, 허용 동작), `repository.url` 일치 요구, 공개 저장소·공개 패키지에서 provenance 자동 생성, 새 설정은 2일 안에 첫 publish로 검증.
    - pnpm 12.18.0: `pnpm publish` 문서(trusted publishing에서 provenance를 스스로 붙임)와 설치본 CHANGELOG(OIDC trusted publishing, `NPM_ID_TOKEN` 처리). changesets 3.0.3은 pnpm 저장소에서 `pnpm publish <tarball> --access <access> --tag <tag> --no-git-checks`를 부른다(설치본 `getPublishPlan.mjs`).
    - GitHub Actions: `actions/checkout` v7(`persist-credentials`, `fetch-depth`), `actions/setup-node` v7(`node-version-file`, `package-manager-cache`), `pnpm/action-setup` v6(`cache` 기본 false)의 `action.yml`. 기존 ci.yml처럼 major tag로 고정했다(SHA 고정 아님). `gh` 2.102.0 `release create --help`.
    - Dokploy API(docs.dokploy.com 「Dokploy API」, 「Application」 reference): `POST /api/application.deploy`, 헤더 `x-api-key`, 본문 `{ "applicationId" }`.
    - Docker 이미지: Docker Hub tag 목록에서 `node:26-slim`, `nginx:1.30-alpine`(stable) 확인. Node 26에는 corepack이 없다(로컬 Node 26.12.1에서 `corepack` 없음).
  - **구성**
    - `.changeset/config.json`: `fixed: [["@tide-tds/*"]]`, `access: "public"`, changelog `@changesets/changelog-github`(`repo: chane81/tide-design-system`), `format: "oxfmt"`. private 앱(docs, smoke-next)은 3.0의 기본값대로 버전을 올리지 않는다(실험으로 확인).
    - **한글 CHANGELOG**: 요약은 기여자가 한글로 쓴다(CONTRIBUTING.md). 도구가 넣는 영어 문구는 `pnpm release:version`(= `changeset version && node scripts/changelog-ko.ts`)이 맨 위 항목에서만 바꾼다. 제목 `### Minor Changes`는 apply-release-plan이 고정으로 넣고 설정이 없어서 후처리했다. 0.x에서는 「호환되지 않는 변경 (minor)」, 「기능 추가와 수정 (patch)」이고, changesets/action이 Version PR 본문을 만들 때 제목의 major/minor/patch 낱말로 수준을 읽으므로(v2.1.2 `getChangelogEntry`) 괄호에 남겼다. `No changes in this release.`(fixed 때문에 버전만 오른 패키지) → 「변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.」(ADR 0008 Consequences), `Updated dependencies` → 「의존성 업데이트」, `Thanks [@user]!`는 작성자 링크만 남긴다. changelog-github의 `template` 옵션은 실험 기능이라 쓰지 않았다.
    - **changeset 검사**(`scripts/check-changesets.ts`, ci.yml 한 단계, `changeset-release/*` 브랜치는 건너뜀): ① `changeset status --since origin/<base>`가 실패하면 실패. 배포 패키지가 바뀌었는데 새 changeset이 없을 때다. private 앱·문서·루트 설정만 바뀌면 통과하고, empty changeset도 changeset으로 센다. ② 배포 패키지가 0.x인 동안 `major` changeset이면 실패(기여 문서의 규칙을 CI로도 막음). ③ merge-base의 이름표와 현재 이름표를 비교해 빠진 키(삭제와 이름 바꾸기)가 있는데 `"@tide-tds/icons": minor`가 없으면 실패. fixed라 다른 패키지의 minor로도 버전은 오르지만 CHANGELOG의 icons 항목에 남도록 icons에 직접 minor를 요구한다. 규칙 함수는 `packages/icons/scripts/name-removal.ts`, unit 테스트는 `packages/icons/test/name-removal.test.ts`(spec 테스트 표 ① icons).
    - **릴리스 workflow**(`.github/workflows/release.yml`, main push와 workflow_dispatch): `select-mode`(contents read) → changeset이 있으면 `version`(contents·pull-requests write, `pnpm release:version`으로 Version PR 「chore: 릴리스 버전 올리기」) / registry에 없는 버전이 있으면 `pack`(contents read, Playwright 설치 후 `--affected` 없이 `turbo run typecheck test build smoke`, 그다음 `changeset pack`) → `publish`(contents write + **`id-token: write`는 여기만**, `--from-pack-dir`로 pnpm publish, git tag는 패키지마다 push, `create-github-releases: false`) → `github-release`(contents write, `scripts/release-notes.ts`가 published-packages의 버전이 하나인지 확인하고 세 CHANGELOG 항목을 합쳐 `gh release create v<버전>`) / `docs`(권한 없음, environment `docs`, publish 출력 `published == 'true'`이거나 workflow_dispatch일 때 Dokploy 호출). docs job은 publish 뒤에 따로 돌므로 실패해도 npm 릴리스는 그대로이고, workflow_dispatch로 문서 배포만 다시 돌릴 수 있다. prerelease dist-tag는 쓰지 않는다(`--tag latest`, pre 모드 없음).
    - **문서 Dockerfile**(`apps/docs/Dockerfile`, context는 저장소 루트, `.dockerignore`): `node:26-slim`에 `npm install --global pnpm@12.18.0`, `pnpm install --frozen-lockfile`, `pnpm turbo run build --filter=@tide-tds/docs` → `nginx:1.30-alpine`에 `storybook-static` 복사.
    - **repository 필드**: npm trusted publishing은 `repository.url`이 저장소와 같아야 해서 세 패키지에 `git+https://github.com/chane81/tide-design-system.git`과 `directory`를 넣었다. 이 PR은 배포 패키지를 바꾸므로 empty changeset(`.changeset/release-pipeline.md`)을 넣었다.
    - **의존성**: catalog에 `@changesets/cli` ^3.0.3(2026-09-14), `@changesets/changelog-github` ^1.0.1(2026-09-04). 둘 다 1.x 이상이라 범위로 넣었고 `minimumReleaseAge` strict 정책은 그대로다.
  - **결정과 판단(확인 부탁)**
    - **publish 켜기 변수**: publish job은 저장소 변수 `NPM_TRUSTED_PUBLISHING == 'true'`일 때만 돈다. 이유: (1) 지금 버전은 0.0.0이고 registry에 없어서, `.changeset`에 changeset이 하나도 없으면 select-mode가 publish로 간다(`changeset publish-plan`이 0.0.0 세 개를 계획하는 것을 확인). (2) 티켓 12의 0.1.0은 로컬 2FA publish이고 trusted publisher는 티켓 18에서야 설정하므로, 그 전에 Version PR을 머지하면 CI publish가 인증 실패로 끝난다. spec 흐름을 바꾸는 것은 아니고 18 전까지 꺼 두는 장치다. 변수를 켜는 것은 사람이 한다.
    - **GitHub Release tag**: 패키지별 tag(`@tide-tds/foundation@0.2.0` 등, changesets 기본) 말고 Release용 `v0.2.0` tag가 하나 더 생긴다(`gh release create --target <sha>`). spec의 「GitHub Release는 `v0.2.0` 하나」를 따랐다.
    - **문서·설정만 바꾼 PR**: `changeset status`는 배포 패키지가 바뀌지 않으면 changeset 없이도 통과한다. 수용 기준의 「empty changeset으로 통과」도 성립하고(실험 3), empty 없이도 통과한다(실험 2). 기여 문서에는 「없어도 통과, 남기고 싶으면 empty」로 적었다. 반드시 empty를 요구하려면 별도 검사가 필요하다.
    - **icons 쪽 규칙 위치**: spec 테스트 표대로 icons `unit`에 규칙 테스트를 두고, git·changesets를 읽는 부분은 루트 CI 스크립트에 두었다. 루트 스크립트 자체는 아래 실험으로 확인했고 자동 테스트는 없다.
  - **로컬 검증**
    - `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/*/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force`(15개 태스크) 통과. foundation 250, icons 18(새 이름표 규칙 9 포함), desktop 7, docs 30, smoke 통과.
    - actionlint 1.7.12(공식 릴리스 바이너리, checksum 확인)로 `ci.yml`, `release.yml` 문제 없음.
    - 저장소 밖 복제본에서 `scripts/check-changesets.ts main`: 1) desktop 소스 변경 + changeset 없음 → exit 1, 2) `docs/`·`apps/docs`만 변경 → 통과, 3) 1 + empty changeset → 통과, 4a) 이름표 `HouseIcon` → `HomeIcon` + icons patch → exit 1(빠진 키 `HouseIcon`), 4b) desktop minor를 더해도 exit 1, 4c) icons minor로 바꾸면 통과, 5) foundation major → exit 1, 6) icons 소스 변경 + changeset 없음 → exit 1. 이 브랜치 자체도 통과(empty changeset 1개).
    - 같은 복제본에서 `pnpm release:version`: 세 패키지 모두 0.1.0(0.0.0에서 minor), foundation은 「변경 없음」, icons·desktop은 한글 제목, desktop `dependencies`는 `workspace:*` 그대로. 그 뒤 `pnpm format:check` 통과(CHANGELOG), `pnpm install --frozen-lockfile` 통과. `changelog-ko.ts`는 Thanks·여러 작성자·1.x 제목 표본에서 맨 위 항목만 바꾸고 두 번 돌려도 같은 결과. `release-notes.ts`는 세 항목을 foundation → icons → desktop 순으로 합치고, 버전이 둘 이상이면 exit 1.
    - 이 worktree에서 `changeset publish-plan` → `changeset pack --from-publish-plan`: plan은 foundation·icons → desktop 순, access public, tag latest. desktop tarball의 `package.json`에 `repository`, `@tide-tds/foundation`·`@tide-tds/icons` 정확한 버전, catalog 범위, `publishConfig.exports`가 반영된다. `pnpm publish <tarball> --dry-run --access public --tag latest --no-git-checks`는 registry.npmjs.org 대상 dry run으로 끝났다.
    - `docker build -f apps/docs/Dockerfile .`(OrbStack, Docker 29.8.2) 성공, 이미지 72.3MB. 컨테이너에서 `/`, `/iframe.html` 200, `index.json`에 「시작하기/설치」 항목이 있다. 확인 후 이미지는 지웠다.
  - **로컬에서 확인하지 못한 것**(실제 CI·publish에서만 확인됨): OIDC 토큰 교환과 실제 publish, provenance 생성, select-mode·pack·publish 사이의 artifact 전달, GitHub API로 Version PR 커밋·tag push, `gh release create`, Dokploy API 호출과 배포 결과, changelog-github의 PR·작성자 링크(push된 커밋이 있어야 함). 티켓 18의 첫 CI 릴리스가 이것들을 처음 검증한다.
  - **필요한 secret과 사람이 할 설정**
    - npm 토큰 secret은 만들지 않는다(OIDC만 쓴다).
    - GitHub Settings → Actions → General: 「Allow GitHub Actions to create and approve pull requests」 켜기(Version PR, changesets/action README).
    - GitHub Environment `docs`: secret `DOKPLOY_API_KEY`(Dokploy `/settings/profile` → API/CLI에서 만든 키), variable `DOKPLOY_URL`(Dokploy 인스턴스 주소, 끝 `/` 없이), `DOKPLOY_APPLICATION_ID`(문서 앱 id). 필요하면 deployment branch를 main으로 제한.
    - Dokploy 문서 앱: 이 저장소 main, Build Type Dockerfile, Dockerfile 경로 `apps/docs/Dockerfile`, Docker context `.`, 컨테이너 포트 80, 도메인 `tide-tds.lakegreen.net`, **Autodeploy 끄기**.
    - 브랜치 보호에서 CI 통과를 필수로 둔다면: 기본 `GITHUB_TOKEN`으로 만든 Version PR에는 `pull_request` workflow가 돌지 않아 머지가 막힌다. 필수 검사를 두지 않거나, GitHub App 토큰을 version 액션의 `github-token`에 넘기는 변경이 필요하다(지금은 기본 토큰).
    - 티켓 12(0.1.0 로컬 publish): `NPM_TRUSTED_PUBLISHING`은 아직 만들지 않는다. 세 패키지에 `minor` changeset(첫 공개 요약)을 넣은 PR을 머지 → Version PR(0.0.0 → 0.1.0) 머지 → 릴리스 workflow가 pack(전체 검사)까지 돌고 publish는 건너뛴다 → 로컬 main에서 `pnpm install`, `pnpm turbo run build`, `pnpm changeset publish`(2FA 입력, 패키지별 git tag 생성) → `git push origin --tags` → `PUBLISHED_PACKAGES='[{"name":"@tide-tds/foundation","version":"0.1.0"},…]' node scripts/release-notes.ts notes.md` 후 `gh release create v0.1.0 --title v0.1.0 --notes-file notes.md` → Actions에서 Release workflow를 수동 실행해 문서 첫 배포.
    - 티켓 18(trusted publisher): npmjs.com에서 세 패키지마다 Trusted Publisher(GitHub Actions)에 Organization or user `chane81`, Repository `tide-design-system`, Workflow filename `release.yml`, Environment 비움, Allowed actions에서 **직접 `npm publish` 허용** 켜기(dist-tag 권한은 필요 없음). 같은 때 저장소 variable `NPM_TRUSTED_PUBLISHING`을 `true`로 만들고 바로 Version PR을 머지한다(2일 안에 검증). 그 뒤 패키지 Publishing access를 「Require two-factor authentication and disallow tokens」로 바꾼다.
