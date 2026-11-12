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
- **Switch 꺼짐 누름 thumb**: 꺼짐 상태에서 누르면 thumb(`text-accent`)이 `subtle-active` 위에 놓인다. 이 쌍은 02에서 지웠다. thumb은 글자가 아닌 UI 요소라 3:1이 기준이고, 실제 값은 최저 4.31:1(info dark)이라 통과한다. 주석만 고쳤다. 등록 쌍(3:1 UI 쌍)을 더할지 정해야 한다.
- **Alert 닫기 버튼 덮어쓰기**: ghost의 기본(text-accent, bg-hover)을 Alert 안에서만 `text-accent-on-subtle` + `subtle-hover`·`subtle-active`로 덮어썼다. 다른 subtle 표면 안에 ghost 버튼을 두는 앱도 같은 문제를 겪는다. 문서(04)에 「subtle 표면 안 버튼」 안내가 필요할 수 있다.
- **Toast.mdx 한 문장**: 「닫기·액션 버튼 색이 바뀐다」가 사실과 달라져 한 문장만 고쳤다. 설명 전체는 04에서 다시 본다.

## 티켓 01에서 넘어온 항목

- MDX(Avatar·Badge·Tag·Color)는 계열 목록과 개수만 고쳤다. 설명과 Do/Don't는 티켓 04에서 고친다.
- JSDoc의 「색 계열 6개」를 「8개」로 고쳤다. 다른 곳에 남은 표현이 없는지 04에서 다시 본다.
- 문서 앱은 changeset이 없다. ADR 0021에 따라 Storybook 버전은 TDS를 따라 오른다.
