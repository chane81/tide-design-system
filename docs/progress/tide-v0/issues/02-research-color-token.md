# 컬러 시스템과 Token 구조 조사

Type: research
Status: resolved
Blocked by: 없음

## Question

레퍼런스 시스템들은 컬러 스케일을 어떻게 만드는가(단계 수, OKLCH/HCT 등 색공간, 생성 알고리즘)? Primitive와 Semantic Token의 네이밍 규칙과 계층 구조는 어떤가? light/dark Theme 매핑과 대비 보장 방식은 어떤가? W3C Design Tokens(DTCG) 포맷의 현재 상태와 Style Dictionary 같은 변환 도구 현황도 함께 조사한다. 마지막으로 `#3183f5`를 앵커로 삼아 스케일을 만들 때 쓸 수 있는 방법 후보를 정리한다.

## Answer

- 레퍼런스 시스템의 스케일은 10~12단계다(Radix 12, Primer·Carbon·Atlassian 10, Tailwind v4 11). 생성 알고리즘이 공개된 곳은 Material 3(HCT tonal palette)와 Radix 커스텀 생성기(OKLCH)뿐이다.
- Semantic 네이밍은 공통으로 "속성 × 역할 × 강도 × 상태" 구조다(예: Atlassian `color.background.brand.bold.hovered`, Primer `bgColor.accent.emphasis`). light/dark는 "같은 스케일에서 단계 반전"(M3)과 "테마별 스케일"(Radix, Primer)로 나뉜다.
- `#3183f5`는 직접 계산한 결과 흰색 대비 3.69:1, 검정 대비 5.70:1이다(HCT tone 55.56). 흰 배경에서 4.5:1을 넘으려면 L\* 49.9 이하가 필요하다. 다른 시스템의 brand solid 단계는 흰색 대비 약 5:1이다.
- DTCG 2025.10은 첫 안정판이고 OKLCH와 Resolver(테마)를 지원한다. Style Dictionary 5.8.0은 color 객체를 지원하지만 Resolver 모듈은 아직 지원하지 않는다(#1590 open).
- 스케일 생성 후보 5가지(OKLCH 계단, HCT, 대비 역산, Radix 생성기, 수작업+CI 검증)를 정리했다. 결정은 하지 않았다.

리서치: [docs/research/color-and-token-structure.md](../../../research/color-and-token-structure.md)
