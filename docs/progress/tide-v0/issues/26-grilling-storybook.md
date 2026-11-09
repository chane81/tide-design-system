# Storybook 문서 구성 결정

Type: grilling
Status: open
Blocked by: 25

## Question

공개 문서 사이트의 구조와 운영 방식을 정한다.

- 사이드바 정보 구조: 원칙(Principle) · Standard · Foundation · Component 순서와 페이지 단위. GLOSSARY 용어와 맞춘다
- 페이지마다 MDX로 쓸 것과 stories로 쓸 것의 경계. Component 문서 템플릿(설명, 사용 시점, 접근성, props 표, Do/Don't)
- Token 시각화 방식: 직접 만든 블록인지, Storybook Docs 블록인지. 원본(Token TS 객체)에서 자동으로 만드는지
- Theme 전환 UI와 기본 Theme, 전환 시 transition 끄기
- 원칙별 Do/Don't 예시를 실제 Component로 렌더링하는 방식
- 가이드 페이지 목록: 설치(Next.js App Router), 폰트 로드, Theme 전환, `scroll-padding-top`, 아이콘 사용
- 아이콘 검색 페이지 구성
- 한글 우선·영문 병행을 문서에서 어떻게 할지(v0는 한글만인지)
- 배포처와 배포 시점

### 참고 (다른 티켓에서 넘어온 것)

- 「Storybook 문서 사이트 구성 조사」(25번)의 결과를 근거로 쓴다.
- 「모노레포 패키지 구조와 빌드 결정」: Storybook은 private `apps/docs`이고 `react-docgen` 기본값을 쓴다.
