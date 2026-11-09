# 테스트 도구와 방식 조사

Type: research
Status: open
Blocked by: 없음

## Question

Tide의 테스트 전략을 정하기 위해 확인할 사실을 모은다. 실제 최신 안정 버전을 npm에서 확인하고, context7이나 공식 문서로 검증한 뒤 근거 버전을 적는다.

1. vitest 최신 버전의 Browser Mode(Playwright provider) 현황과, jsdom/happy-dom 대비 React Aria hooks 위젯 테스트에 무엇이 맞는지
2. Storybook의 vitest 연동(stories를 테스트로 돌리는 addon)의 현재 이름과 동작. interaction test, a11y 검사를 CI에서 돌리는 방법
3. 접근성 자동 검사: axe-core 최신 버전이 잡는 것과 못 잡는 것(키보드, 포커스 순서 등). WCAG 2.2 규칙 지원 범위
4. 시각 회귀 테스트 선택지: Chromatic, Playwright screenshot, vitest browser screenshot 등. 비용, 오픈소스 무료 범위, flaky 원인(폰트 렌더링)
5. forced-colors 모드를 테스트에서 에뮬레이션하는 방법(Playwright `forcedColors` 옵션 등). 「그림자·포커스 표시·motion 시각 비교」(24번)에서 확인하지 못한 항목
6. `prefers-reduced-motion` 에뮬레이션 방법
7. Token 대비 쌍 128개 CI 검사(「컬러 Foundation 결정」)를 어떤 도구로 돌릴지: 직접 만든 스크립트 + vitest로 충분한지
8. `pnpm pack` tarball을 Next.js 앱에 설치하는 smoke test 사례(`"use client"` 보존, d.ts nodenext 해석). CI에서 걸리는 시간
9. GitHub Actions에서 위 검사를 Turborepo 캐시와 함께 돌리는 구성

결과는 `docs/research/testing.md`에 main 브랜치로 커밋한다.
