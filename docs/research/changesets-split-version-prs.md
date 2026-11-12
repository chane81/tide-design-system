# changesets Version PR을 TDS와 Storybook 둘로 나눌 수 있는가

조사일: 2026-11-12

> 결정(2026-11-12): 추천안 (a)를 골라 구현했다. [ADR 0020](../decisions/0020-storybook-versioning-and-version-pr-title.md).

> 원칙: 1차 출처(설치된 패키지 소스, changesets·changesets/action의 해당 버전 태그 소스와 문서, GitHub 이슈, 다른 저장소의 실제 workflow 파일)만 근거로 삼는다. 확인하지 못한 내용은 「확인 불가」로 적는다. 코드 동작은 소스를 읽은 데 더해, 저장소를 scratchpad에 복제해 설치된 `@changesets/cli` 3.0.3으로 직접 돌려 확인했다(4절).

[release.md](release.md), [release-practices.md](release-practices.md)의 후속이다. 그 문서에 있는 도구 비교와 다른 저장소의 브랜치 운영은 다시 적지 않는다.

## 0. 질문과 결론 요약

질문: Version PR을 둘로 나눌 수 있는가.

- TDS PR: `@tide-tds/foundation`·`@tide-tds/icons`·`@tide-tds/components`(npm publish), 제목 「[TDS] Release <버전>」
- Storybook PR: private 앱 `@tide-tds/docs`(`apps/docs`), 제목 「[Storybook] Release <버전>」

결론: **조건부 가능.**

- changesets CLI만 놓고 보면 된다. `privatePackages.version`으로 docs를 버전 관리 대상에 넣고, `changeset version --ignore`로 묶음마다 따로 버전을 올리면 서로의 changeset을 지우지 않는다(실험으로 확인, 4절).
- **changesets/action v2.1.2의 공식 입력만으로는 PR 2개를 만들 수 없다.** Version PR 브랜치 이름이 `changeset-release/<base 브랜치>`로 고정이라, 둘 다 `main`을 향하면 같은 브랜치(`changeset-release/main`)를 두고 서로 덮어쓴다(3절).
- `select-mode`도 그대로 쓸 수 없다. changeset이 하나라도 남아 있으면 mode가 `version`이 되어, Storybook changeset이 쌓여 있는 동안 TDS Version PR을 머지해도 npm publish가 돌지 않는다(3.3절).
- 그래서 PR 2개는 **스크립트 보강(Storybook 쪽 Version PR 브랜치·PR을 직접 만들고, mode 판단을 직접 하기)으로만** 된다. 비용은 중간 이상이다(6절).

## 1. 현재 구성 (2026-11-12, `a3bb49b` 기준)

| 항목               | 현재 값                                                                                                                                  | 출처                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `@changesets/cli`  | 3.0.3 (`config` 4.0.1, `assemble-release-plan` 7.0.0, `apply-release-plan` 8.1.1, `should-skip-package` 1.0.0, `changelog-github` 1.0.1) | `node_modules/.pnpm/@changesets+*/…/package.json` |
| changesets/action  | `@v2`(주석 기준 v2.1.2), 하위 액션 `select-mode`·`version`·`pack`·`publish`                                                              | `.github/workflows/release.yml`                   |
| `fixed`            | `[["@tide-tds/*"]]` (glob)                                                                                                               | `.changeset/config.json`                          |
| `linked`, `ignore` | 둘 다 `[]`                                                                                                                               | 같음                                              |
| `privatePackages`  | 없음 → 기본값 `{ version: false, tag: false }`                                                                                           | 같음, 2.1절                                       |
| private 패키지     | `@tide-tds/docs`(`apps/docs`, 0.0.0), **`@tide-tds/smoke-next`(`apps/smoke-next`, 0.0.0)**, 루트 `tide-design-system`(version 없음)      | 각 `package.json`                                 |
| docs → TDS 의존    | `devDependencies`에 `workspace:*`로 세 패키지                                                                                            | `apps/docs/package.json`                          |
| Version PR 제목    | `Release ${{ steps.next.outputs.version }}` (`changeset status --output`의 components `newVersion`)                                      | `release.yml` version job                         |
| Version PR 후처리  | `pr-number`로 assignee(`github.actor`)·`release` 라벨 추가                                                                               | 같음                                              |
| CHANGELOG 한글화   | `scripts/changelog-ko.ts`가 **`packages/*`만** 돈다                                                                                      | `scripts/changelog-ko.ts` 51행                    |
| GitHub Release     | `scripts/release-notes.ts`가 `published-packages`의 버전이 하나가 아니면 실패한다(fixed 전제)                                            | `scripts/release-notes.ts`                        |
| 문서 배포          | npm publish가 실제로 됐을 때만 Dokploy에 배포 요청. Dokploy는 **main HEAD**를 받아 `apps/docs/Dockerfile`로 빌드                         | `release.yml` docs job, `apps/docs/Dockerfile`    |
| CI changeset 검사  | `changeset status --since origin/main`(private는 세지 않음), 0.x major 금지, 아이콘 이름표 규칙. `changeset-release/*` 브랜치는 건너뜀   | `scripts/check-changesets.ts`, `ci.yml` 56행      |
| git tag            | 패키지별 `@tide-tds/components@0.3.1` 등과 Release용 `v0.4.0`                                                                            | `git tag`                                         |

## 2. changesets CLI 3.0.3에서 확인한 것

### 2.1 private 패키지 버전 관리: `privatePackages`

- v3 기본값은 `{ version: false, tag: false }`다. v2는 기본으로 private을 버전 관리(태그는 안 함)했는데 v3에서 둘 다 끔으로 바뀌었다. 옛 동작은 `{ "version": true, "tag": false }`로 켠다.
  - 출처: [site/guide/migration.md @changesets/cli@3.0.3](https://github.com/changesets/changesets/blob/%40changesets/cli%403.0.3/site/guide/migration.md) 「Opt in to versioning private packages」, [site/guide/config.md](https://github.com/changesets/changesets/blob/%40changesets/cli%403.0.3/site/guide/config.md) 「privatePackages」, 설치 소스 `@changesets/config` 4.0.1 `normalizeWrittenConfig`(`privatePackages`가 객체가 아니면 `version`·`tag` 모두 그 값 또는 `false`). context7 `/changesets/changesets`도 같은 내용.
- `privatePackages: true`는 `{ version: true, tag: true }`와 같다. `tag: true`인데 `version: false`면 설정 오류다(`noPrivateTagWithoutPrivateVersion`, [config/src/rules.ts @changesets/config@4.0.1](https://github.com/changesets/changesets/blob/%40changesets/config%404.0.1/packages/config/src/rules.ts)).
- 공식 가이드 「Beyond npm」은 앱 같은 private 패키지를 `privatePackages.version`으로 버전 관리하고, `privatePackages.tag`로 `changeset publish` 때 git tag만 만드는 쓰임을 안내한다([site/guide/beyond-npm.md @changesets/cli@3.0.3](https://github.com/changesets/changesets/blob/%40changesets/cli%403.0.3/site/guide/beyond-npm.md)).
- 건너뛸 패키지 판단은 한 함수에 모여 있다. `ignore`에 있거나, private인데 `allowPrivatePackages`(=`privatePackages.version`, 태그 단계에서는 `.tag`)가 거짓이거나, **`version` 필드가 없으면** 건너뛴다([should-skip-package/src/index.ts @1.0.0](https://github.com/changesets/changesets/blob/%40changesets/should-skip-package%401.0.0/packages/should-skip-package/src/index.ts)).
- private 패키지 tag: `tag: true`면 `changeset publish`(와 `publish-plan`)가 git tag가 아직 없는 private 패키지를 `kind: "tag-only"` 항목으로 넣고 tag를 만든다(`getUntaggedPrivatePackages`, [cli/src/commands/publish-plan/getPublishPlan.ts @3.0.3](https://github.com/changesets/changesets/blob/%40changesets/cli%403.0.3/packages/cli/src/commands/publish-plan/getPublishPlan.ts)). 모노레포에서 tag 이름은 `<name>@<version>`이다([cli/src/utils/gitTags.ts @3.0.3](https://github.com/changesets/changesets/blob/%40changesets/cli%403.0.3/packages/cli/src/utils/gitTags.ts) `buildGitTag`).
- 이 tag-only 항목은 `CHANGESETS_OUTPUT`의 `git-tag` 이벤트로 나가고, changesets/action v2.1.2 publish는 이 이벤트로 `published-packages`를 만든다([src/run.ts @v2.1.2](https://github.com/changesets/action/blob/v2.1.2/src/run.ts) `runPublish`의 `output.map`). 즉 `tag: true`면 **docs가 `published-packages`에 섞이고 `published`가 `true`가 된다.** 지금 `release-notes.ts`는 버전이 하나가 아니면 실패하므로 그대로 두면 깨진다.

### 2.2 일부 패키지만 버전 올리기: `--ignore`, config `ignore`

- `changeset version --ignore <pkg>`(여러 번 가능)이 있다. config의 `ignore`가 비어 있지 않으면 `--ignore`를 쓸 수 없다(오류로 종료)([cli/src/commands/version/index.ts @3.0.3](https://github.com/changesets/changesets/blob/%40changesets/cli%403.0.3/packages/cli/src/commands/version/index.ts)). 실험으로도 확인(4절 E4).
- `changeset status`에는 `--ignore`가 없다(`--since`, `--verbose`, `--output`만). 설치 `dist/index.mjs`의 명령 정의로 확인.
- dependents 제약: 건너뛴 패키지에 **public** 패키지가 `dependencies`·`peerDependencies`·`optionalDependencies`로 기대면 오류다. **devDependencies는 세지 않고(`ignoreDevDependencies: true`), 의존하는 쪽이 private이면 넘어간다**(`validateSkippedDependents`, 같은 파일. config 쪽 `alsoSkipDependentsOfSkipped`도 같은 규칙). docs는 private이고 devDependencies로만 기대므로, 어느 쪽을 ignore해도 이 제약에 걸리지 않는다.
- 섞인 changeset 금지: 한 changeset 파일에 건너뛰는 패키지와 아닌 패키지가 함께 있으면 `Mixed changesets that contain both ignored and not ignored packages are not allowed`로 실패한다(`getRelevantChangesets`, [assemble-release-plan/src/index.ts @7.0.0](https://github.com/changesets/changesets/blob/%40changesets/assemble-release-plan%407.0.0/packages/assemble-release-plan/src/index.ts)). 실험 E2로 확인.
- dependents 자동 bump: TDS가 오를 때 docs는 devDependencies라 bump 수준이 `none`이다([determine-dependents.ts @7.0.0](https://github.com/changesets/changesets/blob/%40changesets/assemble-release-plan%407.0.0/packages/assemble-release-plan/src/determine-dependents.ts)). 실험 E1에서 TDS를 올려도 docs `package.json`은 바뀌지 않았다(`workspace:*` 그대로).
- **`fixed` glob 주의**: `fixed`의 glob은 전체 패키지 이름에 맞춰 펼친다(`globMatch`, `@changesets/config` 4.0.1). 지금 `["@tide-tds/*"]`는 docs와 smoke-next도 잡는다. 지금은 private이 건너뛰어져 상관없지만, `privatePackages.version: true`를 켜면 **docs·smoke-next가 TDS fixed 묶음에 들어가 TDS와 같은 버전(0.4.0 → 0.5.0)으로 함께 오른다.** 실험 E3로 확인. 독립 버전을 원하면 `fixed`를 세 패키지 이름으로 적어야 한다.
- smoke-next: `privatePackages.version`을 켜면 smoke-next도 버전 관리 대상이 된다(실험 E0에서 `none` 릴리스로 계획에 들어옴). config `ignore`에 넣으면 `--ignore`와 함께 못 쓰므로, **`apps/smoke-next/package.json`에서 `version` 필드를 지우거나**(should-skip-package 규칙) 모든 `--ignore` 목록에 매번 넣어야 한다.

### 2.3 changeset 소비: 한쪽 `changeset version`이 다른 쪽 changeset을 지우는가

- 지우지 않는다. `applyReleasePlan`은 changeset 파일을 지우기 전에 그 changeset의 패키지 중 **건너뛰는 패키지가 하나라도 있으면 남긴다**([apply-release-plan/src/index.ts @8.1.1](https://github.com/changesets/changesets/blob/%40changesets/apply-release-plan%408.1.1/packages/apply-release-plan/src/index.ts) changeset 삭제 부분 `!changeset.releases.some((release) => shouldSkipPackage(…))`).
- 예외: **empty changeset(`releases: []`)은 어느 쪽이 돌든 지워진다.** 두 PR이 모두 같은 파일을 지우는 변경이라 git 충돌은 없다(양쪽 삭제). 먼저 머지된 쪽 뒤에 다른 쪽 브랜치는 main에서 다시 만들어진다(3.1절 `prepareBranch`).
- `changeset version`은 건너뛰지 않는 changeset이 하나도 없어도 성공(exit 0)하고 아무 파일도 바꾸지 않는다. "No unreleased changesets"는 changeset이 **아예** 없을 때만이다(같은 version/index.ts). 실험 E5에서 docs changeset만 있을 때 TDS 모드는 변경 없이 끝났다. 그러니 **묶음마다 해당 changeset이 있는지 먼저 보고 job을 건너뛰어야** 빈 PR을 막는다.
- 두 PR이 건드리는 파일은 겹치지 않는다. TDS: `packages/*/package.json`·`CHANGELOG.md`·TDS changeset. Storybook: `apps/docs/package.json`·`apps/docs/CHANGELOG.md`·docs changeset(실험 E1·E1′).

### 2.4 CI 검사(`changeset status --since`)에 생기는 변화

- `status --since`는 "바뀐 패키지 중 버전 관리 대상"이 있는데 새 changeset이 없으면 실패한다. 대상 판단에 `privatePackages.version`을 쓴다([cli/src/utils/versionablePackages.ts @3.0.3](https://github.com/changesets/changesets/blob/%40changesets/cli%403.0.3/packages/cli/src/utils/versionablePackages.ts)).
- 따라서 `privatePackages.version: true`를 켜면 **`apps/docs`를 바꾼 PR도 changeset(또는 empty)을 요구받는다.** 지금 규칙 「문서·설정만이면 필요 없음」이 바뀐다. `changedFilePatterns`는 config 전체에 하나만 있고 패키지별로 줄 수 없다(`@changesets/config` 4.0.1 스키마).
- 판단은 "changeset이 하나라도 있나"이지 패키지별이 아니다. 즉 TDS를 바꾸고 docs changeset만 넣어도 통과한다. 묶음별로 맞는지는 `check-changesets.ts`에 규칙을 더해야 본다.

## 3. changesets/action v2.1.2에서 확인한 것

### 3.1 Version PR 브랜치 이름은 고정이다

- `version` 하위 액션 입력: `github-token`, `script`, `commit-message`, `pr-title`, `pr-draft`, `pr-base-branch`, `push-with-git-cli`, `cwd`. **head 브랜치 이름을 정하는 입력은 없다**([version/action.yml @v2.1.2](https://github.com/changesets/action/blob/v2.1.2/version/action.yml)). 출력은 `pr-number` 하나.
- `runVersion`은 `branch = pr-base-branch ?? github.ref_name`, `versionBranch = changeset-release/${branch}`로 정하고, `head: owner:versionBranch, base: branch`로 열린 PR을 찾아 있으면 갱신, 없으면 만든다([src/run.ts @v2.1.2](https://github.com/changesets/action/blob/v2.1.2/src/run.ts) `runVersion`, [src/version/index.ts](https://github.com/changesets/action/blob/v2.1.2/src/version/index.ts)). 시작할 때 `github.prepareBranch(versionBranch)`로 브랜치를 현재 커밋에서 다시 만든다.
- 그러므로 같은 저장소에서 `version` 액션을 두 번 불러도 **둘 다 `changeset-release/main`을 쓰고, 나중에 돈 쪽이 앞의 결과를 덮어쓴다.** `pr-base-branch`를 바꾸면 PR이 main이 아닌 곳을 향하게 되어 쓸 수 없다.
- 이 결합은 알려진 미해결 문제다.
  - [changesets/action#575](https://github.com/changesets/action/issues/575) (OPEN, 2026-02-09) 「`branch` input conflates version branch name and PR base, making per-workspace release branches impossible in monorepos」 — 이 질문과 정확히 같은 요구.
  - [#184](https://github.com/changesets/action/issues/184) (OPEN) Custom PR branch prefix. [#107](https://github.com/changesets/action/issues/107) (OPEN, 2021) 패키지별 여러 PR.
  - [#445](https://github.com/changesets/action/issues/445) (CLOSED, duplicate, 2026-05-15) 앱별 release PR 요청. 메인테이너 Andarist의 답(2025-05-26): changesets는 패키지 publish용으로 설계되었고, 해결하려면 config에 여러 "release line"을 두는 복잡한 기능이 필요한데 지금 작업할 시간이 없다.
  - [#254](https://github.com/changesets/action/issues/254) → [PR #255](https://github.com/changesets/action/pull/255)(2024-03-18 머지)로 생긴 것이 `branch`(지금의 `pr-base-branch`)다. 같은 이슈 댓글에 `changeset version --ignore`로 패키지마다 action을 돌리니 브랜치 이름이 겹쳐 두 번째 PR을 못 만든다는 보고(2023-06-05)와, 직접 브랜치·PR을 만드는 우회 workflow(rohit-gohri, 2024-01-30)가 있다. 같은 댓글에 `GITHUB_*` 기본 환경 변수는 덮어쓸 수 없어 `GITHUB_REF`로 속이는 방법도 안 된다고 적혀 있다(이 주장 자체는 직접 검증하지 않음).

### 3.2 `version` 액션의 `script`로 묶음을 고를 수는 있다

- `script` 입력을 주면 `changeset version` 대신 그 명령을 돌린다(`runVersion`의 `exec(script)`). 그러니 `script: pnpm changeset version --ignore @tide-tds/docs && node scripts/changelog-ko.ts` 식으로 **TDS PR 하나는 공식 액션 그대로** 만들 수 있다. 제목은 `pr-title`로 「[TDS] Release <버전>」을 줄 수 있다(지금처럼 미리 계산).
- Version PR 본문은 버전이 바뀐 패키지의 CHANGELOG에서 만든다(`getChangedPackages` → `getChangelogEntry`). private 패키지도 `private` 표시와 함께 들어간다(같은 run.ts).

### 3.3 `select-mode`는 묶음을 모른다

- `getMode`: changeset 중 비어 있지 않은 것이 하나라도 있으면 `version`, 비어 있는 것만 있으면 `none`, 없으면 `changeset publish-plan` 결과가 비지 않았을 때 `publish`([src/select-mode/index.ts @v2.1.2](https://github.com/changesets/action/blob/v2.1.2/src/select-mode/index.ts)).
- PR 2개 체제에서의 문제:
  - Storybook changeset이 남아 있는 상태에서 TDS Version PR을 머지하면 mode가 `version`이 되어 **pack/publish가 돌지 않는다.** npm 릴리스가 Storybook PR 머지까지 밀린다.
  - 반대로 TDS changeset이 남아 있으면 Storybook 릴리스(태그·배포)를 판단할 자리가 없다.
- `privatePackages.tag: true`이면 `publish-plan`에 tag 없는 private 패키지가 바로 들어간다. 실험 E6에서 changeset이 하나도 없는데도 `@tide-tds/docs@0.0.0`, `@tide-tds/smoke-next@0.0.0` tag-only 항목이 나왔다. 켜는 순간 다음 push에 `publish` mode가 되어 pack(전체 검사)이 돈다.
- `pack` 하위 액션의 `publish-plan-artifact-id`는 선택 입력이다. 없으면 `changeset pack`이 계획을 스스로 계산한다([src/pack/index.ts @v2.1.2](https://github.com/changesets/action/blob/v2.1.2/src/pack/index.ts)). 그러니 mode 판단을 직접 하는 경우에도 pack·publish 하위 액션은 그대로 쓸 수 있다.

## 4. 실험 (설치된 `@changesets/cli` 3.0.3)

방법: 저장소를 scratchpad에 `git clone`하고 `.changeset/*.md`를 지운 뒤, config를 `privatePackages: { version: true, tag: true }`, `fixed: [["@tide-tds/foundation","@tide-tds/icons","@tide-tds/components"]]`로 바꿨다. 외부 의존을 없애려고 `changelog: false`, `format: false`로 두었다(이 둘은 판단에 영향 없음). changeset 세 개를 넣었다: `tds-a`(components patch), `sb-a`(docs minor), `empty-a`(empty). 메인 저장소의 `node_modules/@changesets/cli/bin.js`로 돌렸다.

| #   | 실행                                                                                                     | 결과                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| E0  | `changeset status --output`                                                                              | docs minor 0.0.0→0.1.0, foundation·icons·components patch 0.4.0→0.4.1, **smoke-next none 0.0.0→0.0.0** |
| E1  | `changeset version --ignore @tide-tds/docs`                                                              | 세 패키지 `package.json`만 바뀜. `tds-a`·`empty-a` 삭제, **`sb-a` 남음**. `apps/docs` 변경 없음        |
| E1′ | `changeset version --ignore @tide-tds/components --ignore @tide-tds/foundation --ignore @tide-tds/icons` | `apps/docs/package.json` 0.0.0→0.1.0만 바뀜. `sb-a`·`empty-a` 삭제, **`tds-a` 남음**                   |
| E2  | components와 docs를 한 파일에 넣고 E1                                                                    | `Found mixed changeset … not allowed`로 실패                                                           |
| E3  | `fixed: [["@tide-tds/*"]]`(지금 값) + `privatePackages.version: true`로 status                           | **docs·smoke-next가 TDS와 함께 0.4.0→0.5.0**                                                           |
| E4  | config `ignore: ["@tide-tds/smoke-next"]` + `--ignore`                                                   | `--ignore option while ignore is defined in the config file … not allowed`로 exit 1                    |
| E5  | docs changeset만 두고 E1                                                                                 | 성공, 파일 변경 없음                                                                                   |
| E6  | `changeset publish-plan --output`(tag: true, changeset 없음 상태)                                        | `tag-only` 항목 `@tide-tds/docs@0.0.0`, `@tide-tds/smoke-next@0.0.0`                                   |

## 5. 다른 저장소 사례

2026-11-12에 각 저장소 기본 브랜치의 `.changeset/config.json`과 workflow를 `gh api`로 읽었다.

| 저장소                                                                                                                                                                 | private docs·storybook 처리                                                                                                                            | Version PR          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| [chakra-ui/chakra-ui](https://github.com/chakra-ui/chakra-ui/blob/main/.changeset/config.json)                                                                         | `ignore`에 `storybook-ts`, `@chakra-ui/www` 등. `fixed: [["@chakra-ui/**"]]`                                                                           | 1개                 |
| [radix-ui/primitives](https://github.com/radix-ui/primitives/blob/main/.changeset/config.json)                                                                         | `ignore`에 `@repo/storybook` 등                                                                                                                        | 1개                 |
| [primer/react](https://github.com/primer/react/blob/main/.changeset/config.json)                                                                                       | `privatePackages: { version: true, tag: false }`, `ignore: ["example-*", "codesandbox"]`                                                               | 1개                 |
| [daangn/seed-design](https://github.com/daangn/seed-design/blob/dev/.changeset/config.json) (기본 `dev`)                                                               | `privatePackages: { version: false, tag: false }`                                                                                                      | 1개                 |
| [grommet/hpe-design-system](https://github.com/grommet/hpe-design-system/blob/52467e57bfd94119e06970d6e1d021849b74465d/.github/workflows/design-tokens-release-pr.yml) | `changeset version --ignore docs --ignore …`로 **design tokens만** Version PR. 아이콘은 changesets PR이 아닌 별도 workflow(`hpe-icons-publish.yml` 등) | changesets PR은 1개 |
| [iTwin/iTwinUI](https://github.com/iTwin/iTwinUI/blob/3c4935b3c2bd04b527e9f5068786d2816e4d9d2f/.github/workflows/changeset-release.yml)                                | `version: pnpm changeset version --ignore @itwin/itwinui-css`, `changeset status` 출력에 특정 패키지가 있을 때만 PR 단계 실행                          | 1개                 |

- 살펴본 곳 중 **같은 저장소에서 changesets Version PR을 2개 이상 유지하는 곳은 찾지 못했다.** 사례들은 docs·storybook을 `ignore`하거나(버전 없음), private 버전만 올리고 Version PR은 하나로 둔다. `--ignore`는 "일부만 changesets로 릴리스하고 나머지는 다른 흐름"에 쓰였다.
- 우회 workflow로 커스텀 브랜치 PR을 만든 예는 [changesets/action#254 댓글](https://github.com/changesets/action/issues/254)(rohit-gohri, 2024-01-30)에 있다. 공개 저장소에서 이를 운영 중인 사례는 확인 불가.

## 6. 대안 비교

공통 전제(어느 안이든 Storybook에 버전을 붙이려면 필요):

- `privatePackages: { "version": true, "tag": false }` 추가. `tag: true`는 2.1·3.3절 문제(published-packages 섞임, 즉시 publish mode) 때문에 권하지 않는다. Storybook tag는 workflow에서 직접 만든다.
- `fixed`를 `[["@tide-tds/foundation", "@tide-tds/icons", "@tide-tds/components"]]`로 명시(E3).
- `apps/smoke-next/package.json`의 `version` 필드 삭제(E0·E4).
- `changelog-ko.ts`가 `apps/docs/CHANGELOG.md`도 돌게 한다.
- Storybook 릴리스 감지: `apps/docs/package.json` 버전의 git tag(예: `@tide-tds/docs@0.1.0` 또는 `storybook-v0.1.0`)가 없으면 tag·GitHub Release·Dokploy 배포. 지금은 docs 배포가 npm publish에만 걸려 있으므로, docs만 오른 릴리스에서는 배포가 안 된다.
- CI: `apps/docs`를 바꾸면 changeset이 필요해진다(2.4절). 섞인 changeset을 CI에서 미리 막는 규칙을 `check-changesets.ts`에 더한다(E2가 Version PR 단계에서야 터지지 않게).

### (a) Version PR 1개, 제목만 내용에 따라

- 동작: 지금 구조 그대로 `changeset version` 한 번. `steps.next`에서 `changeset status --output`의 releases를 보고 제목을 고른다. TDS만: 「[TDS] Release 0.6.0」, docs만: 「[Storybook] Release 0.2.0」, 둘 다: 「[TDS] Release 0.6.0 · [Storybook] Release 0.2.0」.
- 장점: changesets·action 공식 경로 그대로. 두 PR 사이 순서·mode 문제가 없다. 버전 번호는 독립이다(docs는 자기 changeset으로만 오름).
- 단점: **릴리스 시점은 독립이 아니다.** 둘이 같이 쌓이면 한 번에 머지된다. TDS를 먼저 내고 Storybook을 미루려면 docs changeset을 늦게 넣는 식의 운영 규칙이 필요하다.
- 이 저장소 기준 비용: 작음. 제목 계산 스크립트 수정, 공통 전제, Storybook 릴리스 감지 job 하나(mode는 select-mode 그대로: docs만 오른 머지 뒤에는 `publish-plan`이 비어 mode가 `none`이므로, 감지는 select-mode와 별개 job으로 둔다).

### (b-1) Version PR 2개, 공식 기능만으로

- **불가.** 3.1절: 브랜치 이름이 base 브랜치로 고정이라 두 번째 PR을 따로 둘 수 없다. 3.3절: select-mode가 묶음을 몰라 npm publish가 막힌다. changesets/action#575가 열려 있는 동안은 같다.

### (b-2) Version PR 2개, 스크립트 보강

- 동작:
  1. mode 판단을 직접 한다(`scripts/release-mode.ts` 같은 것). `changeset status --output`의 `releases`를 묶음별로 나눠 `tds-version`·`storybook-version`을, `changeset publish-plan --output`의 `kind: "publish"` 항목 유무로 `tds-publish`를, docs 버전 tag 유무로 `storybook-release`를 낸다. `select-mode`는 뺀다.
  2. TDS Version PR: 공식 `version` 액션 + `script: changeset version --ignore @tide-tds/docs && node scripts/changelog-ko.ts`, `pr-title: [TDS] Release <버전>`. 브랜치 `changeset-release/main`.
  3. Storybook Version PR: 공식 액션을 쓸 수 없어 직접 만든다. `git switch -C changeset-release/storybook` → `changeset version --ignore`(TDS 세 개) → 커밋·force push → `gh pr list --head`로 찾아 `gh pr create`/`gh pr edit --title "[Storybook] Release <버전>"` → assignee·라벨. PR 본문(변경 패키지 CHANGELOG 요약)도 직접 만든다. 커밋 서명은 action이 GitHub API로 하던 것(`push-with-git-cli: false` 기본값의 서명 커밋)을 따라 하려면 GraphQL `createCommitOnBranch` 등이 필요하다(확인하지 않음).
  4. pack/publish/github-release는 `tds-publish`일 때만. pack은 `publish-plan-artifact-id` 없이 돌린다(3.3절).
  5. Storybook 릴리스 job: tag·Release·Dokploy 배포.
  6. CI: 섞인 changeset 금지 규칙. `changeset-release/storybook`도 `changeset-release/` 접두라 지금 ci.yml 건너뛰기 조건에 걸린다.
- 장점: 버전 번호와 릴리스 시점 모두 독립. 제목 요구를 그대로 맞춘다.
- 단점과 위험:
  - action이 해 주던 일(브랜치 재생성, PR 찾기·갱신, 본문 생성, 서명 커밋)을 Storybook 쪽에 다시 짠다. workflow가 두 경로로 갈라져 유지 비용이 두 배다.
  - **Storybook 배포가 TDS 릴리스와 어긋난다.** Dokploy는 main HEAD를 빌드하는데 docs는 `workspace:*`로 main의 TDS 소스를 쓴다. TDS Version PR이 머지되기 전에 Storybook을 릴리스하면 **npm에 아직 없는 Component 변경이 문서에 먼저 나간다.** 지금은 docs 배포가 npm publish 뒤에만 돌아 이 어긋남이 없다.
  - empty changeset은 먼저 도는 쪽이 지운다(무해, 2.3절). 섞인 changeset은 두 Version PR이 모두 실패한다.
  - action이 #575를 해결하면 Storybook 쪽 스크립트를 걷어낼 수 있지만 그 시점은 확인 불가.
- 이 저장소 기준 비용: 중간 이상. 새 스크립트 2개(mode 판단, Storybook Version PR) + release.yml 재구성 + check-changesets 규칙 + 테스트. 공통 전제 포함 대략 (a)의 3~4배 작업량으로 본다(추정).

### (c) Storybook은 버전 대신 TDS 버전별 스냅샷 배포

- 동작: docs는 버전을 갖지 않는다(지금처럼). TDS가 publish될 때마다 그 커밋의 Storybook을 배포하고, 필요하면 `v0.5`처럼 TDS 버전별 경로·도메인에 남긴다. docs만 고친 변경(오타, 예시)은 수동 `workflow_dispatch`로 "현재 TDS 버전 문서"를 다시 배포한다.
- 장점: changesets 설정을 거의 안 바꾼다. 문서와 npm 버전이 항상 맞는다(사용자가 0.5를 쓰면 0.5 문서를 본다). chakra·radix처럼 storybook을 `ignore`하는 사례와 같은 결.
- 단점: Storybook 자체 변경 이력(CHANGELOG, 버전 번호)이 없다. 사용자가 원한 "Storybook 독립 버전"은 아니다. 버전별 보존을 하려면 Dokploy 앱을 버전마다 두거나 정적 호스팅 구조를 바꿔야 한다(이 저장소에서 미조사).
- 이 저장소 기준 비용: "최신만 배포"는 0(지금 상태). 버전별 보존은 호스팅 구조에 따라 중간.

### 요약표

| 안                     | 버전 독립          | 릴리스 시점 독립 | 공식 경로 | 문서·npm 정합      | 비용      |
| ---------------------- | ------------------ | ---------------- | --------- | ------------------ | --------- |
| (a) PR 1개, 제목 구분  | O                  | X                | O         | O(같이 머지·배포)  | 작음      |
| (b-1) PR 2개, 공식만   | —                  | —                | 불가      | —                  | —         |
| (b-2) PR 2개, 스크립트 | O                  | O                | 일부만    | **어긋날 수 있음** | 중간 이상 |
| (c) TDS 버전별 스냅샷  | X(TDS 버전을 따름) | X                | O         | O                  | 0~중간    |

## 추천안과 근거

**(a) Version PR 1개 + 내용에 따른 제목 + docs 독립 버전**을 먼저 하고, 릴리스 시점까지 나눠야 할 실제 필요가 생기면 (b-2)로 넘어간다.

근거:

1. 공식 액션으로는 PR 2개가 안 된다. 브랜치 이름이 `changeset-release/<base>`로 고정이고(changesets/action v2.1.2 `src/run.ts`), 같은 요구가 [#575](https://github.com/changesets/action/issues/575)·[#107](https://github.com/changesets/action/issues/107)로 열려 있으며 메인테이너도 "release line" 기능 없이는 어렵다고 했다([#445](https://github.com/changesets/action/issues/445)). (b-2)는 action이 하던 일을 Storybook 쪽에 다시 짜는 일이다.
2. 사용자가 원한 "Storybook 독립 버전 관리"의 핵심인 **버전 번호와 CHANGELOG의 독립**은 (a)로도 된다. `privatePackages.version` + 명시적 `fixed`면 docs는 자기 changeset으로만 오른다(E1′, E3).
3. (b-2)는 Dokploy가 main HEAD를 빌드하는 지금 구조에서 **npm 미발행 Component를 문서에 먼저 내보내는** 어긋남을 만든다. (a)는 같은 머지에서 함께 나가므로 이 문제가 없다.
4. 살펴본 design system·라이브러리 모노레포(chakra, radix, primer, seed-design, HPE, iTwinUI) 중 Version PR을 2개 유지하는 곳은 없었다.
5. (a)에서 만드는 것(공통 전제, 제목 계산, Storybook 릴리스 감지 job, 섞인 changeset 검사)은 (b-2)에서도 그대로 쓰인다. 나중에 넘어갈 때 버릴 작업이 적다.

## 구현하면 바뀌는 파일 목록

(a) 기준. (b-2)로 갈 때 더해지는 것은 「(b-2) 추가」로 적었다.

- `.changeset/config.json`: `privatePackages: { "version": true, "tag": false }` 추가, `fixed`를 세 패키지 이름으로 명시.
- `apps/smoke-next/package.json`: `version` 필드 삭제(changesets가 건너뛰게).
- `apps/docs/package.json`: 버전 시작값 결정(0.0.0 그대로 두고 첫 minor로 0.1.0 등). `apps/docs/CHANGELOG.md`는 첫 `changeset version`이 만든다.
- `.github/workflows/release.yml`:
  - version job의 `steps.next`: 묶음별 다음 버전을 읽어 「[TDS] Release …」/「[Storybook] Release …」/둘 다 제목 생성.
  - Storybook 릴리스 감지 job 추가(docs 버전 tag 없음 → tag·GitHub Release·Dokploy 배포). 지금 docs job의 조건(`published == 'true'`)을 이 감지와 합친다.
  - (b-2) 추가: `select-mode` 대신 직접 만든 mode 판단, Storybook Version PR job, TDS version 액션 `script`에 `--ignore @tide-tds/docs`, pack의 `publish-plan-artifact-id` 제거.
- `scripts/changelog-ko.ts`: `apps/docs/CHANGELOG.md`도 처리.
- `scripts/check-changesets.ts`: TDS 패키지와 docs가 한 changeset에 섞이면 실패하는 규칙. `apps/docs` 변경도 changeset이 필요해진다는 안내 문구 수정.
- `scripts/release-notes.ts`: (a)에서는 그대로(`tag: false`라 published-packages에 docs가 안 섞임). Storybook Release 본문용 스크립트를 새로 둘지 결정.
- (b-2) 추가: `scripts/release-mode.ts`(mode 판단), `scripts/storybook-version-pr.ts`(브랜치·PR 생성·갱신) 같은 새 스크립트와 테스트.
- 문서: `CONTRIBUTING.md` 「버전 규칙」(docs changeset, 섞기 금지), `GLOSSARY.md`(Storybook 버전 용어), 새 ADR(`docs/decisions/`: Storybook 버전 관리와 Version PR 구성, ADR 0008 fixed 결정 덧붙임), spec 릴리스 절.

## 열린 질문

1. Storybook 버전이 무엇을 뜻하는가. 문서 사이트 자체(내용·레이아웃)의 변경 이력인가, 아니면 "어느 TDS 버전을 보여 주는가"인가. 후자라면 (c)가 맞다.
2. 릴리스 시점까지 나눠야 하는 구체적인 상황이 있는가(예: 문서 오타만 빨리 배포). (a)에서도 docs changeset만 있는 Version PR은 TDS 없이 단독으로 머지·배포된다. 둘이 동시에 쌓였을 때만 묶인다.
3. Storybook git tag 이름: changesets 관례 `@tide-tds/docs@0.1.0`인가, 별도 `storybook-v0.1.0`인가. GitHub Release를 Storybook에도 만들 것인가(지금 Release는 `v<TDS 버전>` 하나).
4. docs 버전 시작값과 0.x 동안의 규칙(지금 major 금지 규칙은 배포 패키지만 본다).
5. `apps/docs` 변경에 changeset을 요구하는 것을 받아들일 것인가. 받아들이지 않으면 `privatePackages.version`을 켤 수 없다(2.4절, `changedFilePatterns`는 전역).
6. (b-2)로 갈 경우 Storybook Version PR 커밋 서명이 필요한가(branch protection의 signed commits 요구 여부). 확인 불가.
7. changesets/action#575가 언제 해결될지 확인 불가. 해결되면 (b-2)의 Storybook Version PR 스크립트를 공식 입력으로 바꿀 수 있다.
