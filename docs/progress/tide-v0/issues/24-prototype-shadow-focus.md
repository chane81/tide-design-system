# 그림자·포커스 표시·motion 시각 비교

Type: prototype
Status: resolved
Blocked by: 20, 21, 23

## Question

「radius·elevation·focus ring 형태 결정」(20번)에서 규칙은 정했고 숫자는 초안으로 남겼다. light·dark Theme에서 실제로 렌더링해 보고 아래 값을 확정한다.

- 그림자 `sm`/`md`/`lg`의 2레이어 초안 값(offset, blur, spread, 레이어별 `color-mix` 비율)
- shadow 색 alpha(light gray-950 12%, dark black 40%)를 조정할지
- dark에서 raised(gray-900 + border) 위 그림자가 깊이를 구분해 주는지. `md`(Popover)와 `lg`(Dialog)가 구별되는지
- 24px(xs) 조작 요소에 radius `md`(6px)가 어색하지 않은지
- 포커스 표시 field(border 2px, inset 방식)와 ring(outline 2px, offset 2px)이 두 Theme에서 잘 보이는지. solid 버튼, error 입력창, raised 위 Menu 항목 위에서 확인한다
- forced-colors 에뮬레이션에서 field의 투명 outline이 보이는지
- forced-colors 에뮬레이션에서 light raised의 투명 border가 경계로 보이는지
- 「아이콘 전략 결정」(23번)의 size별 아이콘 크기(14/16/16/20px, IconButton 16/16/20/24px)와 선 두께 2px가 Pretendard label과 어울리는지
- Menu·Select 목록(`lg`, padding 3px + border 1px) 안 항목 `sm` radius가 동심원으로 보이는지
- 「motion Foundation 결정」(21번)의 등장·퇴장 값: Popover·Toast(opacity + blur 4px + translate 12px), Dialog(opacity + scale 0.96), 등장 300ms / 퇴장 150ms. 12px가 Popover에 큰지. Button press `scale 0.96`. reduced-motion 에뮬레이션에서 opacity 전환만 남는지

### 참고

- 초안 값과 근거는 20번 `## Answer`에 있다.
- prototype 코드는 버려도 되는 코드다. 결론과 스크린샷 설명만 `## Answer`에 남긴다.

## Answer

light·dark에서 실제로 렌더링해 비교하고 아래 값을 확정했다. 확정한 값은 각 결정 티켓(20, 21, 23, 09)의 Answer에 반영했다.

| 항목                         | 비교한 안                            | 확정                                                                                                                          |
| ---------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 그림자                       | A 초안 / B 옅게 / C 진하게           | **B**. sm `0 1px 1px` 60% + `0 1px 2px`, md `0 1px 3px` 50% + `0 4px 12px -2px`, lg `0 2px 6px -1px` 50% + `0 12px 24px -6px` |
| shadow 색 alpha              | 12%·40% / 8%·30% / 16%·50%           | **light gray-950 8%, dark black 30%** (B에 딸린 값)                                                                           |
| Popover·Toast 등장 이동 거리 | 4 / 8 / 12px                         | **4px**                                                                                                                       |
| sm 버튼 텍스트 옆 아이콘     | 14 / 16px                            | **14px**                                                                                                                      |
| 목록 안 항목 포커스 표시     | 바깥 ring / 안쪽 ring / 배경 강조    | **배경 강조(highlight)**: primary subtle 배경 + primary text 글자. hover도 같은 모양                                          |
| 버튼류 ring                  | 유지(offset 2px) / offset 1px / 없앰 | **유지(outline 2px, offset 2px, `:focus-visible`)**. 없애는 안은 WCAG 2.4.7(AA) 위반이라 후보에서 뺐다                        |

- 사람이 보고 어색하다고 하지 않아 그대로 둔 것: Dialog scale 0.96, press 축소 0.96, field 모양, blur 4px, 24px(xs) 조작 요소의 `md` radius, Menu 목록의 동심원 radius(8 = 4 + 3 + 1).
- **확인하지 못한 것**: forced-colors 모드(light raised의 투명 border, field의 투명 outline, highlight의 투명 outline). 페이지 안에서 흉내 낼 수 없어 DevTools 에뮬레이션이 필요하다. 구현 후 테스트 전략에서 다룬다.
- prototype에서 찾은 구현 함정: error 입력창에 포커스를 주면 빨강 border와 파랑 inset이 겹쳐 보였다. CSS 우선순위 문제였고, 20번 Answer에 구현 주의로 남겼다.
- 버튼 ring에 대한 오해: prototype에서 "포커스 고정"을 켜 두면 ring이 늘 보인다. 실제로는 Tab 이동 때만 보이고 마우스 클릭 때는 보이지 않는다(`:focus-visible`). 이를 확인한 뒤 현재 규칙을 유지했다.
- 프로토타입: `prototype/24-shadow-focus-motion` 브랜치의 `prototypes/shadow-focus-motion/index.html`(커밋 `4944d1c`). main에는 머지하지 않는다. `?variant=A|B|C&theme=light|dark` 등 URL 파라미터로 상태를 재현할 수 있다.
