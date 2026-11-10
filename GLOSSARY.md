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
Semantic Token이 나타내는 의미 범주. `neutral`, `primary`, `success`, `warning`, `danger`, `info` 여섯 가지다. 같은 Role의 Token은 같은 Primitive 계열을 참조한다. Component에서는 `color` prop으로 Role을 고른다.
_Avoid_: 컬러 그룹, intent, tone

**강도 (Emphasis)**:
같은 Role 안에서 배경색이 얼마나 강한지를 나타내는 구분. `solid`(진한 배경, 흰 글자)와 `subtle`(옅은 배경, 역할색 글자) 두 가지다. 이름에 항상 적고 생략하지 않는다.
_Avoid_: variant(Component 스타일 축과 혼동), weight, tone

**표면 층 (Surface level)**:
요소가 놓이는 바닥의 높이. `canvas`(페이지 배경), `surface`(카드, 패널), `raised`(popover, dropdown, modal) 세 가지다.
_Avoid_: elevation(그림자 형태 Foundation과 혼동), layer(Layer와 혼동)

**Elevation**:
그림자로 나타내는 깊이 단계. `sm`, `md`, `lg` 세 단계이고 `raised` 표면 층에서만 쓴다. 표면 층은 "어느 바닥에 놓이는가", Elevation은 "그 바닥이 얼마나 떠 보이는가"다.
_Avoid_: 표면 층, z-index(겹치는 순서와 혼동)

**쌓임 단계 (Stacking tier)**:
겹치는 요소가 화면 앞뒤로 놓이는 순서의 구분. 뒤에서부터 `sticky`, `modal`, `popover`, `toast`, `tooltip`이다. 표면 층은 "어느 바닥 위에 놓이는가", Elevation은 "얼마나 떠 보이는가", 쌓임 단계는 "무엇이 앞에 그려지는가"다.
_Avoid_: 층(Layer와 혼동), level(표면 층과 혼동), elevation(그림자와 혼동)

**포커스 표시 (Focus indicator)**:
포커스가 어느 요소에 있는지 보여주는 시각 표시. 세 종류다. **ring**은 요소 바깥에 간격을 두고 선을 그린다. **field**는 입력창의 테두리 색과 두께를 바꾼다. **highlight**는 목록 안 항목(Menu 항목, Select 옵션)의 배경과 글자색을 바꾼다. 입력창은 field, 목록 안 항목은 highlight, 나머지는 ring을 쓴다.
_Avoid_: focus ring(ring 한 종류만 가리킬 때만 씀), 포커스 테두리

**대비 쌍 (Contrast pair)**:
실제로 함께 쓰는 전경 Token과 배경 Token의 짝. 대비 검사는 모든 조합이 아니라 등록된 대비 쌍만 대상으로 한다.
_Avoid_: 색 조합, 컬러 페어

**Theme**:
Semantic Token이 어떤 Primitive Token을 참조할지 정한 묶음. 예: light, dark.
_Avoid_: 모드, 스킨

**텍스트 스타일 (Text style)**:
글자 크기, 행간, 굵기를 용도에 맞게 하나로 묶은 Semantic Token. `display`, `heading`, `body`, `label`, `caption` 다섯 범주가 있다. 예: `text-body-md`, `text-label-sm`. `display`는 랜딩 페이지 같은 곳에 쓰는 가장 큰 제목이다. `label`은 버튼이나 입력창처럼 한 줄로 쓰는 UI 텍스트이고, `body`는 읽는 글이다.
_Avoid_: 타이포 토큰, font style, 텍스트 크기(크기 하나만 뜻하는 Primitive와 혼동)

## Component API

**Variant**:
Component마다 정의되는 주된 스타일 축. 값 집합은 Component 종류마다 다르다. 예를 들어 Button은 채움 방식을, Typography는 텍스트 스타일을 값으로 쓴다. 값은 새로 만들지 않고 Foundation에 이미 있는 이름을 쓴다. 색은 Variant가 아니라 Role로 고른다.
_Avoid_: kind, appearance, 강도(Token 쪽 개념과 혼동)

**채움 방식 (Fill)**:
Button류 Component의 Variant 값 집합. `solid`, `subtle`, `outline`, `ghost` 네 가지다. `solid`와 `subtle`은 강도와 이름이 같고, `outline`과 `ghost`는 Component에만 있다.
_Avoid_: kind, appearance, 강도(Token 쪽 개념과 혼동)

**Badge (배지)**:
상태나 분류를 보여주는 짧은 라벨. 사용자와 상호작용하지 않는다.
_Avoid_: lozenge, label(텍스트 스타일 label과 혼동)

**Tag (태그)**:
사용자가 고르거나 입력한 값을 보여주는 짧은 라벨. 필요하면 지울 수 있다. 예: 선택한 필터, 입력한 키워드. 눌러서 켜고 끄는 칩과는 다르다.
_Avoid_: Chip(토글 칩과 혼동), Badge

## 배포

**공개 계약 (Public contract)**:
사용자 코드가 이름으로 기대는 Tide의 표면. CSS 변수, Utility class 이름, 텍스트 스타일 이름, Component와 아이콘의 export·props가 여기에 속한다. 공개 계약을 지우거나 이름·뜻을 바꾸는 것이 breaking change다. 값의 시각적 조정은 공개 계약이 바뀌는 것이 아니다.
_Avoid_: public API(Component props만 떠올리게 함), 인터페이스

**릴리스 (Release)**:
Tide의 모든 배포 패키지를 같은 버전으로 함께 내는 한 번의 배포. 바뀐 것이 없는 패키지도 같은 버전으로 함께 나간다.
_Avoid_: 배포(문서 사이트 배포와 혼동), publish(패키지 하나의 동작)
