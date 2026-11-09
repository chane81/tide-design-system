# 11: 릴리스 파이프라인

Status: ready-for-agent
Blocked by: 02 (Token에서 Next 앱까지 관통), 08 (아이콘 패키지)

## What to build

메인테이너가 PR에 changeset만 넣으면 Version PR이 자동으로 관리되고, 그 PR을 머지하면 전체 검사 → npm publish(OIDC) → 문서 배포가 이어진다. changeset을 빠뜨리거나 아이콘 이름표 키를 지우면서 minor를 안 쓰면 CI가 막는다. 첫 publish(12)와 trusted publisher 설정(18)은 사람이 하므로, 이 티켓은 그 전까지 동작할 수 있는 상태로 만든다.

## 수용 기준

- [ ] changesets 3 + `changesets/action`(Version PR) + `@changesets/changelog-github`. 세 패키지를 `fixed`로 묶는다. CHANGELOG는 한글로 쓴다.
- [ ] 0.x 동안 `major` changeset을 쓰지 않는다는 규칙과 breaking/patch 기준(spec 릴리스 절)을 기여 문서에 둔다.
- [ ] `packages/*`를 바꾼 PR에 changeset이 없으면 CI가 실패한다. 문서·설정만 바꾼 PR은 empty changeset으로 통과한다.
- [ ] 아이콘 이름표에서 키가 빠졌는데 minor changeset이 없으면 CI가 실패한다(`unit` 또는 CI 검사).
- [ ] 릴리스 workflow: Version PR 머지 → 전체 `typecheck test build smoke` → publish(OIDC). `id-token: write`는 publish job에만 준다. provenance가 붙는다.
- [ ] tag는 패키지마다 만들고 GitHub Release는 릴리스당 하나로 합친다. prerelease dist-tag는 쓰지 않는다.
- [ ] 문서 배포: Dockerfile(pnpm build → nginx)과 Dokploy API 호출 단계. 실제로 publish되었을 때만 실행하고, 실패해도 npm 릴리스는 되돌리지 않는다. Dokploy Autodeploy는 끈 상태를 전제로 한다(설정은 사람이 확인).
- [ ] 필요한 secret 이름과 사람이 할 설정을 Comments에 정리한다.
- [ ] changesets, GitHub Actions, npm OIDC 관련 API는 설치·현재 버전 문서로 확인하고 근거 버전을 남긴다.

## Comments
