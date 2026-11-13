# 한글 타이포그래피 조사

Type: research
Status: resolved
Blocked by: 없음

## Question

한글을 우선으로 하는 UI의 폰트 후보(Pretendard, Spoqa Han Sans Neo, SUIT, Noto Sans KR 등)를 비교한다. 비교 항목은 라이선스, 가변 폰트 지원, 웹폰트 용량과 subset 방식이다. 함께 한글 본문과 제목의 행간·자간 관례, 국내 디자인 시스템 사례의 타입 스케일, 영문과 섞어 쓸 때 고려할 점을 1차 출처로 정리한다.

## Answer

- 네 후보 모두 SIL OFL 1.1이다. 가변 폰트는 Pretendard(`wght` 45–930), SUIT(100–900), Noto Sans KR(100–900)에 있고 Spoqa Han Sans Neo에는 없다.
- 현대 한글 11,172자를 웹폰트로 다 주면서 unicode-range 동적 subset까지 공식 제공하는 것은 Pretendard(92조각)와 Noto Sans KR(Google Fonts, 124조각)뿐이다. SUIT(2,668자)와 Spoqa(2,574자)의 웹폰트는 KS X 1001 2,350자에 일부 음절만 더한 구성이다.
- 국내 디자인 시스템 한 곳은 11–48px 스케일(14단계), rem 단위, 굵기 400/500/700을 쓴다. 글꼴은 시스템 폰트를 우선하고 Windows에서만 Pretendard를 권장한다. 다른 국내 사례 두 곳도 본문 행간은 1.5 근처, 제목은 1.25–1.4다.
- 자간은 klreq와 국내 사례 현행 토큰 모두 기본 0이다. 영문을 섞어 쓸 때는 라틴 글리프 출처, 세로 메트릭(hhea 1.19–1.45em), `tnum` 지원, `word-break: keep-all`을 고려해야 한다.

리서치: [docs/research/korean-typography.md](../../../research/korean-typography.md)
