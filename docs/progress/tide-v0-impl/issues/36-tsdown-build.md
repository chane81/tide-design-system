# 36: 패키지 빌드를 tsdown으로 전환

Status: ready-for-agent
Blocked by: 03 (Storybook과 브라우저 테스트 골격)

## What to build

메인테이너가 배포 패키지 세 개(foundation, icons, desktop)를 같은 빌드 도구 하나(tsdown)로 빌드한다. 앱 개발자가 받는 결과물(파일 단위 ESM, d.ts, `"use client"` 경계, CSS exports)은 지금과 같다. 2026-11-10 사용자 결정으로 tide-v0 티켓 16·19의 빌드 결정(desktop은 Vite 8 라이브러리 모드 + tsc d.ts, foundation은 번들러 없이 tsc)을 바꾼다. icons(08)와 Foundation 확장(04)이 이 빌드 위에서 시작하도록 먼저 처리한다.

## 수용 기준

### 빌드

- [ ] foundation과 desktop의 JS·d.ts 빌드를 tsdown으로 바꾼다. 파일 구조를 유지하는 모드(unbundle)로 원본 파일 단위를 그대로 낸다.
- [ ] d.ts는 `isolatedDeclarations` 기반(oxc)으로 만든다. TS 7.0.2에는 컴파일러 API가 없으므로 TS API에 기대는 경로를 쓰지 않는다.
- [ ] desktop의 `"use client"`가 원본 파일 단위로 빌드 결과에 남는다. 지금은 해당 파일이 없으므로 확인용 파일로 대조 실험하고 결과를 Comments에 남긴다(지시어 일괄 주입은 하지 않는다. 필요한 파일에만 붙이는 spec 규칙 유지).
- [ ] dependencies·peerDependencies와 그 서브패스는 번들에 넣지 않는다.
- [ ] d.ts의 상대 import가 소비자에서 해석된다. tsdown 출력으로 충분하면 d.ts 후처리 스크립트를 지운다.
- [ ] Vite 라이브러리 빌드 설정을 지운다(Vite는 테스트·Storybook에서 계속 쓴다).
- [ ] foundation의 CSS·tailwind-merge 생성 스크립트는 그대로 둔다(tsdown 뒤에 실행).
- [ ] exports는 지금처럼 손으로 관리한다(desktop의 개발용 조건 `@tide-tds/source`와 `publishConfig.exports` 유지). tsdown의 exports 자동 생성을 쓸지는 판단해 근거를 남긴다.
- [ ] tsdown은 0.x이므로 catalog에서 정확한 버전으로 고정한다. `minimumReleaseAge` strict 정책을 지킨다.

### 검증

- [ ] foundation·desktop `unit`, desktop `browser`, docs `storybook`, `smoke`(publint `--strict`, `next build`, tsc bundler·nodenext, CSS `@source`)가 모두 통과한다.
- [ ] 빌드 결과의 파일 목록과 d.ts가 전환 전과 공개 표면상 같음을 비교해 Comments에 남긴다.

### 기록

- [ ] spec의 「저장소와 패키지」「`@tide-tds/foundation`」「`@tide-tds/desktop` 공통 API」「`@tide-tds/icons`」의 빌드 문장을 고친다.
- [ ] tide-v0 티켓 16 `## Comments`에 정정 한 줄(날짜, 사용자 결정, 이 티켓 링크)을 남긴다. ADR이 필요한지 CLAUDE.md 기준(되돌리기 어려움, 놀라움, trade-off)으로 판단하고 근거를 남긴다.
- [ ] 티켓 02 Comments의 d.ts 후처리 기록과 08·11 티켓 본문에 빌드 도구 언급이 있으면 맞춘다.
- [ ] tsdown API는 설치 버전 문서(context7 `/rolldown/tsdown`)로 확인하고 근거 버전을 남긴다.

## Comments

- 2026-11-10 발행. 사전 확인(context7 `/rolldown/tsdown/v0.23.0`): `unbundle: true`로 디렉터리 구조 유지, `isolatedDeclarations`가 켜져 있으면 oxc-transform으로 d.ts 생성(`dts.oxc`). npm 최신 tsdown 0.23.7(2026-11-06), peer `typescript ^5 || ^6 || ^7`. `"use client"` 보존은 아직 확인하지 않았다.
