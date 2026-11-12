# Version PR CI가 매번 승인을 기다리는 이유와 피하는 방법

## 증상

changesets Version PR(「Release x.y.z」)의 CI(`ci.yml`, `pull_request`)가 `action_required` 상태로 멈추고, 사람이 「Approve and run」을 눌러야 돈다. PR #7, #10에서 매번 그랬다.

## 원인: GitHub 정책 변경 (2026-06)

- [GitHub Changelog 2026-06-11 「Bot-created pull requests can run workflows if approved」](https://github.blog/changelog/2026-06-11-bot-created-pull-requests-can-run-workflows-if-approved/)
  - `github-actions[bot]`이 만든 PR도 이제 CI/CD workflow를 돌릴 수 있게 됐다. 대신 저장소 write 권한이 있는 사용자가 승인해야 한다.
  - 승인을 요구하는 이유는 보안이다. 자동 생성된 코드가 민감한 정보에 접근할 수 있는 workflow를 저절로 돌리지 못하게 막는다. Copilot이 만든 PR과 같은 동작이다.
  - 그 전에는 `github-actions[bot]`이 만든 PR에서 CI가 아예 돌지 않았다.
- [community discussion #199292](https://github.com/orgs/community/discussions/199292)
  - 2026년 6월 중순부터 점진적으로 적용됐다.
  - 같은 저장소 브랜치에서 온 PR에도, 기본 `GITHUB_TOKEN`으로 만들거나 갱신한 PR이면 승인을 요구한다.
  - 승인 없이 돌리려면 GitHub App이나 PAT 같은 신뢰된 신원으로 PR을 만들라는 답이 지지를 받았다.
- 이 저장소의 상황
  - `release.yml`의 version job은 `changesets/action/version@v2`를 `github-token` 입력 없이 쓴다. 그래서 기본 `GITHUB_TOKEN`으로 PR을 만든다.
  - 저장소 Actions 설정은 `approval_policy: first_time_contributors`다. 이 설정은 fork PR 정책이라, 이번 동작과는 별개로 보인다.

## 피하는 방법

`changesets/action/version@v2`에는 `github-token` 입력이 있다(v2.1.2 `version/action.yml`). 여기에 `GITHUB_TOKEN`이 아닌 신원의 token을 넘기면, 그 신원이 Version PR을 만들고 브랜치에 push한다.

1. **GitHub App token (추천)**
   - 저장소 전용 GitHub App을 만든다. 권한은 Contents·Pull requests·Issues write다.
   - App ID와 private key를 secret으로 저장하고, version job에서 installation token을 발급받아 넘긴다.
   - 사람 계정과 묶이지 않고, token은 짧게 살다가 만료된다. 권한도 이 저장소로 좁힐 수 있다.
   - token 발급 액션(`actions/create-github-app-token`)의 입력과 버전은 적용할 때 공식 문서로 확인한다. 이 문서에서는 아직 확인하지 않았다.
2. **Fine-grained PAT**
   - 메인테이너 계정으로 이 저장소 한정 PAT를 만들어 secret으로 넣는다.
   - 설정은 가장 간단하다.
   - 단점: 만료 때마다 교체해야 한다. PR 작성자와 커밋 작성자가 메인테이너 본인으로 보인다.
3. **현행 유지**: Version PR마다 「Approve and run」을 누른다. 변경 비용은 없다.

주의: 이 방법은 자동화가 만든 코드가 승인 없이 CI(그리고 CI가 쓰는 secret)를 돌리게 한다. 지금 CI는 secret 없이 `contents: read`만 쓰므로 위험은 작다.

## 결정

- 2026-11-12: 사용자 결정 대기. Storybook Release 분리 작업(티켓 미정)과 함께 적용할 수 있다.
