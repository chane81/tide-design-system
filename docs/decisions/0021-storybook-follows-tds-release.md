# TDS를 릴리스할 때마다 Storybook 버전도 같은 단계로 올린다

근거 원칙: ③ 단순함이 유연함보다 우선한다

쌓인 changeset에 TDS 릴리스가 있고 Storybook(`@tide-tds/docs`) changeset이 없으면, `pnpm release:version`이 `changeset version` 전에 Storybook changeset을 하나 더해 Storybook을 TDS와 같은 단계(minor면 minor, patch면 patch)로 올린다(2026-11-12, 사용자 결정). 그 전에는 TDS 릴리스 때 문서를 다시 배포만 하고 Storybook 버전과 tag는 그대로였다([ADR 0020](0020-storybook-versioning-and-version-pr-title.md)).

근거 버전: `@changesets/cli` 3.0.3(`assemble-release-plan` 7.0.0, `changelog-github` 1.0.1), changesets/action v2.1.2. 설치본 소스와 context7 `/changesets/changesets`(config 가이드 `___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH`)로 확인했다.

| 쌓인 changeset          | Storybook                       | Version PR 제목(TDS 0.5.1, docs 0.1.0에서)                         |
| ----------------------- | ------------------------------- | ------------------------------------------------------------------ |
| TDS patch만             | patch 자동(「TDS 0.5.2 반영」)  | `[TDS] Release 0.5.2 · [Storybook] Release 0.1.1`                  |
| TDS minor만(patch 섞임) | minor 자동(「TDS 0.6.0 반영」)  | `[TDS] Release 0.6.0 · [Storybook] Release 0.2.0`                  |
| TDS + docs changeset    | 사람이 쓴 docs changeset을 따름 | `[TDS] Release 0.6.0 · [Storybook] Release 0.1.1`(docs patch일 때) |
| docs만                  | 그대로(자동 없음)               | `[Storybook] Release 0.2.0`(docs minor일 때)                       |

- **규칙**: TDS 단계는 changeset들의 TDS 항목 중 가장 큰 것이다(fixed라 묶음 전체가 그 단계로 오른다). changeset 하나라도 `@tide-tds/docs` 항목이 있으면 자동으로 더하지 않는다. empty changeset은 어느 쪽에도 세지 않는다. 규칙은 `scripts/release-scope.ts`(`storybookFollowType`, `withStorybookFollow`)에 있다.
- **자동 changeset**: `scripts/storybook-follow.ts`가 `changeset status --output`을 읽어 `.changeset/storybook-follows-tds.md`(`"@tide-tds/docs": <단계>`, 요약 「TDS x.y.z 반영. …」)를 만든다. 요약이 `apps/docs/CHANGELOG.md` 항목이 된다. 커밋이 없는 changeset이라 changelog-github가 PR·커밋 링크 없이 요약만 쓴다(1.0.1 `getReleaseLine`, 로컬 확인). 파일이 이미 있으면 그대로 둔다(같은 브랜치에서 다시 돌려도 결과가 같다).
- **섞인 changeset 금지와 충돌하지 않는다**: 자동 파일은 docs 한 패키지만 담고, Version PR 브랜치에서 `changeset version`이 바로 소비하므로 main에 커밋되지 않는다. PR의 `check-changesets.ts`가 볼 일이 없다.
- **Version PR 제목**: 제목은 `changeset version` 전에(`changeset status` 기준) 계산하므로 아직 없는 자동 changeset을 `version-pr-title.ts`가 `withStorybookFollow`로 미리 반영한다. 같은 함수(`storybookFollowType`)를 쓰므로 제목과 실제 bump가 어긋나지 않는다.
- **release.yml은 그대로다**: 머지하면 TDS 버전이 npm에 없어 select-mode가 `publish` → pack·publish → `published == 'true'`로 `docs` job이 돈다. `storybook` job은 docs 새 버전의 tag가 원격에 없으니 `release=true`이고, `storybook-tag` job 조건(`docs` 성공 + `release == 'true'`)이 맞아 `@tide-tds/docs@<버전>`을 만든다. 문서 배포는 TDS publish 뒤 한 번이다.

## 검토한 대안

- **`___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH.updateInternalDependents: "always"`**: 쓰지 않는다. docs는 TDS를 `devDependencies`(`workspace:*`)로 받는데, `assemble-release-plan` 7.0.0 `determineDependents`는 devDependencies 의존자에 `none`만 준다. 설정을 켜고 `changeset status`를 돌려도 docs는 `none` 0.1.0이었다(로컬 확인). `dependencies`로 옮겨도 단계는 언제나 patch라(설정 문서 「with patch bumps」) minor를 따라갈 수 없고, CHANGELOG는 「Updated dependencies」뿐이라 어느 TDS 버전인지 남지 않는다. 이름 그대로 patch 버전에서도 바뀔 수 있는 실험 옵션이기도 하다.
- **workflow에서 status 전에 자동 changeset을 만들기**: 제목 계산을 따로 할 필요는 없지만 로컬 `pnpm release:version`과 workflow 순서가 갈린다. 규칙을 함수 하나에 두고 둘 다 거기서 읽는 쪽이 단순하다.

## Consequences

- TDS 릴리스마다 Storybook tag와 CHANGELOG 항목이 하나씩 생긴다. 문서 내용이 바뀌지 않은 TDS patch에도 Storybook patch가 오른다.
- 0.x TDS minor는 breaking이지만 Storybook minor는 「추가와 개편」이다. TDS minor를 따라 오른 Storybook minor는 「TDS 반영」 뜻으로 읽는다.
- 사람이 docs changeset을 쓰면 그 단계를 따르고, 그 CHANGELOG 항목에는 「TDS x.y.z 반영」이 자동으로 붙지 않는다.
