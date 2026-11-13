# 05: smoke 앱·루트 스크립트·루트 설정 주석 정리

Status: done
Blocked by: 코드 스타일 02 ([code-style/issues/02](../../code-style/issues/02-extensionless-imports.md))

## What to build

`apps/smoke-next`, 루트 `scripts/`, 루트 설정 파일(`pnpm-workspace.yaml`, `vitest.config.ts`, `vitest.workers.ts`, `.github/workflows` 등)의 주석을 [주석 규칙](../../../../.claude/rules/code-comments.md)대로 정리한다. 코드는 바꾸지 않는다.

## 할 일

- `pnpm-workspace.yaml`·워크플로의 YAML 주석도 같은 규칙으로 줄인다. 보안·배포 설정 이유(OIDC, minimumReleaseAge 등)는 1줄로 남긴다.
- `apps/smoke-next/template`은 앱 개발자 예시 역할도 하므로, 설정 방법을 알려 주는 주석은 1~2줄로 남긴다.

## 수용 기준

- [x] 범위 안 주석이 규칙의 「남긴다」에 해당하는 것만 1~2줄로 남았다.
- [x] 정리 전후 주석 줄 수를 티켓 Comments에 적었다.
- [x] 공통 수용 기준(README)을 통과한다.

## Comments

- 2026-11-13 완료. 주석 줄(`//`·`#`·`/* */`·JSDoc·JSX 주석, 이어지는 줄 포함)이 **475줄 → 284줄**이다. 범위: `apps/smoke-next`, 루트 `scripts/`, `pnpm-workspace.yaml`, `vitest.config.ts`, `vitest.workers.ts`, `.github/workflows/*`, `.dockerignore`. `turbo.json`은 주석이 없어 건너뛰었다.
  - 티켓 번호·확인 날짜·액션 버전 확인 기록, 근거 문서를 옮겨 적은 단락을 지웠다. 보안·배포 설정 이유(catalogMode, minimumReleaseAge, allowBuilds, OIDC·trusted publisher 파일 이름, `queue: max`, Playwright 컨테이너)는 1줄로 남겼다.
  - smoke `template`에는 설정 방법(브랜드 색 등록, client·서버 경계, render로 Next Link 넘기기)을 1줄씩 남겼다. 「Component 내부 class를 주석에도 쓰지 않는다(Tailwind가 스캔한다)」는 `page.tsx` 머리 한 곳으로 모았다.
  - `smoke.ts`의 "use client" 목록에서 같은 이유(React Aria hooks·state)를 반복하던 주석을 한 줄로 합쳤다.
  - 코드·설정 줄은 바뀌지 않았다(`git diff`에서 주석 밖의 변경 없음). 배포 패키지·Storybook 밖이라 changeset은 필요 없다.
- **보류(결정 근거인데 ADR·티켓에 없어 여기로 옮김, 3건)**: 코드에서는 지웠다. 문서로 옮길지 판단이 필요하다.
  1. `vitest.workers.ts` 로컬 worker 수 실측(10코어, 2026-11-13, components·docs 브라우저 테스트 동시 실행): 제한 없음 평균 59%·p90 81%·1분 15초, 30% 평균 37%·p90 72%, 20% 평균 25%·p90 60%·1분 34초, 1개 평균 13%·p90 38%·2분 58초. 시작할 때 Vite 변환과 첫 렌더로 잠깐 더 튈 수 있다. 퍼센트는 `os.availableParallelism()` 기준(vitest 5.1.0 `maxWorkers`). `docs/agents/testing.md`에는 결론(20%, CPU 약 60%)만 있다. **06에서 반영**(`docs/agents/testing.md` 「로컬 동시 실행 수」 실측 표).
  2. `release.yml` version job: `actions/create-github-app-token` v3.3.0은 `client-id`(`app-id`는 deprecated)·`private-key` 입력, `token` output이고 job이 끝나면 token을 폐기한다. **06에서 반영**(`docs/research/bot-pr-workflow-approval.md` 「보충 (2026-11-14)」).
  3. `release.yml` version job: changesets/action v2.1.2가 `GITHUB_TOKEN`을 환경 변수로 넘겨 changelog-github가 PR 링크와 작성자를 찾고, 열린 Version PR이 있으면 제목도 새 값으로 바꾼다(`src/run.ts` `updatePullRequest`). **06에서 반영**(ADR 0020 「보충 (2026-11-14)」).
