# 기여 안내

Tide의 버전과 릴리스 규칙을 적는다. 근거는 [tide-v0 spec](docs/progress/tide-v0/spec.md)의 「릴리스」 절, [ADR 0008](docs/decisions/0008-fixed-versions-and-oidc-direct-publish.md), [ADR 0007 「정정」](docs/decisions/0007-lucide-generated-icons-package.md), [ADR 0020](docs/decisions/0020-storybook-versioning-and-version-pr-title.md)이다.

버전은 두 묶음으로 따로 간다.

- **TDS**: 배포 패키지 `@tide-tds/foundation`, `@tide-tds/icons`, `@tide-tds/components`. 언제나 같은 버전이다.
- **Storybook**: 문서 앱 `@tide-tds/docs`(`apps/docs`, npm에 내지 않음). 자기 changeset으로만 버전이 오른다.

## changeset

배포 패키지(`packages/*`)나 Storybook(`apps/docs`)을 바꾸는 PR에는 changeset을 넣는다. 없으면 CI가 실패한다.

```sh
pnpm changeset          # 패키지와 변경 수준(patch / minor)을 고르고 요약을 쓴다
pnpm changeset --empty  # 바꿨지만 릴리스가 필요 없을 때(테스트, 빌드 설정만 바꾼 경우)
```

- 문서(`docs/`), smoke 앱(`apps/smoke-next`), 저장소 설정만 바꾼 PR은 changeset이 없어도 통과한다. 남기고 싶으면 empty changeset을 쓴다.
- **TDS 패키지와 `@tide-tds/docs`를 한 changeset 파일에 섞지 않는다.** CI가 실패한다. 둘 다 올리려면 파일을 둘로 나눈다(`pnpm changeset`을 두 번).
- Component를 더하면서 그 문서 페이지도 만든 PR은 TDS changeset 하나로 검사를 통과한다. Storybook 버전도 올리고 싶으면 docs changeset을 따로 더한다.
- 요약은 **한글**로 쓴다. CHANGELOG와 GitHub Release에 그대로 들어간다. 코드 식별자는 원문 그대로 backtick으로 감싼다.
- 요약 첫 줄은 사용자가 무엇을 해야 하는지 알 수 있게 쓴다. breaking이면 바꿔야 할 코드(옛 이름 → 새 이름)를 적는다.
- 세 패키지는 언제나 같은 버전으로 함께 나간다(changesets `fixed`). 실제로 바뀐 패키지만 고르면 된다. 나머지는 CHANGELOG에 「변경 없음」으로 남는다.

## 버전 규칙 (TDS, 0.x)

0.x 동안은 **minor가 breaking**이고 **patch가 기능 추가와 수정**이다. caret 범위(`^0.2.0`)로 설치한 앱은 patch만 받으므로 breaking을 받지 않는다.

- **`major`는 쓰지 않는다.** 0.x에서 `major` changeset은 1.0.0을 만든다. CI가 막는다. 1.0을 언제 낼지는 따로 정한다.
- **minor(breaking)**: [공개 계약](GLOSSARY.md)을 지우거나 이름·뜻을 바꾸는 것.
  - `--tide-*` CSS 변수
  - Utility class 이름
  - 텍스트 스타일 이름
  - Component export, props, props 값, 콜백 시그니처
  - 아이콘 이름표(`packages/icons/icon-names.json`)의 키. 키를 지우거나 이름을 바꾸면 `"@tide-tds/icons": minor`가 있어야 한다. 없으면 CI가 실패한다.
  - peer 범위를 올리는 것(React, Tailwind 등)
- **patch**: 그 밖의 모든 것.
  - 새 Token, 새 Component, 새 props, 이름표에 키 더하기
  - 버그 수정
  - 시각 값 조정(Primitive hex, 그림자 alpha, duration 등). 공개 계약의 이름과 뜻은 그대로이므로 breaking이 아니다. CHANGELOG에는 적는다.
  - 이름표의 원본 SVG 쪽만 고치는 것, 아이콘 원본 패키지를 올려 모양이 바뀌는 것

## 버전 규칙 (Storybook)

문서 앱에는 사용자 코드가 기대는 공개 계약이 없으므로 0.x의 「minor = breaking」을 쓰지 않는다. 첫 릴리스는 0.0.0에서 minor로 0.1.0이다.

- **minor**: 새 문서 페이지·기능(검색, 블록 등), 사이드바·페이지 구성 개편, Storybook 설정 변경
- **patch**: 내용 수정, 오타, 예시 수정
- **`major`는 쓰지 않는다.** TDS와 같이 CI가 막는다.
- **TDS를 릴리스하면 Storybook도 오른다.** 쌓인 changeset에 TDS 릴리스가 있고 Storybook changeset이 없으면, Version PR을 만들 때 Storybook도 TDS와 같은 단계(minor면 minor, patch면 patch)로 오르고 CHANGELOG에 「TDS x.y.z 반영」이 남는다(ADR 0021). Storybook changeset을 직접 쓰면 그 단계를 따른다. 자동 changeset은 Version PR에서만 생기므로 PR에 넣지 않는다.

## 릴리스 흐름

1. changeset이 든 PR을 main에 머지하면 「chore: 릴리스 버전 올리기」 PR(Version PR)이 생기거나 갱신된다. 버전과 CHANGELOG 변경이 들어 있다. Version PR은 하나이고 제목은 든 묶음에 따라 `[TDS] Release 0.6.0`, `[Storybook] Release 0.1.0`, `[TDS] Release 0.6.0 · [Storybook] Release 0.2.0` 중 하나다. TDS가 오르면 Storybook도 따라 오르므로 TDS가 든 Version PR은 「둘 다」 꼴이 된다.
2. 릴리스할 때 Version PR을 머지한다. 단계 경계(0.1.0 … 0.5.0)는 이 PR을 머지할 때 사람이 고른다.
3. 릴리스 workflow(`.github/workflows/release.yml`)가 전체 `typecheck test build smoke`를 다시 돌리고, npm에 publish한다(trusted publishing, provenance). tag는 패키지마다(`@tide-tds/components@0.2.0` 등) 생기고 GitHub Release는 `v0.2.0` 하나로 합쳐진다.
4. publish가 실제로 일어났으면 문서 사이트(`tds.lakegreen.net`) 배포를 요청하고, Dokploy에서 배포가 끝날 때까지 기다린다(실패하거나 15분 안에 끝나지 않으면 job이 실패한다). Storybook만 오른 Version PR을 머지했을 때는 npm publish 없이 문서만 배포하고, 성공하면 tag `@tide-tds/docs@0.1.0`을 만든다(GitHub Release는 없다). 아직 릴리스하지 않은 TDS changeset이 main에 남아 있으면 Storybook만으로는 배포하지 않는다. 문서 배포가 실패해도 npm 릴리스는 그대로 둔다. Actions에서 Release workflow를 수동 실행(workflow_dispatch)하면 문서 배포만 다시 한다.

prerelease dist-tag(`next`, `canary`)는 v0에서 쓰지 않는다.
