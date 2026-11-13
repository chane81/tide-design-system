# 04: components 공개 Component를 모두 폴더로

Status: ready-for-agent
Blocked by: 01

## What to build

`packages/components/src/` 바로 아래의 공개 Component 파일과 테스트를 Component마다 폴더 하나로 옮긴다([ADR 0029](../../../decisions/0029-components-always-folders.md), 구조 규칙 7). 공개 API(`src/index.ts`의 이름)와 공개 import 경로는 바뀌지 않는다.

## 할 일

- `src/<C>.tsx`, `src/<C>.test.tsx` → `src/<C>/<C>.tsx`, `src/<C>/<C>.test.tsx`. `src/<C>/index.ts`를 새로 만들어 그 파일의 공개 이름만 재수출한다.
- 테스트가 없는 공개 Component(`AlertDialog`, `CheckboxGroup`, `RadioGroup`, `Textarea`)도 폴더로 옮긴다.
- `src/index.ts`는 각 폴더의 `index.ts`를 가리키게 고친다. 공개 이름 목록과 순서는 그대로 둔다.
- 폴더 깊이가 하나 늘어나므로 내부 모듈 상대 import(`./hooks/…` → `../hooks/…`)를 고친다. 테스트가 `../test/…` 헬퍼를 가리키면 그것도 고친다.
- `apps/smoke-next/scripts/smoke.ts`의 `"use client"` 검사 대상 dist 경로를 새 경로로 고친다.
- `index.ts`에는 `"use client"`를 적지 않는다. 본문 파일의 지시어는 그대로 둔다.
- vitest `include`, `tsconfig.build.json` `exclude`, `styles.css`의 `@source`가 새 위치를 잡는지 확인한다.

## 수용 기준

- [ ] `src/` 바로 아래에 공개 Component 파일(`*.tsx`)과 Component 테스트가 없다. 남는 것은 `index.ts`, `styles.css`, `types.ts`와 Component 폴더, `components`·`hooks`·`libs`·`constants` 폴더뿐이다.
- [ ] `dist/index.d.ts`의 공개 이름 목록이 main 빌드 결과와 같다.
- [ ] `dist`에서 `"use client"`가 있는 파일 목록이 경로만 바뀌고 수는 같다.
- [ ] 공통 수용 기준(README)을 통과한다.
- [ ] changeset: `@tide-design/components` patch(`dist` 구조가 바뀜).
