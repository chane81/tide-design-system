# 테두리 없는 요소의 포커스 표시에 2px 링을 더해 3:1을 지킨다

근거 원칙: ① 접근성이 미려함보다 우선한다, ② 명확함이 화려함보다 우선한다

[ADR 0032](0032-unified-focus-halo.md)는 포커스 표시를 요소에 붙은 3px halo 하나로 통일했다. halo는 accent `subtle-border`(light 200, dark 800단계)라 표면과 약 1.46:1(dark 1.6~1.85:1)이다. 테두리가 있는 요소는 포커스 테두리가 3:1을 맡지만, `focus-ring`을 쓰는 테두리 없는 요소(solid·subtle·ghost 버튼, 링크, 탭, Switch, Accordion, Toast, Breadcrumb, Tag)는 halo가 유일한 표시라 WCAG 1.4.11(비텍스트 대비 3:1)에 못 미쳤다. ADR 0032가 「번호가 작은 원칙을 따른다」의 예외로 남긴 부분이다.

소비 앱(tide-web)에서 앱 덮어쓰기로 시험하고 측정한 뒤, 사용자는 「바깥으로 띄운 이중 테두리(outline + offset) 말고, 포커스가 오면 테두리가 primary로 바뀌고 바깥에 옅은 halo가 도는 표현」으로 이 예외를 없애자고 했다(2026-11-15, 사용자 결정).

## 결정

- **`focus-ring`은 요소에 붙은 2px 링 + 그 바깥 3px halo다.** 링은 accent `border` 슬롯(light 600, dark 400단계, neutral은 `border-strong`)이고, halo는 그대로 accent `subtle-border`다. 둘 다 간격(offset) 없이 요소 가장자리에서 시작한다. 링이 3:1을 맡고 halo는 꾸밈이다.
- 링·halo는 Tailwind ring 합성 자리(`ring-offset` 2px = 링, `ring` = halo)에 box-shadow로 그린다. `--tide-focus-ring-width`(3px)는 halo 두께 그대로이고, 링 바깥에서 잰다(퍼짐 5px).
- **solid 바탕 요소는 안쪽에 canvas 2px 틈을 둔다.** light에서 링(600)이 solid 바탕(600)과 같은 색이라 붙어 보인다. Tailwind `inset-ring-2 inset-ring-(color:--tide-bg-canvas)`를 함께 붙여 「바탕 | canvas 틈 | 링 | halo」로 뗀다. Button·IconButton `solid`와 켜진 Switch는 Component가 붙이고, 직접 만든 요소는 쓰는 쪽이 붙인다(CSS로는 바탕이 solid인지 알 수 없다).
- 여러 줄로 나뉜 링크는 `box-decoration-break: clone`으로 줄마다 링을 닫는다.
- **`focus-field`는 그대로다.** 테두리 색이 accent `border`로 바뀌고 바깥 3px halo를 그린다. 오류 입력창은 `border-danger`·`border-danger-subtle`이다.
- **halo 색은 accent `subtle-border` 슬롯을 그대로 쓴다.** 이미 요소의 accent(`data-color`)와 Theme을 따른다. tide-web이 쓴 「accent `border` 30% 섞기」는 light에서 거의 같은 색이고(blue `#c1d4f6` vs blue-200 `#bfd8f7`), 반투명 값이라 빌드 시 hex로 계산할 수 없어 슬롯 규칙(덮기·섞기를 빌드 시 hex로 넣는다, `colorSlot.ts`)에 맞지 않는다.
- forced-colors: box-shadow가 지워지므로 ADR 0032의 forced-colors 전용 투명 outline을 그대로 둔다. `forced-color-adjust: none`인 Switch는 링·halo 변수를 `Highlight`로, canvas 틈을 `Canvas`로 바꾼다.
- **Alert 닫기 버튼의 링은 on-subtle 색이다.** subtle 바탕 위에 링이 그려지는데, neutral 링(`border-strong`)은 `bg-neutral-subtle`과 2.96:1이다. 파스텔 글자 색(on-subtle)으로 그리면 모든 Role에서 4.5:1 이상이다.
- 대비 쌍: 링이 표면 위에 그려지는 경우는 이미 있는 `border × 표면`(색 이름 규칙)·`border-<Role>`·`border-strong × 표면` 쌍이 맡는다. subtle 바탕 위 링(Alert 안의 Link 등)을 위해 `border-<Role> × bg-<Role>-subtle`(3:1) 쌍 5개를 더한다.

## 측정

Token 대비(foundation `contrastRatio`, WCAG 2.x). primary 기준이고 괄호는 Tide 계열 8개의 최솟값이다.

| 무엇                            | light       | dark        |
| ------------------------------- | ----------- | ----------- |
| 이전: halo × 표면               | 1.46        | 1.74        |
| 링 × canvas·surface             | 4.70 (4.18) | 5.57 (5.19) |
| 링 × raised                     | 4.70 (4.18) | 3.86 (3.60) |
| 링 × 같은 Role subtle 바탕      | 4.00 (3.54) | 4.70 (4.19) |
| 링 × `bg-neutral-subtle`        | 3.84        | 3.86        |
| solid: canvas 틈 × solid 바탕   | 4.70 (4.18) | 3.10 (3.10) |
| solid: 링 × solid 바탕(틈 없음) | 1.00        | 1.80        |

tide-web 대시보드(5라우트, light·dark Tab 45회)에서 같은 모양을 앱 덮어쓰기로 측정한 값도 같은 범위다(링 light 4.70, 회색 바탕 4.31, dark 5.57 이상).

## 고려한 대안

- **outline 2px(offset 0)로 링 그리기:** tide-web이 쓴 방식이다. forced-colors에서도 남는 장점이 있지만, Button은 `transition-colors`와 누름 축소 전환에 `outline-color`가 들어 있어 포커스가 올 때 링 색이 currentColor에서 전환되어 번쩍인다(ADR 0032가 평소 투명 outline을 두지 않는 이유와 같다). forced-colors는 기존 투명 outline이 맡는다.
- **outline + offset으로 띄운 이중 테두리:** 사용자가 원하지 않은 모양이다.
- **halo를 진하게(3:1 이상) 바꾸기:** halo만으로 3:1이 되려면 500단계 이상이 필요해 halo가 아니라 두꺼운 링이 된다. 요소 바깥 3px가 진한 색이 되어 옆 요소와 겹쳐 보인다.
- **canvas 틈을 utility에 넣기:** CSS로는 요소 바탕이 solid인지 알 수 없다. 모든 요소에 틈을 두면 ghost·링크에서 의미 없는 흰 선이 생긴다.
- **halo를 accent `border` 30% 섞기(런타임 `color-mix()`):** 위 「결정」의 halo 색 항목.
- **`border × subtle`을 색 이름 규칙(모든 계열·앱 계열·neutral)에 넣기:** neutral이 2.96:1로 통과하지 못한다. Tide Role 5개 쌍으로만 둔다.

## 결과

- `focus-ring`의 모양이 바뀌어(링 추가, 퍼짐 3px → 5px) 공개 계약 Utility class의 뜻이 바뀐다. 0.x 관례대로 minor(breaking)다. Token 이름·class 이름은 그대로다. solid 바탕에 `focus-ring`을 직접 쓴 앱은 canvas 틈 class를 더해야 링이 바탕과 떨어져 보인다.
- [ADR 0032](0032-unified-focus-halo.md)의 「테두리 없는 요소는 halo가 유일한 표시라 1.4.11 미달」 예외는 없어진다. 「포커스 색은 accent를 따른다」, `focus-field`, 오류 색, forced-colors 결정은 그대로다.
- dark solid는 링(400)과 바탕(600)이 1.80:1이지만 사이의 canvas 틈이 링과 5.57:1, 바탕과 3.10:1이라 구분된다. hover·누름 중인 solid(dark)는 틈 × 바탕이 2.2~2.4:1로 낮아지지만 링 × 틈·표면(3:1 이상)은 그대로다.
- **남은 한계:** 테두리가 이미 accent 색인 요소(`outline` 버튼, 체크된 Checkbox·Radio)는 `focus-field`라 포커스 중 바뀌는 것이 halo뿐이다(테두리 자체는 표면과 3:1 이상). neutral Role의 링은 `bg-neutral-subtle` 위에서 2.96:1이다(Alert 닫기 버튼은 위 결정으로 피한다). 두 경우는 다시 볼 때 이 ADR에서 판단한다.
