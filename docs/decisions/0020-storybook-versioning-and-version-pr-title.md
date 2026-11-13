# Storybook은 독립 버전을 갖고, Version PR은 하나로 두되 제목을 들어간 묶음에 따라 정한다

근거 원칙: ③ 단순함이 유연함보다 우선한다

Storybook 문서 앱(`@tide-tds/docs`, `apps/docs`)에 TDS(`@tide-tds/foundation`·`icons`·`components`)와 따로 가는 semver 버전과 CHANGELOG를 붙인다. Version PR은 지금처럼 하나이고, 제목만 들어간 묶음에 따라 정한다(2026-11-12, 사용자 결정. [근거 문서](../research/changesets-split-version-prs.md)의 추천안 (a)).

| Version PR에 든 것 | 제목                                              |
| ------------------ | ------------------------------------------------- |
| TDS만              | `[TDS] Release 0.6.0`                             |
| Storybook만        | `[Storybook] Release 0.1.0`                       |
| 둘 다              | `[TDS] Release 0.6.0 · [Storybook] Release 0.2.0` |

> 덧붙임(2026-11-12, [ADR 0021](0021-storybook-follows-tds-release.md)): TDS 릴리스에 Storybook changeset이 없으면 `pnpm release:version`이 Storybook changeset(「TDS x.y.z 반영」)을 자동으로 더해 Storybook도 TDS와 같은 단계로 오른다. 그래서 TDS가 오르는 Version PR의 제목은 언제나 「둘 다」 꼴이고, 「TDS만」 제목은 더 나오지 않는다. 아래 「TDS가 실제로 publish되면 … 배포한다」 경로에서 docs tag도 함께 생긴다.

근거 버전: `@changesets/cli` 3.0.3(`@changesets/config` 4.0.1, `assemble-release-plan` 7.0.0, `apply-release-plan` 8.1.1, `should-skip-package` 1.0.0), changesets/action v2.1.2. 설치본 소스와 태그 소스, context7 `/changesets/changesets`로 확인했다.

- **버전 관리 대상**: `.changeset/config.json`에 `privatePackages: { "version": true, "tag": false }`를 둔다. changesets 3의 기본값은 private을 버전 관리하지 않는다(migration 가이드 「Opt in to versioning private packages」).
- **fixed는 세 패키지 이름으로 적는다**: `[["@tide-tds/foundation", "@tide-tds/icons", "@tide-tds/components"]]`. 예전 glob `@tide-tds/*`는 docs도 잡아, private 버전 관리를 켜면 docs가 TDS와 같은 버전으로 오른다(근거 문서 실험 E3). ADR 0008 덧붙임.
- **smoke-next는 버전이 없다**: `apps/smoke-next/package.json`에서 `version`을 지웠다. changesets는 `version` 필드가 없는 패키지를 건너뛴다(`should-skip-package` 1.0.0). config `ignore`에 넣으면 나중에 `changeset version --ignore`(근거 문서 (b-2))를 못 쓰므로 그 길은 쓰지 않는다. `changeset status` 계획에는 `none`(버전 `undefined`)으로 나오지만 파일은 바뀌지 않는다(로컬 시나리오로 확인).
- **시작 버전**: `apps/docs/package.json`은 0.0.0 그대로 두고, 첫 Storybook changeset을 `minor`로 넣어 0.1.0이 되게 한다(semver 0.0.0의 minor는 0.1.0, `changeset status`로 확인). 0.0.0은 「아직 한 번도 릴리스하지 않은 값」으로 보고 릴리스 감지에서 뺀다. 버전 값을 미리 0.1.0으로 바꾸면 첫 Version PR에 CHANGELOG 항목 없이 tag만 생기고, 첫 changeset이 0.2.0을 만들어 버린다.
- **Storybook 버전 규칙**: 문서 앱에는 호환성 계약이 없으므로 0.x의 「minor = breaking」을 쓰지 않는다. `minor`는 페이지·기능 추가와 구성 개편, `patch`는 내용 수정·오타·예시 수정이다. `major`는 TDS와 같이 0.x 동안 쓰지 않는다(지금 CI 규칙이 모든 changeset의 major를 막는다). CHANGELOG 제목은 `scripts/changelog-ko.ts`가 「추가와 개편 (minor)」「수정 (patch)」로 바꾼다.
- **changeset 규칙**: `apps/docs`를 바꾸면 changeset이 필요하다(`changeset status --since`가 버전 관리 대상 private도 센다, `versionablePackages`). 릴리스가 필요 없으면 empty. **TDS 패키지와 docs를 한 changeset 파일에 섞으면 CI가 실패한다**(`scripts/check-changesets.ts` → `scripts/release-scope.ts`). changesets는 `--ignore`를 쓸 때 섞인 changeset을 거부하므로(`assemble-release-plan` 7.0.0), 나중에 묶음을 나눠 올릴 길을 열어 둔다.
- **Version PR 제목**: release.yml version job이 `changeset status --output`의 `releases`를 `scripts/version-pr-title.ts`로 읽는다. `type`이 `none`이 아닌 항목만 센다. assignee·`release` 라벨 단계는 그대로다.
- **git tag**: TDS는 changesets가 만드는 패키지별 tag 그대로다. Storybook은 changesets 모노레포 형식 `@tide-tds/docs@<버전>`(`buildGitTag`)이지만, `privatePackages.tag`를 끄고 workflow가 직접 만든다. `tag: true`면 `changeset publish`가 docs를 `tag-only` 항목으로 넣어 action의 `published-packages`에 섞이고(`release-notes.ts`가 버전 하나를 전제해 실패), tag 없는 private 패키지가 있으면 publish-plan이 비지 않아 select-mode가 `publish`가 된다(근거 문서 2.1·3.3절, 실험 E6). Storybook용 GitHub Release는 만들지 않는다.
- **문서 배포 시점**(release.yml):
  - TDS가 실제로 publish되면 지금처럼 배포한다. Storybook이 같이 올랐으면 그 한 번으로 끝난다.
  - Storybook만 오른 Version PR을 머지하면 changeset이 남지 않고 npm에 낼 버전도 없어 select-mode가 `none`이다(action v2.1.2 `getMode`, 로컬 `changeset publish-plan` 결과 `plan: []`). pack·publish는 돌지 않는다. `storybook` job이 main의 docs 버전 tag가 원격에 없음을 보고(`scripts/storybook-release.ts`, `git ls-remote`) 배포를 요청한다.
  - mode가 `version`이면(아직 릴리스하지 않은 TDS changeset이 main에 있음) Storybook만으로 배포하지 않는다. Dokploy는 main HEAD를 빌드하고 docs는 `workspace:*`로 main의 TDS 소스를 쓰므로, npm에 없는 Component가 문서에 먼저 나가면 안 된다(spec 사용자 이야기 89).
  - tag는 배포가 성공한 뒤 `storybook-tag` job이 GitHub REST 「Create a reference」로 만든다(lightweight). 배포가 실패하면 tag가 없으므로 다음 `none` push나 workflow_dispatch에서 다시 배포하고 tag를 만든다.

## 검토한 대안

- **Version PR 2개(공식 기능만)**: changesets/action v2.1.2는 Version PR 브랜치를 `changeset-release/<base>`로 고정해 둘째 PR을 둘 수 없다([#575](https://github.com/changesets/action/issues/575) 미해결). select-mode도 묶음을 몰라 Storybook changeset이 남아 있으면 TDS publish가 막힌다.
- **Version PR 2개(스크립트 보강, 근거 문서 (b-2))**: 릴리스 시점까지 나뉘지만 action이 하던 브랜치·PR·본문·서명 커밋을 다시 짜야 하고, Storybook이 npm보다 먼저 나가는 어긋남이 생긴다. 필요가 생기면 그때 간다. 이번에 만든 것(fixed 명시, 섞인 changeset 금지, 릴리스 감지)은 그대로 쓰인다.
- **Storybook 버전 없이 TDS 버전별 스냅샷(근거 문서 (c))**: 문서 앱 자체의 변경 이력이 남지 않아 사용자가 원한 독립 버전이 아니다.
- **docs를 config `ignore`에 넣기(조사한 저장소 두 곳)**: 버전이 없다.
- **`privatePackages.tag: true`로 changesets가 tag를 만들게 하기**: 위 git tag 항목의 이유로 하지 않는다.

## Consequences

- 릴리스 시점은 독립이 아니다. TDS와 Storybook changeset이 함께 쌓이면 한 Version PR로 같이 나간다. Storybook만 먼저 내려면 TDS changeset이 없을 때 머지하거나, Storybook changeset을 늦게 넣는다.
- `apps/docs`만 바꾼 PR도 changeset(또는 empty)이 필요하다. Component 티켓처럼 TDS와 docs를 함께 바꾸면 changeset 하나로 검사는 통과하지만, Storybook 버전도 올리려면 파일을 둘로 나눈다.
- 루트 `scripts/` 단위 테스트(`pnpm test:scripts`, 루트 `vitest.config.ts`)가 생겼다. turbo 밖에서 돌고 CI에 step을 더했다.
- workflow 동작(제목 갱신, `none`일 때의 배포·tag)은 main에 머지한 뒤 첫 실행에서야 확인된다.

## 로컬 확인 (2026-11-12, `@changesets/cli` 3.0.3)

임시 changeset을 넣고 `changeset status --output`, `scripts/version-pr-title.ts`, `pnpm release:version`(`changeset version` + `changelog-ko.ts`)을 돌린 뒤 되돌렸다. 시작 상태는 TDS 0.5.0, docs 0.0.0.

| 시나리오                            | status releases                                           | 제목                                              | `changeset version` 결과                                                               |
| ----------------------------------- | --------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| TDS만(components patch)             | TDS 세 패키지 patch 0.5.1, docs `none`, smoke-next `none` | `[TDS] Release 0.5.1`                             | 세 패키지 `package.json`·CHANGELOG만 바뀜. docs 그대로                                 |
| Storybook만(docs minor)             | docs minor 0.0.0 → 0.1.0                                  | `[Storybook] Release 0.1.0`                       | `apps/docs/package.json` 0.1.0, `apps/docs/CHANGELOG.md` 생성(「추가와 개편 (minor)」) |
| 둘 다(components minor, docs patch) | TDS 0.6.0, docs 0.0.1                                     | `[TDS] Release 0.6.0 · [Storybook] Release 0.0.1` | 양쪽 모두 바뀜. docs CHANGELOG 「수정 (patch)」                                        |
| 섞인 파일(components+docs)          | —                                                         | —                                                 | `check-changesets.ts main`이 exit 1(「한 changeset에 섞지 않는다」)                    |

- 섞인 파일은 `changeset version --ignore @tide-tds/docs`에서도 `Found mixed changeset`으로 실패한다(이후 (b-2)로 갈 때의 제약과 같다).
- `apps/docs`만 바꾸고 changeset이 없으면 `check-changesets.ts`가 exit 1, empty changeset을 더하면 통과. `apps/smoke-next`만 바꾸면 changeset 없이 통과.
- docs 0.1.0·changeset 없음 상태의 `changeset publish-plan --output`은 `plan: []`(→ select-mode `none`). TDS를 0.5.1로 올린 상태는 세 패키지 `kind: "publish"`.
- `scripts/storybook-release.ts`: docs 0.0.0이면 `release=false`, 0.1.0(원격 tag 없음)이면 `release=true`. `git ls-remote --exit-code`는 있는 tag에 0, 없는 tag에 2.

## 보충 (2026-11-14): workflow 동작 근거

결정은 그대로다. 코드 주석에서 뺀 외부 동작 근거를 여기 남긴다(주석 정리 티켓 06).

- **Version PR 제목 갱신**: changesets/action v2.1.2(`release.yml`의 `@v2`가 가리키는 커밋)는 열린 Version PR이 있으면 GraphQL `updatePullRequest`로 제목과 본문을 새 `pr-title` 값으로 바꾼다. 없으면 `pulls.create`로 만든다(`src/run.ts` `runVersion`). 그래서 changeset이 더 쌓여 묶음이 바뀌면 제목도 따라 바뀐다.
- **changelog 링크용 token**: 같은 버전의 action은 `script`(`pnpm release:version`)를 돌릴 때 `github-token` 입력 값을 환경 변수 `GITHUB_TOKEN`으로 넘긴다(`src/run.ts`). `@changesets/changelog-github` 1.0.1이 쓰는 `@changesets/get-github-info` 1.0.1이 이 변수로 PR 링크와 작성자를 찾는다. 이 저장소에서는 값이 GitHub App token이다([근거 문서](../research/bot-pr-workflow-approval.md)).
- **문서 배포가 빌드하는 것**: Dokploy 문서 앱은 이 저장소 `main` 브랜치, Dockerfile `apps/docs/Dockerfile`, context `.`로 설정했다(tide-v0-impl 티켓 11 Comments). Dokploy는 앱에 고른 브랜치를 받아 지정한 Dockerfile로 빌드한다(docs.dokploy.com 「GitHub」·「Build Type」, 2026-11-14 확인. 문서에 버전 표기 없음, 운영 버전은 티켓 44 기준 v0.31.1). 위 「mode가 `version`이면 … 배포하지 않는다」의 전제다.
