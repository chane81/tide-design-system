# 01: 저장소 골격

Status: ready-for-agent
Blocked by: 없음 (바로 시작 가능)

## What to build

메인테이너와 에이전트가 패키지를 추가하기 전에, 빈 패키지만으로 install·typecheck·lint·format이 돌고 PR CI가 통과하는 모노레포를 만든다. 이후 모든 티켓은 이 골격 위에서 같은 명령, 같은 버전 규칙으로 작업한다.

## 수용 기준

- [ ] pnpm workspace 위에 Turborepo를 쓴다. 배포 패키지 3개(`@tide-tds/foundation`, `@tide-tds/icons`, `@tide-tds/desktop`)와 private 앱 2개(Storybook 문서 앱, Next.js smoke 앱)의 자리가 빈 패키지로 있다.
- [ ] 별도의 설정 패키지나 utils 패키지는 두지 않는다.
- [ ] 의존성 버전은 pnpm 기본 catalog 하나로 관리하고 `catalogMode: strict`로 둔다. peer 범위와 내부 패키지는 catalog에 넣지 않는다. 0.x인 oxfmt만 정확한 버전으로 고정한다.
- [ ] turbo 태스크는 `build`, `typecheck`, `test`, `smoke`, `dev` 다섯 개이고, `dev`를 뺀 나머지는 모두 `^build`에 의존한다.
- [ ] TypeScript 7.0.2 하나만 쓴다. 공통 tsconfig에서 `erasableSyntaxOnly`, `isolatedDeclarations`, `verbatimModuleSyntax`, `rewriteRelativeImportExtensions`를 켠다.
- [ ] 출력은 ESM 전용이다. 배포 패키지에는 `engines`를 두지 않는다.
- [ ] 저장소는 Node 26과 pnpm 12.18.0으로 고정한다.
- [ ] oxlint와 oxfmt를 루트에서 저장소 전체에 한 번에 돌린다. type-aware 린팅은 쓰지 않는다.
- [ ] PR CI가 `turbo run typecheck test build smoke --affected`와 lint·format 검사를 돌리고, 빈 패키지 상태에서 통과한다. `.turbo` 캐시는 GitHub Actions cache에 둔다(원격 캐시·nightly 없음).
- [ ] 쓴 도구(pnpm catalog, turbo, tsconfig 옵션, oxlint, oxfmt)의 설정은 설치 버전 문서로 확인하고 근거 버전을 Comments에 남긴다.

## Comments
