---
"@tide-design/foundation": minor
"@tide-design/components": minor
---

포커스 표시를 간격 없는 3px halo 하나로 통일했다(ADR 0032). 깨지는 변경이 있다.

- `focus-ring`: outline 2px + offset 2px 대신 요소 바깥 3px halo만 그린다. 테두리 색은 바꾸지 않는다.
- `focus-field`: inset 1px 대신 테두리(1px 그대로)를 focus 색으로 바꾸고 3px halo를 그린다. 오류 입력창(`aria-invalid="true"`)은 테두리 `border-danger`, halo `outline-danger-halo`다.
- 새 Semantic Token `outline-focus-halo`(light blue-200, dark blue-800), `outline-danger-halo`(light red-200, dark red-800). 두 Token은 표면과 3:1에 못 미쳐 대비 검사에서 뺐다.
- `--tide-focus-ring-width`가 2px에서 3px가 됐다. `--tide-focus-ring-offset`과 `focusRing.offset`을 지웠다.
- halo는 Tailwind ring 자리에 그려 `shadow-*`와 함께 써도 그림자가 남는다. forced-colors에서는 투명 outline이 시스템 색으로 그려진다.
- Checkbox·Radio는 `focus-field`로 바뀌어 포커스 중에 상자 테두리가 focus 색(오류면 빨강)이 된다. Button·IconButton은 `outline`만 `focus-field`이고 나머지 variant는 halo만 보인다.
