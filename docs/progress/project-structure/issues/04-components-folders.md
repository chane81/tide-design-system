# 04: components 공개 Component를 모두 폴더로

Status: done
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

- [x] `src/` 바로 아래에 공개 Component 파일(`*.tsx`)과 Component 테스트가 없다. 남는 것은 `index.ts`, `styles.css`, `types.ts`와 Component 폴더, `components`·`hooks`·`libs`·`constants` 폴더뿐이다.
- [x] `dist/index.d.ts`의 공개 이름 목록이 main 빌드 결과와 같다.
- [x] `dist`에서 `"use client"`가 있는 파일 목록이 경로만 바뀌고 수는 같다.
- [x] 공통 수용 기준(README)을 통과한다.
- [x] changeset: `@tide-design/components` patch(`dist` 구조가 바뀜).

## Comments

### 2026-11-13 결과

- 공개 Component 35개를 폴더로 옮겼다(테스트 있는 31개 + `AlertDialog`·`CheckboxGroup`·`RadioGroup`·`Textarea`). 첫 커밋은 `git mv`로 경로만 바꾸고, 다음 커밋에서 import와 `index.ts`를 고쳤다. rename 이력을 남기려면 PR을 squash가 아닌 merge commit으로 머지한다.
- 폴더 `index.ts`는 `src/index.ts`의 export 블록을 그대로 나눠 만들었다(값은 `export { … }`, 타입은 `export type { … }`). `CheckboxGroup/index.ts`는 공개 이름 `ChoiceOrientation`도 함께 재수출한다. 하위 Component(`TableRow`·`MenuItem` 등)는 대표 폴더 `index.ts`가 재수출한다.
- Component 사이 import는 폴더 `index.ts`가 아니라 본문 파일(`../Button/Button.tsx`)을 가리킨다. 내부 import는 파일 경로로 한다는 규칙에 맞고, `AlertDialog`→`DialogRoot`, `RadioGroup`→`orientationClass`처럼 공개되지 않는 이름을 가져오는 곳이 있어 `index.ts`로는 닿지 않기 때문이다.
- 빌드: 폴더 `index.ts`는 재수출만 해서 tsdown(unbundle)이 JS로 내지 않는다. `dist/<C>/index.d.ts`만 생기고 `dist/index.js`는 본문 파일(`./Button/Button.js`)을 바로 import한다. 그래서 smoke에는 폴더 `index.js` 대신 진입점 `index.js`에 지시어가 없는지 보는 검사를 더했다.
- vitest `include`(`src/**/*.test.tsx`), `tsconfig.build.json` `exclude`(`src/**/*.test.tsx`), `styles.css`의 `@source "./"`는 이미 하위 폴더까지 잡아 고치지 않았다. 문서 앱은 components 내부 경로를 import하지 않는다(`preview.css`의 `@source`는 `src` 폴더 전체).
- 검증: `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm smoke` 통과. `dist/index.d.ts` 공개 이름 166개가 main과 같고, `"use client"` 파일 28개가 경로(`X.js` → `X/X.js`)만 바뀌었다.
- 남은 것: `orientationClass`(CheckboxGroup·RadioGroup 공용)와 `DialogRoot`(Dialog·AlertDialog 공용)는 다른 Component 본문에서 가져다 쓰는 비공개 이름이다. 규칙 3대로 공통 부모(`src/constants/`·`src/hooks/`)로 승격할지는 이 티켓 범위 밖이라 그대로 두었다.
