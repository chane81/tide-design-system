# Button outline·ghost의 호버·누름을 같은 색 파스텔로 채운다

근거 원칙: ② 명확함이 화려함보다 우선한다, ① 접근성이 미려함보다 우선한다

[ADR 0022](0022-pastel-intensity-and-overlay-states.md) §3은 Button·IconButton `outline`·`ghost`의 호버·누름을 색 없이 덮었다(`bg-hover`·`bg-active`). 화면에서 보니 danger outline에 회색이 깔려 버튼 색과 따로 놀았다. 사용자는 각 색에 맞는 채움을 원했고, 진한 `subtle`은 너무 진하다며 Badge `faint` 바탕 정도를 골랐다(2026-11-13, 사용자 결정).

ADR 0022 당시에는 `text × subtle-hover·subtle-active`가 4.5:1에 못 미쳐 색 채움을 쓸 수 없었다. 이번에 고른 단계(`faint`·`subtle`)는 그보다 연해서 모든 Role이 4.5:1 이상이다.

## 결정

| 상태 | Role(primary, success, warning, danger, info, 앱 Role) | neutral                  |
| ---- | ------------------------------------------------------ | ------------------------ |
| 기본 | 투명                                                   | 투명                     |
| 호버 | `faint`(가장 연한 파스텔)                              | `bg-hover`(색 없이 덮기) |
| 누름 | `subtle`                                               | `bg-active`              |

- 글자 색은 그대로 `text`다. 대비(최저): `text × faint` light 5.43 · dark 6.84, `text × subtle` light 5.16 · dark 5.79. 둘 다 정지 상태 등급인 4.5:1로 등록한다(`faint`·`subtle` 위 글자는 4.5라는 규칙을 그대로 둔다).
- **neutral은 색 없이 덮는 방식을 유지한다.** dark에서 `bg-neutral-subtle`이 raised 표면(Dialog, Toast)과 같은 색이라 neutral에 같은 규칙을 쓰면 그 안 닫기 버튼의 누름이 보이지 않는다. 회색 덮기가 곧 neutral의 색이기도 하다.
- 구현은 변수 두 개(`--pressable-hover`, `--pressable-active`)로 한다. 기본은 accent `faint`·`subtle`이고 `data-color="neutral"`일 때만 `bg-hover`·`bg-active`로 바꾼다. hover·누름 class는 하나라서 Alert·Tag 닫기 버튼처럼 Component가 `hover:`·`active:` class로 덮어쓰면 그대로 바뀐다.
- 대비 쌍: `text-<role> × bg-<role>-faint`(4.5)를 더하고, 아무도 쓰지 않게 된 `text-<role> × bg-hover·bg-active`를 지운다. 앱 계열 규칙(`tide-color build`)도 `text × bg-hover·bg-active`(4) 대신 `text × faint`(4.5)를 검사한다.
- 목록 항목, Table 행, Accordion 트리거는 그대로 색 없이 덮는다(ADR 0022 §3).

## 결과

- 불투명 배경이라 raised 표면 안에서도 Role 색 outline·ghost의 대비가 같다. ADR 0022·0023이 남긴 「raised 안 outline·ghost는 `neutral`로」 안내를 지운다.
- `subtle` 바탕(Alert 등) 안의 ghost는 그대로 두면 호버 배경(`faint`)이 바탕보다 연하다. 지금처럼 `subtle-hover`·`subtle-active`로 덮어쓴다(Button 문서 「앱이 할 일」).
- 앱 계열의 `faint`가 `text`와 4.5:1이 안 되면 `tide-color build`가 실패한다. 이전 규칙(`bg-hover` 4:1)보다 엄하다.
