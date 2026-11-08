# 레퍼런스 디자인 시스템의 원칙 조사

Type: research
Status: resolved
Blocked by: 없음

## Question

Material 3, IBM Carbon, Atlassian, GitHub Primer, Radix Themes, 당근 SEED Design은 각각 어떤 원칙을 내세우는가? 원칙을 어떻게 쓰는지(형식, 개수, 'A가 B보다 우선' 같은 우선순위 문장 사용 여부)와 원칙이 실제 결정에 어떻게 연결되는지(예시, 반례)를 1차 출처로 정리한다.

## Answer

- 원칙을 명시한 레퍼런스는 모두 3~6개다(Atlassian 3, SEED 3, Primer 3, Carbon 5, Radix Primitives 6, M3 접근성 3). M3에는 시스템 전체 원칙 페이지가 없고, 접근성 원칙과 Expressive 전술이 따로 있다.
- "A가 B보다 우선" 형식을 원칙의 기본 형식으로 쓰는 곳은 Atlassian("Trusted fundamentals before comprehensive patterns" 등 3개)뿐이다. Primer는 Zen of GitHub 경구("Approachable is better than simple" 등)에서 쓴다.
- 반례를 원칙 문장 안에 넣는 곳은 Atlassian과 Primer이고, Do/Caution 시각 예시는 M3 Expressive에 있다.
- 원칙과 ADR을 명시적으로 잇는 시스템은 찾지 못했다(Primer ADR 파일 27개(템플릿 포함)도 원칙을 인용하지 않음). SEED는 업데이트 글에서 결정, 이유, 지표를 사후에 서술한다.
- 리서치: [docs/research/principles-reference-systems.md](../../../research/principles-reference-systems.md)
