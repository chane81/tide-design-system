# 한글 타이포그래피 조사

- 조사일: 2026-11-08
- 티켓: [04-research-korean-typography](../progress/tide-v0/issues/04-research-korean-typography.md)
- 질문: 한글 우선 UI의 폰트 후보(Pretendard, Spoqa Han Sans Neo, SUIT, Noto Sans KR)를 라이선스, 가변 폰트, 웹폰트 용량과 subset 방식으로 비교한다. 한글 본문·제목의 행간·자간 관례, 국내 디자인 시스템의 타입 스케일, 영문 혼용 시 고려점을 1차 출처로 정리한다.

## 조사 방법

- 각 폰트의 공식 GitHub 저장소, LICENSE 파일, 릴리스 정보를 `gh api`로 확인했다.
- **실측**: 공식 저장소와 Google Fonts에서 배포하는 woff2 파일을 내려받아 fontTools로 cmap(지원 글자 수), `fvar`(가변 축), `hhea`(세로 메트릭), GSUB(OpenType 기능)을 읽었다. 아래에서 "실측"이라고 적은 값은 이 방법으로 얻었고, 바이트 수는 GitHub API가 알려준 파일 크기다.
- 한글 음절 수는 U+AC00–U+D7A3 범위(현대 한글 11,172자)를 셌다. "KS X 1001 2,350자"는 EUC-KR 2바이트로 인코딩되는 음절 집합으로 셌다.
- 이 문서는 조사 결과만 담는다. 결정은 하지 않는다.

## 1. 폰트 비교표

| 항목                                 | Pretendard                                                                      | SUIT                                                   | Spoqa Han Sans Neo                                    | Noto Sans KR                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------- |
| 최신 버전                            | v1.3.9 (폰트 내부 버전 1.309)                                                   | v2.0.5 (폰트 내부 버전 2.040)                          | v3.3.0 (폰트 내부 버전 1.100)                         | Sans 2.004 (Google Fonts 배포본 내부 버전 2.004-H2)              |
| 릴리스 날짜                          | 2023-11-05                                                                      | 2024-07-24                                             | 2021-06-07                                            | 원본 저장소 Sans2.004: 2022-01-27                                |
| 저장소 마지막 커밋                   | 2025-06-28                                                                      | 2024-07-13                                             | 2021-06-07                                            | 2024-09-19                                                       |
| 라이선스                             | SIL OFL 1.1                                                                     | SIL OFL 1.1                                            | SIL OFL 1.1                                           | SIL OFL 1.1                                                      |
| Reserved Font Name                   | Pretendard (+ 원천 서체의 Source, Inter, M PLUS 1)                              | SUIT                                                   | Spoqa Han Sans, Spoqa Han Sans JP, Spoqa Han Sans Neo | Source (Adobe)                                                   |
| 한글 원천                            | 본고딕(Source Han Sans) + Inter + M PLUS 1p                                     | 본고딕(Source Han Sans)                                | 확인 불가 (저장소에 명시 없음)                        | Source Han Sans와 같은 원본(Adobe 저작권 표기)                   |
| 굵기                                 | 9단계                                                                           | 9단계 (Thin–Heavy)                                     | 5단계 (Thin, Light, Regular, Medium, Bold)            | 가변 100–900                                                     |
| 가변 폰트                            | 있음. `wght` 45–930 (CSS는 `45 920`로 선언)                                     | 있음. `wght` 100–900                                   | 없음                                                  | 있음. `wght` 100–900                                             |
| 한글 음절 수(풀 버전)                | 11,172                                                                          | 해당 없음 (풀 버전 배포 없음)                          | 11,172 (Original OTF/TTF에만 있음, woff2 없음)        | 11,172                                                           |
| 한글 음절 수(subset 버전)            | 2,780 (KS X 1001 2,350 + 430)                                                   | 2,668 (KS X 1001 2,350 + 318). 배포본 전체가 이 버전   | 2,574 (KS X 1001 2,350 + 224)                         | 해당 없음 (unicode-range 분할로 대체)                            |
| 웹폰트 1개 굵기 용량 (Regular woff2) | 풀 766KB, subset 267KB                                                          | 168KB                                                  | subset 181KB                                          | 해당 없음                                                        |
| 가변 woff2 단일 파일                 | 2.06MB (풀 글자)                                                                | 625KB                                                  | 없음                                                  | 단일 파일 배포 없음 (원본 TTF 10.4MB)                            |
| 동적 subset (unicode-range 분할)     | 있음. 가변 기준 92조각, 조각당 8–44KB, 전체 합 2.96MB                           | 없음                                                   | 없음                                                  | 있음. Google Fonts가 124조각 제공, 조각당 8–65KB, 전체 합 3.51MB |
| 공식 배포 경로                       | GitHub 릴리스, npm `pretendard`, jsDelivr/cdnjs/UNPKG                           | GitHub 릴리스, npm `@sun-typeface/suit`, jsDelivr      | GitHub 릴리스, npm `spoqa-han-sans`, GitHub Pages CSS | Google Fonts, GitHub `notofonts/noto-cjk`                        |
| npm 패키지 압축 해제 크기            | 97.7MB (`pretendard@1.3.9`)                                                     | 12.2MB (`@sun-typeface/suit@2.0.5`)                    | 확인하지 않음                                         | 해당 없음                                                        |
| 주요 OpenType 기능(실측 GSUB)        | `tnum`, `case`, `frac`, `zero`, `ss01`–`ss16`, `cv01`–`cv13`, `calt`, `locl` 등 | `tnum`, `pnum`, `ss01`, `ss17`, `ss18`, `sups`, `subs` | GSUB 기능 없음                                        | `locl`, `vert`, `vrt2` (조각 하나 기준)                          |
| hhea ascent/descent (UPM)            | 1950 / -494 (2048) → 합 1.19em                                                  | 988 / -260 (1000) → 합 1.25em                          | 970 / -282 (1000) → 합 1.25em                         | 1160 / -288 (1000) → 합 1.45em                                   |

### 출처

- Pretendard
  - 릴리스 v1.3.9 (2023-11-05): https://github.com/orioncactus/pretendard/releases/tag/v1.3.9
  - LICENSE (OFL 1.1, Reserved Font Name 목록): https://github.com/orioncactus/pretendard/blob/main/LICENSE
  - README (9가지 굵기, 가변 글꼴, 동적 subset, 가변 동적 subset, 추천 font-family): https://github.com/orioncactus/pretendard/blob/main/packages/pretendard/README.md
  - 파일 크기: `packages/pretendard/dist/web/static/woff2`, `.../woff2-subset`, `.../variable/woff2`, `.../variable/woff2-dynamic-subset` (태그 v1.3.9): https://github.com/orioncactus/pretendard/tree/v1.3.9/packages/pretendard/dist/web
  - 가변 동적 subset CSS (`font-weight: 45 920`, unicode-range): https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css
  - npm: https://www.npmjs.com/package/pretendard
- SUIT
  - 릴리스 v2.0.5 (2024-07-24): https://github.com/sun-typeface/SUIT/releases/tag/v2.0.5
  - LICENSE (OFL 1.1, Reserved Font Name SUIT): https://github.com/sun-typeface/SUIT/blob/main/LICENSE
  - README ("UI 본문용 폰트", 본고딕 기반, 가변 CSS): https://github.com/sun-typeface/SUIT
  - 파일 크기: https://github.com/sun-typeface/SUIT/tree/main/fonts
  - npm: https://www.npmjs.com/package/@sun-typeface/suit
- Spoqa Han Sans Neo
  - 릴리스 v3.3.0 (2021-06-07): https://github.com/spoqa/spoqa-han-sans/releases/tag/v3.3.0
  - LICENSE (OFL 1.1, Reserved Font Name 목록): https://github.com/spoqa/spoqa-han-sans/blob/master/LICENSE
  - README: https://github.com/spoqa/spoqa-han-sans. README는 "네 가지 굵기"라고 적지만, 저장소의 `Subset/SpoqaHanSansNeo`에는 Thin, Light, Regular, Medium, Bold 다섯 굵기의 woff2가 있다.
  - 공식 웹폰트 CSS는 `Subset` 폴더 파일을 가리킨다: https://github.com/spoqa/spoqa-han-sans/blob/master/css/SpoqaHanSansNeo.css
  - Original(풀 글자)은 OTF/TTF만 있고 굵기당 약 12.5–13.5MB다: https://github.com/spoqa/spoqa-han-sans/tree/master/Original/SpoqaHanSansNeo
- Noto Sans KR
  - 원본 저장소 릴리스 목록 (Sans2.004, 2022-01-27): https://github.com/notofonts/noto-cjk/releases
  - Sans LICENSE (OFL 1.1): https://github.com/notofonts/noto-cjk/blob/main/Sans/LICENSE
  - Google Fonts 메타데이터 (`wght` 100–900, subset 목록, 원본 커밋): https://github.com/google/fonts/blob/main/ofl/notosanskr/METADATA.pb
  - Google Fonts CSS2 API (실측 시 `@font-face` 124개, 경로 `v40`): https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap

### 비교에서 드러난 점

- 네 폰트 모두 SIL OFL 1.1이다. 상업 사용, 임베드, 재배포가 가능하다. 다만 OFL 1.1 3항은 "수정한 버전(Modified Version)은 Reserved Font Name을 쓸 수 없다"고 정한다(Pretendard LICENSE 74–77행). 직접 subset을 만들어 재배포하면 이 조항에 걸리는지 검토해야 한다. OFL FAQ의 해석은 이번에 확인하지 않았다(확인 불가).
- **SUIT와 Spoqa Han Sans Neo의 웹폰트는 현대 한글 11,172자를 다 담지 않는다.** KS X 1001 2,350자는 모두 들어 있지만, 그 밖의 음절은 SUIT 318자, Spoqa 224자만 추가로 있다. 사용자가 입력한 글자(이름, 채팅, 검색어 등)에 없는 음절이 나오면 다음 fallback 폰트로 그려진다. 한 국내 서비스도 같은 문제를 겪었다. 처음에 2,350자 경량판을 만들었다가 채팅 등에서 글자가 빠져 11,172자판으로 바꿨다고 공개 글에서 밝혔다.
- Pretendard와 Noto Sans KR만 "11,172자 + 동적 subset(unicode-range 분할)"을 공식 제공한다. 이 방식에서는 브라우저가 페이지에 쓰인 글자가 든 조각만 내려받는다. 전체 합(2.96MB, 3.51MB)이 한 번에 내려오지는 않는다. 페이지 하나가 실제로 몇 KB를 받는지는 측정하지 않았다.
- Spoqa Han Sans Neo는 2021년 6월 이후 커밋이 없고 가변 폰트도 없다. SUIT는 2024년 7월, Pretendard 폰트 릴리스는 2023년 11월이 마지막이다(Pretendard 저장소 커밋은 2025년 6월까지 있음).
- 세로 메트릭이 폰트마다 다르다. `line-height: normal`이나 버튼 안의 세로 가운데 정렬은 폰트를 바꾸면 달라진다. Noto Sans KR의 hhea 합은 1.45em로 다른 셋(1.19–1.25em)보다 크다.

## 2. 한글 본문·제목의 행간·자간 관례

### 표준 문서

- **W3C 「Requirements for Hangul Text Layout and Typography」(klreq)**, Group Note Draft, 2026-03-21: https://www.w3.org/TR/klreq/
  - 행간(7.4.1): 비례 행간, 고정 줄 높이 등 네 가지 방식을 소개한다. 권장값은 없다. 예시로 글자 크기의 160%를 쓴다.
  - 자간(7.3.1): 한글, 한자, 가나는 기본적으로 글자 사이 간격이 0이라고 적는다.
  - 줄바꿈(7.1.1): 한글로 끝나는 줄은 글자 단위나 어절 단위로 나눌 수 있고, 문단이나 문서 단위로 고른다.
  - 금칙(7.1.2–7.1.3): 닫는 괄호, 하이픈 등은 줄 첫머리에 올 수 없다. 여는 괄호는 줄 끝에 올 수 없다.
- **CSS Text Module Level 3**, Candidate Recommendation Draft, 2026-08-14: https://www.w3.org/TR/css-text-3/
  - `word-break: keep-all`(5.1)은 "단어" 안에서 줄을 나누지 않는다. 명세는 이 방식을 한국어의 또 다른 일반적인 줄바꿈 방식이라고 설명한다. 한국어는 단어 사이에 공백을 쓰기 때문이다.

### 디자인 시스템이 실제로 쓰는 값

국내 디자인 시스템 세 곳을 「국내 시스템 A·B·C」로 부른다. 출처: 공개 디자인 시스템 문서·저장소 3곳(조회일 2026-11-08). 공개 저장소 규칙에 따라 이름·링크는 적지 않는다.

| 출처                                   | 본문 행간                                            | 제목 행간                                                       | 자간                                                                                                                         |
| -------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 국내 시스템 A (공개 토큰 패키지 3.2.0) | 16px/24px = 1.5 (긴 본문), 14px/19px ≈ 1.36 (4단계)  | 26px/35px ≈ 1.35 (화면 제목, 10단계), 48px/60px = 1.25 (14단계) | 현행 토큰에는 자간 항목 없음. 구버전 스타일시트는 Android에서만 큰 제목 -0.04em, 제목 -0.03em, 부제목 -0.02em을 쓰고 iOS는 0 |
| 국내 시스템 B                          | 17px/25.5px = 1.5 (5단계), 15px/22.5px = 1.5 (6단계) | 30px/40px ≈ 1.33 (1단계), 22px/31px ≈ 1.41 (3단계)              | 문서에 명시 없음                                                                                                             |
| 국내 시스템 C (공개 저장소 1.1.0)      | 기본 `line-height: 1.5`                              | 별도 토큰 확인 못 함                                            | `letter-spacing` 토큰은 0과 0.1rem 두 개뿐                                                                                   |
| W3C klreq                              | 예시 160% (권장값 아님)                              | 해당 없음                                                       | 기본 0                                                                                                                       |

정리하면, 확인한 국내 시스템의 본문 행간은 1.5 근처이고 제목은 1.25–1.4로 더 좁다. 크기가 커질수록 비율이 줄어든다. 음수 자간을 시스템 전체에 기본으로 거는 사례는 확인하지 못했다. 국내 시스템 A 구버전이 Android 제목에만 음수 자간을 걸었던 것이 유일하다.

## 3. 국내 디자인 시스템의 타입 스케일

### 국내 시스템 A

- 버전: 토큰·CSS·React 패키지 모두 3.2.0 (2026-11-05 릴리스). 저장소 라이선스 Apache-2.0.
- 출처: 공개 저장소의 font-size·line-height·font-weight 토큰 파일과 타이포그래피 문서

| 토큰            | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  | 11* | 12* | 13* | 14* |
| --------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| font-size(px)   | 11  | 12  | 13  | 14  | 16  | 18  | 20  | 22  | 24  | 26  | 28  | 32  | 40  | 48  |
| line-height(px) | 15  | 16  | 18  | 19  | 22  | 24  | 27  | 30  | 32  | 35  | 38  | 42  | 52  | 60  |

\* 11–14단계는 `sm` breakpoint 이상에서만 쓰도록 권장한다.

- 값은 rem(1rem = 16px)이다. 폰트 스케일링에 반응하지 않는 고정(px) 토큰도 따로 있다. 문서는 고정 단위 대신 rem 같은 상대 단위를 써서 사용자의 폰트 크기 설정을 존중하라고 안내한다.
- font-size와 line-height는 같은 번호끼리 짝을 이룬다. 시맨틱 스타일은 짝을 섞기도 한다. 예를 들어 긴 본문 스타일은 font-size 5단계에 line-height 6단계를 쓴다.
- 굵기 토큰은 regular 400, medium 500, bold 700 세 개다.
- 스케일 스타일 이름은 단계 번호에 굵기를 붙여 만든다. 시맨틱 스타일은 화면 제목, 긴 본문, 본문 주석처럼 용도를 이름으로 쓴다.
- **글꼴**: iOS, Android, macOS는 시스템 기본 글꼴을 쓰고, Windows만 Pretendard를 권장한다. 맑은 고딕과 Segoe UI가 디자인 의도와 어긋나는 경우가 많기 때문이다. 글꼴 CSS 변수는 이름만 나열하고 웹폰트를 내려받지 않는다. 그래서 제품이 Pretendard를 직접 로드해야 하고, 문서는 가변 동적 subset을 권장한다. 스택은 `-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard Variable", Pretendard, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, 이모지 폰트들`이다.
  - 출처: 공개 저장소의 글꼴 안내 문서와 base CSS
- 문서는 시스템 폰트를 쓰기 때문에 같은 medium(500)이라도 iOS(Apple SD Gothic Neo)보다 Android가 조금 더 두껍게 보일 수 있다고 경고한다.

### 국내 시스템 B

- 출처: 공개 문서 사이트의 타이포그래피 페이지 (문서에 버전과 날짜 표기 없음, 2026-11-08 조회)
- 주 단계 7개(1–7단계)와 보조 단계 13개가 11–30px를 1px 간격으로 채운다.

| 토큰            | 1단계        | 2       | 3         | 4         | 5         | 6         | 7                   |
| --------------- | ------------ | ------- | --------- | --------- | --------- | --------- | ------------------- |
| font-size(px)   | 30           | 26      | 22        | 20        | 17        | 15        | 13                  |
| line-height(px) | 40           | 35      | 31        | 29        | 25.5      | 22.5      | 19.5                |
| 용도            | 매우 큰 제목 | 큰 제목 | 일반 제목 | 작은 제목 | 일반 본문 | 작은 본문 | 읽지 않아도 되는 글 |

- 각 토큰을 Light, Regular, Medium, Semibold, Bold 다섯 굵기로 보여준다. 자간과 서체는 문서에 명시가 없다.
- 큰 글씨 설정을 지원한다. iOS는 기본(100%)부터 가장 큰 접근성 크기(310%)까지 단계마다 토큰 크기가 정해져 있다. Android는 100% 이상 어떤 배율이든 "기본 크기 × 배율"로 계산하되 토큰마다 최대 크기가 있다(예: 1단계는 최대 42). 값을 하드코딩하지 말고 토큰을 그대로 쓰라고 안내한다.
- 서체는 회사 전용 서체다. 공개나 라이선스에 관한 언급은 찾지 못했다(확인 불가). 출처: 회사의 서체 소개 글(2021-10-08)

### 국내 시스템 C (공공 UI/UX 디자인 시스템)

- 출처: 공개 저장소 (릴리스 1.1.0, 2026-01-12, 저장소에 라이선스 표기 없음). 토큰 CSS 파일, SCSS 변수와 reset 파일을 읽었다.
- 서체: Pretendard 파생 서체
- 루트 `font-size: 62.5%`로 1rem = 10px다. 본문 기본은 17px다.

| 토큰 (PC)     | display L/M/S | heading XL/L/M/S/XS/XXS     | body L/M/S/XS     |
| ------------- | ------------- | --------------------------- | ----------------- |
| font-size(px) | 60 / 44 / 36  | 40 / 32 / 24 / 19 / 17 / 15 | 19 / 17 / 15 / 13 |

- 모바일은 display 44/32/28, heading 28/24/22/19/17/15이고, body는 PC와 같다.
- 기본 `line-height: 1.5`, `word-break: keep-all`을 `html, body`에 건다.

## 4. 영문과 섞어 쓸 때 고려할 점

- **라틴 글리프의 출처가 다르다.** Pretendard는 라틴 부분이 Inter를 바탕으로 한다(README). SUIT는 한글이 본고딕 기반이라고만 밝히고, 라틴 출처는 README에 없다(확인 불가). Noto Sans KR은 Google Fonts에서 `latin`, `latin-ext` subset을 따로 제공한다(METADATA.pb). 실측한 기본 라틴 영역(U+0250 미만) 글자 수는 Pretendard 525, Spoqa subset 149, SUIT 109였다.
- **크기와 굵기의 시각 보정.** 국내 시스템 B의 회사는 전용 서체를 만들 때 숫자와 영문을 한글보다 조금 크고 두껍게 그렸다. 한글과 같은 두께로 맞추면 숫자와 영문이 너무 얇아 보였기 때문이다(서체 소개 글 2021-10-08). Pretendard README는 "가독성과 시각 보정을 위해 추가적인 작업을 하지 않아도 된다"고 적는다.
- **숫자.** 같은 회사는 실시간 수치 화면을 위해 고정폭과 가변폭 숫자를 함께 마련했다. 실측 결과 Pretendard와 SUIT는 `tnum`을 지원했다. Spoqa Han Sans Neo에서는 GSUB 기능을 하나도 찾지 못했다. 표나 금액처럼 숫자를 세로로 맞춰야 하는 곳에 `font-variant-numeric: tabular-nums`를 쓸 수 있는지는 폰트에 달려 있다.
- **세로 메트릭과 fallback.** 1절 표처럼 hhea 값이 폰트마다 다르다. fallback 폰트로 그려진 글자는 줄 높이와 베이스라인이 어긋날 수 있다. 같은 회사는 여러 플랫폼에서 세로 메트릭이 잘 동작하도록 최적화했다고 밝혔다. klreq는 혼용 시 베이스라인 정렬과 상대 크기를 다루지 않는다.
- **font-family 순서.** Pretendard README는 두 가지 스택을 제시한다.
  - 시스템에 맞추는 스택: `-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard Variable", Pretendard, Roboto, "Noto Sans KR", "Segoe UI", "Malgun Gothic", 이모지 폰트들, sans-serif`
  - 어디서나 같은 모습을 내는 스택: `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", 이모지 폰트들, sans-serif`
  - 국내 시스템 A는 앞의 방식(시스템 우선, Windows만 Pretendard)이다. 국내 시스템 C는 Pretendard 파생 서체 하나에 `sans-serif`를 붙인다.
- **이름이 다른 가변 패밀리.** Pretendard의 가변판은 패밀리 이름이 `"Pretendard Variable"`이고, SUIT 가변판은 `'SUIT Variable'`이다. 스택에 정적판 이름만 적으면 가변판을 로드해도 적용되지 않는다(각 README와 CSS).
- **줄바꿈.** 한국어는 어절 사이에 공백을 쓰므로 `word-break: keep-all`로 어절 단위 줄바꿈을 할 수 있다(CSS Text 3). 국내 시스템 C는 이를 전역에 건다. 단, `keep-all`은 공백 없이 긴 영문이나 URL을 끊지 않는다. 국내 시스템 C는 `word-wrap: break-word`를 함께 건다.

## 5. 확인하지 못한 것

- 국내 시스템 B의 자간 값, 서체 지정, 문서 버전: 공개 문서에 없다.
- 국내 시스템 C 타이포 토큰별 행간: 토큰 파일에서 크기별 행간 토큰을 찾지 못했다. 기본 1.5만 확인했다.
- 동적 subset을 쓸 때 실제 페이지 하나가 내려받는 용량: 측정하지 않았다.
- OFL FAQ가 웹폰트 subset을 "수정 버전"으로 보는지: 이번에 확인하지 않았다.
- Spoqa Han Sans Neo와 SUIT의 라틴 글리프 원천: README에 명시가 없다.

## Tide에 주는 시사점

결정이 아니라, 결정할 때 따져볼 질문과 근거를 모은 것이다.

1. **폰트를 Tide가 직접 배포할지, 이름만 나열할지.** 국내 시스템 A는 글꼴 CSS 변수로 이름만 주고, 웹폰트 로드는 제품에 맡긴다. Tide는 npm에 배포하므로 비슷한 질문이 생긴다. `pretendard` npm 패키지는 압축 해제 크기가 97.7MB라서 Tide의 dependency로 넣는 부담이 크다. CDN이나 peer로 두는 선택지와 비교할 필요가 있다.
2. **11,172자 지원 여부가 후보를 거른다.** 사용자가 입력하는 텍스트를 다루는 범용 시스템이라면, SUIT와 Spoqa Han Sans Neo의 웹폰트는 일부 음절을 fallback 폰트로 그리게 된다. 11,172자와 동적 subset을 공식 제공하는 것은 Pretendard와 Noto Sans KR뿐이었다.
3. **가변 폰트와 굵기 토큰의 관계.** 국내 시스템 A는 굵기 토큰을 400/500/700 세 개만 둔다. 가변 폰트(Pretendard, SUIT, Noto)를 쓰면 중간 값도 쓸 수 있다. 하지만 시스템 폰트 fallback에서는 그 값이 그대로 나오지 않는다. 국내 시스템 A도 medium이 플랫폼마다 다르게 보인다고 경고한다.
4. **행간은 비율보다 px 짝으로 정하는 사례가 많다.** 국내 시스템 A·B 모두 크기마다 행간을 따로 정했다. 본문은 1.5 근처, 제목은 1.25–1.4다. Tailwind의 `text-*` 유틸리티는 font-size와 line-height를 함께 지정할 수 있다. 따라서 Tide의 스케일을 이 형태로 담을 수 있는지 Tailwind 최신 버전 문서로 확인해야 한다(이번 조사 범위 밖, 미확인).
5. **자간은 기본 0이 다수다.** klreq는 한글 기본 자간을 0으로 보고, 국내 시스템 C와 A의 현행 토큰에도 음수 자간이 없다. 제목에 음수 자간을 둘지는 별도로 근거가 필요하다.
6. **rem과 접근성.** 국내 시스템 A는 rem(1rem = 16px)을 쓰고 고정 px 토큰을 따로 둔다. 국내 시스템 C는 루트를 62.5%로 바꿔 1rem = 10px로 쓴다. Tide는 Tailwind의 간격 숫자 규칙을 유지하기로 했다(ADR 0002). 루트 font-size를 바꾸는 방식이 그 규칙과 맞는지 따져봐야 한다. 국내 시스템 B처럼 사용자 글꼴 확대에 대응하는 범위도 WCAG 2.2 AA(1.4.4 텍스트 크기 조정) 기준과 함께 정할 거리다.
7. **세로 메트릭은 폰트에 묶인다.** 버튼이나 입력창의 높이와 세로 가운데 정렬은 폰트를 고른 뒤에 검증해야 한다. Noto Sans KR(1.45em)과 Pretendard(1.19em)는 `line-height: normal` 결과가 크게 다르다.
8. **숫자 표시.** 금액이나 표가 있는 컴포넌트를 만들 계획이라면 `tnum` 지원 여부가 후보 선정 기준이 될 수 있다.
9. **유지보수 상태.** Spoqa Han Sans Neo는 2021년 이후 갱신이 없고 가변 폰트도 없다. 장기 의존성으로 보면 불리하다.
