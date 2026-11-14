# 오류 입력창의 포커스 표시는 오류 색으로 두껍게 그린다

근거 원칙: ② 명확함이 화려함보다 우선한다, ① 접근성이 미려함보다 우선한다

[spec](../progress/tide-v0/spec.md) 「Shape」와 [티켓 06](../progress/tide-v0-impl/issues/06-radius-elevation-focus-foundation.md)은 오류 입력창(`aria-invalid="true"`)에서도 포커스 중에는 `focus-field`(포커스 색)가 이기도록 했다. 문서 「모양과 깊이」의 오류 입력창 예시를 보니 빨간 border 안쪽에 파란 inset이 겹쳐 두 색이 보였다. 예시는 포커스 상태를 고정하려고 `focus-field`를 variant 없이 쓰는데, 그러면 `.focus-field[aria-invalid]`와 `aria-invalid:border-danger`의 우선순위가 (0,2,0)으로 같아 CSS 순서에 따라 오류 border가 이겼다. 사용자는 오류일 때는 포커스 색을 빨강으로 하자고 했다(2026-11-13, 사용자 결정).

## 결정

- `focus-field`의 `[aria-invalid="true"]` 조합은 border와 inset 1px를 **둘 다 `border-danger`** 로 그린다. 정지 상태 1px 빨강 → 포커스 2px 빨강이다.
- 오류가 아닐 때는 그대로 포커스 색(`outline-focus`) 2px다. forced-colors의 투명 outline도 그대로다.

## 결과

- border와 inset이 같은 색이라 선택자 우선순위·순서와 상관없이 두 색이 겹치지 않는다. variant 없이 쓴 경우도 마찬가지다.
- 포커스는 두께 변화(1px → 2px)로 드러난다. `border-danger × bg-canvas`는 이미 3:1로 등록되어 있어 대비 쌍을 더하지 않는다.
- 오류 입력창에 포커스해도 오류 색이 유지되어 오류 상태를 놓치지 않는다. 오류는 계속 메시지·`aria-invalid`로도 알린다.
- Input·Textarea·Select·Combobox 트리거가 모두 `focus:focus-field`를 써서 함께 바뀐다.

> 덧붙임(2026-11-14, [ADR 0032](0032-unified-focus-halo.md)): 포커스 표시를 간격 없는 3px halo로 통일했다. 오류 입력창은 포커스 중에 테두리 `border-danger`(1px 그대로)와 halo `outline-danger-halo`(light red-200, dark red-800)로 그린다. inset 1px로 두껍게 보이던 표시는 없어졌다. "오류일 때는 포커스 색도 빨강" 결정은 그대로다.
