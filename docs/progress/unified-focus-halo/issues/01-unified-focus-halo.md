# 01: `focus-ring`·`focus-field`를 간격 없는 3px halo로 바꾸기

Status: ready-for-human

## What to build

포커스 표시 두 모양(offset ring, inset field)을 요소 바깥 3px halo 하나로 통일한다. 테두리가 있는 요소는 테두리 색도 focus 색으로 바꾼다([ADR 0032](../../../decisions/0032-unified-focus-halo.md)). blue 새 값(PR #74)을 전제로 한다.

## 할 일

- [x] foundation: `focus-ring`(halo만)·`focus-field`(테두리 + halo, 오류는 빨강) utility, `--tide-focus-ring-width` 3px, `--tide-focus-ring-offset` 삭제
- [x] Semantic Token `outline-focus-halo`(blue-200 / blue-800), `outline-danger-halo`(red-200 / red-800)와 대비 제외 사유
- [x] components: Checkbox·Radio는 `focus-field`, Button·IconButton은 outline만 `focus-field`, forced-colors adjust를 끈 요소는 halo 변수를 `Highlight`로
- [x] 문서: Shape·Color·Component MDX, GLOSSARY, 접근성 기준, ADR 0023·0026 덧붙임
- [x] 테스트: utility CSS, Token 값, 오류 입력창 포커스, forced-colors 투명 outline, Component별 포커스 표시
- [ ] PR 리뷰(PR #74 머지 뒤 base를 main으로)

## 판단한 곳

- utility를 하나로 합치지 않았다. CSS로는 보이는 테두리가 있는지 알 수 없어, 투명 border를 둔 solid·ghost 버튼에 파란 테두리가 생긴다.
- Switch(경계 있음), Tag(파스텔 테두리), Toast(raised 테두리)는 halo만 둔다. Switch는 사용자 결정, Tag·Toast는 꾸밈 테두리라서다.
- halo는 `@apply ring-*`으로 그려 Tailwind ring 합성 자리에 들어간다. Toast처럼 `shadow-md`를 가진 요소도 포커스 중에 그림자가 남는다.
- 브라우저 기본 `:focus-visible` offset(링크 1px, 체크박스 2px)을 `outline-offset: 0`으로 지웠다. forced-colors outline이 요소에 붙는다.
- `focus-ring`·`focus-field`는 tailwind-merge 설정에 등록하지 않았다. Component가 variant별로 하나만 붙여 충돌하지 않는다.
