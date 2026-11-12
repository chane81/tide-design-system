# Tide 색감 조정 지도

Label: wayfinder:map

## Destination

파스텔 색감(파스텔 바탕 + 같은 색상의 진한 글자 + 한 톤 진한 테두리, 차분한 solid)을 Tide 컬러 Foundation에 넣는 결정이 모두 끝나 있고, ADR과 구현 티켓으로 넘길 수 있는 상태.

## Notes

- **배경**: Tide solid가 너무 쨍하다는 피드백. 사용자가 고른 색감에서 조합 규칙만 뽑아 기준으로 삼음. 외부 제품의 색 값·이름·화면은 저장소에 남기지 않는다
- **먼저 읽을 것**: [파스텔 색감 조사](../../research/pastel-color-tone.md), [컬러 Foundation 결정](../tide-v0/issues/09-grilling-color-foundation.md), [ADR 0011](../../decisions/0011-open-color-names-data-color-accent.md), [ADR 0016](../../decisions/0016-role-scoped-color-and-app-roles.md), `packages/foundation/src/color.ts`, `color-slot.ts`, `semantic.ts`, `contrast.ts`
- **grilling 티켓**: Skill `mattpocock-skills:grilling`과 `mattpocock-skills:domain-modeling`을 함께 호출한다
- 대비 기준(WCAG 2.x, 텍스트 4.5 / UI 3)은 바꾸지 않는다. 관찰 값이 미달이면 밝기만 조정한다
- **모든 문서는 한글로 작성한다**

### 지도를 그리면서 이미 확정한 것

- 기준은 계열마다 손으로 맞춘 파스텔 값이다(공식 하나로 다시 만들지 않음)
- **두 번째 파스텔(채도를 더 뺀 단계)을 하나 더 만든다**. 이름과 자리는 01에서 정한다

## Decisions so far

<!-- 닫힌 티켓마다 한 줄: [티켓 제목](issues/NN-slug.md): 답 요약 -->

- [파스텔 강도와 슬롯 구성 결정](issues/01-grilling-intensity-and-slots.md): 새 슬롯 `on-subtle`·`subtle-border`·`faint`(새 강도). `text`·`border`는 기존 용도 유지. subtle-border는 꾸밈이라 대비 검사 제외
- [계열별 파스텔 값을 스케일에 넣는 방식 결정](issues/02-grilling-scale-values.md): 50·100·200·300·950 단계를 계열마다 다시 맞춤. 호버·클릭은 「단계 + 덮기 비율」(subtle gray-950 4·8%, solid black 14·20%), outline·ghost 호버는 무채색. light `text` 700(대비 예외 없음)
- [dark Theme 파스텔 짝 결정](issues/04-grilling-dark-theme-pairs.md): subtle 950 + white 6·10% 덮기, faint는 gray-950과 950 반반, on-subtle 100, subtle-border 800, dark `text` 300
- [장식 계열 추가 결정](issues/05-grilling-purple-family.md): purple·mint 장식 계열 추가. yellow 대신 amber 50~300을 노랑으로 옮김
- [ADR 작성과 구현 티켓 분해](issues/06-task-adr-and-impl-tickets.md): ADR 0022, GLOSSARY 갱신, 구현 티켓 tide-color-tone-impl 01~04
- [solid 채도와 앵커 결정](issues/03-grilling-solid-chroma-and-anchor.md): solid 채도 상한 0.13(blue·green), red는 0.16. 앵커 blue-500 유지. light `text` 800→700

## Not yet specified

- 차분해진 solid가 Button·Toast 등 기존 Component에 주는 영향 범위

## Out of scope

- 밝은 포인트 색 + 검은 글자 방식
- primary를 잉크(무채색)로 바꾸는 안
- 대비 기준 자체를 바꾸는 것
