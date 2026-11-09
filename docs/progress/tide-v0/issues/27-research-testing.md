# 테스트 도구와 방식 조사

Type: research
Status: resolved
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

## Answer

결과: [docs/research/testing.md](../../../research/testing.md) (기준 vitest 5.1.0, playwright 1.65.0, axe-core 4.14.0, storybook 10.6.6, turbo 2.11.10, 2026-11-09 확인)

- Browser Mode는 Vitest 4.0부터 정식이고 provider는 `@vitest/browser-playwright`. jsdom에는 `matchMedia`가 없고, jsdom·happy-dom 모두 레이아웃 크기가 0이라 axe 대비 검사가 `incomplete`로 끝남. 실제 브라우저에서는 위반을 잡음(실험). 다만 React Aria 공식 테스트 문서와 `@react-aria/test-utils`(1.0.0-rc.1)는 jsdom + user-event를 전제로 함
- Storybook 연동은 `@storybook/addon-vitest`(`vitest --project=storybook`). a11y는 `parameters.a11y.test: 'error'`일 때만 CI 실패. `play`의 `userEvent`는 이벤트를 흉내 내는 방식이라 Vitest의 CDP 실제 이벤트와 다름
- axe-core는 평균 57%를 자동 검출한다고 밝힘. WCAG 2.2 규칙은 `target-size` 하나(기본 꺼짐). 1.4.11·2.4.7·2.4.11·2.4.3·2.1.2는 규칙 없음. 키보드로 닿을 수 없는 `role="button"`도 못 잡음(실험)
- 시각 회귀: Chromatic Free 월 5,000 snapshot(Chrome만, 한도에서 멈춤), Argos Hobby 월 5,000장, Vitest·Playwright 스크린샷은 무료(기준 이미지 저장소 보관). flaky 주원인은 OS·폰트 렌더링이고 기준 이미지 이름에 플랫폼이 붙음
- **forced-colors(24번에서 넘어온 항목)**: Playwright `forcedColors: 'active'`로 Chromium·Firefox는 렌더링까지 바뀜(투명 border·outline이 검정, 그림자 사라짐). WebKit은 미디어 쿼리만 바뀜. Vitest는 instance별 `contextOptions`로 켤 수 있음
- `reducedMotion: 'reduce'`는 세 브라우저 모두 CSS 결과까지 바뀜
- 대비 쌍 128개는 Node에서 직접 만든 스크립트 + Vitest로 충분(약 0.2ms). culori·wcag-contrast는 W3C 공식과 같고 colorjs.io는 넷째 자리부터 다름. WCAG는 반올림 금지라 경계값에서 판정이 바뀔 수 있음
- tarball smoke test: 최소 구성 로컬 측정은 설치 1.2초, nodenext `tsc` 0.5초, `next build` 2.8초. `"use client"`를 지우면 `next build`가, d.ts 확장자를 빼면 `tsc`(TS2835)·attw가 실패함(대조 실험)
- GitHub Actions: Vercel Remote Cache(무료)나 `actions/cache`로 `.turbo` 저장, `--affected`로 바뀐 패키지만. 환경 변수는 Strict 모드. Playwright는 브라우저 캐시 대신 `--with-deps --only-shell`이나 공식 컨테이너
- 확인 불가 항목은 문서의 「확인 불가 목록」에 있음. 28번 쟁점: Browser Mode와 jsdom의 층 나누기, interaction test 위치(`play` vs `*.test.tsx`), axe가 못 잡는 부분을 채울 단언, 시각 회귀 도구와 촬영 수, smoke test·캐시·브라우저 설치 CI 구성
