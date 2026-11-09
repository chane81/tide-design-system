# Storybook 문서 사이트 구성 조사

Type: research
Status: resolved
Blocked by: 없음

## Question

Tide 공개 문서 사이트(Storybook 하나, MDX 사용, private `apps/docs`)를 만들기 위해 확인할 사실을 모은다. 모두 실제 최신 안정 버전을 npm에서 확인하고, context7이나 공식 문서로 검증한 뒤 근거 버전을 적는다.

1. Storybook 최신 안정 버전과 React + Vite 프레임워크 패키지. TS 7 단독 환경에서의 동작(「모노레포 패키지 구조와 빌드 결정」: `react-docgen` 기본값 고정)
2. Tailwind 4.3.x를 Storybook에 연결하는 공식 방법. workspace 패키지(`@tide-tds/foundation`의 `tailwind.css`, desktop `styles.css`)를 읽는 방법
3. MDX 문서 페이지 구성: Docs 블록(ColorPalette, Typeset 등)이 아직 있는지, Token 시각화(색 스케일, 텍스트 스타일 14개, 그림자, radius, motion)를 직접 만든 React 블록으로 하는 사례
4. Theme(light/dark, `[data-theme]`) 전환 방법: 공식 addon(`@storybook/addon-themes` 등)의 현재 API. 전환 순간 transition을 끄는 처리(「motion Foundation 결정」)를 넣을 위치
5. 접근성 addon(`addon-a11y`)의 현재 동작과 axe 버전
6. 아이콘 2,000개 이상(「아이콘 전략 결정」)을 검색하는 페이지를 Storybook 안에서 만들 때의 성능·구성 사례
7. 정적 빌드 배포처(GitHub Pages, Vercel 등)와 base path 설정
8. 레퍼런스 디자인 시스템(Primer, Atlassian, Radix, SEED 등)이 Storybook 또는 문서 사이트에서 원칙·Foundation·Component 페이지를 어떻게 나누는지

결과는 `docs/research/storybook.md`에 main 브랜치로 커밋한다.

### 참고 (다른 티켓에서 넘어온 것)

- 지도의 「Storybook 문서 구성」에 들어갈 가이드: 폰트 로드(next/font/local, CDN 동적 subset), 텍스트 스타일 시각화, 원칙별 Do/Don't를 실제 Component로 렌더링, Theme 전환 시 transition 끄기, sticky 헤더용 `scroll-padding-top`, 아이콘 목록 검색과 사용 가이드.

## Answer

결과: [docs/research/storybook.md](../../../research/storybook.md) (기준 Storybook 10.6.6, 2026-11-09 확인)

- `storybook`·`@storybook/react-vite` 10.6.6(next 11.0.0-beta.0). `react-docgen` 기본값은 TS API를 쓰지 않아 TS 7.0.2 단독으로 빌드가 성공함(실험). `experimentalDocgenServer`는 TS Language Service를 써서 피해야 함
- Tailwind는 `@tailwindcss/vite` + preview에서 CSS import가 공식 방법. foundation `tailwind.css` → desktop `styles.css`(`@source`) 순서로 workspace class가 생성됨. MDX 안의 직접 요소는 `<Unstyled>`가 필요
- ColorPalette·Typeset·IconGallery는 있으나 Typeset은 행간·복수 굵기를 표현하지 못하고, 그림자·radius·motion 블록은 없어 직접 만들어야 함
- `withThemeByDataAttribute` 기본값이 `html`·`data-theme`. 단, story가 없는 MDX 페이지에서는 decorator가 돌지 않음(실측). preview에서 globals channel 이벤트를 구독하면 해결
- addon-a11y는 axe-core 4.14.0. 기본은 WCAG 2.0/2.1 A·AA이고 `wcag22aa`로 추가되는 규칙은 `target-size` 하나. 자동 검사는 story 화면에서만 돌고 docs 페이지에서는 돌지 않음
- 아이콘 2,000개 검색 페이지는 직접 만들어야 함. 가짜 아이콘 실험에서 별도 청크(gzip 86 kB), 약 0.3초 렌더
- 빌드는 `base: "./"`라 하위 경로 배포에 설정이 필요 없음(로컬 확인). GitHub Pages·Vercel 모두 가능
- Primer·Atlassian·Radix·SEED는 원칙 → Foundation → Component 순서지만 공개 문서를 Storybook으로 운영하는 곳은 없음. Component 페이지는 사용 지침/코드/접근성으로 나눔
- `next/font`는 react-vite에서 못 씀 → `preview-head.html`이나 `staticDirs`로 폰트 로드
- 확인 불가 항목은 문서의 「확인 불가」 절에 있음. 26번 쟁점: MDX 페이지 Theme 적용 방식, Token 블록 범위, Do/Don't를 CSF story로 할지, 사이드바 구조, 배포처와 시각 회귀의 관계
