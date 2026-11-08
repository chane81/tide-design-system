# Tide Design System

`#3183f5`(blue)를 primary로 삼는 범용 디자인 시스템. Principle, Foundation, Component 세 층(Layer)으로 이루어진다.

## 구조

**Layer (층)**:
Tide를 이루는 세 갈래인 Principle, Foundation, Component 중 하나. 아래 층이 위 층의 근거가 된다.
_Avoid_: 레벨, 카테고리

**Principle (원칙)**:
Tide의 모든 결정이 따르는 가치 판단 문장. 예: "명확함이 화려함보다 우선한다."
_Avoid_: 가이드라인, 철학, 규칙

**Standard (기준)**:
통과 여부를 측정할 수 있는 규칙. 예: WCAG 2.2 AA 대비 4.5:1. Principle은 가치 판단이고 Standard는 검증할 수 있는 규칙이다.
_Avoid_: 원칙(Principle과 혼동), 가이드

**Foundation (파운데이션)**:
컴포넌트가 가져다 쓰는 시각 언어. 컬러, 타이포그래피, 간격 등이 여기에 속한다.
_Avoid_: 스타일, 테마, 베이스

**Token (토큰)**:
Foundation을 코드로 표현한, 이름이 붙은 값 하나. Foundation 자체와는 다른 개념이다.
_Avoid_: 변수, 디자인 변수

**Component (컴포넌트)**:
Foundation을 조합해 만든, 재사용할 수 있는 UI 단위.
_Avoid_: 위젯, 엘리먼트

## Token 종류

**Primitive Token**:
용도와 무관하게 값 자체를 가리키는 Token. 예: `blue-500`, spacing `24`.
_Avoid_: 원시값, base token, global token

**Semantic Token**:
용도를 이름으로 가지는 Token. 값은 Primitive Token을 참조하고, 테마가 바뀌면 참조 대상만 바뀐다. 예: `bg-primary`, `text-muted`.
_Avoid_: alias token, 의미 토큰

**Utility class**:
Token에 연결된 Tailwind 클래스. 사용자가 `className`에 직접 쓴다. 예: `w-24`, `bg-primary`.
_Avoid_: 헬퍼 클래스, 스타일 클래스

**Theme**:
Semantic Token이 어떤 Primitive Token을 참조할지 정한 묶음. 예: light, dark.
_Avoid_: 모드, 스킨
