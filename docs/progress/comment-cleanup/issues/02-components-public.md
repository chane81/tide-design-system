# 02: components 공개 Component 주석 정리

Status: ready-for-agent
Blocked by: 코드 스타일 02 ([code-style/issues/02](../../code-style/issues/02-extensionless-imports.md))

## What to build

`packages/components/src/<Component>/` 폴더 전체(본문·테스트·전용 조각)의 주석을 [주석 규칙](../../../../.claude/rules/code-comments.md)대로 정리한다. 코드는 바꾸지 않는다.

## 할 일

- Combobox·Toast·Dialog·Accordion·Menu·Select·Tabs가 주석이 가장 많다.
- props JSDoc은 1~2줄로 다듬는다. Storybook props 표에서 설명이 비지 않게 한다.
- 접근성 동작을 설명하는 주석은 구현 이유가 코드로 안 보이면 1줄로 남긴다.

## 수용 기준

- [ ] 범위 안 주석이 규칙의 「남긴다」에 해당하는 것만 1~2줄로 남았다.
- [ ] 정리 전후 주석 줄 수를 티켓 Comments에 적었다.
- [ ] 공통 수용 기준(README)을 통과한다.
