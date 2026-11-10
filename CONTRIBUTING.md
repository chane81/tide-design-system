# 기여 안내

Tide의 버전과 릴리스 규칙을 적는다. 근거는 [tide-v0 spec](docs/progress/tide-v0/spec.md)의 「릴리스」 절, [ADR 0008](docs/decisions/0008-fixed-versions-and-oidc-direct-publish.md), [ADR 0007 「정정」](docs/decisions/0007-lucide-generated-icons-package.md)이다.

## changeset

배포 패키지(`packages/*`: `@tide-tds/foundation`, `@tide-tds/icons`, `@tide-tds/desktop`)를 바꾸는 PR에는 changeset을 하나 넣는다. 없으면 CI가 실패한다.

```sh
pnpm changeset          # 패키지와 변경 수준(patch / minor)을 고르고 요약을 쓴다
pnpm changeset --empty  # 패키지를 바꿨지만 릴리스가 필요 없을 때(테스트, 빌드 설정만 바꾼 경우)
```

- 문서(`docs/`), 앱(`apps/*`, private), 저장소 설정만 바꾼 PR은 changeset이 없어도 통과한다. 남기고 싶으면 empty changeset을 쓴다.
- 요약은 **한글**로 쓴다. CHANGELOG와 GitHub Release에 그대로 들어간다. 코드 식별자는 원문 그대로 backtick으로 감싼다.
- 요약 첫 줄은 사용자가 무엇을 해야 하는지 알 수 있게 쓴다. breaking이면 바꿔야 할 코드(옛 이름 → 새 이름)를 적는다.
- 세 패키지는 언제나 같은 버전으로 함께 나간다(changesets `fixed`). 실제로 바뀐 패키지만 고르면 된다. 나머지는 CHANGELOG에 「변경 없음」으로 남는다.

## 버전 규칙 (0.x)

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

## 릴리스 흐름

1. changeset이 든 PR을 main에 머지하면 「chore: 릴리스 버전 올리기」 PR(Version PR)이 생기거나 갱신된다. 버전과 CHANGELOG 변경이 들어 있다.
2. 릴리스할 때 Version PR을 머지한다. 단계 경계(0.1.0 … 0.5.0)는 이 PR을 머지할 때 사람이 고른다.
3. 릴리스 workflow(`.github/workflows/release.yml`)가 전체 `typecheck test build smoke`를 다시 돌리고, npm에 publish한다(trusted publishing, provenance). tag는 패키지마다(`@tide-tds/desktop@0.2.0` 등) 생기고 GitHub Release는 `v0.2.0` 하나로 합쳐진다.
4. publish가 실제로 일어났으면 문서 사이트(`tide-tds.lakegreen.net`) 배포를 요청한다. 문서 배포가 실패해도 npm 릴리스는 그대로 둔다. Actions에서 Release workflow를 수동 실행(workflow_dispatch)하면 문서 배포만 다시 한다.

prerelease dist-tag(`next`, `canary`)는 v0에서 쓰지 않는다.
