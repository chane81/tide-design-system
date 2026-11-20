# 01: main에서 캐시 채우기, icons task inputs 좁히기

Status: ready-for-human

## What to build

새 PR의 첫 CI가 매번 cold로 도는 것을 막고, icons의 문서·테스트만 바뀌어도 generate→build→하위 패키지 캐시가 모두 깨지는 것을 막는다.

배경:

- `ci.yml`이 `pull_request`에서만 돌아 Actions cache가 모두 `refs/pull/N/merge` 범위에 저장된다. Actions cache는 branch 범위이고 default branch 캐시만 다른 branch가 복원할 수 있어서, PR끼리는 `.turbo`·pnpm 캐시를 나눠 쓰지 못한다.
- icons(아이콘 2030개) cold build는 약 5초(그중 d.ts 4.4초)다. 최근 60커밋 중 icons 변경 48개의 대부분이 릴리스 버전업(`package.json`·`CHANGELOG.md`)이고 `icon-names.json` 변경은 1개다. changeset `fixed` 묶음이라 릴리스마다 icons 버전이 오른다.
- `packages/icons/turbo.json`의 `generate` inputs가 `$TURBO_DEFAULT$`라 패키지 안 어떤 파일이 바뀌어도 generate 해시가 바뀐다. 하위 task 해시는 dependsOn 상위 task 해시를 포함하므로 icons build, components·docs·smoke까지 연쇄로 미스가 난다.
- turbo(2.11.10)는 패키지 `package.json`·`turbo.json`·lockfile을 inputs와 상관없이 해시에 넣는다. `inputs`를 쓰면 `.gitignore` 기본 처리에서 빠진다.

## 할 일

- [x] `ci.yml`: `push: branches: [main]`을 더해 main에서 `.turbo`·pnpm 캐시를 채운다. main은 `--affected` 없이 전체를 돌리고, changeset 검사는 PR에서만 한다.
- [x] `packages/icons/turbo.json`: task마다 실제로 읽는 파일만 inputs에 적는다. `CHANGELOG.md`·README는 넣지 않는다.
- [x] dry run 해시 비교: CHANGELOG 수정 → 4개 task 해시 불변(변경 전 설정은 4개 모두 바뀜), `test/icons.test.tsx` 수정 → generate·build 불변·test·typecheck 변경, `icon-names.json` 수정 → 4개 모두 변경.
- [ ] PR 리뷰, 머지 뒤 main run이 캐시를 저장하는지 `gh cache list`로 확인

## 판단한 곳

- `release.yml`은 바꾸지 않는다. publish 경로에 캐시를 복원하면 cache poisoning 위험이 있어 job마다 캐시를 꺼 두었다.
- main push는 취소하지 않는다(`cancel-in-progress`는 PR에서만). 취소된 run은 캐시를 저장하지 않고, main push는 머지와 Version PR 정도라 드물다.
- generate inputs는 `scripts/**`에서 테스트(`*.test.ts`)만 뺐다. generate가 쓰지 않는 `init-names.ts`·`name-removal.ts`도 들어가지만, 파일을 하나씩 적으면 헬퍼를 더할 때 빠뜨리기 쉬워서 폴더 단위로 둔다.
- build·typecheck·test는 `!src/generated/**`로 생성 결과를 뺀다. 생성 결과는 gitignore라 기본 처리에서 빠지던 파일이고, 내용은 dependsOn의 generate 해시가 대신한다.
- lucide-static 버전은 lockfile로 해시에 들어가므로 inputs에 따로 적지 않는다.## 할 일

- [x] `ci.yml`: `push: branches: [main]`을 더해 main에서 `.turbo`·pnpm 캐시를 채운다. main은 `--affected` 없이 전체를 돌리고, changeset 검사는 PR에서만 한다.
- [x] `packages/icons/turbo.json`: task마다 실제로 읽는 파일만 inputs에 적는다. `CHANGELOG.md`·README는 넣지 않는다.
- [x] dry run 해시 비교: CHANGELOG 수정 → 4개 task 해시 불변(변경 전 설정은 4개 모두 바뀜), `test/icons.test.tsx` 수정 → generate·build 불변·test·typecheck 변경, `icon-names.json` 수정 → 4개 모두 변경.
- [ ] PR 리뷰, 머지 뒤 main run이 캐시를 저장하는지 `gh cache list`로 확인

## 판단한 곳

- `release.yml`은 바꾸지 않는다. publish 경로에 캐시를 복원하면 cache poisoning 위험이 있어 job마다 캐시를 꺼 두었다.
- main push는 취소하지 않는다(`cancel-in-progress`는 PR에서만). 취소된 run은 캐시를 저장하지 않고, main push는 머지와 Version PR 정도라 드물다.
- generate inputs는 `scripts/**`에서 테스트(`*.test.ts`)만 뺐다. generate가 쓰지 않는 `init-names.ts`·`name-removal.ts`도 들어가지만, 파일을 하나씩 적으면 헬퍼를 더할 때 빠뜨리기 쉬워서 폴더 단위로 둔다.
- build·typecheck·test는 `!src/generated/**`로 생성 결과를 뺀다. 생성 결과는 gitignore라 기본 처리에서 빠지던 파일이고, 내용은 dependsOn의 generate 해시가 대신한다.
- lucide-static 버전은 lockfile로 해시에 들어가므로 inputs에 따로 적지 않는다.
