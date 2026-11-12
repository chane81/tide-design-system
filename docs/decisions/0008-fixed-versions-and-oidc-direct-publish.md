# 세 패키지는 fixed 버전으로 묶고, CI는 OIDC 직접 publish로 배포한다

근거 원칙: ③ 단순함이 유연함보다 우선한다

`@tide-tds/foundation`, `@tide-tds/desktop`, `@tide-tds/icons`는 changesets `fixed`로 묶는다. 바뀐 것이 없는 패키지도 함께 버전을 올리고 함께 publish한다. desktop은 foundation과 icons를 `workspace:*`(배포 시 정확한 버전)로 의존한다. 그래서 "Tide 0.3"이라는 말이 세 패키지 모두에 통한다.

CI publish는 npm trusted publishing(GitHub Actions OIDC)에서 **직접 publish를 허용**한 설정으로 한다. 2026-09-03 이후 새 설정의 기본값은 "stage만 허용"이지만, 이것을 일부러 바꾼다.

상세는 [버전과 배포 정책 결정](../progress/tide-v0/issues/30-grilling-release.md)에 있다.

## 검토한 대안

- **독립 버전(Primer, Carbon, Atlassian)**: 바뀐 패키지만 올라간다. 하지만 foundation이 minor(0.x breaking)를 내면 desktop은 patch만 올라가서, 앱이 버전 조합을 따져야 한다. 패키지가 3개뿐이고 단계마다 함께 나가므로 얻는 것이 적다.
- **linked**: 바뀐 패키지끼리만 버전을 맞춘다. icons 버전이 따로 놀아 "같은 버전으로 설치"라는 안내가 성립하지 않는다.
- **OIDC stage + 사람 승인**: 가장 안전하다. 하지만 1인 프로젝트에서 릴리스마다 2FA로 승인해야 하고, changesets 3은 아직 stage를 쓰지 못한다(이슈 #2025).
- **2FA 우회 토큰을 secret에 저장**: 직접 publish 기능은 2027-01 제거가 목표라 곧 막힌다.
- **로컬에서만 publish**: 자동화와 provenance를 잃는다.

## Consequences

- 변경이 없는 패키지도 새 버전이 나간다. CHANGELOG에는 "변경 없음, 버전만 맞춤" 항목이 생긴다.
- 앱이 foundation을 desktop과 다른 버전으로 설치하면 두 벌이 생긴다. 설치 가이드에서 같은 버전 설치를 안내한다.
- 직접 publish를 허용했으므로 main 브랜치와 release workflow가 뚫리면 바로 배포될 수 있다. `id-token: write`는 publish job에만 주고, trusted publisher 설정 변경에는 대화형 2FA가 필요하다는 점에 기댄다.
- changesets가 staged publishing을 지원하면 stage + 승인으로 바꿀지 다시 볼 수 있다. 바꿀 때는 trusted publisher 설정만 바꾸면 되고 버전 체계는 그대로다.

> 덧붙임(2026-11-12, [ADR 0020](0020-storybook-versioning-and-version-pr-title.md)): `fixed`를 glob `["@tide-tds/*"]`에서 세 패키지 이름 `["@tide-tds/foundation", "@tide-tds/icons", "@tide-tds/components"]`로 바꿨다. Storybook(`@tide-tds/docs`)을 `privatePackages.version`으로 버전 관리하면 glob이 docs와 smoke-next까지 fixed 묶음에 넣어 TDS와 같은 버전으로 올리기 때문이다(@changesets/config 4.0.1 `globMatch`는 전체 패키지 이름에 맞춘다, [근거 문서](../research/changesets-split-version-prs.md) 실험 E3). 새 배포 패키지를 더하면 이 목록에도 직접 더한다. 「Tide 0.x」라는 말은 지금처럼 세 배포 패키지에만 통하고, Storybook 버전은 따로 간다.
