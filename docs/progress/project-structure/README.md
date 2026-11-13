# 프로젝트 구조 이행

[구조 규칙](../../../.claude/rules/monorepo-structure.md)([ADR 0028](../../decisions/0028-colocation-monorepo-structure.md))에 맞게 기존 파일 배치를 옮긴다. 공개 import 경로(`@tide-design/*`)와 subpath 이름, Component 동작은 바꾸지 않는다.

## 티켓

| 번호                                                | 제목                                     | 차단 |
| --------------------------------------------------- | ---------------------------------------- | ---- |
| [01](issues/01-components-internal-modules.md)      | components 내부 모듈을 네 폴더로 나누기  | 없음 |
| [02](issues/02-foundation-icons-names-and-tests.md) | foundation·icons 파일 이름과 테스트 위치 | 없음 |
| [03](issues/03-docs-app-layout.md)                  | 문서 앱 섹션·블록 재배치                 | 없음 |

세 티켓은 서로 다른 패키지만 건드리므로 worktree별로 동시에 진행할 수 있다.

## 공통 수용 기준

- `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm smoke`가 통과한다.
- 파일 이동은 `git mv`로 해서 이력이 이어지게 한다.
- 옮긴 파일의 `"use client"` 지시어가 그대로 남아 있다.
- 지난 티켓·ADR에 적힌 옛 경로는 고치지 않는다. 코드 주석 속 경로는 새 경로로 고친다.
