# 고른 Radio는 바탕을 채우지 않고 accent 테두리와 가운데 점으로 그린다

근거 원칙: ② 명확함이 화려함보다 우선한다, ① 접근성이 미려함보다 우선한다

Radio와 Checkbox는 같은 class 묶음(`choiceInputClass`)을 썼다. 그래서 고른 Radio는 원 전체가 accent solid로 차고 가운데 흰 점이 있어, 체크된 Checkbox와 모양이 거의 같았다. 소비 앱(tide-web)은 Radio를 「canvas 바탕 + accent 테두리 + 가운데 점」으로 앱 덮어쓰기를 했고, 사용자는 이 모양을 Tide에 넣자고 했다(2026-11-15, 사용자 결정).

같은 class 묶음 때문에 버그도 있었다. HTML은 같은 `name`의 라디오 중 고른 것이 하나도 없으면 모두 `:indeterminate`로 본다. Checkbox용 `indeterminate:bg-accent-solid` 규칙이 Radio에도 걸려, 아무것도 고르지 않은 묶음은 원이 모두 accent로 찼다.

## 결정

- **고른 원**: canvas 바탕 + 2px accent `border` 테두리 + 가운데 accent `border` 색 점. 점 지름은 원의 절반이다(`md` 20px 원에 10px, `sm` 16px 원에 8px). 원 바깥 크기는 그대로다(border-box).
- **안 고른 원**: 지금 그대로 1px `border-strong` 테두리, canvas 바탕.
- **hover·누름**: 고름과 상관없이 바탕만 accent `subtle`·`subtle-active`가 된다. 테두리·점 색은 바뀌지 않는다.
- **오류**: 테두리와 점이 모두 `border-danger`다(고른 원 테두리 2px). hover·누름 바탕도 `danger` subtle·subtle-active다. 다른 Role의 subtle 바탕 위 danger 테두리·점은 dark 누름에서 2.3~3.0:1이라, 오류 표시와 바탕을 같은 danger 계열로 맞춘다(사용자 요청, 2026-11-15). forced-colors에서는 테두리·점 `CanvasText`, 바탕 `Canvas`다. 비활성이면 비활성 모양이 이긴다. **비활성**: `border-default` 테두리, `bg-disabled` 바탕, 점 `text-disabled`.
- **포커스**: `focus-field` 그대로다([ADR 0032](0032-unified-focus-halo.md), [ADR 0034](0034-focus-ring-contrast.md)).
- **forced-colors**: 테두리·점은 `Highlight`, 바탕은 `Canvas`다.
- **class 나누기**: `choiceInputClass`에는 공통 모양(테두리, 오류, 포커스, 비활성, forced-colors)만 남긴다. 선택 상태는 Checkbox(`checkboxInputStateClass`: checked·indeterminate solid)와 Radio(`radioInputStateClass`: checked 테두리)가 각자 더한다. Radio에는 indeterminate 규칙이 없어 버그가 사라진다.
- **점은 아이콘이 아니라 `span`이다**: `size-2.5`/`size-2` + `rounded-full bg-current`라 지름이 정확하다. 채운 원 아이콘(`CircleIcon`)은 선 두께가 더해져 크기를 맞추기 어려웠다. `forced-color-adjust: none`이라 forced-colors에서도 배경색이 남는다.
- 대비 쌍: 고른 원의 테두리·점(accent `border`) × 표면은 이미 있는 쌍이 맡는다. hover·누름 바탕 위를 위해 `border-<Role> × bg-<Role>-subtle-active`(3:1) 5개를 더한다(`× bg-<Role>-subtle`은 ADR 0034가 더했다).

## 측정

테두리·점 × 바탕(primary, Token 대비). 괄호는 Tide Role 5개의 최솟값이다.

| 상태                              | light       | dark        |
| --------------------------------- | ----------- | ----------- |
| 정지(canvas)                      | 4.70 (4.20) | 5.57 (5.19) |
| hover                             | 4.00 (3.63) | 4.70 (4.19) |
| 누름                              | 3.45 (3.14) | 3.55 (3.14) |
| 오류 정지(danger × canvas)        | 4.62        | 5.19        |
| 오류 hover(× danger subtle)       | 3.89        | 4.43        |
| 오류 누름(× danger subtle-active) | 3.37        | 3.46        |

오류 쌍은 `border-danger × bg-danger-subtle(-active)`로 이미 등록되어 있다.

## 고려한 대안

- **앱 덮어쓰기처럼 점을 `radial-gradient` 배경으로 그리기:** 마크업 없이 되지만 hover 바탕색과 한 `background`에 함께 써야 해 상태마다 gradient를 다시 적어야 한다. Tide는 마크업을 고칠 수 있어 `span`이 단순하다.
- **`choiceInputClass`에 `not-[type=radio]` 같은 조건을 붙이기:** class 묶음 하나가 두 Component의 차이를 알게 된다. 쓰는 곳 가까이 둔다는 구조 규칙대로 각 Component 폴더에 둔다.
- **hover에서 테두리·점을 진하게(solid-hover):** 사용자가 고른 모양이 아니다. 바탕만 바꿔도 hover를 알아볼 수 있다.

## 결과

- 고른 Radio 모양이 바뀐다. props·class 이름(공개 계약)은 그대로이고 시각 값 조정과 버그 수정이다. 같은 PR 묶음의 changeset 관례에 맞춰 minor로 낸다.
- Checkbox 모양은 그대로다. 체크·indeterminate Checkbox는 오류여도 테두리만 danger이고 채움은 accent solid, 표시는 흰색이다. Radio와 규칙이 갈린다(다시 볼 때 맞출지 판단한다).
- **neutral Radio**: 테두리·점(`border-strong`) × `bg-neutral-subtle`(hover) 2.96 / dark 3.88, × `subtle-active`(누름) 2.57 / 2.44로 3:1에 못 미친다. 일시 상태이고 정지 상태(× canvas 3.62 / 5.60)는 통과한다. neutral 쌍은 등록하지 않았다.
- 고른 원은 테두리가 이미 accent 색이라 포커스 중 바뀌는 것은 halo뿐이다(ADR 0034 「남은 한계」).
- 소비 앱은 Radio 덮어쓰기(`[data-mark="dot"]` 선택자)를 지운다. 점이 `svg`에서 `span`으로 바뀌어 그 선택자는 그대로 맞지만 덮어쓸 필요가 없다.
