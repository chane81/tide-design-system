# Tide 색감 조정 구현: 판단 보류 목록

티켓을 진행하면서 사용자 판단이 필요한 항목을 모은다. 정한 항목은 결정과 날짜를 적고 지우지 않는다.

## 티켓 02 (2026-11-12)

### 정함: text × subtle-hover·subtle-active 쌍을 지우면 Component 등록 검사가 깨진다

**결정(사용자, 2026-11-12): (a) 02와 03을 한 브랜치·한 PR로 머지한다.** 02 커밋에서는 쌍을 지운 채로 두고, 03에서 Component를 옮기며 등록 검사를 맞춘다.

티켓 02는 `text × subtle 3단계` 쌍을 지우라고 한다. 그런데 지금 Component(티켓 03 전)는 이 조합을 그린다. 새 값(text light 700, dark 300)에서는 아래 일곱 조합이 4.5:1에 못 미친다.

| 색 이름       | Theme | 쌍                   | 대비비 |
| ------------- | ----- | -------------------- | ------ |
| success·green | light | text × subtle-active | 4.47   |
| gray          | light | text × subtle-active | 4.49   |
| warning·amber | dark  | text × subtle-active | 4.41   |
| info·cyan     | dark  | text × subtle-active | 4.31   |

- 쌍을 남기면 위 조합이 미달이라 대비 검사가 실패한다(값을 바꾸지 않는다는 규칙에 따라 멈춤).
- 쌍을 지우면 components `test/contrast.test.ts`의 등록 검사 19개(Alert 닫기 ghost·Toast 버튼 hover·누름, Tag 3단계, Pagination 현재 페이지 hover·누름, Alert 경계)가 실패한다. 03이 이 Component를 `on-subtle`·`bg-hover`로 옮기기 전까지 이 조합은 기준에 못 미친 채 그려진다.
- 고를 수 있는 길: (a) 02와 03을 한 브랜치에서 함께 머지한다. (b) 02에서 쌍을 지우고 components 등록 검사도 함께 고친다. 03 머지 전까지는 기준 미달인 상태가 된다. (c) 다른 방법.
- 03 뒤에도 Pagination 현재 페이지(text-primary × primary subtle·hover·active)는 text × subtle을 쓴다. primary는 통과한다(subtle·subtle-active: light 5.42·4.68, dark 6.63·4.97). Progress 트랙과 Menu·Select highlight는 text × subtle 기본 단계를 쓴다. 그래서 02 구현은 `text × subtle`(기본 단계)을 남기고 hover·active 쌍만 지웠다. 티켓 원문(3단계 모두 지움)과 다르다.

### Alert 경계 3:1 쌍 삭제

- ADR 0022 §1을 따라 `border-<role> × bg-<role>-subtle`, `border-strong × bg-neutral-subtle` 쌍을 지웠다. 티켓 02 본문에는 없다.
- 지우지 않으면 `border-strong × bg-neutral-subtle` light가 2.96:1로 미달이다. neutral light subtle이 규칙을 따라 gray-50에서 gray-100으로 바뀌었기 때문이다. Alert(neutral)는 03 전까지 이 경계를 그린다.

### 그 밖의 항목

- **text × bg-hover·bg-active의 표면**: 티켓의 「흰 표면에 얹은 값」을 두 Theme 모두 `bg-canvas`(light white, dark gray-950)로 구현했다. dark `bg-raised`(gray-900, Menu·popover) 위에서는 역할 text × bg-hover가 4.41~4.68, × bg-active가 3.91~4.14로 미달이다. → 03에서 Toast 버튼을 neutral로 정해 해결했다(아래 티켓 03 항목).
- **neutral dark subtle 3단계**: 기존 덮어쓴 값 900 / 800 / 700을 그대로 두었다(덮기 규칙 950 + white 6%·10%로 바꾸지 않음). neutral light는 규칙을 따라 100, 100 + gray-950 4%·8%로 바뀌었다. 이제 light `bg-neutral-subtle`과 `bg-disabled`가 둘 다 gray-100(`#e8e8ea`)이다.
- **neutral·gray dark faint**: gray-950과 gray-950을 섞으면 gray-950이라 dark canvas와 같은 색이다. 테두리 없는 Badge faint(03)는 dark에서 바탕이 보이지 않는다.
- **섞기 색 공간**: 「반씩 섞기」(dark faint)는 덮기와 같은 sRGB 채널 보간으로 계산했다. 결정 표에는 참고 값이 없다.
- **테스트 픽스처**: 앱 계열 CLI 테스트용 `yellow-overrides`가 새 규칙(text 700)에서 text × bg-active light 4.24:1로 미달이라, 픽스처에 `text: { light: 800 }`를 더했다(Tide 값이 아니라 테스트 데이터).

## 티켓 03 (2026-11-12)

### 정함: Toast 닫기·액션 버튼

**결정(사용자, 2026-11-12): Toast 닫기·액션 버튼은 `color="neutral"`(글자 text-default)로 바꾼다.** 상태 아이콘은 Role 색(text-accent)을 유지하고 ADR 값은 바꾸지 않는다. 수치는 [티켓 03 Comments](issues/03-components-pastel-and-overlay.md#2026-11-12-결과)에 있다.

### 보류 항목

- **ADR 0022 §3의 4.5 보장은 canvas 기준이다.** 앱이 raised 표면(Dialog, Popover 등, dark gray-900)에 Role 색 ghost·outline 버튼을 두면 hover·누름에서 4.5:1에 못 미친다(dark 누름 3.89~4.10:1, danger hover 4.42:1). 문서(티켓 04)에 안내할지, ADR을 보강할지(예: raised 위 bg-hover·bg-active 값 따로 두기) 검토가 필요하다.
  - → 04 처리(2026-11-12): 문서 안내를 넣었다. Color.mdx 「표면에 따른 주의」, Button.mdx 「앱이 할 일」(raised 안 outline·ghost는 `color="neutral"`, IconButton도 같음). **ADR 보강 여부는 아직 정하지 않았다(보류 유지).**
  - → 티켓 46 처리(2026-11-12): ADR 0023(대비 하한 세 등급)으로 보강했다. 일시 상태 하한 4.0:1에서 hover는 모두 통과하지만 dark 누름 warning 3.99·danger 3.89가 남아 문서 안내(`neutral`)는 유지하고 문장만 사실에 맞췄다. 표는 [티켓 46](../tide-v0-impl/issues/46-contrast-tiered-minimum.md)에 있다.
- **Switch 꺼짐 누름 thumb**: 꺼짐 상태에서 누르면 thumb(`text-accent`)이 `subtle-active` 위에 놓인다. 이 쌍은 02에서 지웠다. thumb은 글자가 아닌 UI 요소라 3:1이 기준이고, 실제 값은 최저 4.31:1(info dark)이라 통과한다. 주석만 고쳤다. 등록 쌍(3:1 UI 쌍)을 더할지 정해야 한다.
  - → 티켓 46 처리(2026-11-12): `text-<role>` × `bg-<role>-subtle-active` 3:1 쌍 5개와 색 이름 규칙 `text × subtle-active` 3:1을 등록했다(neutral은 text-default × neutral subtle-active 4.5:1 쌍 안에 있다).
- **Alert 닫기 버튼 덮어쓰기**: ghost의 기본(text-accent, bg-hover)을 Alert 안에서만 `text-accent-on-subtle` + `subtle-hover`·`subtle-active`로 덮어썼다. 다른 subtle 표면 안에 ghost 버튼을 두는 앱도 같은 문제를 겪는다. 문서(04)에 「subtle 표면 안 버튼」 안내가 필요할 수 있다.
  - → 04 처리(2026-11-12): Button.mdx 「앱이 할 일」에 「subtle 배경 안 ghost는 `color`를 같은 Role로, className으로 `text-accent-on-subtle hover:bg-accent-subtle-hover active:bg-accent-subtle-active`」를 적고 Color.mdx에서 가리킨다. light·dark 모두 `bg-hover`·`bg-active`를 subtle에 덮은 값이 `subtle-hover`·`subtle-active`와 같다(덮는 색·비율이 같음).
- **Toast.mdx 한 문장**: 「닫기·액션 버튼 색이 바뀐다」가 사실과 달라져 한 문장만 고쳤다. 설명 전체는 04에서 다시 본다.
  - → 04 처리(2026-11-12): 첫 줄을 한 문장 요약으로 줄이고 위치·시간 설명을 「구조」「큐와 시간」으로 옮겼다. 상태 문단과 대비 줄(버튼 글자 text-default, 아이콘 Role 색)을 사실에 맞게 고쳤다.

## 티켓 01에서 넘어온 항목

- MDX(Avatar·Badge·Tag·Color)는 계열 목록과 개수만 고쳤다. 설명과 Do/Don't는 티켓 04에서 고친다.
  - → 04 처리(2026-11-12): Color(강도·덮기·장식 계열 Do/Don't), Badge(faint 예·Don't), Tag·Avatar(파스텔 글자 대비 줄)를 고쳤다. Tag·Avatar의 Do/Don't는 색과 무관해 그대로 두었다.
- JSDoc의 「색 계열 6개」를 「8개」로 고쳤다. 다른 곳에 남은 표현이 없는지 04에서 다시 본다.
  - → 04 확인(2026-11-12): packages·apps·GLOSSARY에 「계열 6개」 표현은 없다(`scale.test.ts`의 「Role 계열 6개」는 Role 계열이라 맞다).
- 문서 앱은 changeset이 없다. ADR 0021에 따라 Storybook 버전은 TDS를 따라 오른다.

## 티켓 04 (2026-11-12)

### 새 보류 항목

- **외부 팔레트 값이 코드에 남아 있다.** `packages/foundation/test/fixtures/brand.ts`·`yellow.ts`와 `color-family.ts` JSDoc 예(`50: "#f5f3ff"` …)가 외부 팔레트 값과 같다. 04는 코드 동작을 바꾸지 않는 문서 티켓이라 문서(BrandColor.mdx) 예시만 Tide 예시 값으로 바꿨다. 픽스처·JSDoc을 바꿀지 정해야 한다(바꾸면 CLI 테스트 기대 출력도 바뀐다).
  - → 티켓 49 처리(2026-11-13): 픽스처·JSDoc과 같은 값을 쓰던 Component 테스트·Storybook·smoke 예시를 Tide 방식 값으로 바꿨다. brand는 브랜드 색 문서 예시 스케일, yellow는 새로 계산했고 대비 미달·덮어쓰기 경로는 전과 같다. 과거 기록(티켓 13·16·17, 리서치 문서)의 인용은 남겼다([티켓 49](../tide-v0-impl/issues/49-tide-fixture-palette.md)).
- **smoke 메시지 낡음**: `apps/smoke-next/scripts/smoke.ts`의 Table 검사 실패 메시지가 옛 class `hover:bg-neutral-subtle-hover`를 적는다(검사 조건은 `:where(tbody>`라 동작은 맞다).
- **Badge JSDoc과 문서 문장**: Badge `variant` JSDoc은 「같은 화면 안에서는 한 가지로 맞춘다」인데, 문서는 「눈에 띄어야 하는 몇 개만 solid」(기존 문장)를 함께 적는다. faint 예시는 한 목록 안을 faint로 맞춰 충돌을 피했다. 규칙을 하나로 정리할지 정해야 한다.
- **Pagination 현재 페이지 쌍**: 02 기록은 현재 페이지가 `text × subtle`을 쓴다고 했지만, 03 뒤 Button subtle은 `text-accent-on-subtle`이라 현재 페이지 글자는 `text-primary-on-subtle`이다. 문서는 코드에 맞췄다. foundation `contrast.ts` 주석(「Pagination 현재 페이지가 text × subtle을 쓴다」)은 낡았을 수 있다.
  - → 티켓 46 처리(2026-11-12): 주석을 고쳤다. text × subtle은 Progress 막대 × 트랙, Menu·Select·Combobox highlight, Switch 꺼짐 hover thumb이 쓰고, Pagination 현재 페이지는 on-subtle 쌍이다.
- **neutral·gray dark faint**(티켓 02 항목)는 문서에 사실(dark에서 배경이 페이지와 같다)만 적었다. 값을 바꿀지는 그대로 보류다.

## 티켓 47 (2026-11-13)

solid 600을 덜 진하게 바꾼 [티켓 47](../tide-v0-impl/issues/47-softer-solid.md)에서 추천안대로 구현하고 남긴 항목이다.

- **`text-muted` light를 gray-700으로 옮겼다.** 새 gray-600(`#747a81`)은 흰 표면 위 4.34:1로 정지 상태 글자 4.5:1에 못 미친다. gray-700은 6.33:1이라 이전(gray-600 4.93:1)보다 진하고, `text-default`(gray-900, 10.09:1)와의 차이가 줄었다. gray만 600을 이전 값으로 두는 길(neutral solid만 진하게 남음)이나 gray에 따로 muted 단계를 두는 길(스케일 밖 값, ADR 0022 ③과 충돌)도 있다. → 정함(사용자, 2026-11-13): 유지. `text-muted` light는 gray-700 그대로 둔다(이미 구현됨)([티켓 48](../tide-v0-impl/issues/48-softer-solid-followup.md)).
- **500→600 명도 간격이 좁아졌다.** 순서(500 > 600 > 700)는 지키지만 OKLCH L 간격이 500→600 0.044~0.049, 600→700 0.085~0.089다. 500은 어느 슬롯도 쓰지 않아 화면에는 스케일 견본에서만 보인다. → 정함(사용자, 2026-11-13): 유지. blue-500은 앵커 `#3183f5`라 바꿀 수 없고 600은 사용자가 고른 값이라 간격을 맞추지 않는다([티켓 48](../tide-v0-impl/issues/48-softer-solid-followup.md)).
- **solid 위 흰 글자가 4.5:1 아래다(4.18~4.62).** ADR 0023의 4.0 등급 안이지만, red를 뺀 7개 계열은 이제 흰색보다 검정 글자 대비가 더 높다(색 스케일 타일 글자가 검정으로 바뀐다). on-solid는 흰색 그대로 두었다. → 정함(사용자, 2026-11-13): 유지. 색 버튼의 흰 글자 관례와 계열 사이 일관성을 대비 차이보다 앞에 둔다([티켓 48](../tide-v0-impl/issues/48-softer-solid-followup.md)).
- **Storybook axe 검사를 둘로 나눴다.** `*-on-solid` class와 `data-contrast-tier="4"` 요소는 4.0:1, 나머지는 4.5:1이다. hover·누름 같은 다른 4.0 등급 상태는 axe가 정지 화면만 보므로 따로 표시하지 않았다. 앱이 `on-solid` 글자를 solid가 아닌 바탕에 쓰면 axe가 4.0으로만 검사한다. → 정함(사용자, 2026-11-13): 유지. 4.0 별도 규칙은 `*-on-solid`(와 대비 견본)에만 둔다. axe는 정적 렌더 상태만 보므로 hover·누름 표시는 필요 없고, 그 이유를 접근성 기준 문서에 한 줄 남겼다([티켓 48](../tide-v0-impl/issues/48-softer-solid-followup.md)).
- **브랜드 색 문서의 예시 스케일과 권장 범위는 그대로다.** BrandColor.mdx의 600 권장(C 0.13 이하)과 예시 600(L 0.545)은 이전 Tide 600 기준이다. 앱 계열에 같은 덜 진한 solid를 권할지 정해야 한다. → 정함(사용자, 2026-11-13): 앱 계열에도 같은 덜 진한 solid를 권한다. BrandColor.mdx의 600 권장 범위를 L 0.57~0.58·C 0.12 이하·흰 글자 4:1 이상으로, 예시 600을 같은 방식으로 다시 계산한 값으로 고쳤다. CLI(`colorContrastRules`)는 이미 on-solid × solid에 4.0을 걸어 바꾸지 않았다([티켓 48](../tide-v0-impl/issues/48-softer-solid-followup.md)).
- **역사 기록의 600 값은 고치지 않았다.** tide-v0 티켓 08·09, tide-color-tone 티켓 02·05의 표는 그때의 결정이라 그대로 두고 ADR 0022 덧붙임이 새 값을 가리킨다. → 정함(사용자, 2026-11-13): 유지. 과거 티켓의 600 표는 고치지 않는다([티켓 48](../tide-v0-impl/issues/48-softer-solid-followup.md)).
