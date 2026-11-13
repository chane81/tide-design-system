# 03: components 내부 코드·테스트 헬퍼 주석 정리

Status: ready-for-agent
Blocked by: 코드 스타일 02 ([code-style/issues/02](../../code-style/issues/02-extensionless-imports.md))

## What to build

`packages/components/src/_internal/`, `packages/components/test/`, `src/index.ts`, `src/types.ts`, `src/styles.css`, 패키지 설정 파일의 주석을 [주석 규칙](../../../../.claude/rules/code-comments.md)대로 정리한다. 코드는 바꾸지 않는다.

## 할 일

- `_internal/constants/overlayClass.ts`처럼 class 상수 위에 긴 설명이 붙은 파일이 많다. Tailwind 스캔 제약 같은 함정은 1줄로 남긴다.
- `test/` 헬퍼의 flaky 대응 설명은 `docs/agents/testing.md`에 있으면 그 문서를 가리키는 1줄로 줄인다.

## 수용 기준

- [ ] 범위 안 주석이 규칙의 「남긴다」에 해당하는 것만 1~2줄로 남았다.
- [ ] 정리 전후 주석 줄 수를 티켓 Comments에 적었다.
- [ ] 공통 수용 기준(README)을 통과한다.
