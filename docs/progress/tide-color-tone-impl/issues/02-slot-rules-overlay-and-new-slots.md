# 02: 슬롯 규칙 확장: 새 슬롯 셋, 덮기·섞기, `bg-hover`·`bg-active`

Status: done
Blocked by: 01

## What to build

ADR 0022 §1~§3을 foundation에 구현한다.

- **새 슬롯**: `colorSlots`에 `faint`, `on-subtle`, `subtle-border`를 더한다. accent 변수(`--tide-accent-faint` 등), 색 계열 변수, `[data-color]` 규칙, `defineColorFamily`의 덮어쓸 값이 따라온다. accent Utility class는 `bg-accent-faint`, `text-accent-on-subtle`, `border-accent-subtle`(슬롯 `subtle-border`)다.
- **슬롯 규칙 형태**: `SlotRule`이 단계 하나뿐 아니라 「단계 + 색 n% 덮기」와 「두 단계 섞기」를 표현하게 한다. light·dark 매핑은 ADR 0022 §2 표 그대로다. 덮은·섞은 값은 빌드할 때 hex로 계산해 Token·CSS에 넣는다(런타임 `color-mix()`를 쓰지 않는다. 대비 검사와 같은 값이어야 한다).
- **light `text` 800 → 700, dark `text` 200 → 300.**
- **Role Token**: Role마다 `bg-<role>-faint`, `text-<role>-on-subtle`, `border-<role>-subtle`. neutral의 `on-subtle`은 `text-default`를 공유한다(`roleSharedSlots`). neutral(gray)의 다른 새 슬롯도 같은 규칙을 따른다. gray 스케일은 그대로다.
- **공통 Token**: `bg-hover`(light gray-950 α 0.04, dark white α 0.06), `bg-active`(light gray-950 α 0.08, dark white α 0.10). 기존 `bg-overlay`처럼 `{ primitive, alpha }` 형태를 쓴다.
- **대비 쌍**(`contrast.ts`): `on-subtle` × `faint`·`subtle`·`subtle-hover`·`subtle-active`(4.5), `text` × `bg-hover`·`bg-active`를 흰 표면에 얹은 값(4.5, light·dark). `subtle-border`는 꾸밈이라 제외 사유를 등록한다. 기존 쌍 가운데 `text` × `subtle` 3단계는 `text`가 더 이상 subtle 위에 쓰이지 않으므로 지운다. 앱 계열 검사(`checkColorFamily`)도 같은 규칙을 쓴다.
- **tailwind-merge**: 새 Utility class를 등록한다.
- **`tide-color` CLI**: 새 슬롯이 `[data-color]` CSS에 나오는지 확인한다.

## 수용 기준

- [x] 새 슬롯 셋과 `bg-hover`·`bg-active`가 Token 원본, CSS 변수, Utility class, tailwind-merge, 자동완성 타입에 모두 있다.
- [x] 덮기·섞기 계산 결과가 결정 표의 참고 값과 같다(02 결정 「계산된 호버·클릭 값」 표, ±1 hex 반올림 허용 여부는 테스트에 명시).
- [x] 대비 쌍이 light·dark에서 모두 통과한다. 미달이면 멈추고 보고한다.
- [x] `defineColorFamily` + `tide-color build` 결과에 새 슬롯이 있고, 앱 계열 대비 검사도 새 쌍으로 돈다.
- [x] 기존 Utility class 이름은 바뀌지 않는다(값만 바뀐다).
- [x] 회귀 스냅숏 갱신. changeset(foundation minor).

## Comments

### 2026-11-12 멈춤(커밋 전)

- foundation 구현(새 슬롯 셋, 덮기·섞기 SlotRule, text 700·300, Role·공통 Token, 대비 쌍, accent·tailwind-merge 키, CLI)과 테스트를 마쳤다. 덮기 값은 결정 표와 ±0으로 같다.
- `text × subtle-hover·subtle-active` 쌍을 지우면 components 등록 검사 19개가 실패한다. 남기면 4.31~4.49:1로 미달인 조합이 일곱 개다. 규칙에 따라 멈추고 [review-backlog.md](../review-backlog.md)에 적었다. 사용자 판단을 기다린다.

### 2026-11-12 결과

- **03과 한 PR로 머지(사용자 결정, 2026-11-12).** 02만으로는 Component(Alert 닫기·Toast 버튼 호버, Tag, Pagination 현재 페이지)가 지운 쌍을 계속 그린다. components 대비 쌍 등록 검사는 03에서 맞춘다. 02 커밋 시점에 검사가 실패하는 것은 허용했다.
- 원문과 다르게 한 것
  - `text × subtle`(기본 단계)은 남겼다. Progress 트랙, Pagination 현재 페이지, Menu·Select highlight가 03 이후에도 쓰고, 모든 계열에서 통과한다(최저 5.16:1). `subtle-hover`·`subtle-active` 위 text 쌍만 지웠다(4.31~4.49:1로 미달인 조합이 있었다).
  - Alert 경계 3:1 쌍(`border-<role>`·`border-strong` × 같은 Role subtle)을 ADR 0022 §1에 따라 지웠다. 남기면 `border-strong × bg-neutral-subtle` light가 2.96:1이다(neutral light subtle이 gray-100이 됨).
- 바뀐 파일
  - foundation: `color-slot.ts`(슬롯 12개, `SlotValue` = 단계·덮기·섞기, `mixHex`, `slotValueHex`), `semantic.ts`(`MixedColor`, Role Token 셋, `bg-hover`·`bg-active`), `color-name.ts`, `color-css.ts`(덮기·섞기는 hex, accent Utility class 셋 추가), `color-family.ts`(덮어쓸 값 검증), `contrast.ts`(`surface` 합성, `contrastPairRatio`, `opaqueSemanticHex`), `internal.ts`, `index.ts`, `scripts/build.ts` 주석.
  - foundation 테스트: 새 `overlay-values.test.ts`(결정 표 「계산된 호버·클릭 값」 20개와 ±0으로 대조), `tokens`·`contrast`·`color-family`(CLI 새 슬롯, 덮기 검증)·`color-name`·`exports`·`role-regression` 갱신, 스냅숏 갱신. 픽스처 `yellow-overrides`에 `text: { light: 800 }`.
  - components 테스트 값: Alert·Link·foundation-color(text 700·300, subtle 100). 문서 앱 `ContrastPairs` 블록이 반투명 배경을 표면 위에 합성해 그린다.
  - changeset: `color-tone-slot-rules.md`(foundation minor).
- 대비: Semantic 쌍 107개 × light·dark, 색 이름 14개의 계열 규칙 448건 모두 통과. 가장 빠듯한 쌍은 `text-on-solid` × `bg-success-solid` 4.70:1이다. `text × bg-hover·bg-active`는 `bg-canvas` 위 합성 값으로 검사한다.
- 검증(02 커밋 시점): lint, format:check, typecheck, build 통과. test는 foundation 537, docs 292, icons 18 통과, components 등록 검사 19개 실패(03에서 해결).
- 라이브러리 근거: tailwind-merge 3.7.0(context7 `/dcastil/tailwind-merge/tailwind-merge_3.7.0` configuration·api-reference의 `extend.classGroups` 객체 문법), vitest 5.1.0, TypeScript 7.0.2, oxfmt 0.77.0. 새 의존성 없음.
- 판단 보류는 [review-backlog.md](../review-backlog.md).
