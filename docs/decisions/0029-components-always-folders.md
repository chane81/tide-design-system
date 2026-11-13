# components 패키지의 공개 Component는 모두 폴더로 둔다

근거 원칙: ④ 발견할 수 있음이 외워야 함보다 우선한다, ③ 단순함이 유연함보다 우선한다

[ADR 0028](0028-colocation-monorepo-structure.md)은 단순한 Component를 파일 하나로 두고, 전용 조각이 생길 때 폴더로 바꾸게 했다. 그런데 `packages/components`의 공개 Component는 본문과 테스트를 늘 함께 가진다. 그래서 `src/` 바로 아래에 `Button.tsx`와 `Button.test.tsx`가 Component 수의 두 배만큼 늘어서고, 내부 폴더(`components`·`hooks`·`libs`·`constants`)가 그 사이에 묻힌다(2026-11-13, 사용자 결정).

## 결정

- `packages/components`의 공개 Component는 처음부터 `<C>/index.ts` + `<C>/<C>.tsx` + `<C>/<C>.test.tsx` 폴더로 둔다. 테스트가 아직 없어도 폴더로 둔다.
- 하위 Component(`TableRow` 등)는 대표 폴더 안에 두고, 대표 폴더의 `index.ts`가 함께 재수출한다.
- 내부 Component(`src/components/`)와 문서 앱 블록은 ADR 0028의 규칙(단순하면 파일 하나, 조각이 생기면 폴더)을 그대로 따른다.

## 고려한 대안

- **ADR 0028 그대로(조각이 생길 때 폴더로):** 파일 수는 적지만, Component마다 파일이 둘씩 늘어서고 폴더로 바꾸는 시점마다 `src/index.ts`와 smoke 검사 목록을 고쳐야 한다. 규칙 하나("공개 Component는 폴더")가 조건부 규칙보다 단순하다(③).

## 결과

- 이미 있는 공개 Component를 폴더로 옮기는 작업은 [구조 이행 티켓 04](../progress/project-structure/issues/04-components-folders.md)에서 한다. 공개 import 경로는 바뀌지 않는다.
- `dist` 파일 경로가 `dist/Button.js`에서 `dist/Button/Button.js`로 바뀐다. 이 경로를 직접 적은 smoke 검사 목록도 함께 고친다.
