# 버전과 배포 정책 결정

Type: grilling
Status: resolved
Blocked by: 29

## Question

언제, 어떻게 버전을 올리고 배포할지 정한다.

- 릴리스 도구(changesets 등)와 흐름
- 세 패키지의 버전을 함께 올릴지 따로 올릴지
- v0(0.x) 동안의 semver 규칙. breaking change를 무엇으로 볼지(Token 이름 변경, Component props 변경, 아이콘 이름 변경)
- 단계별 중간 릴리스 여부(「v0 Component 목록과 우선순위 결정」: 5단계 구현 순서)
- CI publish 인증(trusted publishing 또는 토큰)과 2FA
- prerelease dist-tag 사용 여부
- CHANGELOG 언어(한글 우선, 영문 병행)
- Lucide 업스트림이 아이콘 이름을 바꾸거나 지울 때 `@tide-tds/icons`의 처리(「아이콘 전략 결정」, ADR 0007)

### 참고 (다른 티켓에서 넘어온 것)

- 「버전 관리와 npm 배포 흐름 조사」(29번)의 결과를 근거로 쓴다.
- 「npm scope @tide-tds 확보」: org `tide-tds`, owner `charles-green`, 2FA 켜짐.
- 의존성 버전은 pnpm catalog로 관리한다(지도 Notes).
- 「Storybook 문서 구성 결정」: 문서는 릴리스(npm publish)마다 Dokploy(`tide-tds.lakegreen.net`)에 배포한다. 릴리스 workflow 마지막 단계에서 Dokploy API를 호출한다. 문서 배포는 저장소 공개 여부와 상관없다. 아이콘 페이지에 alias를 보여 줄지는 이 티켓의 alias 결정을 따른다.

## Answer

근거: [docs/research/release.md](../../../research/release.md)(@changesets/cli 3.0.3, pnpm 12.18.0, lucide-static 1.70.0). 2026-11-09 grilling으로 정함. 버전 묶음과 인증 방식은 [ADR 0008](../../../decisions/0008-fixed-versions-and-oidc-direct-publish.md).

### 도구와 흐름

- **도구**: changesets 3 + `changesets/action`. changelog 생성기는 `@changesets/changelog-github`(PR 링크와 작성자). pnpm 자체 릴리스 관리는 버전 PR Action이 없고 0.x 동작을 확인하지 못해 고르지 않았다. `.changeset` 형식이 같으므로 나중에 옮길 수 있다.
- **흐름**: 기능 PR에 changeset → main 머지 시 action이 "Version Packages" PR을 만들거나 갱신 → 그 PR을 머지하면 publish job(이 job에만 `id-token: write`) → publish 성공 시 Dokploy 문서 배포.
- **changeset 필수**: `packages/*`를 건드린 PR은 `changeset status`로 확인해 changeset이 없으면 실패. 문서·설정만 바꾼 PR은 `changeset --empty`.
- 릴리스 workflow는 「테스트 전략 결정」대로 전체 검사를 다시 돌린 뒤 publish로 넘어간다.

### 버전 묶음과 내부 의존

- **fixed**: `fixed: [["@tide-tds/*"]]`. 세 패키지는 언제나 같은 버전이고 함께 publish한다.
- desktop은 foundation·icons를 `dependencies`에 `workspace:*`로 둔다. 배포하면 정확한 버전(`0.2.0`)으로 바뀐다. 설치 가이드에 "세 패키지를 같은 버전으로 설치"라고 적는다. 내부 패키지는 catalog에 넣지 않는다.

### 0.x semver 규칙

- **minor = breaking, patch = 기능 추가와 수정.** 0.x 동안 changeset에 `major`를 쓰지 않는다(changesets가 1.0.0으로 올림).
- **breaking**: 공개 계약을 지우거나 이름을 바꾸거나 뜻을 바꾸는 것. `--tide-*` CSS 변수, Utility class 이름, 텍스트 스타일 이름, Component export·props·props 값·콜백 시그니처, 아이콘 export 이름, peer 범위 상향(React, Tailwind).
- **breaking이 아님**: Primitive hex, 그림자 alpha, duration 같은 시각 값 조정. patch로 내고 CHANGELOG에 적는다.
- 1.0을 언제 낼지는 이 지도에서 정하지 않는다(Out of scope).

### 릴리스 단위

- 「v0 Component 목록과 우선순위 결정」의 5단계마다 `latest`로 minor를 한 번 낸다(1단계 끝 0.1.0 … 5단계 끝 0.5.0). 단계 사이 수정은 patch로 수시로 낸다. 단계 경계는 Version PR을 머지할 때 사람이 고른다.
- **prerelease dist-tag는 v0에서 쓰지 않는다.** Next.js 호환은 `apps/smoke-next`가 릴리스 전에 확인한다.
- **CHANGELOG**: v0는 한글만 쓴다(문서 사이트와 같음). 코드 식별자는 원문 그대로.
- **git tag와 GitHub Release**: tag는 changesets 기본대로 패키지마다 만든다. GitHub Release는 `createGithubReleases`를 끄고 릴리스마다 하나(`v0.2.0`, 세 CHANGELOG를 합친 본문)를 직접 만든다. 구현이 번거로우면 기본 동작(패키지마다 하나)으로 돌아가도 된다.

### 인증과 첫 publish

- **저장소는 공개로 바꿈**(2026-11-09, `gh repo view` PUBLIC 확인). 첫 버전부터 provenance가 붙는다.
- **CI publish**: trusted publishing(GitHub Actions OIDC)에서 직접 publish를 허용한다. stage + 사람 승인은 쓰지 않는다. 2FA 우회 토큰은 쓰지 않는다.
- **첫 publish 순서**:
  1. 0.1.0은 로컬에서 `charles-green` 계정으로 2FA를 거쳐 `pnpm publish -r`
  2. 세 패키지의 `access: public`과 패키지 설정의 2FA 필수를 확인
  3. **다음 CI 릴리스 직전에** 세 패키지에 trusted publisher 설정(직접 publish 허용, workflow 파일 이름 지정)
  4. 바로 CI 릴리스를 내서 48시간 안에 검증
- 그 뒤 로컬 publish는 비상시에만 한다.

### 문서 배포

- publish가 실제로 일어났을 때만 돌린다(action 출력 `published == 'true'`).
- 문서 배포가 실패해도 npm 릴리스는 되돌리지 않는다. job은 실패로 남기고 `workflow_dispatch`로 다시 돌린다.
- Dokploy 토큰은 GitHub Environment secret에 둔다.

### 아이콘 alias

- `lucide-static`의 alias 293개도 생성한다. Component를 새로 만들지 않고 정식 Component를 다른 이름으로 다시 export한다(`export { HouseIcon as HomeIcon }`). `@deprecated` JSDoc을 붙인다.
- 업스트림 alias가 사라지면 Tide export도 지우고 breaking(0.x minor)으로 낸다. `lucide-static` 업그레이드로 아이콘이 추가되기만 하면 patch.
- Storybook 아이콘 페이지에는 정식 2,029개만 보이고, alias는 상세 정보에 텍스트로 보여 준다.
- ADR 0007의 "SVG 2,322개"를 "정식 2,029 + alias 293"으로 정정했다.
