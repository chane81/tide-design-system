# 파일은 쓰는 곳 가까이 두고, 폴더 이름은 네 개로 고정한다

근거 원칙: ④ 발견할 수 있음이 외워야 함보다 우선한다, ③ 단순함이 유연함보다 우선한다

Component가 30개를 넘으면서 `packages/components/src/`에 Component, 테스트, 여러 Component가 함께 쓰는 내부 모듈(`alert-style.ts`, `field-context.ts`, `overlay.tsx` 등)이 한 폴더에 85개 파일로 섞였다. 파일 이름만 보고는 공개 Component인지 내부 모듈인지, 누가 쓰는지 알 수 없다. 문서 앱도 `docs-blocks/`처럼 이 앱에만 있는 폴더 이름을 쓴다. foundation은 테스트를 `test/`에 모으고, components는 원본 옆에 둔다(2026-11-13, 사용자 결정으로 구조 규칙을 정함).

## 결정

- 구조 규칙은 `.claude/rules/monorepo-structure.md`에 두고, 예시는 같은 폴더의 `monorepo-structure.examples.md`에 둔다. 규칙 본문이 기준이다.
- **콜로케이션:** 코드는 쓰는 곳 가장 가까이 두고, 쓰는 곳이 실제로 늘 때만 공통 부모로 올린다. 패키지를 넘을 때는 코드의 주인(foundation·icons·components·docs)이 먼저다.
- **폴더 이름 네 개:** `components` `hooks` `libs` `constants`. 어느 깊이에서든 같은 뜻이다. 타입만 모은 파일은 `types.ts`.
- **Component:** 단순하면 `PascalCase.tsx` 하나, 전용 조각이 생기면 `<C>/index.ts` + `<C>/<C>.tsx` 폴더로 바꾼다.
- **이름:** Component `PascalCase.tsx`, hook `useXxx.ts`, 그 밖의 소스는 `camelCase.ts`. subpath export 이름은 공개 계약이라 kebab-case를 유지한다.
- **테스트:** 단위 테스트는 대상 옆, 패키지 `test/`에는 setup·helper·fixture와 패키지 전체를 보는 테스트만.
- **진입점:** 패키지 `src/index.ts`는 공개 이름을 하나씩 네임드로 재수출한다. `export *`와 내부 폴더 배럴은 쓰지 않는다.
- **의존 방향:** `apps → components → {foundation, icons}`. 강제 수단은 별도 lint 규칙 대신 `package.json` 선언과 pnpm의 격리 링크다.

## 고려한 대안

- **`export *` 진입점:** 진입점이 짧아지지만, 내부 모듈의 export가 실수로 공개 계약이 된다. 공개 API를 진입점에서 바로 읽을 수 있어야 해서(④) 명시 재수출을 유지한다.
- **kebab-case 파일 이름 유지:** 이름을 바꾸는 diff가 줄지만, Component(`PascalCase`)·hook(`useXxx`)과 섞이면 파일 이름만으로 export를 짐작할 수 없다. 대표 export 이름을 그대로 쓰는 camelCase로 맞춘다.
- **의존 방향 lint 규칙(boundaries 류):** 패키지가 셋이고 방향이 단순해서, 선언하지 않은 패키지를 import할 수 없는 pnpm 동작으로 충분하다(③).

## 결과

- 기존 파일 배치를 규칙에 맞게 옮기는 작업은 `docs/progress/project-structure/`의 티켓으로 나눈다. 공개 import 경로(`@tide-design/*`)와 subpath 이름은 바뀌지 않는다.
- foundation 파일 이름이 바뀌면 `dist` 파일 이름도 바뀌므로 `package.json` `exports`를 함께 고친다.
- 지난 티켓·ADR에 적힌 옛 파일 경로는 당시 기록이라 고치지 않는다.
