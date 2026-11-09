# 36: 패키지 빌드를 tsdown으로 전환

Status: done
Blocked by: 03 (Storybook과 브라우저 테스트 골격)

## What to build

메인테이너가 배포 패키지 세 개(foundation, icons, desktop)를 같은 빌드 도구 하나(tsdown)로 빌드한다. 앱 개발자가 받는 결과물(파일 단위 ESM, d.ts, `"use client"` 경계, CSS exports)은 지금과 같다. 2026-11-10 사용자 결정으로 tide-v0 티켓 16·19의 빌드 결정(desktop은 Vite 8 라이브러리 모드 + tsc d.ts, foundation은 번들러 없이 tsc)을 바꾼다. icons(08)와 Foundation 확장(04)이 이 빌드 위에서 시작하도록 먼저 처리한다.

## 수용 기준

### 빌드

- [x] foundation과 desktop의 JS·d.ts 빌드를 tsdown으로 바꾼다. 파일 구조를 유지하는 모드(unbundle)로 원본 파일 단위를 그대로 낸다.
- [x] d.ts는 `isolatedDeclarations` 기반(oxc)으로 만든다. TS 7.0.2에는 컴파일러 API가 없으므로 TS API에 기대는 경로를 쓰지 않는다.
- [x] desktop의 `"use client"`가 원본 파일 단위로 빌드 결과에 남는다. 지금은 해당 파일이 없으므로 확인용 파일로 대조 실험하고 결과를 Comments에 남긴다(지시어 일괄 주입은 하지 않는다. 필요한 파일에만 붙이는 spec 규칙 유지).
- [x] dependencies·peerDependencies와 그 서브패스는 번들에 넣지 않는다.
- [x] d.ts의 상대 import가 소비자에서 해석된다. tsdown 출력으로 충분하면 d.ts 후처리 스크립트를 지운다.
- [x] Vite 라이브러리 빌드 설정을 지운다(Vite는 테스트·Storybook에서 계속 쓴다).
- [x] foundation의 CSS·tailwind-merge 생성 스크립트는 그대로 둔다(tsdown 뒤에 실행).
- [x] exports는 지금처럼 손으로 관리한다(desktop의 개발용 조건 `@tide-tds/source`와 `publishConfig.exports` 유지). tsdown의 exports 자동 생성을 쓸지는 판단해 근거를 남긴다.
- [x] tsdown은 0.x이므로 catalog에서 정확한 버전으로 고정한다. `minimumReleaseAge` strict 정책을 지킨다.

### 검증

- [x] foundation·desktop `unit`, desktop `browser`, docs `storybook`, `smoke`(publint `--strict`, `next build`, tsc bundler·nodenext, CSS `@source`)가 모두 통과한다.
- [x] 빌드 결과의 파일 목록과 d.ts가 전환 전과 공개 표면상 같음을 비교해 Comments에 남긴다.

### 기록

- [x] spec의 「저장소와 패키지」「`@tide-tds/foundation`」「`@tide-tds/desktop` 공통 API」「`@tide-tds/icons`」의 빌드 문장을 고친다.
- [x] tide-v0 티켓 16 `## Comments`에 정정 한 줄(날짜, 사용자 결정, 이 티켓 링크)을 남긴다. ADR이 필요한지 CLAUDE.md 기준(되돌리기 어려움, 놀라움, trade-off)으로 판단하고 근거를 남긴다.
- [x] 티켓 02 Comments의 d.ts 후처리 기록과 08·11 티켓 본문에 빌드 도구 언급이 있으면 맞춘다.
- [x] tsdown API는 설치 버전 문서(context7 `/rolldown/tsdown`)로 확인하고 근거 버전을 남긴다.

## Comments

- 2026-11-10 발행. 사전 확인(context7 `/rolldown/tsdown/v0.23.0`): `unbundle: true`로 디렉터리 구조 유지, `isolatedDeclarations`가 켜져 있으면 oxc-transform으로 d.ts 생성(`dts.oxc`). npm 최신 tsdown 0.23.7(2026-11-06), peer `typescript ^5 || ^6 || ^7`. `"use client"` 보존은 아직 확인하지 않았다.
- 2026-11-10 완료(브랜치 `ticket/36-tsdown-build`).
  - **버전**: tsdown 0.23.7(2026-11-06 배포, rolldown 1.3.0, rolldown-plugin-dts 0.30.0). catalog에 정확한 버전으로 고정했고 `minimumReleaseAge` strict 정책은 그대로다(예외 없음). install 때 pnpm이 「Agent skills awaiting approval: tsdown」을 알리지만 승인하지 않았다(빌드와 무관).
  - **API 근거**: context7 `/rolldown/tsdown/v0.23.0`(unbundle, deps 기본값, `fixedExtension`, exports 옵션)과 설치본 0.23.7 타입 선언(`dist/types-*.d.mts`의 `UserConfig`, rolldown-plugin-dts 0.30.0 `Options`). 설치본과 문서가 다른 점: 0.23.0 문서의 `dts: { oxc: true }`는 rolldown-plugin-dts 0.30.0에서 `oxc`가 옵션 객체로 바뀌었고, 생성기는 `dts.generator: "oxc"`로 고른다(생략해도 `isolatedDeclarations`면 oxc). 명시적으로 `generator: "oxc"`를 썼다. `"use client"` 보존은 문서에서 찾지 못해 아래 실험으로 확인했다.
  - **설정**(`packages/{foundation,desktop}/tsdown.config.ts`): `entry: src/index.ts`, `unbundle: true`, `format: esm`, `platform: neutral` + `fixedExtension: false`(기본 `node`면 `.mjs`가 된다. type module이라 `.js`), `target: es2024`(tsconfig와 같음), `minify: false`, `tsconfig: tsconfig.build.json`(isolatedDeclarations 켜짐), `dts.generator: oxc`, `exports: false`. 설정 파일은 Node 26 type stripping으로 그대로 읽혔다(configLoader 기본값). `tsconfig.build.json`에서 `tsc` 출력용 옵션(`rootDir`, `outDir`, `emitDeclarationOnly`)은 지웠다.
  - **external**: 별도 설정 없이 tsdown 0.23 기본값(dependencies·peerDependencies·optionalDependencies 외부화)으로 `@tide-tds/foundation/tailwind-merge`, `clsx`, `tailwind-merge`, `react/jsx-runtime`이 import로 남았다(빌드 결과 확인). foundation의 `tailwind-merge`는 devDependency이자 optional peer라 external이다.
  - **`"use client"` 대조 실험**: 확인용 `src/ClientProbe.tsx`(첫 줄 `"use client"`, `useState` 사용)를 index에서 export하고 smoke 템플릿 서버 컴포넌트 page에서 렌더했다. ① 지시어 있음: `dist/ClientProbe.js` 첫 줄에만 `"use client"`가 남고 `index.js`·`cn.js`·`VisuallyHidden.js`에는 없다. smoke 전체(`next build` prerender 포함) 통과. ② 지시어 없음: `next build`가 `TypeError: (0 , au.useState) is not a function`로 실패. 그래서 지시어가 파일 단위 경계로 동작한다. Rolldown이 `MODULE_LEVEL_DIRECTIVE`(번들링 시 의미가 보존되지 않을 수 있음) 경고를 내므로 desktop에서 `suppressWarnings: /MODULE_LEVEL_DIRECTIVE.*"use client"/`로 이 경고만 껐다(경계는 smoke가 검사). 확인용 파일과 템플릿 변경은 되돌렸다. 지시어 일괄 주입(`banner`)은 쓰지 않는다.
  - **d.ts 후처리 삭제**: tsdown d.ts의 상대 import가 처음부터 `./cn.js`라 `scripts/rewrite-dts-imports.ts`를 지웠다. smoke의 `tsc`(bundler, nodenext. nodenext 쪽은 `skipLibCheck` 없음)가 통과한다.
  - **공개 표면 비교**(전환 전 `main` 빌드와 diff): 파일 목록은 두 패키지 모두 같다(foundation 12개: `index`·`color`·`semantic`·`contrast`의 js/d.ts, `tailwind-merge.js`/`.d.ts`, `tokens.css`, `tailwind.css`. desktop 7개: `index`·`cn`·`VisuallyHidden`의 js/d.ts, `styles.css`). CSS와 tailwind-merge 파일은 바이트 단위로 같다. d.ts는 export 이름, 값/타입 구분, 타입 본문이 같다. 차이는 서식(들여쓰기, 줄바꿈)과 표기뿐이다: `index.d.ts`가 `export { … } from`에서 `import` 뒤 `export { type …, … }`로, 다른 파일의 `import type { X }`가 `import { X }`가 됐다(d.ts 안이라 런타임 영향 없음). JS는 export 이름이 같고, 원본 주석 일부와 `isolatedDeclarations`용 모양 검사 문장(`semantic;`)이 빠졌다.
  - **exports 자동 생성 판단**: 쓰지 않는다(`exports: false`). desktop은 개발용 조건 `@tide-tds/source`와 `publishConfig.exports`를 함께 두고, foundation은 생성 스크립트가 만드는 CSS·`tailwind-merge` 서브패스를 export한다. tsdown `exports`는 entry와 출력 파일에서 만들고 `devExports`로 조건 하나를 넣을 수 있지만, 빌드가 `package.json`을 고쳐 쓰게 되고 tsdown 밖에서 생긴 파일은 `customExports`로 따로 적어야 한다. 손으로 쓰는 것보다 줄어드는 것이 없다.
  - **ADR 판단**: 만들지 않는다. 되돌리기 어렵지 않다(패키지별 설정 파일 하나와 build 스크립트 한 줄, 소비자가 받는 결과물은 공개 표면상 같음). 앱 개발자에게 놀라움이 없다. trade-off는 0.x 도구 의존 하나뿐이고 catalog 고정으로 다룬다. 결정은 spec과 tide-v0 티켓 16 정정, 이 티켓에 남겼다. ADR 0007의 `preserveModules`는 「파일 단위로 나뉘어야 한다」는 요구를 설명하는 말이라 `unbundle`로 그대로 충족한다(충돌 없음, 고치지 않음).
  - **기록**: spec 「저장소와 패키지」(빌드 도구 한 줄, 0.x 고정 목록에 publint·tsdown), 「`@tide-tds/foundation`」, 「`@tide-tds/icons`」, 「`@tide-tds/desktop` 공통 API」의 빌드 문장을 고쳤다. tide-v0 티켓 16 Comments에 정정 한 줄, 티켓 02 Comments의 d.ts 후처리 기록에 정정, 티켓 08 빌드 기준을 tsdown으로 맞췄다. 티켓 11에는 빌드 도구 언급이 없다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `pnpm turbo run typecheck test build smoke --force`(12개 태스크) 통과. foundation unit 5 tests, desktop 7 tests(unit + browser 2 instance), docs storybook 4 stories, smoke(publint `--strict`, `next build`, tsc bundler·nodenext, CSS `@source`) 통과.
