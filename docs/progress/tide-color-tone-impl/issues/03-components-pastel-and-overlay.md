# 03: Component 반영: 파스텔 글자·테두리, Badge faint, 무채색 호버

Status: ready-for-agent
Blocked by: 02

## What to build

ADR 0022 §1·§3의 Component 범위를 반영한다.

| Component | 바꿀 것 |
| --- | --- |
| Badge | subtle: 글자 `text-accent` → `text-accent-on-subtle`, 테두리 `border-accent-subtle`. 새 `variant="faint"`(`bg-accent-faint text-accent-on-subtle`, 테두리 없음) |
| Tag | 글자 `text-accent-on-subtle`, 투명 테두리 → `border-accent-subtle` |
| Avatar | fallback 글자 `text-accent-on-subtle` |
| Alert(Toast 포함) | 글자·아이콘 `text-accent-on-subtle`, 테두리 `border-accent` → `border-accent-subtle` |
| Button·IconButton subtle | 글자 `text-accent-on-subtle` |
| Button·IconButton outline·ghost | 호버·클릭 바탕 `bg-accent-subtle-hover`·`-active` → `bg-hover`·`bg-active`. 글자는 `text-accent` 그대로 |
| 목록 항목 호버(Menu·Select·Combobox 항목, Table 행, Pagination 등) | 지금 `bg-neutral-subtle-hover`·`-active`로 칠하는 호버·클릭을 `bg-hover`·`bg-active`로. highlight·선택 유지처럼 상태를 나타내는 바탕은 그대로 둔다 |

- 각 파일의 대비 주석(예: Badge.tsx의 「text-accent × bg-accent-subtle 4.5:1」)을 새 쌍으로 고친다.
- Tag의 지우기 버튼 호버 변수(`--tag-remove-hover`)는 subtle-hover 값을 그대로 쓴다(덮기로 계산된 값).

## 수용 기준

- [ ] 위 표의 Component가 새 Utility class를 쓰고, 기존 테스트의 class 단언을 고친다.
- [ ] Badge `variant` 타입에 `faint`가 들어간다(`FillVariant`에 더할지, Badge 전용으로 둘지는 ADR 0005·기존 타입을 보고 정하고 Comments에 근거를 적는다).
- [ ] 브라우저 테스트로 light·dark 각각 Badge subtle·faint, Alert, Button outline 호버의 계산된 색이 Token 값과 같은지 확인한다.
- [ ] Windows 고대비(forced-colors)에서 테두리·호버가 사라져도 뜻이 남는지 기존 검사(티켓 42)를 다시 돈다.
- [ ] changeset(components minor).

## Comments
