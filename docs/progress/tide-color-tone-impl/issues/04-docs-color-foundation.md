# 04: 문서: 컬러 Foundation, 앱 계열 가이드, Component 문서

Status: ready-for-agent
Blocked by: 03

## What to build

[문서 작성 기준](../../../standards/docs-writing.md)을 따라 Storybook 문서를 고친다.

- `apps/docs/src/foundations/Color.mdx`: 강도 세 가지(solid·subtle·faint), 새 슬롯 셋, 덮기로 만드는 호버·클릭, `bg-hover`·`bg-active`, 장식 계열 purple·mint(의미 표시에는 Role을 쓴다는 Do/Don't). 슬롯 표와 견본이 Token에서 자동으로 나오는지 확인한다.
- `apps/docs/src/getting-started/BrandColor.mdx`: `defineColorFamily`에 넣는 11단계 스케일의 단계별 역할(50 faint, 100 파스텔 바탕, 200 테두리, 600 solid, 700 링크, 950 파스텔 글자)과 권장 밝기·채도 범위(ADR 0022 §4). 대비 검사가 무엇을 강제하는지.
- Badge 문서: `variant="faint"` 예와 쓰임(덜 중요한 표시).
- Alert·Tag·Button 문서의 색 설명이 바뀐 슬롯과 맞는지 확인한다.

## 수용 기준

- [ ] 위 문서가 ADR 0022과 맞고, GLOSSARY 용어(강도, 덮기, accent 슬롯)를 쓴다.
- [ ] 외부 제품 이름·값이 없다.
- [ ] Storybook 빌드와 문서 테스트가 통과한다.
- [ ] changeset(docs).

## Comments
