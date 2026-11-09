# 10: 문서: 시작하기·원칙·기준

Status: ready-for-agent
Blocked by: 03 (Storybook과 브라우저 테스트 골격)

## What to build

앱 개발자가 Storybook 사이드바 맨 위의 「시작하기」를 따라 Next.js App Router 앱에 Tide를 설치하고, 폰트를 로드하고, Theme 전환을 붙인다. 원칙과 기준 문서는 저장소의 원문 그대로 Storybook에서 읽는다.

## 수용 기준

- [ ] 사이드바 순서: 시작하기(설치, 폰트 로드, Theme 전환) → 원칙 → 기준 → Foundation → Component(이름순). v0는 한글만 쓴다.
- [ ] 설치 페이지: `@tide-tds/desktop` 하나 설치, 앱 CSS 두 줄(`@import "tailwindcss"`와 Tide CSS), `transpilePackages` 불필요, 세 패키지를 같은 버전으로 두라는 안내, Tailwind 없이 tokens CSS만 쓰는 방법.
- [ ] 폰트 로드 페이지: `next/font/local`과 CDN 동적 subset 예시.
- [ ] Theme 전환 페이지: `data-theme` 속성 하나로 전환, 요소 단위 Theme, OS 다크 모드를 따를지는 앱이 정한다는 것, 전환 순간 transition 끄는 방법. ThemeProvider는 배포하지 않는다.
- [ ] 원칙과 기준은 저장소의 `.md` 원문을 Markdown 블록으로 불러오고, 상대 링크를 Storybook 경로로 바꾼다. 원문을 고치면 문서에 반영된다.
- [ ] 새 페이지가 `storybook` project 검사를 통과한다.

## Comments
