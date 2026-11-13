# 코드 주석 정리

[주석 규칙](../../../.claude/rules/code-comments.md)에 맞게 장황한 주석을 줄이거나 지운다. 코드 동작은 바꾸지 않는다. 2026-11-13 측정 기준 주석 줄은 약 2,300줄이고, 6줄 이상 이어지는 주석 블록이 80곳이다.

## 티켓

| 번호                                         | 범위                                                        | 차단           |
| -------------------------------------------- | ----------------------------------------------------------- | -------------- |
| [01](issues/01-foundation-icons.md)          | `packages/foundation`, `packages/icons` (scripts·설정 포함) | 코드 스타일 02 |
| [02](issues/02-components-public.md)         | `packages/components` 공개 Component 폴더                   | 코드 스타일 02 |
| [03](issues/03-components-internal-tests.md) | `packages/components/src/_internal`, `test/`, 패키지 설정   | 코드 스타일 02 |
| [04](issues/04-docs-app.md)                  | `apps/docs` (`.storybook` 포함)                             | 코드 스타일 02 |
| [05](issues/05-smoke-scripts-root.md)        | `apps/smoke-next`, 루트 `scripts/`, 루트 설정 파일          | 코드 스타일 02 |

구조 이행([project-structure](../project-structure/README.md)) 06과 코드 스타일([code-style](../code-style/README.md)) 01·02가 머지된 뒤 시작한다. 그 전에 하면 파일 이동과 충돌한다. 다섯 티켓은 서로 다른 파일만 건드리므로 worktree별로 동시에 진행할 수 있다.

## 공통 수용 기준

- 코드 동작이 바뀌지 않는다: `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm smoke`가 통과한다.
- `"use client"`, `#!/usr/bin/env node`, lint·타입 지시 주석(`// oxlint-disable…`, `// @ts-expect-error` 등)은 지우지 않는다.
- 공개 props JSDoc은 지우지 않고 1~2줄로 다듬는다. 빠지는 설명 중 앱 개발자가 알아야 할 것은 해당 MDX에 있는지 확인하고, 없으면 MDX로 옮긴다.
- 지운 내용 중 결정 근거인데 ADR·티켓 어디에도 없는 것은 지우지 말고 티켓 `## Comments`에 목록으로 남겨 보고한다.
- changeset: 배포 패키지는 patch(d.ts의 JSDoc이 바뀜), 그 밖은 저장소 검사가 요구하는 대로.
