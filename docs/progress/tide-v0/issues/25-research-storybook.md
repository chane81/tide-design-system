# Storybook 문서 사이트 구성 조사

Type: research
Status: open
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
