---
"@tide-design/components": minor
---

Checkbox·Radio를 고를 때 움직임을 더했다.

- Checkbox를 체크하면 상자 채움이 0.7배에서 커지며 차고(150ms), 채움이 찬 뒤 체크 표시가 시작점에서 끝점으로 그려진다(150ms). indeterminate 가로줄도 같다. 해제하면 지연 없이 150ms 동안 거꾸로 지워지고 채움도 줄며 사라진다.
- Radio를 고르면 점이 가운데에서 살짝 넘쳤다가 자리 잡으며 나타나고(300ms), 앞 점은 150ms 동안 줄며 사라진다.
- 처음 렌더할 때 이미 선택된 상자·원은 움직이지 않는다. 누르거나 올려도 상자·원 크기는 변하지 않는다.
- 움직임 줄이기(`prefers-reduced-motion: reduce`)에서는 opacity만 바뀐다.
- Checkbox 표시는 `@tide-design/icons` 아이콘 대신 같은 모양의 전용 SVG로 그린다. 체크된 상자의 채움은 input 바탕 대신 겹친 레이어(`data-fill`)가 그린다(forced-colors 제외).
- Checkbox 체크·가로줄의 선 두께를 3px에서 2px로 줄였다. 아이콘 기본(1.5px)보다 한 단계 굵어 채운 상자 안에서도 보인다.
