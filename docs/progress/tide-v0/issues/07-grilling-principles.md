# Tide 원칙 확정

Type: grilling
Status: resolved
Blocked by: 01

## Question

Tide의 원칙(Principle)은 무엇인가? 개수, 각 문장, 우선순위, 원칙마다 예시와 반례를 정한다. 확정한 내용은 `docs/principles/`에 최종 문안으로 작성한다. 이미 정해진 WCAG 2.2 AA 기준과 '명확함이 화려함보다 우선한다'는 후보 문장을 출발점으로 삼는다.

## Answer

원칙 4개를 확정했다. 형식은 "A가 B보다 우선한다"이고, 번호가 곧 우선순위다. ① 접근성 > 미려함, ② 명확함 > 화려함, ③ 단순함 > 유연함, ④ 발견할 수 있음 > 외워야 함. 원칙마다 설명, "그래서 우리는", "하지 않는 것"을 둔다. 문서는 한글로 쓰고 영문 제목을 병기한다.

- 최종 문안: [docs/principles/README.md](../../../principles/README.md)
- WCAG 2.2 AA는 원칙이 아니라 기준으로 분리했다: [docs/standards/accessibility.md](../../../standards/accessibility.md). GLOSSARY에 Standard 용어를 추가했다.
- 모든 ADR에 `근거 원칙:` 줄을 둔다(docs/agents/domain.md). ADR 0001에는 ③, ADR 0002에는 ④를 소급해 적었다.
- Do/Don't 예시를 Storybook에서 실제 Component로 보여주는 일은 Component가 나온 뒤로 미뤘다(지도의 Not yet specified에 기록).
