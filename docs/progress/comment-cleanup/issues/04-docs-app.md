# 04: 문서 앱 주석 정리

Status: ready-for-agent
Blocked by: 구조 이행 05 ([project-structure/issues/05](../../project-structure/issues/05-components-internal-folder.md))

## What to build

`apps/docs`(`src`, `.storybook`, 설정 파일)의 주석을 [주석 규칙](../../../../.claude/rules/code-comments.md)대로 정리한다. 코드는 바꾸지 않는다.

## 할 일

- `.storybook/main.ts`의 Vite·Storybook 우회 설명은 버전과 이유만 1~2줄로 남긴다.
- stories의 `parameters.docs.description` 등 문서 문자열은 주석이 아니므로 이 티켓 범위가 아니다.

## 수용 기준

- [ ] 범위 안 주석이 규칙의 「남긴다」에 해당하는 것만 1~2줄로 남았다.
- [ ] 정리 전후 주석 줄 수를 티켓 Comments에 적었다.
- [ ] 공통 수용 기준(README)을 통과한다.
