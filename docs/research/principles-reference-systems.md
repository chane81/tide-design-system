# 레퍼런스 디자인 시스템의 원칙 조사

- 조사일: 2026-11-08
- 관련 티켓: [01-research-principles](../progress/tide-v0/issues/01-research-principles.md)
- 맥락: [GLOSSARY](../../GLOSSARY.md)의 Principle 정의("Tide의 모든 결정이 따르는 가치 판단 문장. 예: '명확함이 화려함보다 우선한다.'")
- 방법: 각 시스템의 공식 사이트와 공식 GitHub 저장소만 출처로 썼다. SPA라서 일반 HTTP 요청으로 본문이 오지 않는 사이트(m3.material.io, atlassian.design, seed-design.io)는 헤드리스 브라우저로 렌더링한 뒤 읽었다. 인용은 원문 그대로 옮겼고, 출처에서 직접 확인하지 못한 것은 "확인 불가", 내 해석은 "해석"으로 표시했다.

## 한눈에 보기

| 시스템        | 원칙 이름                                                               | 개수                             | 형식                                                         | 우선순위 문장("A가 B보다 우선") | 결정과의 연결                                                                                          |
| ------------- | ----------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Material 3    | 시스템 전체 원칙 페이지 없음. 접근성 원칙과 Expressive 전술이 따로 있음 | 접근성 원칙 3, Expressive 전술 7 | 짧은 제목과 설명 문단. 전술에는 Do/Caution 예시가 붙음       | 없음                            | 전술 아래 Do/Caution 예시와 스스로 묻는 질문                                                           |
| IBM Carbon    | Our guiding principles                                                  | 5                                | "Carbon is ~." 굵은 선언문과 한두 문장 설명                  | 없음                            | 확인 불가                                                                                              |
| Atlassian     | Values 3 + Principles 3                                                 | 3 + 3                            | 원칙 제목이 모두 "A before B" 형식. 원칙마다 "We ~" 문장 3개 | 있음 (3개 모두)                 | 가치 문장 안에 반례가 들어 있음("consistency for the sake of consistency"를 피함)                      |
| GitHub Primer | 소개 페이지의 세 섹션 + Zen of GitHub                                   | 3 + 14                           | 섹션 제목과 설명 문단, 그리고 14개 경구                      | 있음 (Zen 14개 중 5개)          | 원칙에서 바로 나온 설계 판단(예: 데스크톱을 모바일 우선으로 축소하지 않음). ADR은 원칙을 인용하지 않음 |
| Radix         | Themes에는 원칙 페이지 없음. Primitives에 Key Features                  | Primitives 6                     | 한 단어 제목과 설명 문단                                     | 없음                            | 특징이 곧 API 결정(asChild, uncontrolled 기본값 등)                                                    |
| 당근 SEED     | SEED의 디자인 원칙                                                      | 3                                | "A & B" 영문 쌍 제목과 한글 두 줄                            | 없음                            | 업데이트 글에서 결정과 결과(지표)를 함께 서술                                                          |

## 1. Material 3

### 원칙

- M3 공식 사이트에는 시스템 전체를 묶는 "원칙" 페이지를 찾지 못했다(확인 불가). 시작 페이지는 M3를 형용사 셋으로 설명한다. "Material 3, enables personal, adaptive, and expressive experiences" ([m3.material.io/get-started](https://m3.material.io/get-started))
- Foundations 목록에도 원칙 항목은 없고 Accessibility, Content design, Customizing Material, Design tokens, Interaction states, Layout, Material A-Z, Building for all이 있다 ([m3.material.io/foundations](https://m3.material.io/foundations)).
- 비교 참고: 이전 버전인 Material 2는 Introduction에 Principles 3개를 두었다. "Material is the metaphor", "Bold, graphic, intentional", "Motion provides meaning" ([m2.material.io/design/introduction](https://m2.material.io/design/introduction)). 각 원칙은 제목 한 줄과 설명 한 문단이다.

### 접근성 원칙 (Principles for accessible design)

출처: [m3.material.io/foundations/overview/principles](https://m3.material.io/foundations/overview/principles)

- 전제: "Accessibility by default is a core design value for Material."
- 3개 원칙: **Honor individuals**, **Learn before, not after**, **Requirements as a starting point**
- 형식: 명령형 또는 명사구 제목과 설명 두 문단.
- "Learn before, not after"는 제목 자체가 순서를 정하는 대비 문장이지만, "A가 B보다 우선" 형식은 아니다.
- "Requirements as a starting point"는 WCAG를 최소선으로 보고 그 위에서 해결책을 찾으라고 한다. 예로 dark mode, text-to-speech, speech-to-text가 접근성 요구에서 나왔다고 든다.

### M3 Expressive 전술 (Expressive tactics)

출처: [m3.material.io/blog/building-with-m3-expressive](https://m3.material.io/blog/building-with-m3-expressive)

- 원칙이 아니라 "design tactics"라고 부른다. 7개다. 1. Use a variety of shapes, 2. Apply rich and nuanced colors, 3. Guide attention with typography, 4. Contain content for emphasis, 5. Add fluid and natural motion, 6. Leverage component flexibility, 7. Combine tactics to create hero moments
- 근거를 리서치로 댄다. "46 studies with more than 18,000 participants"
- **결정과의 연결**: 전술마다 Do와 Caution 예시가 붙는다. 예를 들어 shape 전술에는 "Caution: Smaller shapes can result in essential actions looking less important.", "Do: Break from the surrounding shape style to draw attention to a particular element."가 있다.
- 적용 한도를 정한다. "Stick to one or two hero moments in your product; too many moments can be overwhelming or distracting."
- 판단용 질문을 준다. "Is this interaction emotionally impactful?", "Is this a key interaction in your product?"

## 2. IBM Carbon

출처: [carbondesignsystem.com/all-about-carbon/what-is-carbon/](https://carbondesignsystem.com/all-about-carbon/what-is-carbon/) (페이지 제목은 "About Carbon")

### 원칙 (Our guiding principles)

5개이고 모두 "Carbon is/puts/builds ~" 형식의 굵은 선언문에 한두 문장 설명이 붙는다.

1. **Carbon is open.** 오픈소스 운동의 원칙을 따르는 분산된 노력이며, "Carbon's users are also its makers"
2. **Carbon is inclusive.** "designed and built to be accessible to all, regardless of ability or situation"
3. **Carbon is modular and flexible.** 컴포넌트가 어떤 조합으로도 함께 동작하도록 설계됨
4. **Carbon puts the user first.** 사용자 니즈에 대한 엄밀한 리서치에 기반함
5. **Carbon builds consistency.** IBM Design Language에 기반해 모든 요소가 함께 동작하도록 설계됨

### 형식과 결정 연결

- 우선순위 문장은 없다. 원칙끼리 부딪힐 때(예: modular and flexible 대 builds consistency) 무엇을 먼저 할지는 적혀 있지 않다.
- 원칙을 특정 결정의 근거로 인용하는 문서는 이번 조사에서 찾지 못했다(확인 불가).
- 참고: 검색 엔진 요약은 이 페이지의 원칙을 다르게 요약했다. 위 목록은 2026-11-08에 페이지를 직접 받아 확인한 내용이다.

## 3. Atlassian Design System

출처: [atlassian.design/get-started/about-atlassian-design-system](https://atlassian.design/get-started/about-atlassian-design-system) (예전 주소 `/get-started/vision-values-principles`에서 리다이렉트됨)

### 구조: Vision, Values, Principles

- Vision: "Our vision is to be the cornerstone of crafting quality user interfaces in Atlassian apps."
- Values 3개: "Our values drive us to create things that are foundational, harmonious, and empowering to use."
  - **Foundational**: "We solve common problems and provide a foundation for teams to build on. We avoid consistency for the sake of consistency and reject infinite flexibility."
  - **Harmonious**: "Our building blocks work together to create apps that feel familiar, cohesive, and part of a family."
  - **Empowering, for everyone**: 역할, 경험, 숙련도와 관계없이 모두에게 동작하게 함
- Principles 3개: "Our principles guide our actions to align with our values."
  1. **Trusted fundamentals before comprehensive patterns**
  2. **Meet system needs before delivering individual features**
  3. **Bring people on the journey before helping for the moment**

### 형식

- 원칙 제목 3개가 모두 "A before B" 형식이다. 조사한 시스템 가운데 우선순위 문장을 원칙의 기본 형식으로 쓰는 곳은 Atlassian뿐이다.
- 원칙마다 "We ~" 행동 문장 3개가 붙는다. 예: 1번 원칙 아래 "We solve common foundational problems first", "We provide opinionated building blocks", 2번 원칙 아래 "We finish what we start before starting something new."
- 가치와 원칙의 관계를 명시한다. 가치는 "무엇을 만드는가", 원칙은 "가치에 맞게 어떻게 행동하는가"이다.

### 결정과의 연결

- 가치 문장 안에 반례가 들어 있다. Foundational은 "consistency for the sake of consistency"와 "infinite flexibility" 둘 다 거부한다고 적는다. 양 극단을 함께 배제해 판단 범위를 좁히는 방식이다(해석).
- 원칙을 구체적인 컴포넌트 결정에 인용한 예시는 이번 조사에서 찾지 못했다(확인 불가).
- 검색 결과에는 Atlassian의 "제품 디자인 원칙"(Build trust in every interaction 등 5개, `atlassian.design/resources/atlassian-design-principles`)도 나왔다. 하지만 이 주소는 2026-11-08 현재 공식 페이지로 열리지 않아(로그인 페이지로 이동) 1차 출처로 확인하지 못했다(확인 불가).

## 4. GitHub Primer

출처: [primer.style/guides/introduction](https://primer.style/guides/introduction) (Product UI, "Getting started")

### 원칙

첫 문장이 세 형용사로 목표를 정한다. "Primer provides common language to build cohesive, accessible, responsive experiences."

원칙 역할을 하는 섹션은 세 개다.

1. **A cohesive experience**: 익숙한 패턴과 같은 은유를 써서 사용자가 새 UI를 해석하지 않고 작업에 집중하게 함
2. **Inclusive and accessible design**: "Accessibility and inclusive design needs to be considered from the start of a project", "Adding accessibility support to a design after the fact generally turns into a difficult retrofit."
3. **Design for efficiency**: "GitHub is a platform used for productivity. We aim to encourage flow, focus, and an experience that is fast and compact."

### 우선순위 문장: The Zen of GitHub

같은 페이지에 "The Zen of GitHub" 14개 경구가 실려 있다. GitHub API가 자기 코드베이스에 담고 있다고 소개한다. 실제로 `https://api.github.com/zen`은 이 경구 중 하나를 무작위로 돌려준다(2026-11-08 호출 결과: "Non-blocking is better than blocking.").

14개 중 비교·우선순위 형식인 것은 다음 5개다.

- Responsive is better than fast
- Practicality beats purity
- Approachable is better than simple
- Non-blocking is better than blocking
- Favor focus over features

나머지는 단정형이다. 예: "Anything added dilutes everything else", "Half measures are as bad as nothing at all", "Design for failure"

### 결정과의 연결

- Design for efficiency 섹션에서 원칙이 구체적인 판단으로 이어진다. "accessible solutions that don't dilute efficient UI interactions", "responsive design that doesn't reduce desktop experiences into mobile-first solutions". 즉 모바일 우선 축소를 하지 않는다는 결정이 원칙에서 나온다.
- Primer React의 ADR([github.com/primer/react/tree/main/contributor-docs/adrs](https://github.com/primer/react/tree/main/contributor-docs/adrs), 2026-11-08 기준 27개 파일)은 템플릿이 Status, Context, Decision, Consequences, Alternatives로 되어 있다. 전체 ADR에서 "principle"과 "zen of"를 찾아보니 디자인 원칙이나 Zen을 근거로 인용한 ADR은 없었다. 유일한 "principle" 언급은 adr-002의 "foundational principles of React"였다. 원칙과 ADR이 문서상 연결되어 있지 않다.

## 5. Radix (Themes, Primitives, Colors)

### Radix Themes

- 원칙 페이지는 없다(확인 불가). 표어만 있다. "An open source component library optimized for fast development, easy maintenance, and accessibility." ([radix-ui.com/themes](https://www.radix-ui.com/themes), [GitHub README](https://github.com/radix-ui/themes))
- Styling 문서에 설계 입장이 드러난다 ([radix-ui.com/themes/docs/overview/styling](https://www.radix-ui.com/themes/docs/overview/styling)).
  - "Radix Themes does not come with a built-in styling system. There's no css or sx prop"
  - "The components in Radix Themes are relatively closed—they come with a set of styles that aren't always easily overridden. They are customizable within what's allowed by their props and the theme configuration."
  - "Changes to the token system are treated as breaking."

### Radix Primitives

출처: [radix-ui.com/primitives/docs/overview/introduction](https://www.radix-ui.com/primitives/docs/overview/introduction)

- Vision: "Our goal is to create a well-funded, open-source component library that the community can use to build accessible design systems."
- Key Features 6개가 사실상 원칙 역할을 한다. 한 단어 제목과 설명 문단 형식이다: **Accessible**, **Unstyled**, **Opened**, **Uncontrolled**, **Developer experience**, **Incremental adoption**
- **결정과의 연결**: 특징 설명이 곧 API 결정이다.
  - Accessible: "Components adhere to the WAI-ARIA design patterns where possible", 그래서 aria/role 속성, 포커스 관리, 키보드 탐색을 라이브러리가 처리한다.
  - Uncontrolled: "components are uncontrolled by default but can also be controlled"
  - Developer experience: "All components share a similar API", 그리고 "asChild prop"
- Themes("relatively closed")와 Primitives("Opened")가 같은 조직 안에서 반대 입장을 택한 것은 제품의 목적에 따라 원칙이 달라진 사례다(해석).

### Radix Colors (참고)

- 원칙은 아니지만 결정 규칙을 표로 적는 방식이 참고할 만하다. "There are 12 steps in each scale. Each step was designed for at least one specific use case." 예: 1단계 App background, 7단계 UI element border and focus rings ([radix-ui.com/colors/docs/palette-composition/understanding-the-scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)).

## 6. 당근 SEED Design

출처: [seed-design.io](https://seed-design.io/) (홈의 "SEED의 디자인 원칙" 섹션)

### 원칙

3개이고 모두 "A & B" 영문 쌍 제목에 한글 설명 두 줄이 붙는다.

1. **Consistent & Essential**: "기초가 되는 최소 단위로 단단하게 설계해요 / 모든 당근 제품은 같은 뿌리에서 자라나요"
2. **Accessible & Clear**: "명확한 표현과 예측 가능한 구조로 설계해요 / 누구나 동등하게 사용할 수 있는 경험을 만들어요"
3. **Responsive & Lively**: "풍부한 표현과 일관된 피드백으로 반응해요 / 제품이 살아 숨 쉬는 감각을 만들어요"

- 형식: 영문 제목에 한글 설명을 붙인 이중 언어 구성이고, 한글 문장은 "~해요" 체다.
- 우선순위 문장은 없다.

### 결정과의 연결

원칙 섹션에서 결정으로 직접 링크하지는 않는다. 대신 업데이트 글 [더 당근답게: SEED는 어떻게 진화했나](https://seed-design.io/updates/how-seed-evolved)에서 결정, 이유, 결과를 함께 서술한다. 각 결정이 어느 원칙에 해당하는지 명시하지는 않는다(아래 원칙 대응은 해석이다).

- 접근성(Accessible & Clear와 대응): "WCAG와 APCA 같은 업계 표준을 충족하는 경험을 처음부터 기준으로 삼았습니다." 색을 전경(fg), 배경(bg), 외곽선(stroke)으로 나누고, 터치 영역(targetSize)을 스펙에 기록했다. "접근성을 '잘 챙기자'는 권고가 아니라, 누구나 확인할 수 있는 명시적인 기준으로 바꾼 셈입니다."
- 피드백(Responsive & Lively와 대응): 누르면 살짝 줄어들었다 돌아오는 인터랙션과 focus 상태를 추가했다.
- 덜어내기(Consistent & Essential과 대응): 텍스트 스타일을 "기존 38개에서 24개로" 줄였다.
- 결과 지표: 프로필 화면 개편 후 "프로필에서 다른 이웃을 모아보기하는 수가 약 44% 늘었고, 화면 체류 시간이 Android 68%·iOS 83% 증가했어요."
- 브랜딩 글은 원칙의 역할을 이렇게 쓴다. "SEED가 무엇이고, 어떤 원칙을 추구하며, 누가 어떤 태도로 만들어가는지를 하나의 정체성으로 묶어내는 일" ([seed-design.io/updates/why-design-system-needs-branding](https://seed-design.io/updates/why-design-system-needs-branding))

## 관찰 정리

1. **개수**: 원칙을 명시한 곳은 모두 3~6개다(Atlassian 원칙 3, SEED 3, Primer 섹션 3, Carbon 5, Radix Primitives 6, M3 접근성 3). 14개인 Zen of GitHub는 원칙이라기보다 문화를 담은 경구 모음으로 제시된다.
2. **우선순위 문장**: 원칙의 기본 형식으로 쓰는 곳은 Atlassian("A before B")뿐이다. Primer는 원칙 섹션이 아니라 Zen 경구에서 "A is better than B"를 쓴다. Material, Carbon, Radix, SEED는 선언형이나 형용사형이라 원칙끼리 부딪힐 때의 순서가 적혀 있지 않다.
3. **반례**: 원칙 문장 안에 "하지 않는 것"을 적은 곳은 Atlassian("avoid consistency for the sake of consistency and reject infinite flexibility")과 Primer("doesn't reduce desktop experiences into mobile-first solutions")다. Do/Caution 같은 구체적인 시각 예시는 M3 Expressive 전술에 있다.
4. **결정과의 연결**: 원칙과 ADR 같은 결정 기록을 링크로 잇는 시스템은 조사 범위에서 찾지 못했다. Primer ADR도 원칙을 인용하지 않는다. 연결은 대개 (a) 원칙 설명 안에 구체적인 판단을 넣거나(Primer, Radix Primitives), (b) 업데이트 글에서 사후에 서술하거나(SEED), (c) 예시와 질문을 붙이는(M3 Expressive) 방식으로 이루어진다.
5. **층위**: 원칙이 여러 층에 따로 있는 경우가 많다. M3는 접근성 원칙과 Expressive 전술이 분리되어 있고, Atlassian은 Values와 Principles를 나누며, Radix는 제품(Themes와 Primitives)마다 입장이 다르다.

## Tide에 주는 시사점

결정은 하지 않는다. grilling 티켓에서 판단할 선택지와 질문만 정리한다.

- **형식 선택지**: (a) Atlassian식 "A가 B보다 우선" 제목, (b) SEED식 "A & B" 쌍 제목에 설명 두 줄, (c) Carbon식 "Tide는 ~하다" 선언문. GLOSSARY의 Principle 예시("명확함이 화려함보다 우선한다")는 (a)와 가장 가깝다. 조사한 시스템 중 (a)를 쓰는 곳은 Atlassian뿐이라는 점은 차별점일 수도 있고, 레퍼런스가 적다는 뜻일 수도 있다.
- **개수**: 레퍼런스는 모두 3~6개 범위다. 이 범위를 벗어날 이유가 있는지 묻는다.
- **반례를 원칙 문장에 넣을지**: Atlassian과 Primer처럼 "하지 않는 것"을 원칙 안에 적을지, M3처럼 Do/Caution 예시로 따로 둘지, 아예 넣지 않을지 정해야 한다. Storybook MDX를 쓰므로 Do/Caution 예시를 실제 Component로 렌더링할 수 있다는 점도 고려 대상이다.
- **결정 기록과의 연결**: 조사 범위에서는 원칙과 ADR을 명시적으로 잇는 시스템이 없었다. Tide는 이미 `docs/decisions/`에 ADR을 쓰고 있으므로, ADR에 "근거 원칙" 항목을 둘지는 Tide가 따로 판단할 수 있는 지점이다.
- **층위**: 원칙을 Tide 전체에 하나로 둘지, 접근성처럼 특정 Foundation 전용 원칙을 따로 둘지 묻는다. 맵에서 이미 확정한 WCAG 2.2 AA 최소 기준은 M3의 "Requirements as a starting point"나 SEED의 "'배려'가 아니라 '기준'"과 같은 방향이다.
- **원칙끼리의 충돌**: 범용 시스템은 일관성과 유연성이 자주 부딪힌다(Carbon의 modular and flexible 대 builds consistency, Radix Themes의 closed 대 Primitives의 Opened). Component 공통 API 규칙 티켓에서 다룰 className 충돌 처리처럼 Tide에서 실제로 부딪힐 결정을 grilling에서 시험 문제로 쓸 수 있다.
- **이중 언어**: SEED가 영문 제목에 한글 설명을 붙인 방식은 "한글 우선, 영문 병행"이라는 Tide 조건과 바로 비교할 수 있는 사례다.
