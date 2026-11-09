# 버전 관리와 npm 배포 흐름 조사

Type: research
Status: open
Blocked by: 없음

## Question

`@tide-tds/foundation`, `@tide-tds/desktop`, `@tide-tds/icons` 세 패키지를 npm에 배포하는 흐름을 정하기 위해 확인할 사실을 모은다. 실제 최신 안정 버전과 현재 npm 정책을 공식 문서로 확인하고 날짜를 적는다.

1. changesets 최신 버전과 pnpm workspace·catalog(`catalog:` 프로토콜) 지원. publish 시 `workspace:`·`catalog:`가 실제 버전으로 바뀌는지
2. 다른 선택지(release-please, semantic-release, 수동 `pnpm publish -r`)와의 차이
3. npm trusted publishing(GitHub Actions OIDC)의 현재 상태, 설정 방법, provenance
4. npm의 토큰·2FA 정책 변경(2FA 우회 토큰 제한 등) 현황과 개인 org(`tide-tds`, 2FA 켜짐)에 주는 영향
5. 0.x 버전에서 semver 관례(0.x의 minor가 breaking을 뜻하는지), 레퍼런스 디자인 시스템의 초기 버전 정책
6. 여러 패키지 버전을 함께 올릴지(fixed/linked) 따로 올릴지. desktop이 icons·foundation에 의존하는 경우의 관례
7. prerelease(`next`, `canary` dist-tag) 흐름
8. Lucide처럼 업스트림 이름이 바뀌어 공개 export가 바뀌는 경우를 다른 아이콘 패키지가 어떻게 다루는지

결과는 `docs/research/release.md`에 main 브랜치로 커밋한다.
