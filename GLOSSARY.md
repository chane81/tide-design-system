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

**접근성 동작 (Accessibility behavior)**:
Component가 키보드, 포커스, 보조기술에 반응하는 방식. 예: Dialog를 열면 포커스가 안으로 들어가고 닫으면 원래 자리로 돌아간다. 생김새(시각 표현)와 구분한다.
_Avoid_: a11y 로직, 인터랙션(시각 효과와 혼동)

## Token 종류

**Primitive Token**:
용도와 무관하게 값 자체를 가리키는 Token. 색 계열 이름은 용도가 아니라 색상으로 짓는다. 예: `blue-500`, `red-600`, spacing `24`.
_Avoid_: 원시값, base token, global token

**Semantic Token**:
용도를 이름으로 가지는 Token. 값은 Primitive Token을 참조하고, 테마가 바뀌면 참조 대상만 바뀐다. 예: `bg-primary-solid`, `text-muted`.
_Avoid_: alias token, 의미 토큰

**Utility class**:
Token에 연결된 Tailwind 클래스. 사용자가 `className`에 직접 쓴다. 예: `w-24`, `bg-primary-solid`.
_Avoid_: 헬퍼 클래스, 스타일 클래스

**Role (역할)**:
Semantic Token이 나타내는 의미 범주. `neutral`, `primary`, `success`, `warning`, `danger`, `info` 여섯 가지다. 같은 Role의 Token은 같은 Primitive 계열을 참조한다.
_Avoid_: 컬러 그룹, intent, tone

**강도 (Emphasis)**:
같은 Role 안에서 배경색이 얼마나 강한지를 나타내는 구분. `solid`(진한 배경, 흰 글자)와 `subtle`(옅은 배경, 역할색 글자) 두 가지다. 이름에 항상 적고 생략하지 않는다.
_Avoid_: variant(Component 스타일 축과 혼동), weight, tone

**표면 층 (Surface level)**:
요소가 놓이는 바닥의 높이. `canvas`(페이지 배경), `surface`(카드, 패널), `raised`(popover, dropdown, modal) 세 가지다.
_Avoid_: elevation(그림자 형태 Foundation과 혼동), layer(Layer와 혼동)

**대비 쌍 (Contrast pair)**:
실제로 함께 쓰는 전경 Token과 배경 Token의 짝. 대비 검사는 모든 조합이 아니라 등록된 대비 쌍만 대상으로 한다.
_Avoid_: 색 조합, 컬러 페어

**Theme**:
Semantic Token이 어떤 Primitive Token을 참조할지 정한 묶음. 예: light, dark.
_Avoid_: 모드, 스킨

**텍스트 스타일 (Text style)**:
글자 크기, 행간, 굵기를 용도에 맞게 하나로 묶은 Semantic Token. `heading`, `body`, `label`, `caption` 네 범주가 있다. 예: `text-body-md`, `text-label-sm`. `label`은 버튼이나 입력창처럼 한 줄로 쓰는 UI 텍스트이고, `body`는 읽는 글이다.
_Avoid_: 타이포 토큰, font style, 텍스트 크기(크기 하나만 뜻하는 Primitive와 혼동)
