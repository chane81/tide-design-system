# 02: 상대 import에서 확장자 빼기

Status: ready-for-agent
Blocked by: 01 (return 앞 빈 줄)

## What to build

패키지·앱 원본의 상대 import에서 `.ts`/`.tsx`를 뺀다(`from "./cn.ts"` → `from "./cn"`). 구조 규칙 「import와 진입점 > 경로」를 따른다. 공개 API와 배포 결과물의 동작은 바꾸지 않는다.

## 배경

`.ts`를 붙인 이유는 두 가지였다(tide-v0 티켓 16, tide-v0-impl 02·36).

1. Node가 TS 스크립트를 바로 실행하려면 확장자가 필요하다(Node ESM).
2. 앱의 `moduleResolution: nodenext`에서 배포 d.ts의 import가 `.js`로 끝나야 한다.

2는 tsdown이 결과물 경로를 `.js`로 다시 쓰므로(티켓 36) 원본 확장자와 무관할 가능성이 크다. 1은 Node가 실행하는 `scripts/`에만 해당한다. 2026-11-13 기준 Node가 직접 실행하면서 `src`를 import하는 곳은 `packages/foundation/scripts/build.ts`(`../src/index.ts`, `../src/internal.ts`) 하나다.

## 할 일

- `tsconfig.base.json`: `moduleResolution: "bundler"`와 짝이 맞는 `module` 값으로 바꾸고 `rewriteRelativeImportExtensions`를 뺀다. TypeScript 설치 버전(7.0.x)의 옵션 이름·조합은 context7 또는 설치본으로 확인한다. Node가 실행하는 `scripts/`를 타입 검사하는 설정이 따로 있으면 그쪽은 nodenext를 유지한다.
- 패키지(`foundation`·`icons`·`components`)·`apps/docs`의 `src`·`test`·`.storybook`·설정 파일 상대 import에서 확장자를 뺀다. 기계적 치환 뒤 `typecheck`로 확인한다.
- `packages/foundation/scripts/build.ts`가 `../dist/index.js`·`../dist/internal.js`를 import하게 바꾼다(빌드 순서상 tsdown 다음에 돈다). icons `scripts/generate.ts` 등 다른 Node 스크립트도 `src`를 import하면 같은 방식으로 바꾼다.
- `scripts/` 아래 파일끼리의 import는 `.ts`를 유지한다.
- `apps/smoke-next/template`은 앱 개발자 예시라 Next.js 관례를 따른다. 이 티켓 범위가 아니다.

## 수용 기준

- [ ] 패키지·앱 원본(`scripts/` 제외)에 `from "./… .ts(x)"` 형태의 상대 import가 없다.
- [ ] `dist`의 JS와 d.ts가 상대 import를 `.js`로 적는다(변경 전 dist와 import 경로 비교).
- [ ] smoke의 nodenext 타입 검사(`template/check/nodenext.ts`)와 `next build`가 통과한다.
- [ ] `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm smoke`, `pnpm test:scripts`가 통과한다.
- [ ] changeset: 배포 패키지 patch(동작 변화 없음).
