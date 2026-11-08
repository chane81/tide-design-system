# 타이포그래피 Foundation 결정

Type: grilling
Status: resolved
Blocked by: 04, 10

## Question

기본 폰트와 fallback 스택, 웹폰트 배포 방식, 타입 스케일(단계 수, 크기, 행간, 자간), 텍스트 스타일 Token의 이름과 Utility class 노출 방식을 결정한다.

### 참고 (다른 티켓에서 넘어온 것)

- 「Token 네이밍과 Utility class 노출 규칙 결정」: 공개 계약은 `--tide-<class 이름>`이고, Tailwind 쪽은 표준 namespace(`--text-*`, `--leading-*` 등)에 연결한다. `text-*`는 색(`text-default`, `text-muted`, `text-primary` 등)과 font size가 같은 접두를 쓰므로, 크기 단계 이름이 색 Token 이름과 겹치지 않게 정한다. 커스텀 크기 이름은 tailwind-merge 설정에 등록되도록 TS 원본에 둔다.

## Answer

텍스트는 **Semantic 텍스트 스타일**로만 Utility class에 노출한다. 스타일 하나가 크기, 행간, 굵기를 한 번에 정한다. ADR 0003의 규칙(TS 원본, `--tide-*` 공개 계약, 빌드 CSS를 CI로 확인)을 그대로 따르므로 새 ADR은 만들지 않았다.

### 폰트와 로드

- **기본 폰트**: Pretendard Variable. 스택은 Pretendard README의 "어디서나 같은 모습" 순서를 따른다: `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", 이모지 폰트, sans-serif`. 11,172자를 다 담고, 공식 동적 subset과 `tnum`을 제공해서 골랐다. 플랫폼마다 모양이 같아 Component 높이 검증 대상도 하나가 된다.
- **font-family Token**: `sans`(위 스택), `mono`(시스템 고정폭 스택, 웹폰트 없음) 두 개만 둔다. Tailwind 기본 `font-serif`는 지운다.
- **웹폰트 로드**: Tide는 font-family 이름만 제공하고 웹폰트는 앱이 로드한다. Tide 패키지에 폰트 파일이나 `@font-face`를 넣지 않는다(`pretendard` npm은 압축 해제 시 97.7MB). Storybook 문서에 next/font/local과 CDN 가변 동적 subset 예시를 둔다.

### 단위

- 크기와 행간은 **rem**으로 정한다. 루트 `font-size`는 바꾸지 않는다(16px). 그래야 Tailwind 숫자 간격 규칙(ADR 0002)과 WCAG 1.4.4 텍스트 크기 조정을 함께 지킬 수 있다.
- px 고정(static) Token은 두지 않는다.

### Token 층

- **Primitive 크기**: 12, 14, 16, 18, 20, 24, 32, 40px(rem으로 표기)의 8개. TS 원본과 `--tide-*`에만 두고 Utility class로는 노출하지 않는다.
- **Semantic 텍스트 스타일**: Tailwind `--text-<이름>`에 `--text-<이름>--line-height`와 `--text-<이름>--font-weight`를 함께 정의해 `text-<이름>` class 하나로 노출한다. 근거: Tailwind v4 공식 문서 `font-size.mdx`(tailwindcss.com main 브랜치, context7로 조회). Tailwind 기본 `text-xs`~`text-9xl`은 `--text-*: initial`로 지운다.
- 스타일 이름은 컬러 class(`text-default`, `text-muted`, `text-<role>`)와 겹치지 않는다. TS 원본에서 tailwind-merge 설정(`text` 그룹)을 만든다.
- 공개 계약 예: `--tide-text-body-md`.

### 텍스트 스타일 11개

| 스타일 | 크기/행간 (px) | 행간 비율 | 굵기 | 용도 |
| --- | --- | --- | --- | --- |
| `heading-xl` | 40/48 | 1.2 | 700 | 페이지 제목 |
| `heading-lg` | 32/40 | 1.25 | 700 | |
| `heading-md` | 24/32 | 1.33 | 700 | |
| `heading-sm` | 20/28 | 1.4 | 600 | 작은 제목 |
| `body-lg` | 18/28 | 1.56 | 400 | 본문 |
| `body-md` | 16/24 | 1.5 | 400 | 기본 본문 |
| `body-sm` | 14/20 | 1.43 | 400 | |
| `label-lg` | 16/20 | 1.25 | 500 | 버튼, 입력창, 탭 같은 한 줄 UI 텍스트 |
| `label-md` | 14/20 | 1.43 | 500 | |
| `label-sm` | 12/16 | 1.33 | 500 | |
| `caption` | 12/16 | 1.33 | 400 | 보조 설명 |

- 행간은 4px 격자를 따른다. 본문은 1.5 근처이고, 제목은 커질수록 좁아진다(리서치의 국내 관례).
- display(마케팅용 초대형)는 두지 않는다(③ 단순함).
- 값의 미세 조정은 spec 단계에서 Storybook 렌더링을 보고 한다.

### 굵기

- Token은 `light 300`, `normal 400`, `medium 500`, `semibold 600`, `bold 700`의 5개다. Tailwind 기본 `--font-weight-*`는 `initial`로 지운다. 자동완성에는 이 다섯 개만 뜬다.
- 텍스트 스타일 기본값으로는 400/500/600/700만 쓴다. light 300은 class로만 쓴다.

### 그 밖의 규칙

- **자간**: 모든 스타일이 0이다. `--letter-spacing` 보조 변수는 쓰지 않는다(klreq, KRDS, SEED 현행 토큰과 같음).
- **반응형**: v0는 고정 스케일이다. 바꿔야 하면 앱이 `md:text-heading-xl`처럼 직접 바꾼다.
- **숫자 정렬**: 따로 Token을 두지 않고 Tailwind 기본 `tabular-nums`를 쓴다.
- **덮어쓰기**: Tailwind 기본 `leading-*`와 `tracking-*`는 지우지 않는다. 드문 경우를 위한 확장 수단으로 남긴다(③ 단순함의 `className` 확장).
- **base CSS**: Tide base layer에 `word-break: keep-all`과 `overflow-wrap: break-word`를 넣는다. 한글은 어절 단위로 줄을 바꾸고, 긴 URL과 영문은 끊긴다.
- **CI**: 빌드한 CSS에 텍스트 스타일 class 11개와 굵기 class 5개가 있는지 확인한다(ADR 0003의 CI 테스트에 추가).

### 다른 티켓에 주는 영향

- 「Component 공통 API 규칙 결정」: Component 내부 텍스트는 텍스트 스타일 class만 쓴다. 예를 들어 버튼은 `label-*`을 쓴다.
- Storybook 문서 구성(Not yet specified): 폰트 로드 가이드 페이지와 텍스트 스타일 시각화 페이지가 필요하다.

### 정정 (2026-11-09, 「v0 Component 목록과 우선순위 결정」)

[v0 Component 목록과 우선순위 결정](15-grilling-component-list.md)에서 사용자가 다음과 같이 바꿨다. 위 본문 중 이 정정과 어긋나는 부분은 이 절을 따른다.

- **display를 추가한다.** 앞의 "display는 두지 않는다"를 뒤집는다. 포트폴리오와 랜딩 페이지에 쓸 대형 제목이 필요하다는 사용자 결정이다.
- **heading을 5단계로 늘린다.** 맨 아래에 `heading-xs`를 추가했다.
- 텍스트 스타일은 11개에서 **14개**가 된다(display 2, heading 5, body 3, label 3, caption 1). 이름은 기존 접미사 규칙을 따른다.
- **Primitive 크기**에 48과 56을 더해 10개가 된다(12, 14, 16, 18, 20, 24, 32, 40, 48, 56px).
- **CI**는 텍스트 스타일 class 14개를 확인한다.

| 스타일 | 크기/행간 (px) | 굵기 | 용도 |
| --- | --- | --- | --- |
| `display-lg` | 56/64 | 700 | 랜딩, 히어로 |
| `display-md` | 48/56 | 700 | |
| `heading-xs` | 18/28 | 600 | 가장 작은 제목. `body-lg`와 크기는 같고 굵기만 다르다 |

- Typography Component의 기본 요소 매핑(`display-*`와 `heading-xl`은 `h1`, `heading-lg`부터 `heading-xs`까지는 `h2`~`h5` 등)은 그 티켓의 Answer에 있다.

## Comments

- 2026-11-08 grilling 진행. 굵기 Token은 처음에 3개(400/500/700)를 제안했으나, 사용자가 light 300부터 bold 700까지 5개로 바꿨다. 그에 맞춰 `heading-sm`을 600으로 조정했다.
