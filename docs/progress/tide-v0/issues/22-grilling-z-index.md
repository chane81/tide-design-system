# z-index 층 결정

Type: grilling
Status: open
Blocked by: 12, 13

## Question

겹치는 요소(dropdown, sticky, overlay, modal, toast 등)의 쌓임 순서를 정한다. 층 이름과 값, 그리고 Tailwind 쪽 노출 방식을 정한다. 「접근성 동작 구현 방식 결정」에서 top-layer(`<dialog>`, popover API)나 Portal을 쓰기로 하면, z-index Token이 필요한 범위가 줄어든다.

### 참고 (다른 티켓에서 넘어온 것)

- 「v0 Foundation 범위 결정」: z-index는 Semantic 층 이름을 둔다. 이름은 표면 층(`canvas`/`surface`/`raised`)과 섞이지 않게 짓는다. GLOSSARY에서 `layer`는 Avoid로 둔 단어다.
- Tailwind 4.3.x에서 z-index에 theme namespace가 있는지는 공식 문서로 확인한다.
