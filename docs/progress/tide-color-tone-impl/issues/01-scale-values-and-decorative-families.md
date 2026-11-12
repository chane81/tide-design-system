# 01: 스케일 값 교체와 장식 계열 purple·mint 추가

Status: done
Blocked by: —

## What to build

`packages/foundation/src/color.ts`의 Primitive 스케일을 ADR 0022의 값으로 바꾸고, 장식 계열 `purple`·`mint`를 더한다. 슬롯 규칙(`color-slot.ts`)은 이 티켓에서 바꾸지 않는다(02).

- 값: [02 결정의 스케일 값 표](../../tide-color-tone/issues/02-grilling-scale-values.md#스케일-값)(blue·green·amber·red·cyan의 50·100·200·300·600·700·800·900·950), amber 400 `#ca9734`, [05 결정의 purple·mint 표](../../tide-color-tone/issues/05-grilling-purple-family.md#answer). 400·500과 gray는 그대로다(amber 400 제외). blue-500 `#3183f5`(앵커)는 바꾸지 않는다.
- `color.ts` 머리 주석의 「초안은 OKLCH L 계단」 설명 옆에 ADR 0022 링크와 「50~300·950은 계열마다 손으로 맞춘 값」을 적는다.
- purple·mint는 색 계열(ColorFamily)이 되어 계열 변수 묶음, `[data-color]` 규칙, `ColorFamilyRegistry` 타입, Storybook 견본에 따라 붙는다(티켓 40·41의 「계열을 더하면 따라오는 것」).

## 수용 기준

- [x] 스케일 값이 결정 표와 한 글자도 다르지 않다(테스트로 대조).
- [x] 50 → 950으로 갈수록 OKLCH L이 줄어드는지(밝기 순서) 모든 계열에서 테스트한다.
- [x] `purple`·`mint`가 `ColorFamilyName`에 들어가고, Badge·Tag·Avatar `color`로 쓸 수 있다. 행동·의미 Component의 `Role` 타입에는 들어가지 않는다.
- [x] 기존 대비 쌍 검사가 그대로 통과한다. 지금 슬롯 규칙(subtle 50, text 800 등)으로도 통과해야 한다. 미달이면 멈추고 보고한다.
- [x] CSS·Utility class 회귀 스냅숏을 갱신하고, 바뀐 값만 달라졌는지 확인한다.
- [x] changeset(foundation minor, components minor: 색 값 변경).

## Comments

### 2026-11-12 결과

- 바뀐 파일
  - foundation: `src/color.ts`(값 교체, purple·mint 추가, 머리 주석에 ADR 0022와 「50~300·950은 계열마다 손으로 맞춘 값」), `src/semantic.ts`(JSDoc 계열 수). 계열 변수 묶음, `[data-color]` 규칙, Primitive Utility class, `ColorFamily`·`ColorFamilyName` 타입은 `color`에서 자동으로 따라왔다.
  - foundation 테스트: 새 `test/scale.test.ts`(결정 표 그대로 대조, 50 → 950 OKLCH L 감소, 앵커), `tokens`·`tailwind`·`color-name`·`contrast` 테스트의 계열 목록·값, `__snapshots__/role-regression.test.ts.snap` 갱신. `Color`가 아닌 이름의 예는 `purple`에서 `violet`으로 바꿨다.
  - components: Badge·Tag·Avatar·types JSDoc(계열 8개), Badge·Tag·Avatar 테스트(purple·mint를 받음, 브라우저 계열 변수 검사에 추가), Button·IconButton·Link의 `color: "purple"` 타입 오류(장식 계열은 Role이 아님), `test/contrast.test.ts` 계열 목록.
  - 문서 앱: `ColorScale` 블록이 장식 계열도 그린다(Role 칸은 「장식」). Badge·Tag·Avatar 견본에 purple·mint를 더하고, MDX는 계열 이름 목록만 고쳤다(설명·Do/Don't는 티켓 04).
  - smoke: `nodenext.ts`의 등록하지 않은 색 이름 예를 `violet`으로.
  - changeset: `color-tone-scale-values.md`(foundation minor), `color-tone-decorative-families.md`(components minor).
- 검증: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`(foundation 484, components 1761, docs 292, icons 18), `pnpm test:scripts`(23), `pnpm build`, `pnpm smoke` 모두 통과. origin/main(a620023) 위로 rebase한 뒤 다시 돌렸다.
- 대비: 지금 슬롯 규칙(subtle 50, text 800 등)으로 Semantic 대비 쌍 90개가 light·dark 모두 통과하고, 색 이름 14개(Role 6 + 계열 8)의 계열 대비 쌍도 모두 통과한다. 가장 빠듯한 쌍은 `text-on-solid` × `bg-success-solid` 4.70:1(02 결정과 같음), 다음이 `bg-info-solid` 4.80:1이다.
- 스냅숏 diff: Role 회귀 스냅숏 두 개에서 primary·success·warning·danger·info Token의 hex와 그 대비비, blue-600을 쓰는 `outline-focus`의 light 대비비만 바뀌었다. neutral·gray·공통 Token은 그대로다.
- 라이브러리 근거: vitest 5.1.0(context7 `/vitest-dev/vitest/v5.0.3` api/test.md의 `test.each` `%s`, guide/learn/snapshots.md의 `-u`), oxlint 1.92.0, oxfmt 0.77.0, TypeScript 7.0.2. 새 API나 의존성은 쓰지 않았다.
