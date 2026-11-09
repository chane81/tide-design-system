# Storybook 문서 구성 결정

Type: grilling
Status: resolved
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

## Answer

근거: [docs/research/storybook.md](../../../research/storybook.md)(Storybook 10.6.6). 2026-11-09 grilling으로 정함.

### 정보 구조와 언어

- **사이드바 최상위**: 시작하기 → 원칙 → 기준 → Foundation → Component 순서. GLOSSARY의 Layer와 Standard를 그대로 따른다. Component는 이름순으로 정렬한다(구현 단계 순서가 아님).
- **언어**: v0는 한글만 쓴다. 사이드바 제목도 한글이고, 원칙 제목에만 지금처럼 영문을 병기한다. Component·Token 이름은 코드 그대로 둔다. Storybook 10.6.6의 id `sanitize`는 한글을 그대로 남기므로 URL에 한글이 들어간다(소스 확인). 영문 문서는 v0 이후로 미룬다.
- **시작하기**: 「설치(Next.js App Router)」, 「폰트 로드」(`next/font/local`, CDN 동적 subset), 「Theme 전환」(`data-theme`, transition 끄기) 3페이지. `scroll-padding-top` 가이드는 Foundation/z-index 페이지에, 아이콘 사용 가이드는 Foundation/아이콘 페이지에, 텍스트 스타일 시각화는 Foundation/타이포그래피 페이지에 둔다.

### 페이지 구성

- **Component 페이지**: Component당 MDX 한 페이지(사용법·코드·접근성 하위 페이지로 나누지 않음). 섹션 순서 고정: 설명 → 사용 시점 / 쓰지 않을 때 → 예시 → Do/Don't → 접근성 → props 표(`ArgTypes`, `react-docgen`).
- **MDX와 story의 경계**: 렌더링되는 예시는 Do/Don't를 포함해 모두 CSF story(`*.stories.tsx`)로 만든다. MDX에는 글과 `<Canvas of={...}>`만 둔다. 이유: a11y 자동 검사와 Theme decorator가 story에서만 동작함. 의도적으로 잘못된 Don't story(예: 대비 미달)만 그 story에서 a11y 검사를 끈다.
- **원칙·기준 원문**: `docs/principles/`, `docs/standards/`의 `.md`가 원본이다. Storybook 페이지는 `?raw` import와 `<Markdown>` 블록(`@storybook/addon-docs/blocks`, 10.6.6에 있음)으로 원문을 불러오고, 원칙별 Do/Don't Canvas를 MDX에서 덧붙인다. 원문의 상대 링크(`../standards/`)는 Storybook 경로로 바꾸는 작은 함수가 필요하다.

### Theme

- `@storybook/addon-themes`의 `withThemeByDataAttribute`(`html`, `data-theme`)로 툴바 전환 UI를 둔다.
- story가 없는 MDX 페이지에는 decorator가 닿지 않으므로, preview에서 globals 채널 이벤트(`SET_GLOBALS`/`GLOBALS_UPDATED`)를 구독해 `<html data-theme>`를 바꾼다.
- 툴바와 채널 구독은 같은 함수를 쓴다. 「motion Foundation 결정」의 transition 끄기도 그 함수 한곳에 둔다.
- 기본 Theme은 light. OS 설정(`prefers-color-scheme`)은 따르지 않는다.

### Token 시각화와 아이콘

- **Token 블록**: Storybook 기본 Token 블록(`ColorPalette`, `Typeset`)은 쓰지 않는다. `apps/docs` 안에 직접 블록 5종을 만들고, `@tide-tds/foundation`의 Token TS 원본(ADR 0003)을 import해 자동으로 그린다(손으로 쓴 값 없음).
  - 색 스케일: 값과 흰색·검정 대비비
  - 텍스트 스타일 14개: 크기·행간·굵기
  - radius
  - 그림자: light와 dark 비교
  - motion: duration·easing 재생
- **아이콘 페이지**: Foundation/아이콘 MDX 한 페이지에 직접 만든 검색 블록을 둔다.
  - 이름과 `lucide-static`의 `tags.json`으로 검색하고, 클릭하면 import 문을 복사한다.
  - 가상화 없이 시작한다. 실제 Lucide 데이터로 느리면 그때 넣는다.
  - 검색 메타데이터는 `apps/docs` 빌드 때 만들고, `@tide-tds/icons` 공개 API로 내보내지 않는다.
  - alias를 보여 줄지는 「버전과 배포 정책 결정」을 따른다. → 2026-11-09 정정: alias는 만들지 않는다. 이름은 Tide 이름표를 따르고 본문에 Lucide를 드러내지 않는다(ADR 0007 「정정」 절).

### 배포

- **배포처**: Dokploy, 도메인 `tide-tds.lakegreen.net`(루트 경로). 자체 호스팅이라 저장소가 private이어도 된다. 문서 배포는 저장소 공개 여부와 상관없다.
- **빌드 방식**: mfa-nextjs 방식을 따른다.
  - `apps/docs/Dockerfile`: 1단계 pnpm `storybook build`, 2단계 nginx로 `storybook-static` 서빙.
  - Dokploy Build Type은 `Dockerfile`, Context는 저장소 루트.
  - Dokploy Autodeploy는 끈다(push 배포와 API 배포가 겹치지 않게).
- **트리거**: 릴리스 workflow의 마지막 단계에서 `POST /api/application.deploy`를 호출하고, `deployment.all` 상태로 완료를 판정한다. mfa-nextjs의 `.github/actions/dokploy-deploy` composite action을 복사해 쓴다. 근거: [Dokploy Auto Deploy](https://docs.dokploy.com/docs/core/auto-deploy)(context7 `/websites/dokploy`, 2026-11-09).
- **배포 시점**: 릴리스(npm publish)마다 배포해 문서가 npm `latest`와 맞게 한다. main 머지마다 배포하지 않는다. 첫 공개는 첫 npm publish와 같은 시점.

### 넘긴 것

- a11y 검사를 CI 실패로 다룰지(`parameters.a11y.test` 수준), `runOnly`에 `wcag22aa`를 넣을지는 「테스트 전략 결정」에서 정한다.
- GLOSSARY에 새 용어는 없다. 쉽게 되돌릴 수 있는 결정이라 ADR은 만들지 않는다.
