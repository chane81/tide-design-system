# npm 패키지들의 버전 bump·릴리스 운영 사례

조사일: 2026-11-11

> 원칙: 1차 출처(GitHub 저장소의 실제 파일, workflow yml, `.changeset/config.json`, package.json scripts, CONTRIBUTING.md, 공식 문서, npm registry)만 근거로 삼는다. 2차 블로그 글은 쓰지 않는다. 확인하지 못한 내용은 "확인 불가"로 적는다.

이 문서는 [버전 관리와 npm 배포 흐름](release.md)(이하 release.md)의 후속이다. release.md에 이미 있는 내용(도구 비교, 레퍼런스 시스템이 쓰는 도구 표, 버전 묶음 관례 표, dist-tag 표, trusted publishing 상태)은 다시 적지 않고, 그 문서를 가리킨 뒤 workflow 구조와 브랜치 운영으로 더 들어간다. 결정은 내리지 않는다. 절마다 끝에 시사점만 적는다.

모든 GitHub 파일은 2026-11-11에 각 저장소의 **기본 브랜치**에서 `gh api repos/OWNER/REPO/contents/PATH`로 읽었다. 기본 브랜치가 `main`이 아닌 곳은 표에 적었다. 링크는 기본 브랜치 기준 `blob` URL이라 이후 바뀔 수 있다. 디자인 시스템 저장소는 공개 저장소 규칙에 따라 이름·링크·파일 경로·패키지 이름을 적지 않고 「시스템 A·B·F·H·J」로 적는다(release.md와 같은 문자는 같은 시스템). 라이브러리·도구 저장소는 이름을 그대로 둔다.

## 0. 확인 대상

### 근거 버전 (2026-11-11 `npm view`, GitHub)

| 도구                           | 버전   | 비고                                                                                                                                                                                                                                                                   |
| ------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@changesets/cli`              | 3.0.3  | dist-tag `next` 3.0.0-next.12, `maintenance-v2` 2.31.1                                                                                                                                                                                                                 |
| `changesets/action`            | v2.1.2 | 루트 action 입력: `publish-script`, `version-script`, `commit-message`, `pr-title`, `pr-draft`, `pr-base-branch`, `create-github-releases`, `push-git-tags`, `push-with-git-cli` 등 ([action.yml@v2.1.2](https://github.com/changesets/action/blob/v2.1.2/action.yml)) |
| `@changesets/changelog-github` | 1.0.1  |                                                                                                                                                                                                                                                                        |
| `pkg-pr-new`                   | 0.0.93 | PR 미리보기 배포 CLI(npm에 publish하지 않음)                                                                                                                                                                                                                           |

### 저장소별 확인 결과

| 저장소                                      | 기본 브랜치          | 버전·릴리스 도구                                                                                                          | 주로 본 파일                                                                                            |
| ------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| pmndrs/zustand, pmndrs/jotai, pmndrs/valtio | main                 | **changesets 없음.** 수동 bump + GitHub Release 트리거                                                                    | `.github/workflows/publish.yml`, `preview-release.yml`, package.json                                    |
| changesets/changesets                       | main                 | changesets(하위 action 분리, `main`·`next`·`maintenance/v*`)                                                              | `.github/workflows/publish.yml`, `pkg-pr-new.yml`, `.changeset/config.json`                             |
| 시스템 B                                    | **dev**              | changesets(`dev`에 Version PR, `minor`·`major` 누적 브랜치)                                                               | 릴리스 publish·브랜치 동기화·fast-forward 머지·머지 가드·연속 릴리스 workflow, 기술 문서                |
| radix-ui/primitives                         | main                 | changesets(`stable` 브랜치에서만 정식 배포, `main`은 snapshot)                                                            | `.github/workflows/publish.yml`, `.github/actions/publish-*/action.yml`, `.changeset/config.json`       |
| withastro/astro                             | main                 | changesets(`main`, `next`(pre 모드), `N-legacy`)                                                                          | `release.yml`, `merge-main-to-next.yml`, `preview-release.yml`, `CONTRIBUTING.md`                       |
| 시스템 A                                    | main                 | changesets(Version PR 브랜치에서 `next`, PR 라벨로 `canary`)                                                              | release·changeset 검사·릴리스 잠금·릴리스 일정 workflow                                                 |
| TanStack/query                              | main                 | changesets(브랜치 이름으로 dist-tag 결정)                                                                                 | `release.yml`, `pr.yml`, `.changeset/config.json`                                                       |
| vercel/ai                                   | main                 | changesets(`main` + `release-v*` 유지보수 브랜치)                                                                         | `release.yml`, `verify-changesets.yml`, `contributing/releases.md`, `contributing/pre-release-cycle.md` |
| tabler/tabler-icons                         | main                 | changesets(`fixed`, GitHub Release 하나를 직접 생성)                                                                      | `release.yml`, `.changeset/config.json`                                                                 |
| shadcn-ui/ui                                | main                 | changesets(PR 라벨로 `beta`/`rc` snapshot)                                                                                | `release.yml`                                                                                           |
| 시스템 H                                    | main                 | changesets(자기 scope 전체를 `fixed`로 묶음)                                                                              | `release.yml`, `.changeset/config.json`                                                                 |
| sveltejs/kit                                | main                 | changesets(커스텀 changelog)                                                                                              | `release.yml`, `.changeset/config.json`, `.changeset/changelog.js`                                      |
| remix-run/react-router                      | main                 | **changesets 제거**(2026-04-14, [#14977](https://github.com/remix-run/react-router/pull/14977)), 자체 `scripts/changes/*` | package.json scripts                                                                                    |
| pnpm/pnpm                                   | main                 | **pnpm 자체 `pnpm change`**(`.changeset/*.md` 형식, `check:versioning: pnpm change check`)                                | package.json scripts                                                                                    |
| vercel/turborepo, vitejs/vite, 시스템 F     | main / main / master | changesets 아님(`.changeset/` 없음). vite는 `@vitejs/release-scripts`, 시스템 F는 `scripts/release`                       | package.json                                                                                            |
| 시스템 J                                    | main                 | changesets였으나 저장소가 **archived**(이름 변경)                                                                         | 사례에서 제외                                                                                           |

npm registry의 `_npmUser`로 실제 publish 주체를 확인했다(2026-11-11 `npm view <pkg> _npmUser`). `GitHub Actions`이면 trusted publishing(OIDC)으로 올라간 것이다.

| 패키지                                                                                                                                                                      | publish 주체                           | provenance |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ---------- |
| `zustand@5.1.0`, `jotai@3.0.2`, `jotai@3.0.0-alpha.0`, `valtio@2.3.2`                                                                                                       | GitHub Actions                         | SLSA v1    |
| `zustand@4.5.7`(v4 유지보수판)                                                                                                                                              | 메인테이너 개인 계정                   | 없음       |
| 시스템 B React 패키지 3.2.1, `@tabler/icons`, `radix-ui`, 시스템 A React 패키지, `@changesets/cli@3.0.3`, `astro`, `@sveltejs/kit`, `@tanstack/react-query`, `ai`, `shadcn` | GitHub Actions                         | SLSA v1    |
| 시스템 H 컴포넌트 패키지(latest)                                                                                                                                            | 사람 계정(workflow가 `NPM_TOKEN` 사용) | 없음       |

---

## 1. zustand(pmndrs)

### 버전 bump: 손으로 package.json 한 줄

- changesets, release-it, np, semantic-release 모두 쓰지 않는다. 루트에 `.changeset/`이 없고, package.json `devDependencies`에도 해당 도구가 없다([package.json](https://github.com/pmndrs/zustand/blob/main/package.json)). scripts에는 `build`·`test`·`fix` 계열만 있고 `version`/`release` 스크립트가 없다.
- 버전 커밋은 메인테이너가 main에 직접 push한 **`version` 필드 한 줄 변경**이다. `v5.1.0` 커밋 [9fed2eb](https://github.com/pmndrs/zustand/commit/9fed2eb2f3af672da9f7bf694b996df3831fc207)은 `package.json +1 -1`(`"version": "5.0.16"` → `"5.1.0"`)뿐이고, 연결된 PR이 없다(`commits/9fed2eb/pulls` 결과 0건). 커밋 메시지는 `v5.1.0`처럼 버전 문자열이다. 직전 커밋은 대개 `chore(deps): update dev dependencies`다.
- git tag `v5.1.0`은 이 버전 커밋을 가리킨다.
- 루트 package.json은 `"private": true`다. 빌드의 `copy` 스크립트가 package.json을 `dist/`로 복사하면서 `json -I -f dist/package.json -e "this.private=false; this.devDependencies=undefined; ..."`로 private을 풀고, **`dist/`에서 publish**한다.

### CHANGELOG: 파일 없음, GitHub Release 본문이 곧 변경 기록

- 저장소에 `CHANGELOG.md`가 없다(404).
- Release 본문은 사람이 쓴 요약 한두 줄 + `## What's Changed` PR 목록 + `**Full Changelog**: …compare/v5.0.16...v5.1.0` 링크다([v5.1.0 release](https://github.com/pmndrs/zustand/releases/tag/v5.1.0)). 목록 형식은 GitHub의 자동 생성 릴리스 노트 형식과 같다. 자동 생성 기능을 눌렀는지 직접 붙였는지는 **확인 불가**.

### publish: `release: published` 트리거 + trusted publishing

[publish.yml](https://github.com/pmndrs/zustand/blob/main/.github/workflows/publish.yml) 전문(액션 SHA 고정 부분만 줄임):

```yaml
on:
  release:
    types: [published]
permissions:
  contents: read
jobs:
  publish:
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@… # v6.0.2
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@… # v6.0.8
      - uses: actions/setup-node@… # v6.4.0
        with:
          node-version: "lts/*"
          registry-url: "https://registry.npmjs.org"
          package-manager-cache: false
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm publish --no-git-checks
        working-directory: dist
```

- 흐름: ① main에 버전 커밋 push → ② 메인테이너가 GitHub에서 Release(tag 포함)를 publish → ③ workflow가 build 후 `dist/`에서 `pnpm publish`.
- `NPM_TOKEN`이 없고 `id-token: write`만 있다. npm registry `_npmUser`가 `GitHub Actions`, provenance SLSA v1이다. 즉 **trusted publishing**이다.
- 테스트는 publish workflow 안에서 돌리지 않는다(`test.yml`은 별도).

### PR 미리보기: pkg.pr.new

[preview-release.yml](https://github.com/pmndrs/zustand/blob/main/.github/workflows/preview-release.yml)은 `push: main`과 `pull_request: [opened, synchronize]`에서 `pnpm dlx pkg-pr-new publish './dist' --compact --template './examples/*'`를 돈다. npm에는 올리지 않는다. CONTRIBUTING.md는 아직 "CodeSandbox CI's canary releases"를 안내한다([CONTRIBUTING.md 63행](https://github.com/pmndrs/zustand/blob/main/CONTRIBUTING.md)). workflow와 문서가 어긋나 있다.

### prerelease와 유지보수판

- zustand의 최근 prerelease는 `v5.0.0-rc.0`~`rc.2`(2024-08~09)다. 지금 dist-tag는 `latest` 하나다.
- 유지보수: `v4` 브랜치가 있고 마지막 커밋이 `4.5.7`(2025-05-15)이다. 그런데 `v4.5.7` git tag도 GitHub Release도 없고, npm `_npmUser`는 메인테이너 개인 계정, provenance 없음이다. 즉 4.5.7은 workflow가 아니라 **로컬에서 publish**된 것으로 보인다(어떤 명령을 썼는지는 **확인 불가**).

### 같은 조직(jotai, valtio)과 비교

- 세 저장소의 `publish.yml`과 `preview-release.yml`은 사실상 같은 파일이다. 차이는 jotai만 `working-directory: dist` 없이 루트에서 publish하는 것(jotai v3에서 빌드 구조가 바뀜)뿐이다([jotai publish.yml](https://github.com/pmndrs/jotai/blob/main/.github/workflows/publish.yml), [valtio publish.yml](https://github.com/pmndrs/valtio/blob/main/.github/workflows/publish.yml)).
- 버전 커밋 방식도 같다(jotai `v3.0.2`, valtio `2.3.2` 같은 메시지의 한 줄 변경). 모두 같은 메인테이너가 Release를 publish한다.
- **jotai v3의 prerelease 처리**가 이 방식의 prerelease 사례다.
  - `v3` 브랜치를 따로 두고 거기서 `3.0.0-alpha.0`(2026-07-20), `3.0.0-alpha.1`(2026-08-24)을 냈다. `v3.0.0-alpha.0` tag 커밋은 main과 갈라져 있다(compare: ahead 20, behind 21).
  - prerelease 때문에 publish 명령에 `--tag next`를 넣었다. 커밋 [8fc1b3d "set publish tag next"](https://github.com/pmndrs/jotai/commit/8fc1b3d)는 main에 들어갔다가 같은 날 바로 revert됐고, `v3` 브랜치에서는 `pnpm publish --no-git-checks --tag next`로 유지됐다.
  - [PR #3337 "v3"](https://github.com/pmndrs/jotai/pull/3337)(head `v3` → base `main`, 2026-09-08 머지)으로 main에 합친 뒤, 버전 커밋 [89d4fdd "v3.0.0"](https://github.com/pmndrs/jotai/commit/89d4fdd)에서 `--tag next`를 지우고 버전을 `3.0.0-alpha.1` → `3.0.0`으로 바꿨다.
  - 즉 **prerelease dist-tag를 workflow 파일을 브랜치마다 고쳐서 처리**한다. 자동 판별은 없다. 지금 jotai dist-tag에는 `latest`만 남아 있다(`next`는 정리됨).
  - valtio는 `next`가 `2.0.0-rc.2`에 멈춰 있다(latest 2.3.2보다 낮음). release.md 7절의 "오래 방치된 tag" 사례가 하나 더 있는 셈이다.

### 시사점

- zustand 방식은 단일 패키지, 단일 메인테이너, CHANGELOG 파일 없음이라는 조건에서 단순하다. publish는 "사람이 Release를 누르는 것"이 승인 단계 역할을 한다.
- Tide는 패키지가 셋이고 CHANGELOG를 저장소에 남기며 Version PR을 쓰기로 했다(release.md, ADR 0008). 그래서 zustand 방식을 그대로 가져올 부분은 적다. 가져올 만한 것은 두 가지다. `release: published` 트리거라는 선택지(Version PR 대신 Release 버튼을 승인 단계로 쓰는 방식)와, pkg.pr.new를 이용한 PR 미리보기다.
- jotai의 "prerelease 브랜치에서만 workflow의 `--tag`를 바꾼다"는 방식은 브랜치를 오래 두면 main과 publish.yml이 갈라진다. 실제로 main에 잘못 들어갔다가 revert된 기록이 있다.

---

## 2. 관점별 changesets 사례

### 2.1 fixed / linked 그룹

release.md 6절 표(시스템 A 독립, 시스템 B 일부 linked, Tabler `fixed`)에 더해 2026-11-11에 확인한 설정이다.

| 저장소                                                 | `fixed`                                                                                         | `linked`                                                         | 기타                                                                                          |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 시스템 H                                               | `[["@<scope>/**"]]`                                                                             | 없음                                                             | `ignore`에 예제 앱·문서 사이트 패키지 등 14개. `onlyUpdatePeerDependentsWhenOutOfRange: true` |
| tabler/tabler-icons                                    | `[["@tabler/icons*"]]`                                                                          | 없음                                                             | `privatePackages: { version: false, tag: false }`                                             |
| TanStack/query                                         | 그룹 **둘**: 코어·react·vue·solid·angular·preact 등 20개 / `vue-query-devtools`·svelte 계열 4개 | `[]`                                                             | changelog-github `disableThanks: true`                                                        |
| 시스템 B                                               | 없음                                                                                            | 두 쌍: figma 플러그인·MCP 패키지, codemod·migration index 패키지 | `baseBranch: "dev"`, `privatePackages: { tag: false, version: false }`                        |
| radix-ui/primitives                                    | `[]`                                                                                            | `[]`                                                             | `snapshot: { useCalculatedVersion: true, prereleaseTemplate: "rc.{timestamp}" }`              |
| 시스템 A                                               | 없음                                                                                            | `[]`                                                             | `privatePackages: { version: true, tag: false }`                                              |
| shadcn-ui/ui, sveltejs/kit, withastro/astro, vercel/ai | `[]` 또는 없음                                                                                  | `[]`                                                             | kit은 `ignore: ["!(@sveltejs/*)"]`, `bumpVersionsWithWorkspaceProtocolOnly: true`             |

출처: 각 저장소 `.changeset/config.json`([tabler](https://github.com/tabler/tabler-icons/blob/main/.changeset/config.json), [TanStack/query](https://github.com/TanStack/query/blob/main/.changeset/config.json), [radix](https://github.com/radix-ui/primitives/blob/main/.changeset/config.json), [kit](https://github.com/sveltejs/kit/blob/main/.changeset/config.json)). 디자인 시스템 세 곳(시스템 A·B·H)은 공개 저장소 규칙에 따라 링크를 적지 않는다.

관찰:

- **디자인 시스템 모노레포에서 패키지 전체를 `fixed`로 묶은 곳**은 시스템 H(자기 scope 전체)다. Tide의 `fixed: [["@tide-tds/*"]]`와 같은 모양이다. Tabler는 아이콘 패키지군만 묶는다.
- TanStack/query는 `fixed` 그룹을 **둘로 나눴다**. 프레임워크 어댑터가 많아도 "같은 숫자로 움직일 묶음"을 명시적으로 나눌 수 있다는 사례다. 두 번째 그룹이 왜 따로인지는 config에 설명이 없다(**확인 불가**).
- `linked`는 시스템 B처럼 "도구 쌍"(figma 플러그인과 MCP, codemod와 migration index)에만 쓰는 경우가 보인다. 디자인 시스템 본체(react/css)는 독립이다.
- `privatePackages`로 private 워크스페이스(문서 앱 등)에 버전·tag를 붙이지 않는 설정이 흔하다(Tabler, 시스템 B). 시스템 A는 version은 올리고 tag만 끈다.

#### 시사점

- Tide 설정(`fixed` 하나, `linked: []`)은 시스템 H와 같은 계열이다. 패키지가 늘어 "같이 움직이지 않아도 되는 묶음"이 생기면 TanStack처럼 fixed 그룹을 나누는 선택지가 있다.
- Tide의 docs·sandbox 같은 private 워크스페이스가 Version PR에 섞이는지 확인할 거리가 있다. 지금 config에는 `privatePackages`가 없다(changesets 기본값은 changesets.dev 문서로 따로 확인해야 함, 이번에는 **미확인**).

### 2.2 Version PR(changesets/action) 운영

#### workflow 구조는 세 갈래

1. **하위 action 분리(v2)**: `select-mode` → `version` | `pack` → `publish`. job마다 권한을 따로 준다. [changesets/changesets publish.yml](https://github.com/changesets/changesets/blob/main/.github/workflows/publish.yml)이 기준 사례다. Tide `release.yml`도 이 구조다.
   - `publish` job에만 `id-token: write`와 `contents: write`(GitHub Release 생성)를 준다.
   - `version` job은 `contents: read`만 받고, PR 쓰기는 **GitHub App 토큰**(`actions/create-github-app-token`, `permission-contents: write`, `permission-pull-requests: write`)으로 한다.
   - GitHub Environment를 job별로 건다(`select-mode`·`version`은 `environment: version`, `publish`는 `environment: npm`). 모든 job에 `skip-cache: true # avoid cache poisoning attacks`를 둔다.
   - `concurrency`에 `queue: max`, `cancel-in-progress: false`.
2. **루트 action 한 번(v2)**: `changesets/action@v2.1.2`에 `version-script`·`publish-script`를 넘기는 방식. TanStack/query, Astro, SvelteKit, 시스템 B, 시스템 A가 이렇다. job 하나에 `contents: write`, `pull-requests: write`, `id-token: write`를 함께 준다.
3. **v1 그대로**: 시스템 H(`changesets/action@v1`, `NPM_TOKEN`), vercel/ai(`v1.9.0`, `commitMode: 'github-api'`), Radix stable(`@v1`, `createGithubReleases: false`), shadcn(`@v1`). release.md 1절대로 v1 action은 Changesets v2 CLI용이다. 이 저장소들의 CLI 버전은 이번에 확인하지 않았다(**미확인**).

#### publish 트리거

- 모두 "기본(또는 릴리스) 브랜치 push → changeset이 있으면 Version PR 갱신, 없고 미배포 버전이 있으면 publish"라는 changesets/action 기본 흐름이다. 별도 트리거(tag push, release published)를 쓰는 changesets 사례는 이번 조사 범위에서 없었다.
- 경로 필터로 불필요한 실행을 줄이는 곳: 시스템 H(`paths: [".changeset/**", "packages/**"]`), vercel/ai(`.changeset/**`와 release.yml만), 시스템 B(`packages/**`, `docs/**`, `.changeset/**` 등).
- 시스템 B은 실행 첫 단계에서 `test "$GITHUB_REF" = "refs/heads/dev"`, `test "$(git rev-parse HEAD)" = "$RELEASE_SOURCE_SHA"`로 "보호된 dev 커밋에서만 돈다"를 다시 검사한다(release publish workflow).

#### 토큰: Version PR을 누가 만드나

| 방식            | 저장소                                                    |
| --------------- | --------------------------------------------------------- |
| GitHub App 토큰 | changesets/changesets, 시스템 B(저장소 전용 앱), 시스템 A |
| 개인/봇 PAT     | 시스템 H(개인 PAT), Astro(`FREDKBOT_GITHUB_TOKEN`)        |
| `GITHUB_TOKEN`  | TanStack/query, SvelteKit, vercel/ai, tabler-icons        |

GitHub 문서: `GITHUB_TOKEN`으로 일으킨 이벤트는 새 workflow run을 만들지 않는다. 예외로 `workflow_dispatch`·`repository_dispatch`는 실행되고, `GITHUB_TOKEN`으로 PR을 만들거나 갱신해서 생긴 `pull_request`(`opened`/`synchronize`/`reopened`) 이벤트는 **승인 대기 상태**로 run이 만들어져 쓰기 권한자가 "Approve workflows to run"을 눌러야 돈다([GITHUB_TOKEN 개념 문서](https://docs.github.com/en/actions/concepts/security/github_token)). App 토큰이나 PAT를 쓰는 이유가 이것으로 보인다(각 저장소가 이유를 적어 둔 곳은 찾지 못함).

#### npm 인증

- trusted publishing(OIDC, `id-token: write`, `NPM_TOKEN` 없음): changesets/changesets, 시스템 B, Radix(`npm-trusted-publishing: 'true'` 입력), Astro, SvelteKit, TanStack, 시스템 A, tabler-icons, vercel/ai, shadcn. registry의 `_npmUser`도 `GitHub Actions`다(0절 표).
- vercel/ai는 npm trusted publisher를 `vercel/ai` + `release.yml` + **`npm-release` environment**로 묶고, 그 environment는 main과 유지보수 브랜치만 허용한다고 문서에 적었다([contributing/releases.md](https://github.com/vercel/ai/blob/main/contributing/releases.md)). 새 패키지는 trusted publisher를 걸기 전에 사람이 한 번 수동 publish해야 한다는 절차도 있다. Tide의 "첫 publish는 로컬 2FA"(release.yml 주석)와 같은 제약이다.
- tabler-icons는 Node 22에 딸린 npm 10으로는 OIDC가 안 되므로 `npm install -g npm@11` 단계를 넣었다고 주석에 적었다([release.yml](https://github.com/tabler/tabler-icons/blob/main/.github/workflows/release.yml)).
- 토큰 방식: 시스템 H(`NPM_TOKEN`). 시스템 J도 `NPM_TOKEN` + `NPM_CONFIG_PROVENANCE: true`였지만 archived다.

#### GitHub Release 생성 방식

- **action 기본(패키지별 Release)**: changesets/changesets(v2 `publish` 하위 action이 `contents: write`로 생성), Astro, SvelteKit.
- **끄고 하나로 직접 생성**: tabler-icons. `create-github-releases: false`, `push-git-tags: false`로 끄고, `has-changesets == 'false'`일 때 `gh release create "v${VERSION}" <zip> --target "$GITHUB_SHA" --title "Release ${VERSION}" --notes-file notes.md`. 주석에 "Changesets describes every package separately, while GitHub gets a single release for all of them"라고 이유를 적었다. publish가 실패해도 이미 올라간 패키지에 Release가 붙도록 `published` 출력에 기대지 않는다. 또 Version PR 본문을 **곧 만들 Release 노트 미리보기**로 바꿔 쓴다(`gh pr edit --body-file`).
- **끄고 별도 스크립트**: TanStack/query(`node scripts/create-github-release.mjs --prerelease|--latest`, 브랜치에 따라 플래그).
- **안 만듦**: Radix stable(`createGithubReleases: false`).

#### Version PR 이름과 운영 장치

- PR 제목: Astro `[ci] release`, TanStack `ci: Version Packages`, 시스템 A는 버전 없는 고정 제목, 시스템 B `release: version packages`, Radix `New release`. 버전 숫자를 제목에 넣는 사례는 없었다(Tide는 `changeset status --output`으로 계산해서 넣는다).
- 시스템 A는 Version PR 주변에 운영 장치를 더 둔다. 매주 월요일 cron으로 릴리스 이슈를 만들고, 릴리스 담당자를 배정하는 workflow를 두고, `workflow_dispatch`로 ruleset을 바꿔 **릴리스 중 머지를 잠그고** Release가 published/prereleased되면 자동으로 풀린다.
- Astro는 publish 뒤 Discord 공지와 `repository_dispatch: release-published`를 보낸다. 같은 커밋에서 두 번 보내지 않도록 `refs/release-announced/<sha>` ref를 push해 표시한다([release.yml](https://github.com/withastro/astro/blob/main/.github/workflows/release.yml)).
- vercel/ai는 changesets/action 실패 시 30초·60초 뒤 두 번 재시도한다.

#### 시사점

- Tide `release.yml`은 changesets/changesets 자체와 같은 구조(하위 action 분리, publish job만 `id-token`)다. 차이는 Version PR을 `GITHUB_TOKEN`으로 만든다는 점이다. 이 경우 Version PR에서 CI가 "승인 대기"로 뜬다(GitHub 문서). App 토큰을 둘지는 Tide가 Version PR에 필수 검사를 걸지에 달려 있다.
- GitHub Release를 하나로 만드는 Tide 방식은 tabler-icons와 같다. Version PR 본문을 Release 미리보기로 바꾸는 tabler 방식은 fixed 그룹과 잘 맞는다.
- GitHub Environment로 trusted publisher 범위를 브랜치까지 좁히는 방식(vercel/ai, changesets/changesets)은 Tide가 브랜치를 늘릴 때 참고할 만하다.

### 2.3 snapshot / canary / prerelease / PR 미리보기

release.md 7절(npm 규칙, pre 모드와 snapshot 실험, dist-tag 표)에 더해 workflow 수준의 사례다.

| 저장소                | 방식                                                                               | 트리거                                                                | 결과(버전·dist-tag)                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 시스템 A              | `changeset version --snapshot` + `publish --tag next`                              | **Version PR 브랜치**(`changeset-release/main`) push                  | `<다음버전>-rc.<short sha>`. pre 모드면 `pre exit` 후 snapshot. 현재 `next` `38.46.0-rc.c7bd2674a`           |
| 시스템 A              | 가짜 patch changeset + `--snapshot` + `--tag canary`                               | PR에 `Canary Release` 라벨(같은 저장소 브랜치만)                      | `0.0.0-<timestamp>`. 현재 `canary` `0.0.0-20261109223425`                                                    |
| radix-ui/primitives   | `changeset version --snapshot` + `pnpm publish -r --tag next`                      | **main push**(변경 감지 action이 테스트·스토리·md만 바뀐 경우 건너뜀) | config `prereleaseTemplate: "rc.{timestamp}"`, `useCalculatedVersion: true` → `1.8.2-rc.1791984254107`       |
| shadcn-ui/ui          | `changeset version --snapshot <channel>` + 자체 publish 스크립트 `--tag <channel>` | PR에 `release: beta` 또는 `release: rc` 라벨(정확히 하나)             | 주석: "Snapshot versions are stamped per run (timestamped)". Version PR에 라벨을 달면 changeset이 없어 no-op |
| changesets/changesets | pre 모드(`next` 브랜치의 `.changeset/pre.json` `tag: "next"`)                      | `next` 브랜치 push                                                    | `3.0.0-next.12`. 지금 `next` 브랜치는 main보다 147커밋 뒤(3.0 정식 뒤 방치)                                  |
| withastro/astro       | pre 모드(`next` 브랜치 `pre.json` `tag: "beta"`)                                   | `next` 브랜치 push                                                    | `beta` `7.4.4-beta.0`(latest 7.4.10보다 낮음), `alpha` `7.0.0-alpha.2`                                       |
| vercel/ai             | pre 모드(`main`에서 `changeset pre enter beta`)                                    | main push                                                             | 메이저 준비 기간 동안 main이 `ai@7.0.0-beta.N`을 냄                                                          |

PR 미리보기 배포(npm에 올리지 않음):

| 저장소                      | 도구                         | 트리거                                                                                                                                                                                                            |
| --------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pmndrs/zustand·jotai·valtio | pkg.pr.new                   | 모든 PR(`opened`, `synchronize`)과 main push                                                                                                                                                                      |
| TanStack/query              | pkg.pr.new                   | 모든 PR(`pr.yml`의 `preview` job, `--template './examples/*/*'`)                                                                                                                                                  |
| changesets/changesets       | pkg.pr.new                   | PR에 `pkg.pr.new` 라벨                                                                                                                                                                                            |
| withastro/astro             | pkg.pr.new                   | PR에 `pr preview` 라벨. `changeset status --output`으로 **changeset에 들어간 패키지만** 골라 publish한 뒤 라벨을 뗌                                                                                               |
| 시스템 B                    | pkg.pr.new(`--comment=off`)  | 쓰기 권한자가 PR에 `/snapshot` 댓글. 결과 댓글을 workflow가 직접 씀                                                                                                                                               |
| vercel/ai                   | Vercel 배포로 tarball 호스팅 | Vercel Git 연동(PR push). 버전 `0.0.0-preview.<전체 커밋 SHA>`. 예전의 npm snapshot 옵션을 대체했다고 문서에 적음([package-previews.md](https://github.com/vercel/ai/blob/main/contributing/package-previews.md)) |

#### 시사점

- "npm에 snapshot을 올린다"(시스템 A, Radix, shadcn)와 "npm에 올리지 않는다"(pkg.pr.new, Vercel tarball)로 갈린다. vercel/ai는 npm snapshot에서 tarball로 **옮겼다**고 적었다. 올리지 않는 쪽은 dist-tag 정리 문제(release.md 7절 시사점)가 생기지 않는다.
- pre 모드를 쓰는 곳은 모두 "메이저 준비 브랜치나 기간"에만 켠다. changesets/changesets와 Astro 모두 pre 모드 브랜치의 dist-tag가 정식판보다 낮은 채로 남아 있다.
- 시스템 A의 "Version PR 브랜치에서 `next` 자동 배포"는 Version PR이 갱신될 때마다 곧 나갈 버전을 미리 써 볼 수 있게 한다. Tide의 sandbox 확인 단계와 목적이 겹친다(3절).

### 2.4 브랜치 전략

#### 유형

1. **main 단일**: SvelteKit, 시스템 H, tabler-icons, shadcn. `on: push: branches: [main]`뿐이다.
2. **main + 메이저 준비 브랜치(pre 모드) + 유지보수 브랜치**
   - changesets/changesets: `main`, `next`(pre 모드), `maintenance/v*`. 유지보수 브랜치는 **브랜치 안에서** `.changeset/config.json`의 `baseBranch`를 `"maintenance/v2"`로 바꾸고, `release` 스크립트를 `changeset publish --tag maintenance-v2`로 바꿨다([maintenance/v2 package.json](https://github.com/changesets/changesets/blob/maintenance/v2/package.json)). workflow 주석: `"maintenance/v*" # branch rulesets don't support v[0-9]+`.
   - Astro: `main`, `next`(pre 모드 `beta`), `1-legacy`~`6-legacy`. Version PR이 머지되어 publish되면 `repository_dispatch: release-published` → [merge-main-to-next.yml](https://github.com/withastro/astro/blob/main/.github/workflows/merge-main-to-next.yml)이 `ci/merge-main-to-next` 브랜치에서 `git merge origin/main --no-ff`를 시도해 **main → next 머지 PR을 자동으로 만든다**. 충돌이 나면 보고만 한다. 정식판 코드를 담는 `latest` 브랜치가 따로 있고 "정식판을 낼 때마다 자동 갱신"된다고 CONTRIBUTING.md에 적혀 있다(무엇이 갱신하는지는 workflow에서 찾지 못함, **확인 불가**). CONTRIBUTING.md는 "main을 prerelease 상태로 둔다"고 설명하는데, 실제 workflow는 `next` 브랜치에 pre.json을 둔다. 문서와 설정이 어긋나 있다.
   - vercel/ai: 메이저 준비 동안 **main을 pre 모드(beta)**로 두고, 직전 메이저는 `release-v6.0` 같은 유지보수 브랜치를 main에서 따서 `ci:release`에 `--tag ai-v6`를 붙인다([pre-release-cycle.md](https://github.com/vercel/ai/blob/main/contributing/pre-release-cycle.md)). release.yml이 이미 `release-v*`에서 돌기 때문에 workflow를 바꿀 필요가 없다고 적었다.
   - TanStack/query: `on: push: branches: [main, 'v[0-9]', '*-pre', '*-maint']`. **브랜치 이름으로 dist-tag를 정한다.** `*-pre` → prerelease, `*-maint` → `--tag maint`, `vN` → `--tag vN`, 나머지 → latest.
3. **정식 배포 전용 브랜치**: Radix. `main` push는 snapshot(`next`)만 내고, `stable` 브랜치 push에서만 changesets/action으로 Version PR·정식 publish를 한다. 정식 publish 뒤 `stable` → `main` 역머지 PR을 자동으로 연다("Opened automatically after a successful stable publish. Review and merge manually.")([publish.yml](https://github.com/radix-ui/primitives/blob/main/.github/workflows/publish.yml)). `bump:check: changeset status --since=main` 스크립트가 있다.
4. **기본 브랜치를 `dev`로 + minor/major 누적 브랜치**: 시스템 B. 아래에 자세히 적는다.

#### 시스템 B: `dev`가 릴리스 브랜치, `minor`·`major`가 누적 브랜치

1차 출처: 시스템 B 저장소의 기술 문서 「릴리스」 절, release publish workflow, 릴리스 브랜치 동기화 workflow와 그 셸 스크립트, fast-forward 머지 workflow, 머지 가드 workflow. 공개 저장소 규칙에 따라 링크·경로는 적지 않는다.

- 기본 브랜치는 `dev`이고 `.changeset/config.json`도 `"baseBranch": "dev"`다. `main` 브랜치는 남아 있지만 마지막 커밋이 2025-02-04이고 dev보다 3510커밋 뒤다(사실상 안 씀).
- **patch 성격의 PR**(`fix/*`, `renovate/*` 등)은 바로 `dev`로 머지된다(최근 머지 PR 목록에서 확인).
- **minor·major 작업**은 `minor`, `major`라는 장기 브랜치로 먼저 모은다(예: 기능 브랜치 → base `minor`). 모은 뒤 `minor` → `dev` PR(16커밋)을 연다. React 패키지의 메이저 릴리스와 다른 플랫폼 패키지의 1.0도 `major` → `dev` PR이었다.
- `minor`/`major` → `dev` PR은 **merge 버튼으로 머지할 수 없다.** 머지 가드 workflow가 그런 PR에서 항상 실패하는 필수 검사이고, 쓰기 권한자가 `/ff-merge` 댓글을 달면 fast-forward 머지 workflow가 앱 토큰으로 **커밋·SHA를 그대로 둔 채 dev를 fast-forward**한다(ruleset이 이 앱만 우회 허용). 그 PR의 `merged_by`는 저장소 전용 앱 봇이다.
- `dev` push마다 changesets/action이 `changeset-release/dev` → `dev` Version PR(`release: version packages`)을 만들거나 갱신하고, 머지되면 `bun release`(스타일 생성·패키지 빌드 뒤 `changeset publish`)로 publish한다. `version-script`는 `changeset version` 뒤 install·토큰 재생성·정책 검사를 이어 붙인다.
- Version PR이 머지되면(`pull_request_target: closed`, head `changeset-release/dev`, 제목 일치 조건) 동기화 workflow가 `minor`·`major`를 **dev 위로 rebase하고 `--force-with-lease`로 push**한다. 브랜치가 없으면 dev에서 새로 만든다. rebase가 충돌하면 실패로 남기고, Step Summary에 AI 에이전트에게 넘길 리베이스 절차 프롬프트를 붙인다.
- PR snapshot은 `/snapshot` 댓글로 pkg.pr.new에 올린다(2.3절). 정식 npm prerelease dist-tag로는 `alpha`(`0.0.0-alpha-…`)가 있지만, 이번 workflow들에서 그것을 내는 경로는 찾지 못했다(**확인 불가**).
- 이전 메이저용 dist-tag `react-v1.0`·`react-v1.1`·`react-v1.2`·`react-v2`가 있고 `2.1` 브랜치가 있다. 그 브랜치의 `release` 스크립트에는 `--tag`가 없다. 유지보수판에 dist-tag를 붙이는 방법은 **확인 불가**.

#### `pr-base-branch` 사용 사례

changesets/action v2.1.2의 `pr-base-branch`는 "Sets the base branch of the PR. Defaults to `github.ref_name`"이다([action.yml](https://github.com/changesets/action/blob/v2.1.2/action.yml)). 조사한 저장소 중 이 입력을 쓰는 곳은 없었고, GitHub 코드 검색(`pr-base-branch`, yml)에서도 changesets/action 자신 말고는 changesets 관련 사용처가 나오지 않았다. 모든 사례가 "Version PR은 그 workflow가 돈 브랜치를 base로" 만든다.

#### 시사점

- 메이저 준비를 위한 장기 브랜치는 흔하다(changesets `next`, Astro `next`, jotai `v3`, 시스템 B `major`). 다만 그 브랜치를 **pre 모드로 npm에 내느냐**(changesets, Astro)와 **내지 않고 모았다가 합치느냐**(시스템 B, jotai는 alpha만)로 갈린다.
- 장기 브랜치는 릴리스 브랜치와 계속 동기화해야 한다. 자동화한 곳은 Astro(main → next 머지 PR)와 시스템 B(Version PR 머지 뒤 minor·major rebase)이다. Radix는 반대 방향(stable → main 역머지 PR)이다.
- 유지보수 브랜치의 dist-tag는 브랜치 안의 스크립트를 고치는 방식(changesets, vercel/ai)과 브랜치 이름에서 계산하는 방식(TanStack)이 있다.

### 2.5 changeset 누락 검사와 CHANGELOG 포맷

#### 누락 검사

- **changeset-bot**(GitHub App, PR에 댓글): 최근 이슈·PR 댓글 100개 중 `changeset-bot[bot]` 댓글 수(2026-11-11)로 확인했다. Radix 61, 시스템 H 39, SvelteKit 32, 시스템 A 30, changesets 25, TanStack/query 20, 시스템 B 19, Astro 15. tabler-icons, shadcn, vercel/ai는 0건이다. 이 bot은 막지 않고 알리기만 한다(bot 동작 자체는 이번에 확인하지 않음).
- **필수 검사로 막는 곳**
  - 시스템 A의 changeset 검사 workflow: PR 변경 파일에 `^\.changeset/[^/]+\.md$`가 없으면 실패. `skip changeset` 라벨이 있으면 통과.
  - vercel/ai [verify-changesets.yml](https://github.com/vercel/ai/blob/main/.github/workflows/verify-changesets.yml): `packages/**`나 `.changeset/*.md`가 바뀐 PR에서 frontmatter를 검사한다. **pre 모드가 아니면 `patch`만 허용**하고, PR에 `minor`·`major` 라벨이 있으면 건너뛴다(`index.js`의 `BYPASS_LABELS`, `allowedBumps`). 문서: "By default, use `patch` (non-breaking). To override, apply the `minor` or `major` label (CI enforces `patch` otherwise)."
  - pnpm: `lint`에 `check:versioning: pnpm change check`가 들어 있다(pnpm 자체 방식).
- **영향 미리보기 댓글**: TanStack/query는 `TanStack/config/.github/changeset-preview` action으로 "Generates comment on a PR showing expected version impact"(`pr.yml`의 `version-preview` job).
- **changeset 작성 자체를 자동화**: tabler-icons는 아이콘 추가 PR에 changeset을 받지 않고, release workflow가 `node ./.build/release-changeset.mjs`로 미배포 아이콘의 minor changeset을 만든다. 시스템 B은 `.changeset/*.md`를 직접 쓰지 말고 저장소의 전용 에이전트 Skill로 만들라고 기여 문서에 적었다.

#### CHANGELOG 포맷

- `@changesets/changelog-github` 그대로: changesets, 시스템 H, Astro, 시스템 A, shadcn. `{ disableThanks: true }`로 "Thanks @user!"를 끄는 곳: TanStack/query·router, tabler-icons.
- 기본 `@changesets/cli/changelog`(PR·작성자 링크 없음): 시스템 B, vercel/ai.
- 커스텀 모듈
  - SvelteKit [.changeset/changelog.js](https://github.com/sveltejs/kit/blob/main/.changeset/changelog.js): `getReleaseLine`은 changelog-github 것을 다시 내보내고, `getDependencyReleaseLine`만 바꿔 의존성 목록에서 커밋 링크를 뺀다. 주석: "Repeating them here produces hundreds of commit links when graduating a large prerelease to stable." config에 `template: "\n- {summary} {ref}"` 옵션도 넘긴다.
  - Radix [.changeset/changelog.cjs](https://github.com/radix-ui/primitives/blob/main/.changeset/changelog.cjs): ariakit 것을 가져온 것(MIT 고지 포함). 여러 줄 요약의 첫 줄을 `###` 제목으로 올리고 `### Overview`를 맨 앞에 정렬한다. 의존성 줄은 `` `name@version` ``을 쉼표로 잇는다.
- 생성 뒤 후처리: Tide는 `changeset version` 뒤 `scripts/changelog-ko.ts`로 고정 문구를 한글로 바꾼다. 조사한 곳 중 후처리 스크립트를 version 스크립트에 붙인 곳은 vercel/ai(`cleanup-examples-changesets.mjs`), 시스템 B(토큰 재생성·정책 검사)이 있지만 CHANGELOG 문구 자체를 바꾸는 사례는 없었다.

#### 시사점

- changeset 누락을 "막는" 곳(시스템 A, vercel/ai)은 모두 **우회 라벨**을 둔다. Tide는 docs·티켓 기록 커밋이 많아서 우회 수단 없이 막으면 마찰이 클 수 있다.
- vercel/ai의 "평소엔 patch만, minor·major는 라벨로"는 0.x인 Tide에서 minor가 곧 호환성 깨짐이라는 점(release.md 5절)과 연결해 볼 만하다.
- SvelteKit의 `getDependencyReleaseLine` 덮어쓰기는 Tide가 `getReleaseLine`은 그대로 두고 일부만 바꾸고 싶을 때 가장 작은 예다. 다만 Tide는 fixed라 dependency 줄이 많이 생기는지는 따로 봐야 한다.

---

## 3. 우리 브랜치 전략과 비교

검토 중인 전략: feature → `base/*` → (확인용 sandbox) `dev`, 완료된 `base/*` → `main` 머지 → main에서 Version PR 자동 갱신 → Version PR 머지 시 배포.

| 항목                                  | Tide 안                      | 가장 가까운 사례                                                                                                                   |
| ------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 작업을 모으는 중간 브랜치             | `base/*`(작업 단위, 여러 개) | 시스템 B `minor`·`major`(bump 크기 단위, 각 하나). jotai `v3`, Astro·changesets `next`(메이저 단위)                                |
| 릴리스 브랜치(Version PR이 생기는 곳) | `main`                       | 시스템 B은 `dev`가 이 역할. 나머지 대부분은 `main`                                                                                 |
| 미리 써 보는 곳                       | `dev` sandbox(브랜치에 머지) | 브랜치 머지 대신 PR 단위 미리보기: pkg.pr.new(zustand, TanStack, Astro, 시스템 B `/snapshot`), 시스템 A Version PR 브랜치 → `next` |
| 중간 브랜치 → 릴리스 브랜치 머지      | 결정 안 됨                   | 시스템 B은 `/ff-merge`(fast-forward 강제, merge 버튼 막음). jotai는 일반 PR 머지                                                   |
| 릴리스 뒤 중간 브랜치 동기화          | 결정 안 됨                   | 시스템 B: Version PR 머지 → minor·major 자동 rebase. Astro: 릴리스 → main→next 머지 PR 자동 생성                                   |
| sandbox를 다시 맞추는 방법            | 결정 안 됨                   | 같은 역할의 장기 sandbox 브랜치 사례는 찾지 못함                                                                                   |

사례에서 보이는 사실:

- **시스템 B이 구조상 가장 가깝다.** "작업을 중간 브랜치에 모으고, 다 되면 릴리스 브랜치로 올리고, 릴리스 브랜치에서 Version PR이 자동 갱신되고, 머지하면 배포"라는 흐름이 같다. 다른 점은 셋이다. ① 중간 브랜치가 작업 단위(`base/*` 여러 개)가 아니라 bump 크기 단위(`minor`, `major` 하나씩)다. ② 확인용 sandbox 브랜치가 없고, 대신 PR마다 `/snapshot`으로 미리보기를 낸다. ③ patch는 중간 브랜치 없이 릴리스 브랜치로 바로 간다.
- 시스템 B이 중간 브랜치를 fast-forward로만 올리게 강제하는 이유는 문서에 "커밋·SHA를 유지한 채"라고만 적혀 있다. sync 스크립트가 Version PR 머지마다 minor·major를 dev 위로 rebase하므로, fast-forward가 가능한 상태가 유지된다. 두 장치가 짝을 이룬다.
- changeset 파일은 브랜치를 따라 이동한다. `base/*`에서 쓴 changeset은 main에 머지되는 순간 main의 Version PR에 들어간다. `changeset status`는 `baseBranch`와 비교하므로(Radix의 `changeset status --since=main`), 릴리스 브랜치가 main이면 Tide config의 `baseBranch: "main"`은 그대로 맞는다. 시스템 B은 릴리스 브랜치를 dev로 바꾸면서 `baseBranch`도 `dev`로 바꿨다.
- Version PR 머지는 릴리스 브랜치에서 `.changeset/*.md`를 지우고 package.json·CHANGELOG를 바꾼다. 그래서 장기 브랜치(`base/*`, sandbox `dev`)가 main과 갈라진다. 시스템 B·Astro가 동기화를 자동화한 이유가 이것으로 보인다(각 저장소가 이유를 이렇게 적지는 않음).
- 확인용 sandbox 브랜치에 여러 작업 브랜치를 머지해 두는 방식은 조사한 저장소에서 찾지 못했다. 미리보기는 **PR 단위**(pkg.pr.new, `/snapshot`, 라벨)이거나 **릴리스 브랜치의 다음 버전 단위**(시스템 A `changeset-release/main` → `next`, Radix main → `next`)였다.

### 시사점

- Tide 안을 시스템 B 모양으로 옮기면 "`base/*` → main 머지 방식(fast-forward 강제 여부)"과 "Version PR 머지 뒤 남은 `base/*`·`dev`를 어떻게 맞출지(rebase 자동화, merge PR 자동화)"가 결정할 거리로 남는다.
- sandbox `dev`의 목적이 "배포 전에 실제 패키지로 써 보기"라면, 브랜치 대신 PR 단위 미리보기(pkg.pr.new)로 같은 목적을 이루는 사례가 많다. 목적이 "문서·Storybook 사이트로 보기"라면 패키지 미리보기와는 다른 문제다(시스템 B도 docs·storybook alpha 배포 workflow를 따로 둔다. 내용은 이번에 읽지 않음).
- 메이저 준비가 필요해질 때의 선택지는 세 가지로 나뉜다. 중간 브랜치에 모았다가 한 번에 합치기(시스템 B `major`, jotai `v3`), 별도 브랜치를 pre 모드로 npm에 내기(changesets·Astro `next`), main 자체를 pre 모드로 두고 유지보수 브랜치를 따기(vercel/ai). 0.x 동안에는 release.md 7절 시사점대로 prerelease가 필요한지부터 쟁점이다.

---

## 4. 확인 불가 목록

- zustand Release 본문의 PR 목록을 GitHub 자동 생성 기능으로 만들었는지 직접 붙였는지.
- zustand 4.5.7(v4 유지보수판)을 로컬에서 어떤 명령으로 publish했는지(registry 기록상 개인 계정, provenance 없음, git tag 없음까지만 확인).
- TanStack/query가 `fixed` 그룹을 둘로 나눈 이유.
- 시스템 H·vercel/ai·Radix·shadcn처럼 `changesets/action@v1`을 쓰는 저장소의 `@changesets/cli` 버전.
- 각 저장소가 Version PR에 GitHub App 토큰이나 PAT를 쓰는 이유(문서에 적힌 곳을 찾지 못함. GitHub 문서의 `GITHUB_TOKEN` 제약만 확인).
- Astro `latest` 브랜치를 무엇이 갱신하는지(브랜치는 있음, workflow에서 갱신 단계를 찾지 못함).
- 시스템 B의 `alpha` dist-tag를 내는 경로, 유지보수 dist-tag(`react-v1.x`, `react-v2`)를 붙이는 방법.
- changeset-bot의 동작 세부(설정 파일 없이 App 설치로만 동작하는 것으로 보이며, 이번에는 댓글 존재만 확인).
- changesets의 `privatePackages` 기본값(changesets.dev 문서로 이번에 확인하지 않음).
- react-router가 changesets를 제거한 구체적 이유([#14977](https://github.com/remix-run/react-router/pull/14977) 본문은 "Removed changesets from the repo and adds our own similar flows for commenting on PRs and `pnpm run changes:add`" 한 줄).

참고: release.md 7절은 시스템 A canary를 "다른 브랜치에서" 낸다고 적었다. 2026-11-11 현재 시스템 A release workflow의 canary job은 `pull_request` 이벤트에서 `Canary Release` 라벨이 있을 때만 돈다.
