# 02: 슬롯 규칙 확장: 새 슬롯 셋, 덮기·섞기, `bg-hover`·`bg-active`

Status: ready-for-agent
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

- [ ] 새 슬롯 셋과 `bg-hover`·`bg-active`가 Token 원본, CSS 변수, Utility class, tailwind-merge, 자동완성 타입에 모두 있다.
- [ ] 덮기·섞기 계산 결과가 결정 표의 참고 값과 같다(02 결정 「계산된 호버·클릭 값」 표, ±1 hex 반올림 허용 여부는 테스트에 명시).
- [ ] 대비 쌍이 light·dark에서 모두 통과한다. 미달이면 멈추고 보고한다.
- [ ] `defineColorFamily` + `tide-color build` 결과에 새 슬롯이 있고, 앱 계열 대비 검사도 새 쌍으로 돈다.
- [ ] 기존 Utility class 이름은 바뀌지 않는다(값만 바뀐다).
- [ ] 회귀 스냅숏 갱신. changeset(foundation minor).

## Comments
