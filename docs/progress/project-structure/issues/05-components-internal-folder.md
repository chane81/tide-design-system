# 05: components 공용 비공개 코드를 `_internal/`로 모으기

Status: done
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

- [x] `src/` 바로 아래에 `index.ts`, `styles.css`, `types.ts`, `_internal/`, 공개 Component 폴더만 있다.
- [x] Component 폴더끼리 공개되지 않은 이름을 import하지 않는다(`rg "from \"\.\./[A-Z]"`로 확인).
- [x] `dist/index.d.ts`의 공개 이름 목록이 main 빌드 결과와 같다.
- [x] `dist`에서 `"use client"`가 있는 파일 목록이 경로만 바뀌고 수는 같다. (승격으로 새로 생긴 client 파일 2개를 빼면 같다. Comments 참고)
- [x] 공통 수용 기준(README)을 통과한다.
- [x] changeset: `@tide-design/components` patch(`dist` 구조가 바뀜).

## Comments

### 2026-11-13 결과

- 사용자 요청으로 04와 같은 PR(#53), 같은 브랜치에서 했다. 첫 커밋은 `git mv`로 `src/{components,hooks,libs,constants}` → `src/_internal/…` 경로만 바꿨다. changeset은 04의 `.changeset/components-folders.md` 설명에 덧붙였다.
- import: Component 폴더는 `../_internal/<폴더>/…`로 바꿨다. `_internal` 안끼리는 깊이가 같아 그대로 두고 `types.ts`만 `../../types.ts`로 고쳤다. `src/index.ts`는 `cn`만 이름으로 재수출한다. `_internal`과 하위에 `index.ts`는 없다. Component 폴더 주석 속 공용 모듈 경로도 `_internal/…`로 고쳤다(`_internal` 안 주석은 서로 상대 위치라 그대로).
- 승격(규칙 3):
  - `DialogRoot` → `_internal/components/DialogRoot.tsx`. `DialogRoot`가 만드는 `DialogContext`를 Dialog의 부분 Component가 읽으므로 context와 `useDialogContext`도 함께 올렸다. 규칙 1(Context는 읽는 hook 파일에)과 hook마다 파일 하나라는 01의 결정대로 `_internal/hooks/useDialogContext.ts`에 따로 뒀다.
  - `orientationClass` → `_internal/constants/choiceGroupClass.ts`. 키 타입인 `ChoiceOrientation`도 같이 옮겼다(`_internal`이 Component 본문을 import하면 의존 방향이 거꾸로 된다).
  - 공개 이름 `DialogProps`·`ChoiceOrientation`은 원래 본문(`Dialog.tsx`·`CheckboxGroup.tsx`)이 `export type { … } from`으로 재수출해서 폴더 `index.ts`와 `src/index.ts`는 바꾸지 않았다.
  - 그 밖의 Component 사이 import(`Button`·`IconButton`·`Spinner`·`VisuallyHidden`, 테스트의 공개 Component)는 모두 공개 이름이라 그대로 뒀다.
- `"use client"`: 옮긴 파일은 지시어를 그대로 갖는다. 승격으로 새 client 모듈 `DialogRoot.js`·`useDialogContext.js`가 생겨 dist의 지시어 파일이 28개에서 30개가 됐다. 이 둘을 빼면 main과 같은 28개이고 경로만 바뀌었다. 둘 다 hook·context를 쓰므로 지시어가 필요하다. smoke 검사 목록에 더했다(`choiceGroupClass.js`는 서버 목록).
- 밑줄 폴더: tsdown(unbundle)이 `dist/_internal/{components,hooks,libs,constants}`를 그대로 내고, vitest `include`(`src/**/*.test.ts`)가 `_internal/libs/cn.test.ts`를 잡는다(components 테스트 파일 70개 그대로). `tsconfig.build.json` `exclude`와 `styles.css`의 `@source "./"`도 밑줄 폴더를 빼지 않는다. 설정은 바꾸지 않았다.
- 검증: `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm smoke` 통과. `dist/index.d.ts` 공개 이름 166개가 main과 같다.
