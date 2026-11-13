# 01: foundation·icons 주석 정리

Status: done
Blocked by: 코드 스타일 02 ([code-style/issues/02](../../code-style/issues/02-extensionless-imports.md))

## What to build

`packages/foundation`, `packages/icons`(`src`, `scripts`, `test`, `tsdown.config.ts`·`vitest.config.ts` 등 설정)의 주석을 [주석 규칙](../../../../.claude/rules/code-comments.md)대로 정리한다. 코드는 바꾸지 않는다.

## 할 일

- `semantic.ts`, `contrast.ts`, `scripts/build.ts`가 주석이 가장 많다. Token 값 옆의 결정 근거는 ADR(0022·0023 등)에 있는지 확인하고 번호만 남긴다.
- 공개 export(`index.ts`·`internal.ts`·`colorFamily.ts`가 내보내는 것)의 JSDoc은 다듬기만 한다.
- icons 생성 코드(`src/generated`)는 생성 스크립트가 만드는 주석이므로, 바꾸려면 스크립트 쪽을 고친다.

## 수용 기준

- [x] 범위 안 주석이 규칙의 「남긴다」에 해당하는 것만 1~2줄로 남았다.
- [x] 정리 전후 주석 줄 수를 티켓 Comments에 적었다.
- [x] 공통 수용 기준(README)을 통과한다.

## Comments

- 주석 줄 수(범위: `packages/foundation`, `packages/icons`의 추적되는 `.ts`·`.tsx`, 줄 머리가 `//`·`/*`·`*`인 줄): 정리 전 795줄 → 정리 후 539줄. 3줄 이상 이어지는 `//` 블록은 0곳이다. 남은 줄 대부분은 공개·internal export의 한두 줄 JSDoc과 `@internal` 표시다.
- 판단: `@internal` 줄 38곳의 「앱 개발자용 공개 계약이 아니다」를 지우고 「`@tide-design/foundation/internal` 전용(문서 앱·빌드 스크립트·테스트용)」만 남겼다. `internal.ts`의 `@packageDocumentation` 고지는 그대로다.
- 판단: `semantic.ts`·`contrast.ts`·`colorSlot.ts`·`color.ts`의 결정 근거(neutral 덮어쓰기, `text-muted` gray-700, raised border, shadow alpha, 대비 등급, 슬롯 값 표, 600 단계 조정)는 ADR 0011·0022·0023·0025와 tide-v0 티켓 20·24에 있어 번호만 남기거나 지웠다. 대비 쌍마다 붙은 「어느 Component가 쓰는지」 목록은 쌍이 왜 있는지 알 수 있는 한 줄로 줄였다.
- 판단: `scripts/build.ts`의 Tailwind 기본값 제거 설명 블록(20줄)은 tide-v0 spec과 tide-v0-impl 티켓 05·06·07에 있다. 고치면 깨지는 함정(`--font-*: initial`이 굵기를 남김, 그림자 기본값 색, `--default-transition-*`, focus-field 투명 outline 번쩍임, 요소 단위 data-theme 재선언)만 해당 줄 위 한 줄로 옮겼다.
- 판단: 공개 Token JSDoc(`radius`·`shadow`·`duration`·`easing`·`zIndex`·`fontFamily`)의 단계별 쓰임 목록은 문서 앱 Foundations MDX(Shape·Motion·Stacking·Typography)에 있어 지웠다. `RoleRegistry`·`ColorFamilyRegistry`·`defineColorFamily`의 augmentation 예시 코드 블록은 IDE 툴팁에서 쓰는 법을 보여 주므로 남겼다.
- 판단: icons `src/generated`의 생성 주석(「생성 파일. 고치지 말고 이름표를 고친다」)은 이미 한 줄이라 `scripts/generate.ts`의 템플릿은 바꾸지 않았다. 재생성 결과 변화 없음.
- 판단: 테스트 이름(`it("…(티켓 40)")`)의 티켓 번호는 문자열이라 코드 변경이 되므로 두었다.
- 보류(결정 근거인데 ADR·티켓에 없음): 0건.
- 검증: 바뀐 파일마다 주석·빈 줄을 뺀 코드 줄을 HEAD와 비교해 차이 0. `pnpm build`, `typecheck`, `test`, `lint`, `format:check`, `smoke`, `test:scripts` 통과.
