# 그림자·포커스 표시 시각 비교

Type: prototype
Status: open
Blocked by: 20

## Question

「radius·elevation·focus ring 형태 결정」(20번)에서 규칙은 정했고 숫자는 초안으로 남겼다. light·dark Theme에서 실제로 렌더링해 보고 아래 값을 확정한다.

- 그림자 `sm`/`md`/`lg`의 2레이어 초안 값(offset, blur, spread, 레이어별 `color-mix` 비율)
- shadow 색 alpha(light gray-950 12%, dark black 40%)를 조정할지
- dark에서 raised(gray-900 + border) 위 그림자가 깊이를 구분해 주는지. `md`(Popover)와 `lg`(Dialog)가 구별되는지
- 24px(xs) 조작 요소에 radius `md`(6px)가 어색하지 않은지
- 포커스 표시 field(border 2px, inset 방식)와 ring(outline 2px, offset 2px)이 두 Theme에서 잘 보이는지. solid 버튼, error 입력창, raised 위 Menu 항목 위에서 확인한다
- forced-colors 에뮬레이션에서 field의 투명 outline이 보이는지

### 참고

- 초안 값과 근거는 20번 `## Answer`에 있다.
- prototype 코드는 버려도 되는 코드다. 결론과 스크린샷 설명만 `## Answer`에 남긴다.
