# 02: 상대 import에서 확장자 빼기

Status: done
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

- [x] 패키지·앱 원본(`scripts/` 제외)에 `from "./… .ts(x)"` 형태의 상대 import가 없다.
- [x] `dist`의 JS와 d.ts가 상대 import를 `.js`로 적는다(변경 전 dist와 import 경로 비교).
- [x] smoke의 nodenext 타입 검사(`template/check/nodenext.ts`)와 `next build`가 통과한다.
- [x] `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm smoke`, `pnpm test:scripts`가 통과한다.
- [x] changeset: 배포 패키지 patch(동작 변화 없음).

## Comments

- tsconfig 근거(TypeScript 7.0.2, context7 `/microsoft/typescript/v7.0.2` 테스트 baseline): `moduleResolution: "bundler"`는 `module`이 `preserve`·`commonjs`·`es2015` 이상일 때만 쓸 수 있다(TS5095), `module: nodenext`와 같이 두면 TS5109. base를 `module: "esnext"` + `moduleResolution: "bundler"`로 바꾸고 `rewriteRelativeImportExtensions`를 뺐다. `.ts` import는 `allowImportingTsExtensions`가 없으면 TS5097이다.
- Node가 직접 실행하는 파일은 `tsconfig.scripts.json`(foundation·icons)으로 나눴다: `nodenext` + `allowImportingTsExtensions` + `noEmit`. 패키지 `typecheck`가 `tsc --noEmit && tsc -p tsconfig.scripts.json`으로 둘 다 본다. smoke-next tsconfig는 scripts만 보므로 `nodenext`를 직접 둔다.
- 판단: foundation `test/fixtures`(앱 브랜드 파일 예시)는 `tide-color` CLI가 Node로 읽는 파일이라 `.ts`를 유지했다. 빼면 `color-family.test.ts`의 CLI 테스트가 `Cannot find module …/fixtures/brand`로 실패했다. 그래서 foundation 기본 tsconfig에서 `test/fixtures`를 빼고 scripts 설정이 본다. 구조 규칙의 예외 문장에도 적었다.
- 판단: bundler 해석에서는 `next/link`의 default가 바로 Component라, components 테스트 5곳의 CJS 우회(`NextLink.default`, nodenext 타입 해석용)가 타입 오류가 됐다. 우회를 지우고 default import를 그대로 쓴다(Vite 런타임과 같다).
- `packages/foundation/scripts/build.ts`는 `../dist/index.js`·`../dist/internal.js`를 import한다. foundation `typecheck`는 이미 자기 `build`를 기다린다(packages/foundation/turbo.json). icons `scripts/generate.ts`는 src를 import하지 않지만, 만드는 아이콘 파일의 import(`../IconBase.tsx`, `./X.tsx`)에서 확장자를 뺐다. 루트 `scripts/`는 scripts끼리라 그대로다.
- 치환: 상대 import 704개(파일 261개: components 184, apps/docs 58(MDX 41 포함), foundation 16, icons 3). `vi.doMock("./color")`·`declare module "./index"`도 같이 바꿨다. 남은 `.ts` 문자열은 import가 아닌 경로(storybook `stories` glob, vitest `setupFiles`)뿐이다.
- dist 비교(tsdown 0.23.7, unbundle, oxc dts): 변경 전후 `dist`가 세 패키지 모두 `diff -r` 0줄(바이트 단위 동일). 상대 import는 foundation 63, icons 10146, components 534개이고 모두 `.js`로 끝난다(전후 같음). 공개 이름 목록(dist/index.d.ts)도 그대로다.
- 검증: `pnpm build`, `typecheck`, `test`, `lint`, `format:check`, `smoke`(nodenext 타입 검사·next build), `test:scripts` 통과.
