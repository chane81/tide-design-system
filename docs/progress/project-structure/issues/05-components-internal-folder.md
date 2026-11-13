# 05: components 공용 비공개 코드를 `_internal/`로 모으기

Status: ready-for-agent
Blocked by: 04

## What to build

`packages/components/src/`의 공용 폴더 `components`·`hooks`·`libs`·`constants`를 `src/_internal/` 아래로 옮긴다([ADR 0030](../../../decisions/0030-components-internal-folder.md), 구조 규칙 3). 공개 API(`src/index.ts`의 이름)와 공개 import 경로는 바뀌지 않는다.

## 할 일

- `src/{components,hooks,libs,constants}/` → `src/_internal/{components,hooks,libs,constants}/` (`git mv`, 이름은 그대로).
- 공개 Component 폴더와 `_internal/` 안 파일의 상대 import를 고친다(`../hooks/…` → `../_internal/hooks/…`, `_internal` 안끼리는 깊이가 같아 그대로인지 확인).
- `src/index.ts`의 `cn` 재수출 경로를 고친다. `_internal/`을 통째로 재수출하지 않는다.
- `_internal/`과 그 하위 폴더에 `index.ts`를 만들지 않는다.
- 테스트(`src/_internal/libs/cn.test.ts` 등)와 `test/`의 헬퍼가 옛 경로를 가리키면 고친다.
- 다른 Component의 본문 파일에서 가져다 쓰는 비공개 이름을 `_internal/`로 승격한다(규칙 3, 티켓 04 Comments): `orientationClass`(CheckboxGroup·RadioGroup) → `_internal/constants/`, `DialogRoot`(Dialog·AlertDialog) → `_internal/components/`. 그 밖에도 `../<OtherComponent>/<OtherComponent>.tsx`에서 공개되지 않은 이름을 import하는 곳이 있으면 같이 올린다.
- `apps/smoke-next/scripts/smoke.ts`의 `"use client"` 검사 대상 dist 경로를 새 경로로 고친다.
- vitest `include`, `tsconfig.build.json` `exclude`, `styles.css`의 `@source`, tsdown 출력이 `_internal`(밑줄로 시작하는 폴더)을 빠뜨리지 않는지 확인한다.

## 수용 기준

- [ ] `src/` 바로 아래에 `index.ts`, `styles.css`, `types.ts`, `_internal/`, 공개 Component 폴더만 있다.
- [ ] Component 폴더끼리 공개되지 않은 이름을 import하지 않는다(`rg "from \"\.\./[A-Z]"`로 확인).
- [ ] `dist/index.d.ts`의 공개 이름 목록이 main 빌드 결과와 같다.
- [ ] `dist`에서 `"use client"`가 있는 파일 목록이 경로만 바뀌고 수는 같다.
- [ ] 공통 수용 기준(README)을 통과한다.
- [ ] changeset: `@tide-design/components` patch(`dist` 구조가 바뀜).
