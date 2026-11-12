# 01: 스케일 값 교체와 장식 계열 purple·mint 추가

Status: ready-for-agent
Blocked by: —

## What to build

`packages/foundation/src/color.ts`의 Primitive 스케일을 ADR 0022의 값으로 바꾸고, 장식 계열 `purple`·`mint`를 더한다. 슬롯 규칙(`color-slot.ts`)은 이 티켓에서 바꾸지 않는다(02).

- 값: [02 결정의 스케일 값 표](../../tide-color-tone/issues/02-grilling-scale-values.md#스케일-값)(blue·green·amber·red·cyan의 50·100·200·300·600·700·800·900·950), amber 400 `#ca9734`, [05 결정의 purple·mint 표](../../tide-color-tone/issues/05-grilling-purple-family.md#answer). 400·500과 gray는 그대로다(amber 400 제외). blue-500 `#3183f5`(앵커)는 바꾸지 않는다.
- `color.ts` 머리 주석의 「초안은 OKLCH L 계단」 설명 옆에 ADR 0022 링크와 「50~300·950은 계열마다 손으로 맞춘 값」을 적는다.
- purple·mint는 색 계열(ColorFamily)이 되어 계열 변수 묶음, `[data-color]` 규칙, `ColorFamilyRegistry` 타입, Storybook 견본에 따라 붙는다(티켓 40·41의 「계열을 더하면 따라오는 것」).

## 수용 기준

- [ ] 스케일 값이 결정 표와 한 글자도 다르지 않다(테스트로 대조).
- [ ] 50 → 950으로 갈수록 OKLCH L이 줄어드는지(밝기 순서) 모든 계열에서 테스트한다.
- [ ] `purple`·`mint`가 `ColorFamilyName`에 들어가고, Badge·Tag·Avatar `color`로 쓸 수 있다. 행동·의미 Component의 `Role` 타입에는 들어가지 않는다.
- [ ] 기존 대비 쌍 검사가 그대로 통과한다. 지금 슬롯 규칙(subtle 50, text 800 등)으로도 통과해야 한다. 미달이면 멈추고 보고한다.
- [ ] CSS·Utility class 회귀 스냅숏을 갱신하고, 바뀐 값만 달라졌는지 확인한다.
- [ ] changeset(foundation minor, components minor: 색 값 변경).

## Comments
