# 버전 관리와 npm 배포 흐름

티켓: [29. 버전 관리와 npm 배포 흐름 조사](../progress/tide-v0/issues/29-research-release.md)

`@tide-tds/foundation`, `@tide-tds/desktop`, `@tide-tds/icons` 세 패키지를 npm에 배포하는 흐름을 정하기 위한 사실을 모은다. 이 문서는 결정을 내리지 않는다. 결정은 [30. 버전과 배포 정책 결정](../progress/tide-v0/issues/30-grilling-release.md)에서 한다. 각 절 끝에 시사점만 적는다.

이미 정해진 전제: npm scope `@tide-tds`(org owner `charles-green`, 2FA 켜짐), pnpm workspace + catalog(기본 하나와 `strict`), Turborepo, ESM 전용 배포([ADR 0006](../decisions/0006-foundation-and-target-packages.md), [ADR 0007](../decisions/0007-lucide-generated-icons-package.md), [티켓 18](../progress/tide-v0/issues/18-task-npm-scope.md)).

## 조사 기준 버전 (2026-11-09, `npm view`, GitHub Releases로 확인)

| 도구 | 최신 안정 버전 | 비고 |
| --- | --- | --- |
| `@changesets/cli` | 3.0.3 (2026-09-14) | 3.0.0은 2026-08-11. `engines`: node `^22.11 \|\| ^24 \|\| >=26`, pnpm `>=10.0.0`, npm `>=10.9.0`. v2 유지보수 태그 `maintenance-v2`는 2.31.1 |
| `changesets/action` | v2.1.2 (2026-09-07) | v2.0.0은 2026-08-11. v2는 Changesets v3 전용이고, v2 CLI는 `changesets/action@v1`을 써야 함 |
| `@changesets/changelog-github` | 1.0.1 | |
| `release-please` | 17.11.2 (2026-08-24) | GitHub Action `googleapis/release-please-action`은 v5.0.0(2026-04-22) |
| `semantic-release` | 25.0.9 | `engines.node`: `^22.14.0 \|\| >= 24.10.0`. `@semantic-release/npm` 13.2.0 |
| `pnpm` | 12.18.0 (2026-11-05) | 12.0.0은 2026-08-26. 로컬 설치는 12.11.2였고, 실험은 `npx pnpm@12.18.0`으로 함 |
| `npm` | 12.2.2 | npm 12는 2026-07-08에 GA |
| `turbo` | 2.11.10 | 배포 흐름과 직접 관계는 없음 |
| `lucide-static` / `lucide-react` | 1.70.0 | Q8 분석용 |
| Node.js(실험 환경) | 26.12.1 | |

npm 정책은 docs.npmjs.com 현재 문서와 GitHub Changelog 원문 날짜로 확인했다. 도구 문서는 changesets.dev, pnpm.io, 각 GitHub 저장소의 원문(README, CHANGELOG, 소스)을 봤다.

### 직접 실험한 환경

scratchpad에 Tide와 같은 모양의 workspace를 만들었다(저장소 밖, publish하지 않음). `foundation`(dependencies에 `clsx: catalog:`), `icons`(devDependencies에 `react: catalog:strict`), `desktop`(`@tide-tds/foundation: workspace:^`, `@tide-tds/icons: workspace:*`, `clsx: catalog:`) 세 패키지를 0.1.0으로 두었다. pnpm 12.18.0과 `@changesets/cli` 3.0.3으로 `pack`, `changeset version`, `changeset pack`, `changeset publish-plan`을 실행했다. 이 절의 "실험" 표시는 모두 이 환경의 결과다.

---

## 1. changesets 최신 버전과 pnpm workspace·catalog 지원

### 버전과 3.0의 주요 변경

`@changesets/cli` 최신 안정 버전은 **3.0.3**이다. 3.0.0(2026-08-11)에서 바뀐 것 중 Tide와 관련 있는 것만 적는다. 출처는 [packages/cli/CHANGELOG.md](https://github.com/changesets/changesets/blob/main/packages/cli/CHANGELOG.md)다.

- publish할 때 패키지 매니저 CLI(npm, pnpm, yarn)를 거쳐 호출한다(#2097). pnpm 프로젝트라면 실제 업로드는 pnpm이 한다.
- `changeset pack --out-dir`(#2062), `changeset publish --from-pack-dir`(#2063), `changeset publish-plan`(#2061)이 새로 생겼다. 빌드·pack 단계와 publish 단계를 다른 job으로 나눌 수 있다.
- private 패키지는 기본적으로 version을 올리지 않는다(#2186). `apps/docs`(private Storybook)가 여기에 해당한다.
- peer dependency가 바뀌면 그것을 쓰는 패키지를 `major`가 아니라 `patch`로 올린다(#2090).
- `prettier` 옵션이 없어지고 `format`(`"auto"`, `"prettier"`, `"oxfmt"`, `"deno"`, `"dprint"`, `false`)으로 바뀌었다(#1994). Tide가 쓰는 oxfmt를 지정할 수 있다.
- prerelease 상태 파일 구조가 `.changeset/pre/` 폴더로 바뀌었다(#2190).
- `changeset tag`가 `changeset git-tag`로 이름이 바뀌었다(#2128). `changeset version`은 changeset이 없으면 exit code 1로 끝난다(#1860).
- 3.0.3에서 "pnpm 10과 npm 12를 함께 쓸 때 registry 조회, pack, publish 호환 문제"를 고쳤다(#2276).

### `workspace:`와 `catalog:`가 publish할 때 실제 버전으로 바뀌는지

**pnpm이 바꾼다. changesets가 직접 바꾸지는 않는다.**

- pnpm 공식 문서: `pnpm pack`이나 `pnpm publish`로 묶을 때 `workspace:` 의존성을 실제 버전으로 바꾼다. `workspace:*`는 정확한 버전, `workspace:^`는 `^버전`, `workspace:~`는 `~버전`이 된다([pnpm Workspace — Publishing workspace packages](https://pnpm.io/workspaces#publishing-workspace-packages)). `catalog:`도 `pnpm publish`·`pnpm pack`에서 제거되고 catalog에 적힌 범위로 바뀐다([pnpm Catalogs — Publishing](https://pnpm.io/catalogs#publishing)).
- **실험**: `pnpm pack`(12.18.0) 결과물의 `package.json`

  | 원본 | pack 결과 |
  | --- | --- |
  | `"@tide-tds/foundation": "workspace:^"` | `"^0.1.0"` |
  | `"@tide-tds/icons": "workspace:*"` | `"0.1.0"` |
  | `"clsx": "catalog:"` | `"^2.1.1"` |
  | `"react": "catalog:strict"`(devDependencies) | `"19.3.1"` |

- **실험**: 같은 패키지를 `npm pack`(12.x)으로 묶으면 `workspace:^`, `catalog:`가 **그대로 남는다**. npm CLI로 publish하면 안 되고 pnpm을 거쳐야 한다.
- **실험**: `changeset pack --out-dir`로 만든 tarball에서도 위 표와 똑같이 바뀌었다. changesets 3이 pack을 pnpm에 맡기기 때문이다. `publish-plan.json`에는 의존 순서대로 묶인 목록(foundation·icons 먼저, desktop 다음)과 tarball의 integrity가 들어간다.
- **실험**: `changeset version`은 소스의 `workspace:^`, `workspace:*`, `catalog:`를 그대로 둔다. 버전 숫자만 바꾸고 CHANGELOG.md를 만든다.

### 주의할 점: catalog 안에 내부 패키지를 넣는 경우

pnpm 12.2.0부터 catalog 항목에 `workspace:` 범위를 넣을 수 있다(`'@tide-tds/foundation': workspace:^`를 catalog에 두고 desktop에서 `catalog:`로 참조). pnpm 자체는 이것을 문제없이 처리한다([pnpm Catalogs — Workspace dependencies in a catalog](https://pnpm.io/catalogs#workspace-dependencies-in-a-catalog)).

**실험**: 이렇게 바꾼 뒤 foundation에 minor changeset을 넣었더니, changesets 3.0.3은 `Package @tide-tds/desktop must depend on the current version of @tide-tds/foundation: 0.1.0 vs catalog:` 경고를 내고 **desktop을 올리지 않았다**(foundation만 0.2.0). 반면 `pnpm pack`은 desktop의 의존성을 `^0.2.0`으로 바꿨다. 즉 desktop 0.1.0을 다시 배포하지 않으면 registry의 desktop은 계속 `^0.1.0`을 가리킨다. changesets는 내부 의존 관계를 `catalog:`를 통해 따라가지 못한다.

### 시사점

- CI의 publish 단계는 반드시 pnpm(`pnpm publish`, `pnpm pack`, 또는 pnpm을 거치는 `changeset publish`)으로 해야 한다. `npm publish`를 직접 쓰면 `workspace:`, `catalog:`가 그대로 배포된다.
- changesets를 쓴다면 내부 패키지끼리는 `workspace:`로 직접 적고, catalog에는 외부 의존성만 두는 것이 안전하다.
- changesets 3은 2026-08에 나온 새 major이고 아직 patch 3개째다. `changesets/action`도 v2(Changesets v3 전용)로 함께 바뀌었으므로, 블로그 예제 중 v1 문법(`NPM_TOKEN`으로 `.npmrc` 자동 생성, camelCase 입력)은 쓸 수 없다.

---

## 2. 다른 선택지와의 차이

조사 중에 **pnpm 자체 릴리스 관리**가 있다는 것을 확인해서 선택지에 넣었다.

| | changesets 3 | pnpm 자체 릴리스 관리 | release-please | semantic-release | 수동 `pnpm publish -r` |
| --- | --- | --- | --- | --- | --- |
| 변경 기록 방식 | `.changeset/*.md` 파일(사람이 bump 종류와 요약을 씀) | 같은 `.changeset/*.md` 형식(`pnpm change`) | Conventional Commits 메시지 | Conventional Commits 메시지 | 없음(직접 버전 수정) |
| 모노레포 | 기본 지원 | 기본 지원 | manifest 모드 + `node-workspace` 플러그인 | 공식 미지원(이슈 #193, 2016년부터 open) | `-r`로 전체 |
| 버전 올리는 PR | `changesets/action`이 "Version Packages" PR을 만듦 | 없음. `pnpm version -r` 후 직접 커밋 | Release PR을 만듦 | 없음(push 시 바로 릴리스) | 없음 |
| npm publish | 함(pnpm 경유) | 함(`pnpm publish -r`) | **하지 않음**. 별도 단계 필요 | 함(`@semantic-release/npm`) | 함 |
| `workspace:`·`catalog:` 치환 | pnpm이 함(실험 확인) | pnpm이 함 | publish를 하지 않으므로 해당 없음. publish를 pnpm으로 하면 됨 | `@semantic-release/npm`은 npm CLI를 씀. 치환되지 않을 것으로 보이지만 **직접 확인하지 않음** | pnpm이 함 |
| fixed / linked | `fixed`, `linked` | `versioning.fixed` | `linked-versions` 플러그인 | 해당 없음 | 해당 없음 |
| prerelease | `pre enter <tag>`, `--snapshot` | `lanes`(패키지별 prerelease 트랙) | `prerelease` 버전 전략 | branch 설정 | 직접 |
| CHANGELOG | 패키지마다 CHANGELOG.md 커밋 | 기본은 커밋하지 않고 tarball 안에 넣음(`changelog.storage: registry`). `repository`로 바꿀 수 있음 | CHANGELOG.md 커밋 | 플러그인 | 없음 |

### 도구별 근거

- **changesets 3**: 위 1절. GitHub Action은 `select-mode`, `version`, `pack`, `publish`, `pr-status` 등 하위 action으로 나뉜다([changesets/action README](https://github.com/changesets/action)). trusted publishing을 쓴다면 하위 action을 따로 써서 publish 권한을 좁히라고 권한다.
- **pnpm 자체 릴리스 관리**: pnpm **v11.13.0**(2026-07-13)에 들어왔다("Added native workspace release management", [v11.13.0 release](https://github.com/pnpm/pnpm/releases/tag/v11.13.0)). `pnpm change`가 changesets 형식의 intent 파일을 쓰고, `pnpm version -r`이 이것을 소비해 버전을 올리고, 의존하는 패키지를 함께 올리고, 소비 기록을 `.changeset/ledger.yaml`에 남긴다. git commit과 tag는 만들지 않는다. "First releases" 규칙에 따라 아직 registry에 없는 패키지는 manifest의 버전 그대로 첫 배포된다. 그 패키지의 intent는 다음 릴리스부터 적용된다([pnpm Release management](https://pnpm.io/versioning), [Versioning settings](https://pnpm.io/settings/versioning)). `versioning.maxBump`로 한 릴리스에서 올릴 수 있는 최대 bump를 제한할 수 있다.
  - **실험**: changesets용으로 쓴 같은 `.changeset/b.md`를 `pnpm change status`와 `pnpm version -r --dry-run`이 읽었다. foundation이 registry에 없으므로 계획은 `0.1.0 → 0.1.0 (minor, via intent)`, 즉 첫 배포는 0.1.0으로 나왔다.
  - GitHub PR 자동화(changesets/action 같은 것)에 해당하는 공식 Action은 찾지 못했다(**확인 불가**).
- **release-please**: README에 "It does not handle publication to package managers"라고 적혀 있다([README](https://github.com/googleapis/release-please#readme)). `node-workspace` 플러그인 소스는 `workspace:`로 시작하는 범위를 인식해 릴리스 노트에 적는다([src/plugins/node-workspace.ts](https://github.com/googleapis/release-please/blob/main/src/plugins/node-workspace.ts)). `catalog:`를 처리하는 코드나 관련 이슈는 찾지 못했다. 0.x 관련 옵션은 5절에 있다.
- **semantic-release**: 저장소 이슈 [#193 "Multi-package repositories support"](https://github.com/semantic-release/semantic-release/issues/193)가 2016-03-03부터 열려 있다. 모노레포에는 서드파티 래퍼(`semantic-release-monorepo` 8.0.2, 마지막 갱신 2024-02, `@anolilab/multi-semantic-release` 4.6.3)를 써야 한다. FAQ에 "initial release version을 0.0.1로 하는 것은 지원하지 않는다. major version zero는 semantic-release의 목표 범위가 아니다"라고 적혀 있다([FAQ](https://semantic-release.gitbook.io/semantic-release/support/faq)). `@semantic-release/npm`은 trusted publishing을 권장한다.
- **수동 `pnpm publish -r`**: 아직 registry에 없는 버전을 가진 패키지를 모두 publish한다. 기본적으로 git 상태(깨끗한 working tree, publish branch, remote와 동기화)를 검사한다. `--report-summary`, `--publish-wait-timeout`(12.7.0+, npm 악성코드 검사 지연에 대응) 같은 옵션이 있다([pnpm publish](https://pnpm.io/cli/publish)).

### 레퍼런스 시스템이 쓰는 도구 (저장소 파일로 확인)

| 저장소 | 도구 |
| --- | --- |
| primer/react | changesets(`linked: []`, 독립 버전) |
| daangn/seed-design | changesets(일부 패키지 쌍만 `linked`) |
| tabler/tabler-icons | changesets(`fixed: [["@tabler/icons*"]]`) |
| carbon-design-system/carbon, adobe/react-spectrum | lerna(`lerna.json` 있음. carbon은 `"version": "independent"`) |
| radix-ui/themes, lucide-icons/lucide, mantinedev/mantine | `.changeset`, `release-please-config.json`, `lerna.json` 모두 없음(자체 스크립트로 보임, **세부 확인 안 함**) |

### 시사점

- Tide 커밋 메시지는 현재 `docs: …` 형식이다. release-please와 semantic-release는 Conventional Commits에 의존하므로, 커밋 규칙이 곧 배포 규칙이 된다. changesets와 pnpm 자체 방식은 커밋 메시지와 무관하다.
- changesets와 pnpm 자체 방식은 같은 `.changeset/*.md` 파일 형식을 쓴다. 다만 pnpm 자체 방식은 2026-07에 나온 새 기능이고, 버전 PR 자동화가 없으며, CHANGELOG 기본값이 "저장소에 커밋하지 않음"이다.
- semantic-release는 모노레포와 0.x 둘 다 공식 범위 밖이다.

---

## 3. npm trusted publishing(GitHub Actions OIDC)의 현재 상태

### 상태

- 2025-07-31에 GA([GitHub Changelog](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)).
- 지원 CI: GitHub Actions(GitHub-hosted runner), GitLab CI/CD(GitLab.com shared runner), CircleCI cloud. self-hosted runner는 지원하지 않는다.
- 요구 버전: npm CLI 11.5.1 이상, Node 22.14.0 이상. dist-tag를 OIDC로 다루려면 npm 11.21.0 이상 또는 12.2.0 이상.
- 출처: [Trusted publishing for npm packages](https://docs.npmjs.com/trusted-publishers)(2026-10-06 마지막 수정).

### 2026년에 바뀐 것 (GitHub Changelog 날짜순)

| 날짜 | 변경 |
| --- | --- |
| 2026-05-22 | staged publishing(`npm stage publish` → 2FA로 승인) 도입([changelog](https://github.blog/changelog/2026-05-22-staged-publishing-and-new-install-time-controls-for-npm/)) |
| 2026-09-03 | 패키지당 trusted publisher 설정을 여러 개(최대 10개) 둘 수 있음. **2026-09-03 이후 만든 설정은 기본으로 `npm stage publish`만 허용**하고, 직접 `npm publish`는 설정마다 따로 켜야 함. 악성코드 검사가 끝나야 staged 패키지를 승인할 수 있음([changelog](https://github.blog/changelog/2026-09-03-multiple-trusted-publishing-configurations-for-npm/)) |
| 2026-09-30 | trusted publishing으로 dist-tag를 다루는 권한(Allow npm dist-tag)이 opt-in으로 추가됨([changelog](https://github.blog/changelog/2026-09-30-opt-in-dist-tag-permissions-for-npm-trusted-publishing/)) |
| 2026-10-02 | 새로 만든 설정은 **48시간 안에 첫 publish로 검증하지 않으면 만료**됨. GitHub Actions의 `issue_comment` 이벤트에서 온 OIDC 토큰은 거부(`pull_request_target`은 원래 거부)([changelog](https://github.blog/changelog/2026-10-02-unvalidated-npm-trusted-publishing-configurations-now-expire/)) |
| 2026-10-02 | `npm stage publish`로 **새 패키지를 만들 수 있음**(로컬 세션이나 granular token). 첫 버전은 승인 대기열에 들어감. "After package creation, you can manage its settings and configure trusted publishing"([changelog](https://github.blog/changelog/2026-10-02-npm-staged-publishing-now-supports-creating-new-packages/)) |

### 설정 방법 (npm 공식 문서 기준)

1. npmjs.com → 패키지 Settings → Trusted Publisher에서 GitHub Actions를 고르고 org/user, repository, workflow 파일 이름(경로 없이 `publish.yml`), 선택적으로 environment 이름과 허용 동작(stage만 / 직접 publish / dist-tag)을 넣는다. 문서상 설정은 **패키지 설정 화면**에서 하므로, 패키지가 먼저 있어야 한다(위 2026-10-02 changelog 문구도 같은 순서를 말한다).
2. workflow에 `permissions: id-token: write`를 준다. npm CLI가 OIDC 환경을 감지해 짧은 수명의 토큰으로 바꾼다.
3. `package.json`의 `repository.url`이 GitHub 저장소와 정확히 같아야 한다.
4. `workflow_call`로 다른 workflow를 부르는 경우 검증은 **호출한 쪽** workflow 이름으로 하고, 양쪽 모두 `id-token: write`가 필요하다.
5. 설정한 뒤에는 Publishing access를 "Require two-factor authentication and disallow tokens"로 바꾸는 것을 권장한다. 이 설정은 trusted publishing(OIDC)에는 영향이 없다.

### provenance

- trusted publishing으로 GitHub Actions나 GitLab에서 publish하면 `--provenance` 없이도 provenance가 자동으로 붙는다. 조건은 **공개 저장소**이고 **공개 패키지**일 것. **private 저장소에서는 공개 패키지라도 provenance가 생성되지 않는다**([Trusted publishers — Automatic provenance generation](https://docs.npmjs.com/trusted-publishers), [Generating provenance statements](https://docs.npmjs.com/generating-provenance-statements)).
- pnpm도 trusted publishing에서 공개 저장소의 공개 패키지에 provenance를 스스로 붙인다. `--no-provenance` 또는 `provenance: false`로 끈다([pnpm publish — provenance](https://pnpm.io/cli/publish#--provenance)).
- **현재 Tide 저장소 `chane81/tide-design-system`은 `gh repo view` 기준 `PRIVATE`이다**(2026-11-09 확인).

### changesets·pnpm과 함께 쓸 때

- changesets.dev 가이드: "At the moment, Staged Publishing does not work with Changesets, so you should use Trusted Publishing instead for now." `id-token: write`는 publish하는 job에만 주고 build·test·pack·publish를 job으로 나누라고 권한다. 예시는 `select-mode` → `version` → `pack` → `publish`(마지막 job에만 `id-token: write`) 구조다([Automating Changesets](https://changesets.dev/guide/automating)).
- changesets 저장소 이슈 [#2025 "Support npm staged publishing in changeset publish"](https://github.com/changesets/changesets/issues/2025)는 2026-05-21에 열렸고 아직 open이다.
- 새 trusted publisher 설정은 기본이 "stage만 허용"(2026-09-03 이후)이므로, changesets로 publish하려면 설정에서 **직접 `npm publish` 허용을 켜야** 한다(문서의 허용 동작 설명에서 추론. 실제 publish로 확인하지 않음).
- pnpm에는 `pnpm stage publish`/`approve`가 있다. `-r`로 workspace 전체를 stage할 수 있고, approve는 여러 stage를 OTP 하나로 의존 순서대로 승인한다(v12.0.0+, [pnpm stage](https://pnpm.io/cli/stage)). 반면 `npm stage`는 "This command is unaware of workspaces"라고 적혀 있다([npm stage](https://docs.npmjs.com/cli/v12/commands/npm-stage)).
- pnpm은 OIDC로 publish와 dist-tag를 처리한다(릴리스 노트에 `pnpm dist-tag` OIDC 지원 기록). `pnpm stage publish`가 OIDC를 쓰는지는 문서에서 찾지 못했다(**확인 불가**).

### 시사점

- 저장소가 private인 동안에는 trusted publishing을 써도 provenance 배지가 붙지 않는다. 공개 배포 포트폴리오라는 목표와 연결되는 쟁점이다.
- 세 패키지 모두 아직 registry에 없다. 첫 버전은 사람이 2FA로 직접 publish하거나 `npm stage publish`(또는 `pnpm stage publish`) 후 승인해야 하고, 그 뒤에 trusted publisher를 설정해 48시간 안에 CI로 한 번 publish해야 설정이 검증된다.
- trusted publishing의 "직접 publish 허용"과 "stage만 허용" 중 무엇을 고르느냐에 따라 쓸 수 있는 도구가 갈린다(changesets는 지금 stage를 못 씀).

---

## 4. npm 토큰·2FA 정책 변경과 `tide-tds` org에 주는 영향

### 지금까지의 변경 (GitHub Changelog 원문)

| 날짜 | 변경 |
| --- | --- |
| 2025-09-29 발표 | 새 write granular token은 기본 만료 7일, 최대 90일(이전엔 무제한). 새 TOTP 2FA 설정 중단 예고([changelog](https://github.blog/changelog/2025-09-29-strengthening-npm-security-important-changes-to-authentication-and-token-management/)) |
| 2025-11-05 | classic token 생성 중단. write granular token은 기본으로 2FA를 요구하고 "Bypass 2FA" 옵션(기본 꺼짐)이 생김. 기존 write granular token도 90일로 제한([changelog](https://github.blog/changelog/2025-11-05-npm-security-update-classic-token-creation-disabled-and-granular-token-changes/)) |
| 2025-12-09 | classic token 전부 영구 폐기. `npm login`은 2시간짜리 세션 토큰을 줌. 새 패키지는 패키지 설정에서 2FA가 기본으로 켜짐([changelog](https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/)) |
| 2026-07-08 | npm 12 GA. 2FA 우회 토큰의 민감한 사용을 단계적으로 막기 시작([changelog](https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/)) |
| 2026-07-31 | 2FA 우회 토큰으로 토큰 생성·삭제, 패키지 access·maintainer·**trusted publishing 설정 변경**, org/team 관리를 할 수 없음. 대화형 2FA 필요. **2FA 우회 토큰의 직접 publish 제거를 2027년 1월 목표로 함**([changelog](https://github.blog/changelog/2026-07-31-restricting-npm-bypass-2fa-granular-access-tokens/)) |
| 2026-09-18 | "Read and write (stage only)" 토큰 추가. 이 토큰은 `npm stage publish`만 되고 직접 publish는 `E_STAGE_REQUIRED`로 거부됨([changelog](https://github.blog/changelog/2026-09-18-stage-only-npm-tokens-for-safer-automation/)) |

현재 문서([About access tokens](https://docs.npmjs.com/about-access-tokens), 2026-09-10 수정)에도 "The ability to publish new package versions directly with a granular access token will be removed in **January 2027**"라고 적혀 있다. 목표 시점이고 확정 날짜는 아니다.

### 패키지 단위 publish 설정 ([Requiring 2FA for package publishing](https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification), 2026-08-03 수정)

- 기본값: "Require two-factor authentication **or** a granular access token with bypass 2fa enabled". 사람은 2FA로 publish하고, 자동화는 우회 토큰을 쓸 수 있다.
- 권장값: "Require two-factor authentication and disallow tokens". granular token은 우회 설정과 관계없이 publish하지 못한다. trusted publishing은 계속 된다.

### `tide-tds` org(개인 소유, owner 2FA 켜짐)에 주는 영향

- **로컬 publish**: `npm login` 세션은 2시간이고 publish할 때 2FA를 요구한다. pnpm은 OTP를 `--otp`, `PNPM_CONFIG_OTP`로 받거나 직접 묻고, web 인증이면 QR을 보여준다([pnpm publish — --otp](https://pnpm.io/cli/publish#--otp)). changesets 3도 npm·pnpm 환경 변수에서 OTP를 읽고, 인증이 필요하면 대화형으로 넘어간다(CHANGELOG #2065).
- **CI에서 토큰으로 publish**: 2FA 우회 granular token이 필요하다. 최대 90일이라 주기적으로 다시 만들어야 하고, 토큰 생성 자체가 대화형 2FA를 요구한다(2026-07-31). 2027년 1월 이후에는 이 방식의 직접 publish가 막힐 예정이다. 대안은 stage-only 토큰 + 사람 승인, 또는 trusted publishing이다.
- **org 권한과 토큰**: 토큰에 organization 접근을 주면 org 설정·팀 관리만 할 수 있고 "It does not give the token the right to publish packages managed by the organization". publish용 토큰은 패키지나 scope(`@tide-tds`) 단위로 권한을 줘야 한다(About access tokens).
- **trusted publisher 설정, maintainer 추가** 같은 작업은 항상 owner가 웹이나 CLI에서 2FA로 해야 한다.
- 티켓 18에서 본 로그인 안내 "npm tokens that bypass 2FA are being restricted for account changes and direct publishing"은 위 2026-07-31 변경과 2027년 1월 예고를 가리킨다.

### 시사점

- 새로 설정한다면 "토큰을 secret에 넣고 CI에서 publish"하는 방식은 1년도 안 돼 막힐 예정이다. 남는 길은 trusted publishing(직접 또는 stage), stage-only 토큰 + 사람 승인, 로컬에서 사람이 2FA로 publish 세 가지다.
- 1인 프로젝트에서 staged publishing을 쓰면 릴리스마다 사람이 승인해야 한다. pnpm은 여러 stage를 OTP 하나로 승인할 수 있다.

---

## 5. 0.x semver 관례와 레퍼런스 시스템의 초기 버전 정책

### 규칙

- SemVer 2.0.0 항목 4: "Major version zero (0.y.z) is for initial development. Anything MAY change at any time. The public API SHOULD NOT be considered stable." FAQ: 0.1.0으로 시작해 릴리스마다 minor를 올리는 것이 가장 간단하다. 프로덕션에서 쓰이거나 사용자가 의존하는 안정 API가 있으면 1.0.0이어야 한다([semver.org](https://semver.org/#spec-item-4)).
- 즉 SemVer 명세는 0.x에서 minor가 breaking을 뜻한다고 **정하지 않는다**. "아무거나 바뀔 수 있다"고만 한다.
- 실제로는 npm의 caret 범위가 그 관례를 만든다. `^0.2.3` := `>=0.2.3 <0.3.0-0`, `^0.0.3` := `>=0.0.3 <0.0.4-0`. node-semver README: "Many authors treat a `0.x` version as if the `x` were the major 'breaking-change' indicator"([node-semver — Caret Ranges](https://github.com/npm/node-semver#caret-ranges-123-025-004)).
- **실험**: `pnpm pack`은 `workspace:^`를 `^0.1.0`으로 바꾼다. 그래서 foundation이 0.2.0이 되면 이미 배포된 desktop 0.1.x는 foundation 0.2.0을 받지 않는다.

### 도구별 0.x 처리

| 도구 | 0.x에서 breaking(major) 요청 시 |
| --- | --- |
| changesets 3.0.3 | **실험**: icons 0.1.0에 `major` changeset → **1.0.0**. 0.x 전용 옵션은 config 문서에서 찾지 못함([config](https://changesets.dev/guide/config)). 0.x 동안 breaking을 minor로 내려면 changeset에 `minor`라고 직접 써야 함 |
| pnpm 자체 릴리스 관리 | 0.x 전용 규칙은 문서에 없음. `versioning.maxBump: minor`로 한 릴리스의 bump를 minor까지로 제한할 수 있음. 제한을 넘는 요청을 낮추는지 거부하는지는 **확인 불가**(registry에 배포된 패키지가 있어야 실험 가능) |
| release-please | `bump-minor-pre-major`(BREAKING CHANGE가 1.0.0 전에는 minor만 올림), `bump-patch-for-minor-pre-major`(feat가 1.0.0 전에는 patch만 올림). 둘 다 기본 false([manifest-releaser.md](https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md)) |
| semantic-release | 0.x 시작 자체를 지원하지 않음(FAQ) |

### 레퍼런스 시스템의 초기 버전 (npm `time` 기록으로 확인)

| 패키지 | 첫 안정판 | 0.x 기간 | 1.0.0 | 현재 |
| --- | --- | --- | --- | --- |
| `@radix-ui/themes` | 0.0.0 (2023-06-15) | 0.0.x 49개, 약 2개월 | 2023-08-08 | 3.3.0 |
| `@carbon/react` | 0.1.0 (2021-07-30) | 0.1~0.17, 27개, 약 8개월 | 2022-03-31(직전 `1.0.0-rc.0`) | 1.120.0 |
| `@seed-design/react` | 0.0.1 (2025-02-24) | 0.0.1~0.2.5, 54개, 약 7개월 | 2025-09-25 | 3.2.0 |
| `@mantine/core` | 0.1.0 (2021-01-07) | 0.1~0.9, 28개, 약 4개월 | 2021-05-03 | 9.7.5 |
| `@material/web` | 0.x 안정판 없음(`0.1.0-alpha.0` 2022-08) | prerelease만 | 2023-09-26(직전 `1.0.0-pre.*`) | 2.5.0 |
| `react-aria-components` | 0.0.x 4개(2018) | 이후 오래 `nightly` prerelease | 2023-12-20 | 1.22.1 |
| `@base-ui/react` | `1.0.0-rc.1`로 시작(이전 이름 `@base-ui-components/react`는 `1.0.0-alpha.*`) | 0.x 없음 | 2025-12-11 | 1.9.0 |
| `@chakra-ui/react`, `@atlaskit/button` | 1.0.0으로 시작 | 없음 | | 3.38.0 / 25.7.1 |
| `@primer/react` | 이전 이름 `@primer/components`가 10.0.0부터 기록됨 | 확인 안 함 | | 38.45.0 |
| `lucide-react` | 0.11.0 (2020-12) | **0.x 634개, 5년 넘게** | 2026-03-23 | 1.70.0 |

0.x를 쓴 시스템도 대부분 수개월 안에 1.0.0으로 갔다. Lucide는 0.x로 오래 있으면서 minor를 매우 자주 올렸다.

### 시사점

- 0.x 동안 minor를 breaking으로 쓸지는 도구가 정해 주지 않는다. changesets는 사람이 bump 종류를 적으므로 관례를 문서로 정해야 한다.
- 0.x에서 foundation의 minor를 올리면 desktop의 `^0.y` 범위를 벗어나므로 desktop도 다시 배포해야 한다(6절 실험 참고).

---

## 6. 여러 패키지 버전을 함께 올릴지 따로 올릴지

### changesets의 세 방식 (**실험**: foundation에만 `minor` changeset, 모두 0.1.0에서 시작)

| 설정 | foundation | icons | desktop | 설명 |
| --- | --- | --- | --- | --- |
| 독립(기본) | 0.2.0 | 0.1.0 | **0.1.1** | desktop의 `workspace:^`(배포 시 `^0.1.0`) 범위를 0.2.0이 벗어나므로 desktop이 patch로 올라감(`updateInternalDependencies: "patch"`) |
| `linked: [["@tide-tds/*"]]` | 0.2.0 | 0.1.0 | **0.2.0** | 올라가는 패키지만 그룹의 가장 높은 버전에 맞춤. icons는 변경이 없어 그대로 |
| `fixed: [["@tide-tds/*"]]` | 0.2.0 | **0.2.0** | **0.2.0** | 변경이 없어도 모두 같은 버전으로 올리고 함께 publish |

공식 설명: fixed는 "versioned and published together even when some of them have no changes", linked는 "share a version"이지만 바뀐 패키지만 올린다([Fixed Packages](https://changesets.dev/guide/fixed-packages), [config — linked](https://changesets.dev/guide/config#linked)). pnpm 자체 방식에는 `versioning.fixed`가 있다(fixed와 같은 뜻). release-please에는 `linked-versions` 플러그인이 있다(이름은 linked지만 설명은 "update all group components to the same version", 즉 fixed에 가깝다).

### 레퍼런스 시스템의 관례

| 시스템 | 버전 묶음 | 내부 의존 방식 |
| --- | --- | --- |
| Primer | 독립(`linked: []`) | `@primer/react`가 `@primer/octicons-react`를 `dependencies` `^19.28.1`로, `@primer/primitives`를 `10.x \|\| 11.x`로 둠 |
| Carbon | 독립(lerna `independent`) | `@carbon/react`가 `@carbon/icons-react`·`@carbon/styles`를 `dependencies` `^`로 둠 |
| Atlassian | 독립 | `@atlaskit/button`이 `@atlaskit/icon`·`@atlaskit/tokens`를 `dependencies` `^`로 둠 |
| SEED | 대부분 독립, 일부 쌍만 linked | `@seed-design/react`가 `@seed-design/css`를 **peerDependencies** `^3.2.0`으로 둠 |
| Mantine | 모든 패키지가 같은 버전(9.7.5) | `@mantine/core`가 `@mantine/hooks`를 **peer로 정확한 버전**(`9.7.5`) 고정 |
| Tabler Icons | `fixed: [["@tabler/icons*"]]` | 아이콘 패키지끼리 같은 버전 |
| Lucide | 모든 패키지가 같은 버전(`lucide-react`, `lucide-static` 모두 1.70.0) | |

desktop처럼 Component 패키지가 아이콘 패키지에 의존할 때는 `dependencies` + `^` 범위가 가장 흔하다(Primer, Carbon, Atlassian). 스타일·Token 패키지는 dependency로 두는 곳(Carbon, Atlassian)과 peer로 두는 곳(SEED)이 나뉜다.

### 기타 사실

- **실험**: `workspace:*`는 정확한 버전(`0.1.0`)으로, `workspace:^`는 `^0.1.0`으로 배포된다. 정확한 버전으로 고정하면 사용자 앱에서 icons를 따로 설치한 경우 버전이 다르면 두 벌이 설치될 수 있다(일반적인 npm 동작. 실험하지 않음).
- changesets 3에서 peer dependency 변경은 의존하는 패키지를 patch로 올린다(#2090). Primer는 `onlyUpdatePeerDependentsWhenOutOfRange: true` 실험 옵션을 쓴다.
- pnpm 자체 방식의 `versioning.epics`는 lead 패키지의 major에 member들의 major 범위를 묶는 기능이다. Tide 규모에서 필요할지는 판단하지 않았다.

### 시사점

- 0.x에서는 foundation의 minor가 곧 desktop의 범위 이탈이라, 독립 방식이어도 desktop이 자주 함께 올라간다.
- fixed는 "모든 Tide 패키지가 같은 숫자"라는 단순함을 주지만, 아이콘만 바뀌어도 foundation·desktop이 새 버전으로 배포된다. 아이콘 패키지는 Lucide 업데이트(주 단위로 나옴)를 따라 자주 바뀔 수 있다.

---

## 7. prerelease(`next`, `canary` dist-tag) 흐름

### npm 규칙

- `npm stage` 문서: prerelease 버전(예: `1.0.0-beta.1`)과 latest가 아닌 버전은 `--tag`를 직접 줘야 하고, 안 주면 CLI가 에러를 낸다. "just as npm publish would"([npm stage — Tag Behavior](https://docs.npmjs.com/cli/v12/commands/npm-stage)). stage한 패키지의 tag는 나중에 바꿀 수 없다.
- pnpm `--tag <tag>`: 기본은 `latest`를 갱신한다([pnpm publish](https://pnpm.io/cli/publish#--tag-tag)).
- changesets 3 CHANGELOG(#2097): prerelease 버전만 있는 패키지는 prerelease 모드에서 prerelease tag로 publish한다. 다만 **npm registry는 첫 publish에 `latest`를 자동으로 붙이므로, npm에서는 계속 `latest`로 publish된다.** 즉 Tide가 첫 버전을 `0.1.0-next.0`으로 내면 `latest`가 prerelease를 가리키게 된다.

### changesets의 두 방식 (**실험**)

- **pre 모드**: `changeset pre enter next` 후 desktop `minor` → `0.2.0-next.0`. 상태는 `.changeset/pre.json`과 `.changeset/pre/`(3.0의 새 구조)에 남는다. `publish-plan`은 모든 패키지를 `(next)` tag로 계획했다(아직 registry에 없는 foundation·icons 0.1.0까지 포함). 공식 문서는 "Prereleases are very complicated!"라고 경고하고, pre 모드에 들어가기 전에 안정판을 한 번 내라고 권한다([Prereleases](https://changesets.dev/guide/prereleases)).
- **snapshot**: `changeset version --snapshot canary` → `0.0.0-canary-20261109061649`. 버전을 커밋하지 않고 테스트용으로 내는 방식이다. 형식은 `snapshot.prereleaseTemplate`(`{tag}`, `{commit}`, `{commit-short}`, `{timestamp}`, `{datetime}`)으로 바꾼다([Snapshot Releases](https://changesets.dev/guide/snapshot-releases), [config — snapshot](https://changesets.dev/guide/config#snapshot-prereleasetemplate)).

### 다른 도구

- pnpm 자체 방식: `lanes`로 패키지를 alpha 같은 lane에 올리면, 같은 실행에서 그 패키지는 `X.Y.Z-<lane>.N`을, 나머지는 안정판을 낸다([Release management — Lanes](https://pnpm.io/versioning)).
- release-please: `prerelease` 버전 전략과 `prerelease-type`, `prerelease: true` 설정.

### 레퍼런스 시스템의 dist-tag (2026-11-09 `npm view <pkg> dist-tags`)

| 패키지 | dist-tag |
| --- | --- |
| `@primer/react` | `latest` 38.45.0, `next` `38.46.0-rc.e10581db0`, `canary` `0.0.0-20261108050529` |
| `@carbon/react` | `latest`, `next` `1.120.0-rc.0`, `v12-alpha` `2.0.0-alpha.5` |
| `@radix-ui/themes` | `latest` 3.3.0, `next` `3.2.0-rc.8`(latest보다 낮은 오래된 rc) |
| `@mantine/core` | `latest`, `next` `9.5.1-alpha.1`, `legacy` 7.17.8 |
| `@seed-design/react` | `latest`, `alpha` `0.0.0-alpha-…`, 이전 major 유지보수용 `react-v1.0`·`react-v2` 등 |
| `react-aria-components` | `latest`, `nightly` `3.0.0-nightly-…` |
| `lucide-react` | `latest` 1.70.0, `next` 1.3.0(오래됨), `beta`, `dev` |

Primer의 [release.yml](https://github.com/primer/react/blob/main/.github/workflows/release.yml)이 구체적인 예다. `id-token: write`(OIDC)를 쓰고, `changeset-release/main` 브랜치(버전 PR)에서는 `changeset version --snapshot` 후 버전을 `<다음버전>-rc.<sha>`로 고쳐 `--tag next`로 내고, 다른 브랜치에서는 가짜 patch changeset을 만들어 `--snapshot`으로 `--tag canary`를 낸다.

### 시사점

- `next`, `canary` tag가 오래 방치되면(Radix, Lucide처럼) latest보다 낮은 버전을 가리킨다. tag를 정리할 주체가 필요하다. trusted publishing으로 dist-tag를 다루려면 설정에서 "Allow npm dist-tag"를 켜야 한다(3절).
- 0.x 기간에는 정식 버전 자체가 "불안정"이라는 뜻이므로, prerelease가 따로 필요한지부터 쟁점이 된다.

---

## 8. 업스트림 아이콘 이름이 바뀔 때 다른 아이콘 패키지의 처리

### Lucide 자체

- 아이콘 메타데이터(`icons/<name>.json`)의 `aliases` 배열에 옛 이름을 남긴다. 스키마 필드는 `name`, `deprecated: true`, `deprecationReason`, `toBeRemovedInVersion`이다. 예: `house.json`의 alias `home`(deprecated)([icon.schema.json](https://github.com/lucide-icons/lucide/blob/main/icon.schema.json), [icons/house.json](https://github.com/lucide-icons/lucide/blob/main/icons/house.json)).
- `lucide-react`는 옛 이름을 새 Component의 **alias export**로 함께 내보낸다. 예: `CircleExclamationPoint as AlertCircle`, `TriangleExclamationPoint as AlertTriangle`(1.70.0 `dist/lucide-react.d.ts`). 공식 문서: "Some icons have multiple names. This is because we sometimes choose to rename them…"([Aliased Names](https://lucide.dev/guide/react/advanced/aliased-names)).
- **실험(export 이름 비교)**: `lucide-react` 0.577.0 → 1.0.1에서 이름 37개가 사라졌다(`Github`, `Figma`, `Slack` 같은 브랜드 아이콘 등. 1.0에서 브랜드 아이콘을 제거함, [1.0.1 release](https://github.com/lucide-icons/lucide/releases/tag/1.0.1)). 1.0.1 → 1.70.0 사이에는 사라진 이름이 **0개**다. 즉 1.x 안에서는 이름을 바꿔도 옛 이름을 유지하고, 지우는 것은 major에서 한다.
- **`lucide-static` 1.70.0에도 alias SVG 파일이 들어 있다.** `icons/` 폴더의 SVG는 2,322개지만, `icon-nodes.json`과 `tags.json`의 키는 **2,029개**다. 나머지 293개는 alias 이름의 SVG다(예: `home.svg`와 `house.svg`가 둘 다 있고, `home.svg`의 class는 `lucide-home`). [ADR 0007](../decisions/0007-lucide-generated-icons-package.md)의 "SVG 2,322개"는 alias 파일을 포함한 숫자다.

### 다른 아이콘 패키지

| 패키지 | 이름 변경 처리 | 근거 |
| --- | --- | --- |
| Tabler Icons 3.51.0 | 저장소 루트 `aliases.json`(outline 63개, filled 3개)에 옛 이름 → 새 이름을 두고, React 패키지가 alias export를 냄(예: `IconPackage as IconBoxSeam`). changesets `fixed`로 모든 패키지를 같은 버전으로 냄 | [aliases.json](https://github.com/tabler/tabler-icons/blob/main/aliases.json), `@tabler/icons-react` 3.51.0 d.ts |
| Heroicons | v2.0.0(major)에서 아이콘 세트를 새로 그리면서 이름을 대량으로 바꿈(`mail` → `envelope`, `search` → `magnifying-glass`). release note에 이름 대응표를 실음. alias는 두지 않음 | [v2.0.0 release](https://github.com/tailwindlabs/heroicons/releases/tag/v2.0.0) |
| Phosphor, Primer Octicons, Carbon Icons | 이번 조사에서는 확인하지 않음 | |

### 시사점

- 업스트림에서 이름이 바뀌어도 Lucide 자신은 alias를 남기므로, `lucide-static`의 alias SVG까지 생성 대상에 넣으면 Tide의 공개 export는 1.x 안에서 줄어들지 않는다. 대신 export 수가 약 14% 늘어난다(2,029 → 2,322).
- alias를 넣지 않고 정식 이름(2,029개)만 생성하면, Lucide가 이름을 바꿀 때마다 Tide의 옛 이름 export가 사라진다. 이것은 semver상 breaking이다(ADR 0007 Consequences).
- Lucide가 alias를 실제로 지우는 시점은 Lucide의 major(지난 번은 0.x → 1.0, 2026-03)였다. `toBeRemovedInVersion` 필드로 예고되는지는 이번에 아이콘별로 집계하지 않았다.

---

## 확인하지 못한 것

- `pnpm stage publish`가 GitHub Actions OIDC(trusted publishing)로 인증되는지. pnpm 문서와 릴리스 노트에서 명시를 찾지 못했다.
- pnpm 자체 릴리스 관리에서 `versioning.maxBump`를 넘는 요청을 낮추는지 거부하는지, 0.x에서 major intent를 어떻게 처리하는지. 이미 배포된 패키지가 있어야 실험할 수 있다.
- pnpm 자체 릴리스 관리용 공식 GitHub Action(버전 PR 자동화) 존재 여부.
- `@semantic-release/npm`으로 publish할 때 `workspace:`·`catalog:`가 치환되는지(npm CLI를 쓰므로 치환되지 않을 것으로 보이나 실험하지 않음).
- trusted publisher 설정이 "stage만 허용"일 때 changesets의 `changeset publish`가 실패하는 정확한 형태. 실제 publish 없이는 확인할 수 없다.
- release-please가 `catalog:` 의존성을 어떻게 다루는지(관련 코드·이슈를 찾지 못함).
- radix-ui/themes, lucide, mantine 저장소의 릴리스 스크립트 세부.
- `@primer/react`의 0.x 이력(이전 이름 `@primer/components`부터 이어지는 기록).
