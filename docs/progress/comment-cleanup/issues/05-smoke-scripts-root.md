# 05: smoke 앱·루트 스크립트·루트 설정 주석 정리

Status: ready-for-agent
Blocked by: 구조 이행 05 ([project-structure/issues/05](../../project-structure/issues/05-components-internal-folder.md))

## What to build

`apps/smoke-next`, 루트 `scripts/`, 루트 설정 파일(`pnpm-workspace.yaml`, `vitest.config.ts`, `vitest.workers.ts`, `.github/workflows` 등)의 주석을 [주석 규칙](../../../../.claude/rules/code-comments.md)대로 정리한다. 코드는 바꾸지 않는다.

## 할 일

- `pnpm-workspace.yaml`·워크플로의 YAML 주석도 같은 규칙으로 줄인다. 보안·배포 설정 이유(OIDC, minimumReleaseAge 등)는 1줄로 남긴다.
- `apps/smoke-next/template`은 앱 개발자 예시 역할도 하므로, 설정 방법을 알려 주는 주석은 1~2줄로 남긴다.

## 수용 기준

- [ ] 범위 안 주석이 규칙의 「남긴다」에 해당하는 것만 1~2줄로 남았다.
- [ ] 정리 전후 주석 줄 수를 티켓 Comments에 적었다.
- [ ] 공통 수용 기준(README)을 통과한다.
