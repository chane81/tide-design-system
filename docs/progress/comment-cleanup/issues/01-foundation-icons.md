# 01: foundation·icons 주석 정리

Status: ready-for-agent
Blocked by: 코드 스타일 02 ([code-style/issues/02](../../code-style/issues/02-extensionless-imports.md))

## What to build

`packages/foundation`, `packages/icons`(`src`, `scripts`, `test`, `tsdown.config.ts`·`vitest.config.ts` 등 설정)의 주석을 [주석 규칙](../../../../.claude/rules/code-comments.md)대로 정리한다. 코드는 바꾸지 않는다.

## 할 일

- `semantic.ts`, `contrast.ts`, `scripts/build.ts`가 주석이 가장 많다. Token 값 옆의 결정 근거는 ADR(0022·0023 등)에 있는지 확인하고 번호만 남긴다.
- 공개 export(`index.ts`·`internal.ts`·`colorFamily.ts`가 내보내는 것)의 JSDoc은 다듬기만 한다.
- icons 생성 코드(`src/generated`)는 생성 스크립트가 만드는 주석이므로, 바꾸려면 스크립트 쪽을 고친다.

## 수용 기준

- [ ] 범위 안 주석이 규칙의 「남긴다」에 해당하는 것만 1~2줄로 남았다.
- [ ] 정리 전후 주석 줄 수를 티켓 Comments에 적었다.
- [ ] 공통 수용 기준(README)을 통과한다.
