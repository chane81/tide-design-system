# 03: components 내부 코드·테스트 헬퍼 주석 정리

Status: done
Blocked by: 코드 스타일 02 ([code-style/issues/02](../../code-style/issues/02-extensionless-imports.md))

## What to build

`packages/components/src/_internal/`, `packages/components/test/`, `src/index.ts`, `src/types.ts`, `src/styles.css`, 패키지 설정 파일의 주석을 [주석 규칙](../../../../.claude/rules/code-comments.md)대로 정리한다. 코드는 바꾸지 않는다.

## 할 일

- `_internal/constants/overlayClass.ts`처럼 class 상수 위에 긴 설명이 붙은 파일이 많다. Tailwind 스캔 제약 같은 함정은 1줄로 남긴다.
- `test/` 헬퍼의 flaky 대응 설명은 `docs/agents/testing.md`에 있으면 그 문서를 가리키는 1줄로 줄인다.

## 수용 기준

- [x] 범위 안 주석이 규칙의 「남긴다」에 해당하는 것만 1~2줄로 남았다.
- [x] 정리 전후 주석 줄 수를 티켓 Comments에 적었다.
- [x] 공통 수용 기준(README)을 통과한다.

## Comments

- 주석 줄 수(범위 파일 43개, `//`·`/* */` 줄): 정리 전 691줄 → 정리 후 270줄. 3줄 이상 내용이 남은 블록은 없다(`/** */`의 2줄 + 구분자 줄이 최대).
- 지운 것: 머리 주석의 티켓 번호·「누가 처음 쓰고 누가 다시 쓴다」·「"use client"가 없다」, class 상수 위 spec 풀어 쓰기, 확인 과정(「설치본 소스로 확인」·실험 날짜·run 번호), 코드를 풀어 쓴 주석. 근거는 ADR 0005·0011·0013·0018·0019·0022·0023·0025, tide-v0-impl 티켓 16·25·26·29 Comments, `docs/agents/testing.md`에 있음을 확인했다.
- 남긴 것: Tailwind 스캔 제약 1줄(class 상수 파일마다), variant 순서 의존(tailwindcss 4.3.5), forced-colors 우회, `_init`·`_payload` 비공개 API, Vite 사전 번들 이유, 서버 컴포넌트 context 제약 등 함정·외부 동작 우회.
- `test/` flaky 대응: `browser-setup.ts`·`motion.ts`는 `docs/agents/testing.md`의 「마우스 잔류」·「전환 중 값 읽기」를 가리키는 1줄로 줄였다.
- 공개 export: `cn` JSDoc은 이미 2줄이라 그대로, `types.ts`의 `Size`·`FillVariant`는 1줄로 다듬었다. changeset은 `@tide-design/components` patch.
- 판단 보류(ADR·티켓에 없어 코드에 1줄로 남김) 1건:
  1. `test/browser-setup.ts`: `beforeEach`가 vitest-browser-react cleanup보다 먼저 돌아 앞 테스트 DOM에 pointerleave가 생기지만 그 DOM은 곧 지워진다는 설명. `docs/agents/testing.md` 「마우스 잔류」로 옮길지 정한다.
- 검증: `pnpm build`, `typecheck`, `test`, `lint`, `format:check`, `smoke` 통과. 주석·빈 줄을 뺀 코드 줄을 origin/main과 비교해 33개 파일 모두 같음을 확인했다.
