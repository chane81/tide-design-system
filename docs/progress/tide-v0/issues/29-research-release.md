# 버전 관리와 npm 배포 흐름 조사

Type: research
Status: resolved
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

## Answer

결과: [docs/research/release.md](../../../research/release.md) (기준 @changesets/cli 3.0.3, pnpm 12.18.0, lucide-static 1.70.0, 2026-11-09 확인)

- changesets 3.0.3은 publish·pack을 pnpm에 맡기므로 `workspace:`·`catalog:`가 실제 버전으로 치환됨(실험). `npm pack`은 둘 다 그대로 남김. catalog에 내부 패키지를 `workspace:^`로 넣으면 changesets가 의존 패키지 버전을 올리지 않고 경고만 냄(실험)
- pnpm v11.13.0부터 자체 릴리스 관리(`pnpm change`, `pnpm version -r`)가 있고 `.changeset/*.md` 형식이 같음. release-please는 npm publish를 하지 않음. semantic-release는 모노레포와 0.x 모두 공식 지원 범위 밖
- trusted publishing은 2025-07 GA. 2026-09-03 이후 새 설정은 기본이 "stage만 허용"이고, 검증되지 않은 설정은 48시간 뒤 만료됨. 패키지가 먼저 있어야 설정할 수 있음. **저장소가 PRIVATE이라 지금은 provenance가 생성되지 않음.** changesets는 staged publishing을 아직 지원하지 않음(이슈 #2025)
- 2FA 우회 토큰은 최대 90일이고 2026-07-31부터 계정·권한 변경에 못 씀. 직접 publish는 2027-01 제거가 목표(확정일 아님). org 접근 권한만 준 토큰으로는 org 패키지를 publish할 수 없음
- SemVer는 0.x를 "무엇이든 바뀔 수 있음"으로만 정의함. "0.x minor = breaking"은 npm caret 범위(`^0.2.3` = `<0.3.0`)에서 나온 관례. changesets는 0.x에서 major를 주면 1.0.0으로 올림(실험). 레퍼런스는 대부분 몇 달 안에 1.0으로 갔고 Lucide만 5년 넘게 0.x
- foundation에만 minor를 주면: 독립은 desktop 0.1.1, linked는 desktop 0.2.0, fixed는 셋 다 0.2.0(실험). Component 패키지는 아이콘 패키지를 `dependencies`에 `^`로 두는 것이 흔하고, Token 패키지는 dependency와 peer(한 곳)로 나뉨
- prerelease는 `--tag` 필수. 첫 publish에는 npm이 `latest`를 자동으로 붙임. 조사한 디자인 시스템 한 곳은 `next`(rc)와 `canary`(snapshot)를 OIDC로 냄
- Lucide·Tabler는 옛 이름을 alias export로 남기고 Lucide는 major에서만 지움. Heroicons는 v2 major에서 한꺼번에 바꿈. **`lucide-static` 1.70.0의 SVG 2,322개 중 293개는 alias이고 정식 아이콘은 2,029개**(메인이 tarball로 재확인). ADR 0007의 "2,322개"는 alias를 포함한 숫자
- 확인 불가 항목은 문서의 「확인하지 못한 것」 절에 있음. 30번 쟁점: 배포 인증 방식(OIDC 직접/stage+승인/로컬 2FA), 저장소 공개 시점과 첫 publish, changesets 3과 pnpm 자체 릴리스 관리 중 선택, 0.x 정책과 fixed/linked/독립, 아이콘 alias 생성 여부
