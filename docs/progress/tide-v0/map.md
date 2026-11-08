# Tide v0 지도

Label: wayfinder:map

## Destination

Tide v0를 `/to-spec`에 넘길 수 있는 상태. 원칙(Principle)은 최종 문안이 `docs/principles/`에 완성되어 있고, Foundation과 Component는 결정이 모두 끝나 있다. Component는 목록, 우선순위, 공통 API 규칙까지만 정한다. 컴포넌트별 세부 API는 spec 단계에서 정한다.

## Notes

- **도메인**: `#3183f5`(blue)를 primary로 하는 범용 디자인 시스템. 개인 사이드 프로젝트이자 포트폴리오이며 npm에 공개 배포한다. 한글을 우선으로 하고 영문을 병행한다.
- **먼저 읽을 것**: `GLOSSARY.md`, `docs/decisions/`(ADR), `docs/research/`
- **grilling 티켓**: Skill `mattpocock-skills:grilling`과 `mattpocock-skills:domain-modeling`을 함께 호출한다.
- **research 티켓**: 결과는 `docs/research/<주제>.md`에 main 브랜치로 커밋한다. 별도 `research/*` 브랜치는 만들지 않는다(wayfinder 기본 동작을 바꾼 부분).
- **라이브러리 API**: 기억에 의존해 추측하지 않는다. 실제 버전을 확인한 뒤 context7 또는 공식 문서로 검증하고, 근거가 된 버전을 문서에 적는다.
- **"Plan, don't do"의 예외**: 원칙(Principle)은 지도 안에서 최종 문안까지 `docs/principles/`에 작성한다. 파운데이션과 컴포넌트는 결정만 한다.
- **모든 문서는 한글로 작성한다.**

### 지도를 그리면서 이미 확정한 것

- [ADR 0001](../../decisions/0001-framework-agnostic-tokens-react-components.md): Token/CSS는 프레임워크 무관, v0 Component는 React 전용
- [ADR 0002](../../decisions/0002-monorepo-tailwind.md): pnpm workspace 모노레포와 Tailwind. Component를 쓰는 앱도 Tailwind가 peer로 필요함. 기본 컬러 팔레트는 교체하고, 간격은 Tailwind 숫자 규칙을 유지함
- Token은 Primitive와 Semantic 두 층으로 나눔. light와 dark Theme 모두 v0에 포함함
- Component 내부의 색은 Semantic Token만 씀
- 접근성은 WCAG 2.2 AA를 최소 기준으로 삼음
- `#3183f5`는 브랜드 기준색으로 스케일 안에 둠. 흰색 대비가 약 3.7:1이라 AA에 못 미치므로, 텍스트와 solid 배경에는 더 진한 단계를 씀
- 공개 문서 사이트는 Storybook 하나로 함(MDX 사용)
- Tailwind는 최신 안정 버전을 씀. className 충돌 처리는 Component 공통 API 규칙 티켓에서 다룸
- **배포 목표**: npm scope는 `@tide-tds`. Next.js(App Router) 앱에서 `@tide-tds/<패키지>`로 import해 바로 쓸 수 있어야 함. 패키지 이름 목록은 "모노레포 패키지 구조와 빌드 결정" 티켓에서 정함
- 리서치 대상: Material 3, IBM Carbon, Atlassian, GitHub Primer, Radix Colors/Themes, 당근 SEED Design

## Decisions so far

<!-- 닫힌 티켓마다 한 줄: [티켓 제목](issues/NN-slug.md): 답 요약 -->

- [레퍼런스 디자인 시스템의 원칙 조사](issues/01-research-principles.md): 시스템마다 원칙은 3~6개. "A가 B보다 우선" 형식을 기본으로 쓰는 곳은 Atlassian뿐. 원칙과 ADR을 연결한 사례는 없음
- [컬러 시스템과 Token 구조 조사](issues/02-research-color-token.md): 스케일은 10~12단계. `#3183f5`의 흰색 대비는 3.69:1. 생성 알고리즘 결과가 원래 hex와 정확히 맞지 않으므로 앵커 단계는 원래 값으로 고정해야 함. 생성 방법 후보 5가지 정리
- [Tailwind theme 노출과 자동완성 조사](issues/03-research-tailwind.md): Tailwind 4.3.5. `@theme`와 `--color-*: initial`로 기본 팔레트만 교체할 수 있음. node_modules는 `@source`로 등록해야 스캔됨. 커스텀 이름은 tailwind-merge에 직접 등록해야 함
- [한글 타이포그래피 조사](issues/04-research-korean-typography.md): 11,172자 전체와 동적 subset을 공식 제공하는 폰트는 Pretendard와 Noto Sans KR뿐. 본문 행간 약 1.5, 자간 0
- [모노레포 툴링 조사](issues/05-research-monorepo-tooling.md): 최신 버전끼리 충돌은 없음. TS 7에 프로그래밍 API가 없어 TS 6 병행 여부가 쟁점. d.ts 생성은 별도 도구가 필요함. oxfmt는 아직 beta
- [레퍼런스 Component 구성과 공통 API 관례 조사](issues/06-research-component-conventions.md): 초기 버전 Component는 26~44개. 스타일 축은 `variant`가 가장 흔함. shadcn은 새 프로젝트 기본값을 Base UI로 바꿈. Radix에는 약 10개월 릴리스 공백이 있었음
- [Tide 원칙 확정](issues/07-grilling-principles.md): 원칙 4개를 "A가 B보다" 형식으로 정함. ① 접근성 > ② 명확함 > ③ 단순함 > ④ 발견할 수 있음. WCAG는 Standard로 분리했고, ADR마다 근거 원칙을 적음
- [컬러 스케일 후보 시각 비교](issues/08-prototype-color-scale.md): A(OKLCH L 계단, 50~950의 11단계, blue 500은 `#3183f5`로 고정)를 채택함. 모든 계열에서 흰 배경 4.5:1을 처음 넘는 단계는 600. gray 초안, 상태색 hue, dark 반전 매핑은 문제없다고 봄
- [Next.js App Router 호환성 조사](issues/17-research-nextjs-consumption.md): Next.js 16.4.5. Vite 8 기본 빌드는 `"use client"`를 지우므로 `preserveModules` 등이 필요함. 컴파일된 ESM dist를 배포하면 `transpilePackages`가 필요 없음. 폰트는 앱이 로드함

## Not yet specified

- **Foundation 세부 값**: 간격 기본 단위, radius, elevation/shadow, motion, breakpoint, z-index. 어떤 항목을 v0에 넣을지는 "v0 Foundation 범위" 티켓에서 정하고, 그 결과에 따라 항목별 티켓으로 나눔.
- **아이콘 전략**: 직접 만들지, 외부 세트를 쓸지, 어떤 형식으로 배포할지.
- **Storybook 문서 구성**: 원칙, 파운데이션, 컴포넌트 페이지의 MDX 구조와 토큰 시각화 방식. 원칙별 Do/Don't 예시를 실제 Component로 렌더링하는 것도 포함.
- **테스트 전략**: vitest로 어디까지 테스트할지, 시각 회귀 테스트와 접근성 자동 검사를 넣을지.
- **버전과 배포 정책**: changesets 등 릴리스 흐름, v0의 semver 정책.

## Out of scope

- Vue, Svelte 등 React 외 프레임워크용 Component (ADR 0001)
- Storybook 외 별도 문서 사이트
- 특정 서비스 전용 Component
