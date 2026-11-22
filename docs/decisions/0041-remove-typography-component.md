# 공개 Component `Typography`를 제거하고 시맨틱 태그와 `text-*` class로 쓴다

근거 원칙: ③ 단순함이 유연함보다 우선한다, ① 접근성이 미려함보다 우선한다

[v0 Component 목록과 우선순위 결정](../progress/tide-v0/issues/15-grilling-component-list.md)은 Heading과 Text를 `Typography` 하나로 합쳤다. 이 ADR은 그 Typography 통합 결정을 대체한다. 과거 티켓 본문은 고치지 않는다.

## 결정

- **`@tide-design/components`에서 `Typography`, `TypographyProps`, `TypographyOwnProps`를 제거한다.** deprecated 단계 없이 바로 제거한다(2026-11-22, 사용자 결정).
- **글자는 시맨틱 태그와 `text-*` class로 쓴다.** 예: `<h3 className="text-heading-lg">`.
- **제목 단계는 문서 구조로, 크기는 class로 고른다.**
- Foundation의 텍스트 스타일(`textStyle`, `TextStyleName`, `text-*`)은 그대로 둔다.
- `render` 적용 범위(루트가 DOM 요소 하나인 Component, ADR 0005)는 바꾸지 않는다. Card·Link 등이 계속 쓴다.

## 이유

- Typography는 `text-*` class 하나를 붙이고 태그를 고르는 일만 한다. 시맨틱 태그에 class를 붙이면 같은 결과가 나온다.
- 다른 Component가 의존하지 않는다. Accordion의 `Heading`은 자체 지역 변수다.
- 기본 태그 매핑은 시각 크기로 제목 단계를 정한다(`heading-lg` → `h2`). 제목 단계는 문서 구조로 정해야 한다.
- 「heading은 항상 `<h*>`」 보장도 `render={<div />}`로 깨진다.

## 결과

- 잃는 것: `variant` 타입 검사·자동완성, 기본 태그 편의.
- 공개 export 제거라 breaking change다. 0.x이므로 minor로 올리고, changeset에 이전 방법을 적는다.
- 이전 방법: `<Typography variant="heading-lg">` → `<h2 className="text-heading-lg">`. 태그는 문서 구조에 맞게 고른다.
- 문서 앱 Foundation/타이포그래피에 사용법을 둔다.
