---
"@tide-tds/foundation": minor
"@tide-tds/components": minor
---

solid를 덜 진하게 바꿨다. 모든 색 계열의 600 단계를 이전 값에서 OKLCH 밝기 +0.03, 채도 ×0.85(상한 0.12)로 옮겼고 색상은 그대로다(blue-600 `#3c70bb` → `#4e7aba` 등). `solid`·`solid-hover`·`solid-active`, light `border`·`outline-focus`가 함께 밝아진다. solid 위 흰 글자 대비는 4.18~4.62:1로 solid 위 글자 하한 4:1(ADR 0023)을 지킨다. `text-muted`(light)는 gray-600이 흰 표면 위 4.5:1에 못 미쳐 gray-700으로 옮겼다. Token 이름은 그대로라 코드는 깨지지 않지만 화면 색이 바뀐다.
