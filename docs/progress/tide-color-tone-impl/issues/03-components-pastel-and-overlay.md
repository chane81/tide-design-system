# 03: Component 반영: 파스텔 글자·테두리, Badge faint, 무채색 호버

Status: done
Blocked by: 02

## What to build

ADR 0022 §1·§3의 Component 범위를 반영한다.

| Component                                                          | 바꿀 것                                                                                                                                                         |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Badge                                                              | subtle: 글자 `text-accent` → `text-accent-on-subtle`, 테두리 `border-accent-subtle`. 새 `variant="faint"`(`bg-accent-faint text-accent-on-subtle`, 테두리 없음) |
| Tag                                                                | 글자 `text-accent-on-subtle`, 투명 테두리 → `border-accent-subtle`                                                                                              |
| Avatar                                                             | fallback 글자 `text-accent-on-subtle`                                                                                                                           |
| Alert(Toast 포함)                                                  | 글자·아이콘 `text-accent-on-subtle`, 테두리 `border-accent` → `border-accent-subtle`                                                                            |
| Button·IconButton subtle                                           | 글자 `text-accent-on-subtle`                                                                                                                                    |
| Button·IconButton outline·ghost                                    | 호버·클릭 바탕 `bg-accent-subtle-hover`·`-active` → `bg-hover`·`bg-active`. 글자는 `text-accent` 그대로                                                         |
| 목록 항목 호버(Menu·Select·Combobox 항목, Table 행, Pagination 등) | 지금 `bg-neutral-subtle-hover`·`-active`로 칠하는 호버·클릭을 `bg-hover`·`bg-active`로. highlight·선택 유지처럼 상태를 나타내는 바탕은 그대로 둔다              |

- 각 파일의 대비 주석(예: Badge.tsx의 「text-accent × bg-accent-subtle 4.5:1」)을 새 쌍으로 고친다.
- Tag의 지우기 버튼 호버 변수(`--tag-remove-hover`)는 subtle-hover 값을 그대로 쓴다(덮기로 계산된 값).

## 수용 기준

- [x] 위 표의 Component가 새 Utility class를 쓰고, 기존 테스트의 class 단언을 고친다.
- [x] Badge `variant` 타입에 `faint`가 들어간다(`FillVariant`에 더할지, Badge 전용으로 둘지는 ADR 0005·기존 타입을 보고 정하고 Comments에 근거를 적는다).
- [x] 브라우저 테스트로 light·dark 각각 Badge subtle·faint, Alert, Button outline 호버의 계산된 색이 Token 값과 같은지 확인한다.
- [x] Windows 고대비(forced-colors)에서 테두리·호버가 사라져도 뜻이 남는지 기존 검사(티켓 42)를 다시 돈다.
- [x] changeset(components minor).

## Comments

### 2026-11-12 결과

- **02와 한 PR로 머지(사용자 결정, 2026-11-12).** 02가 지운 `text × subtle-hover·subtle-active` 쌍을 Component가 더 쓰지 않게 옮겼다.
- **Toast 닫기·액션 버튼은 neutral(사용자 결정, 2026-11-12).** raised 표면(dark gray-900) 위에 `bg-hover`·`bg-active`를 덮으면 Role 색 글자(text, dark 300)가 4.5:1에 못 미친다. 상태 아이콘은 Role 색(`text-accent`, × bg-raised 통과)을 유지하고, ADR 값은 바꾸지 않았다.

  | 글자         | dark, bg-raised 위 hover / active | dark, bg-canvas 위 hover / active |
  | ------------ | --------------------------------- | --------------------------------- |
  | text-default | 7.79 / 6.85                       | 11.10 / 9.66                      |
  | text-primary | 4.56 / **4.01**                   | 6.50 / 5.66                       |
  | text-success | 4.67 / **4.10**                   | 6.65 / 5.79                       |
  | text-warning | 4.54 / **3.99**                   | 6.48 / 5.64                       |
  | text-danger  | **4.42** / **3.89**               | 6.30 / 5.49                       |
  | text-info    | 4.61 / **4.05**                   | 6.57 / 5.72                       |

  light는 raised도 흰색이라 모두 통과한다(최저 5.15).

- **Badge `faint`는 Badge 전용 타입이다.** `FillVariant`는 Button류의 채움 방식 값 집합(ADR 0005 정정, GLOSSARY 「채움 방식」)이고, `faint`는 ADR 0022 §1에서 Badge에만 쓰는 강도라 `type BadgeVariant = Extract<FillVariant, "subtle" | "solid"> | "faint"`로 두었다.
- 바뀐 Component
  - Badge: subtle `border-accent-subtle bg-accent-subtle text-accent-on-subtle`, 새 `faint`(`bg-accent-faint text-accent-on-subtle`, 투명 테두리).
  - Tag: `text-accent-on-subtle`, `border-accent-subtle`. 지우기 버튼 hover·누름은 `subtle-hover`·`subtle-active` 그대로(덮기로 계산된 값).
  - Avatar: fallback `text-accent-on-subtle`.
  - Alert: `border-accent-subtle bg-accent-subtle text-accent-on-subtle`. 닫기 버튼은 `text-accent-on-subtle` + `hover:bg-accent-subtle-hover active:bg-accent-subtle-active`로 덮어쓴다(ghost 기본 bg-hover를 subtle 위에 얹으면 text × subtle-active 미달과 같은 값이 된다).
  - Toast: 닫기(ghost)·액션(outline) 버튼 `color="neutral"`, 상태 아이콘 `text-accent` 유지.
  - Button·IconButton(pressable): subtle 글자 `text-accent-on-subtle`, outline·ghost hover·누름 `bg-hover`·`bg-active`. Pagination(현재 페이지 subtle, 번호 ghost)이 따라온다.
  - 목록 항목 hover: Menu·Select·Combobox 항목(list-style), Table 행, Accordion 트리거가 `bg-hover`. 고른 옵션의 선택 유지(`bg-neutral-subtle-active`)와 highlight는 그대로다.
  - Switch: 코드는 그대로, 주석만 고쳤다(꺼짐 누름 thumb은 UI 요소라 3:1 기준, 최저 4.31:1).
- foundation: `text-default × bg-hover·bg-active`를 `bg-raised` 위 합성으로도 등록했다(목록 오버레이 항목, Toast 버튼). 대비 쌍 중복 검사 키에 표면을 넣었다. 회귀 스냅숏에 두 줄이 더해졌다(light 9.42 / 8.70, dark 7.79 / 6.85).
- 테스트: components 대비 쌍 등록 검사를 새 쌍으로 고쳤다(on-subtle, bg-hover·bg-active의 표면, Button·IconButton 채움 방식 절 추가, raised 위 Role 글자 × bg-active는 등록하지 않음을 확인). 브라우저 테스트로 light·dark Badge subtle·faint(Role 6개), Alert(Role 6개, 닫기 버튼 hover), Button outline·ghost hover의 계산된 색이 Token 값과 같은지 본다. forced-colors instance(티켓 42)도 함께 돌아 통과했다.
- 문서 앱: Badge 스토리 견본·argTypes에 `faint`를 더하고, Toast.mdx의 「닫기·액션 버튼 색이 바뀐다」 한 문장을 사실에 맞게 고쳤다. 설명·Do/Don't는 티켓 04다.
- 대비: Semantic 쌍 109개 × light·dark, 색 이름 14개의 계열 규칙 448건 모두 통과. 가장 빠듯한 쌍은 `text-on-solid` × `bg-success-solid` 4.70:1이다.
- changeset: `color-tone-components-pastel.md`(components minor).
- 라이브러리 근거: tailwind-merge 3.7.0(context7 `/dcastil/tailwind-merge/tailwind-merge_3.7.0` docs/features.md 「Last conflicting class wins」·「Supports modifiers」: 같은 group·같은 modifier면 뒤 class가 이긴다. Alert 닫기 버튼 덮어쓰기의 근거), vitest 5.1.0, TypeScript 7.0.2, oxfmt 0.77.0. 새 의존성 없음.
- 판단 보류는 [review-backlog.md](../review-backlog.md).
