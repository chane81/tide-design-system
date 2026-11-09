# 테스트 도구와 방식

티켓: [27. 테스트 도구와 방식 조사](../progress/tide-v0/issues/27-research-testing.md)

이 문서는 Tide의 테스트 전략을 정하는 데 필요한 사실을 모은다. 다루는 범위는 Component 동작 테스트 환경, Storybook 연동, 접근성 자동 검사, 시각 회귀, forced-colors와 reduced-motion 에뮬레이션, Token 대비 검사, tarball smoke test, GitHub Actions 구성이다. 이 문서는 결정을 내리지 않는다. 시사점만 적고, 결정은 [28. 테스트 전략 결정](../progress/tide-v0/issues/28-grilling-testing.md)에서 한다.

## 조사 기준 버전 (2026-11-09, `npm view`로 확인)

| 패키지 | 최신 안정 버전 | 비고 |
| --- | --- | --- |
| `vitest` | 5.1.0 | `engines.node ^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0`, peer `vite ^6.4.0 \|\| ^7.0.0 \|\| ^8.0.0` |
| `@vitest/browser-playwright` | 5.1.0 | peer `playwright: *`. `@vitest/browser`는 provider 패키지에 포함됨(Vitest 4부터) |
| `@vitest/browser-webdriverio` / `@vitest/browser-preview` | 5.0.0 / 5.1.0 | |
| `vitest-browser-react` | 2.3.0 | peer `vitest ^4 \|\| ^5`, `react ^18 \|\| ^19` |
| `playwright` / `@playwright/test` | 1.65.0 | 2026-11-09 배포. 번들 브라우저: Chromium 158.0.8127.18, Firefox 159.0, WebKit 27.2(실험에서 `browser.version()`으로 확인) |
| `axe-core` | 4.14.0 | 2026-10-05 배포 |
| `@axe-core/playwright` | 4.14.0 | |
| `storybook` / `@storybook/react-vite` | 10.6.6 | |
| `@storybook/addon-vitest` | 10.6.6 | peer `vitest ^4.0.0 \|\| ^5.0.0`, `@vitest/browser-playwright ^4 \|\| ^5` |
| `@storybook/addon-a11y` | 10.6.6 | 의존성 `axe-core ^4.2.0`(설치하면 4.14.0으로 해석됨) |
| `@storybook/test-runner` | 0.26.0 | Jest 30 기반 |
| `chromatic` / `@chromatic-com/storybook` | 18.14.2 / 5.6.0 | |
| `jsdom` / `happy-dom` | 31.0.0 / 21.0.4 | |
| `@testing-library/react` / `user-event` / `dom` | 16.3.3 / 14.6.8 / 10.4.2 | |
| `@react-aria/test-utils` | 1.0.0-rc.1 | 정식 버전 아님. peer `@testing-library/dom ^10`, `user-event ^14` |
| `react-aria` | 3.53.1 | |
| `turbo` | 2.11.10 | |
| `next` | 16.4.5 | |
| `@arethetypeswrong/cli` / `publint` | 0.18.5 / 0.3.25 | attw의 core는 `typescript 5.6.1-rc`를 자체 의존성으로 고정함 |
| `culori` / `colorjs.io` / `wcag-contrast` | 4.0.2 / 0.7.1 / 3.0.0 | `wcag-contrast`는 2022-06 이후 갱신 없음 |

문서는 각 도구의 GitHub 저장소에서 위 버전 태그의 원문을 봤다(Vitest `v5.1.0`, Storybook `v10.6.6`, axe-core `v4.14.0`, Playwright `v1.65.0`, Turborepo `v2.11.10`). context7(`/vitest-dev/vitest/v5.0.3`, 등록된 버전 중 가장 최신)은 교차 확인용으로만 썼다. 가격은 각 서비스의 공식 가격 페이지를 2026-11-09에 확인한 값이다.

실험은 scratchpad에서 했고 저장소에는 파일을 남기지 않았다. 환경: macOS(Darwin 27.2), Node 26.12.1, pnpm 12.11.2. 시간은 모두 **로컬 Mac 측정값**이며 CI 시간이 아니다.

---

## 1. Vitest Browser Mode 현황과 React Aria hooks 위젯 테스트 환경

### Browser Mode 현황 (Vitest 5.1.0)

- **Vitest 4.0에서 `experimental` 표시를 뗐다.** 그때 provider를 별도 패키지로 나눴다(`@vitest/browser-playwright`, `@vitest/browser-webdriverio`, `@vitest/browser-preview`). context는 `vitest/browser`에서 import한다. ([Vitest 4 블로그 "Browser Mode is Stable"](https://github.com/vitest-dev/vitest/blob/v5.1.0/docs/blog/vitest-4.md))
- **Vitest 5.0**은 성능이 중심이다. 공식 벤치마크에서 Browser Mode(Chromium) react-spa(92 모듈)가 2.40s에서 2.01s로 줄었다(−16%). 브라우저 세션을 미리 띄우고 필요한 만큼만 연다. Trace View가 추가됐다. ([Vitest 5 블로그](https://github.com/vitest-dev/vitest/blob/v5.1.0/docs/blog/vitest-5.md))
- **Vitest 5.1**에서 Trace View가 stable이 됐고 실패 시에만 기록하는 `'failure-only'`가 기본값이다. Browser Mode의 모듈 mock은 import map 방식으로 바뀌었다(`browser.importMapMocks`, 실험 기능). ([Vitest 5.1 블로그](https://github.com/vitest-dev/vitest/blob/v5.1.0/docs/blog/vitest-5-1.md))
- 설정: `test.browser.provider: playwright()`, `instances: [{ browser: 'chromium' }]`가 필수다. instance마다 provider 옵션을 따로 줄 수 있다(덮어쓰기이며 병합하지 않음). ([Browser Mode 가이드](https://github.com/vitest-dev/vitest/blob/v5.1.0/docs/guide/browser/index.md), [Configuring Playwright](https://github.com/vitest-dev/vitest/blob/v5.1.0/docs/config/browser/playwright.md))
- Playwright context는 **테스트 파일마다** 새로 만든다. 테스트마다가 아니다. (같은 문서 `contextOptions` 절)
- `userEvent`는 `vitest/browser`에서 가져온다. 이 `userEvent`는 CDP(Playwright)나 WebDriver로 **실제 이벤트**를 보낸다. 공식 문서는 `@testing-library/user-event`를 직접 쓰지 말라고 한다. 이 라이브러리는 이벤트를 흉내 낼 뿐이기 때문이다. `userEvent.tab()`과 `tab({ shift: true })`가 있다. ([Interactivity API](https://github.com/vitest-dev/vitest/blob/v5.1.0/docs/api/browser/interactivity.md))
- React 렌더링은 커뮤니티 패키지 `vitest-browser-react`가 맡는다. 공식 문서에 API 페이지가 있다. ([vitest-browser-react](https://github.com/vitest-dev/vitest/blob/v5.1.0/docs/api/browser/react.md))
- **공식 문서가 밝힌 단점**: E2E 러너를 완전히 대체하지는 못한다. 브라우저를 띄우므로 초기화가 더 걸린다. ([Why Browser Mode](https://github.com/vitest-dev/vitest/blob/v5.1.0/docs/guide/browser/why.md))

### React Aria 공식 문서가 전제하는 환경

[React Aria Testing](https://react-aria.adobe.com/testing) 문서는 Jest와 jsdom, `@testing-library/user-event`를 전제로 쓰여 있다.

- 클릭은 실제로 mousemove, mouseover, mousedown, focus, mouseup, click의 연속이다. 그래서 `user-event`로 고수준 상호작용을 일으키라고 권한다.
- 가짜 타이머를 쓰면 선택 같은 상호작용 뒤에 `act(() => jest.runAllTimers())`가 필요할 수 있다. 그렇지 않으면 `Unable to find an accessible element with the role "listbox"` 같은 실패가 난다고 적혀 있다.
- **jsdom에서 보충해야 하는 것**: 길게 누르기는 `installPointerEvent()`로 PointerEvent를 전역 mock해야 한다. 끌기 위젯(Slider 등)은 `installMouseEvent()`와 함께 `getBoundingClientRect`를 mock해야 한다. jsdom은 레이아웃을 계산하지 않기 때문이다.
- `@react-aria/test-utils`(1.0.0-rc.1)는 ARIA 패턴 tester를 제공한다. 지원 패턴은 CheckboxGroup, ComboBox, Dialog, GridList, ListBox, Menu, RadioGroup, Select, Table, Tabs, Tree다. Tide v0 목록의 hook 위젯(Menu, Select, Tabs, Dialog 등)과 겹친다. 이 패키지는 `@testing-library/user-event`에 의존한다. 따라서 Vitest Browser Mode의 CDP `userEvent`와 함께 쓸 수 있는지는 **확인 불가**다(실험하지 않음).

### 실험: 같은 코드를 jsdom, happy-dom, Browser Mode에서 실행

버튼 두 개, `role="button"`인 `div`(tabindex 없음), 흰 배경 위 `#3183f5` 글자(대비 3.69:1), box-shadow가 있는 요소를 넣고 같은 검사를 돌렸다.

| 항목 | jsdom 31.0.0 | happy-dom 21.0.4 | Browser Mode(Chromium 158) |
| --- | --- | --- | --- |
| `window.matchMedia` | **없음**(`undefined`) | 있음 | 있음 |
| `getBoundingClientRect().width` | 0 | 0 | 실제 값 |
| `PointerEvent` | 있음 | 있음 | 있음 |
| Tab 두 번으로 포커스 이동(`a` → `b`) | 됨(user-event) | 됨(user-event) | 됨(CDP `userEvent.tab`) |
| axe `color-contrast` | **`incomplete`**(판정 못 함) | **`incomplete`** | **`violations`**(잡아냄) |
| `role="button"` div의 키보드 접근 불가 | axe가 잡지 못함 | 잡지 못함 | 잡지 못함 |
| 실행 시간(파일 1개) | 약 50ms | 약 30ms | 프로젝트 2개 합쳐 약 0.85~1.0s |

- 시뮬레이션 환경에서는 레이아웃과 색 계산이 없으므로 axe의 대비 규칙이 판정을 미룬다. 실제 브라우저에서만 위반으로 나온다.
- jsdom에는 `matchMedia`가 없어서 `prefers-reduced-motion`이나 `forced-colors` 분기를 테스트하려면 직접 mock해야 한다. mock은 CSS 적용 결과까지 바꾸지 못한다.

### 시사점

- React Aria hooks 위젯은 포커스 관리, 포인터 이벤트, 위치 계산(Popover)에 기대는 부분이 많다. jsdom에서는 mock으로 메워야 하고, Browser Mode에서는 그럴 필요가 없다. Storybook 문서도 같은 이유로 Browser Mode를 권한다(2절).
- Browser Mode는 브라우저 기동 비용이 있다. 순수 함수(Token 변환, `cn`, variant 맵)는 Node 환경으로 충분하다. 테스트 층마다 환경을 나누는 선택지가 있다(Vitest `projects`).
- React Aria 공식 테스트 문서와 test-utils는 jsdom과 user-event를 기준으로 한다. Browser Mode를 고르면 공식 예시와 다른 길을 가게 된다. 이 점은 결정 티켓에서 비용으로 다룰 만하다.

---

## 2. Storybook의 Vitest 연동: interaction test와 a11y 검사를 CI에서 돌리기

### 이름과 동작 (Storybook 10.6.6)

- 현재 이름은 **`@storybook/addon-vitest`**이고 문서 제목은 "Vitest addon"이다. Vitest 플러그인은 `@storybook/addon-vitest/vitest-plugin`의 `storybookTest()`다. ([Vitest addon](https://github.com/storybookjs/storybook/blob/v10.6.6/docs/writing-tests/integrations/vitest-addon/index.mdx))
- 요구 사항: Vite 기반 Storybook 프레임워크(`react-vite` 등), Vitest 3.0 이상. Next.js에서 쓰려면 `@storybook/nextjs-vite`가 필요하다. Tide는 `apps/docs`가 Vite 기반이므로 해당한다.
- **동작 방식**: Vitest 플러그인이 story를 portable stories로 바꿔 Vitest 테스트로 만든다. 그리고 Playwright Chromium으로 Browser Mode에서 실행한다. story마다 두 가지를 검사한다. ① 렌더링되는지(smoke test). ② `play` 함수가 있으면 실행하고 그 안의 단언이 통과하는지.
- **Storybook을 띄우지 않고 테스트한다.** 이전 방식인 test-runner는 실행 중이거나 배포된 Storybook을 방문해야 했다.
- 기본으로 `test` tag가 붙은 story를 모두 실행한다. `tags` 옵션으로 include, exclude, skip을 조절한다.
- CLI 실행: `"test-storybook": "vitest --project=storybook"`. CI에서도 이 명령을 그대로 쓴다. 실패 결과에 배포된 Storybook 링크를 붙이려면 `storybookUrl` 옵션을 쓴다.

**test-runner와 비교** (같은 문서의 비교표)

| 기능 | Vitest addon | test-runner |
| --- | --- | --- |
| interaction test / a11y test | 지원 | 지원 |
| 시각 테스트 | 지원(Chromatic) | 미지원 |
| snapshot test | 미지원 | 지원 |
| 실행 엔진 | Vitest | Jest |
| Storybook 실행 필요 | 없음 | 필요 |
| 모든 프레임워크 지원 | 아님(Vite 필요) | 지원 |

### interaction test

- `play` 함수 안에서 `canvas`(Testing Library 쿼리)와 `userEvent`로 상호작용하고 `expect`로 단언한다. import는 `storybook/test`다. ([Interaction tests](https://github.com/storybookjs/storybook/blob/v10.6.6/docs/writing-tests/interaction-testing.mdx))
- **주의**: `storybook/test`의 `userEvent`는 `@testing-library/user-event`를 감싼 것이다(소스 [`code/core/src/test/testing-library.ts`](https://github.com/storybookjs/storybook/blob/v10.6.6/code/core/src/test/testing-library.ts) 3행). 실제 브라우저에서 돌지만 이벤트는 흉내 낸 것이다. Vitest의 CDP `userEvent`와는 다르다.

### a11y 검사

[Accessibility tests](https://github.com/storybookjs/storybook/blob/v10.6.6/docs/writing-tests/accessibility-testing.mdx) 기준.

- `@storybook/addon-a11y`는 axe-core 위에 만들어졌다. `parameters.a11y.context`, `config`, `options`가 axe 설정으로 그대로 전달된다.
- **기본 ruleset은 WCAG 2.0, 2.1 A/AA와 best practice다.** WCAG 2.2 AA를 검사하려면 axe의 `runOnly`로 태그를 직접 지정해야 한다. 기본 설정에서는 `region` 규칙이 꺼져 있다(story에는 보통 맞지 않으므로).
- `parameters.a11y.test`가 CI 동작을 정한다.

| 값 | 동작 |
| --- | --- |
| `'off'` | 실행하지 않음 |
| `'todo'` | 실행하고, 위반은 Storybook UI에 경고로만 표시. **CI에는 아무 출력도 없음** |
| `'error'` | 실행하고, 위반이면 UI와 CLI/CI에서 테스트 실패 |

- 프로젝트(`preview`), Component(meta), story 단위로 지정할 수 있다. 문서는 전체를 `'error'`로 두고 문제 있는 Component만 잠시 `'todo'`로 내리는 진행 방식을 소개한다.
- a11y 검사는 Component 테스트와 **함께** 실행된다(별도 실행 불가).
- 알려진 문제: 환경(브라우저 버전 등)에 따라 axe 결과가 달라질 수 있다. 비동기로 렌더링되는 Component는 검사가 너무 일찍 돌아 위반을 놓칠 수 있다.

### CI에서 돌리는 방법

[Testing in CI](https://github.com/storybookjs/storybook/blob/v10.6.6/docs/writing-tests/in-ci.mdx)의 GitHub Actions 예시는 `container: mcr.microsoft.com/playwright:...` 이미지 안에서 `npm run test-storybook`을 실행한다. 컨테이너를 쓰지 않으면 `playwright install chromium --with-deps`가 필요하다. 커버리지는 `--coverage`를 덧붙인다. 샤딩은 Vitest의 `--shard=1/3` 방식을 쓴다.

### 시사점

- Storybook 문서와 Component 테스트를 한 벌의 story로 묶을 수 있다. story가 곧 smoke test가 된다.
- interaction test를 `play` 함수로 쓸지, 별도 `*.test.tsx`(Vitest `userEvent`)로 쓸지는 갈림길이다. 이벤트 방식(흉내 vs CDP)이 다르다.
- WCAG 2.2 AA가 Tide의 최소 기준인데 addon 기본값은 2.1까지다. 2.2를 넣으려면 `runOnly` 설정이 필요하다. 다만 axe의 2.2 규칙은 1개뿐이다(3절).
- `'todo'`는 CI에 흔적을 남기지 않는다. CI에서 막으려면 `'error'`가 필요하다.

---

## 3. axe-core 4.14.0이 잡는 것과 못 잡는 것

### 공식 주장

- "평균적으로 WCAG 이슈의 **57%**를 자동으로 찾는다." 확신할 수 없는 요소는 `incomplete`로 돌려주고 수동 검토가 필요하다고 표시한다. ([axe-core README](https://github.com/dequelabs/axe-core/blob/v4.14.0/README.md))
- 오탐(false positive)이 없다는 것을 원칙으로 내세운다(버그는 예외).
- 4.14.0 변경: `label-content-name-mismatch`가 기본으로 켜졌고 CJK 단어 분리를 지원한다. `target-size`에 EN 301 549 v4 태그가 붙었다. `color-contrast`가 `none`과 지수 표기 색 문자열을 처리한다. ([CHANGELOG 4.14.0](https://github.com/dequelabs/axe-core/blob/v4.14.0/CHANGELOG.md))

### WCAG 2.2 지원 범위

[rule-descriptions.md (4.14.0)](https://github.com/dequelabs/axe-core/blob/v4.14.0/doc/rule-descriptions.md)를 기준으로 셌다.

- WCAG 2.0 A/AA 규칙 60개, 2.1 A/AA 규칙 3개(`autocomplete-valid`, `avoid-inline-spacing`, `label-content-name-mismatch`).
- **WCAG 2.2 A/AA 규칙은 `target-size`(2.5.8) 하나뿐이고 기본으로 꺼져 있다.** 문서에는 "WCAG 2.2가 더 널리 채택되고 요구될 때까지 기본으로 꺼 둔다"고 적혀 있다. 켜려면 `runOnly`에 `wcag22aa` 태그를 넣거나 규칙을 직접 켠다.
- 실험에서 `runOnly: ['wcag2a','wcag2aa','wcag21aa','wcag22aa']`로 실행하면 문제없이 동작했다.

### 규칙이 없는 WCAG 기준 (Tide와 관련 있는 것)

규칙 표의 태그로 확인했다. 아래 기준에 해당하는 태그를 가진 규칙이 **하나도 없다**.

| 기준 | 내용 | Tide와의 관련 |
| --- | --- | --- |
| 1.4.11 | 비텍스트 대비(경계, 포커스 표시 색) | ring, field, highlight 포커스 표시의 대비 |
| 2.4.7 | 포커스가 보임 | ring을 유지한 근거(24번) |
| 2.4.11 | 포커스가 가려지지 않음(최소) | sticky 헤더와 `scroll-padding-top`(22번) |
| 2.4.3 | 포커스 순서 | Dialog, Menu 포커스 이동 |
| 2.1.2 | 키보드 트랩 없음 | Dialog 포커스 가두기와 탈출 |
| 1.4.13 | hover/focus로 나타나는 콘텐츠 | Tooltip, Popover |

- 2.1.1(키보드) 관련 규칙은 `frame-focusable-content`, `scrollable-region-focusable`, `server-side-image-map`뿐이다. 정적 검사라서 실제로 키보드로 조작되는지는 보지 않는다.
- `focus-order-semantics`는 experimental 규칙이며 기본으로 꺼져 있다.
- **실험**: `role="button"`인 `div`에 tabindex가 없어 키보드로 닿을 수 없는데도 axe(2.0~2.2 AA 태그)는 위반을 보고하지 않았다. 세 환경 모두 같았다.
- `color-contrast`는 실제 브라우저에서만 판정된다(1절 실험). forced-colors 에뮬레이션을 켠 상태에서도 같은 위반이 보고됐다. 원인은 확인하지 않았다.

### 시사점

- 키보드 조작, 포커스 순서, 포커스 가두기, 포커스 표시 대비는 axe가 다루지 않는다. Component 동작 테스트(`userEvent.tab`, `keyboard`)로 따로 단언해야 한다. 「접근성 > 명확함」 원칙에 직결되는 영역이다.
- WCAG 2.2 AA 기준을 axe에 맡기면 실제로 추가되는 것은 target-size 하나다. 2.2의 나머지 기준(2.4.11 등)은 수동 확인이나 직접 쓴 테스트가 필요하다.
- 포커스 표시 대비(1.4.11)는 Token 대비 쌍 검사(7절)에 `focus-ring` 쌍으로 넣을 수 있다. 「컬러 Foundation 결정」의 128쌍에 이미 들어 있는지는 결정 티켓에서 확인할 일이다.

---

## 4. 시각 회귀 테스트 선택지

### 선택지 비교

| 선택지 | 방식 | 비용 | 기준 이미지 위치 |
| --- | --- | --- | --- |
| **Chromatic** | story를 클라우드에서 촬영해 비교. `@chromatic-com/storybook` addon으로 Storybook UI에서 실행 | Free: 월 5,000 billed snapshot, Chrome만. Starter $179/월(35,000, Safari·Firefox·Edge). Pro $399/월(85,000). 초과분 $0.008 | Chromatic 클라우드 |
| **Argos** | 스크린샷을 업로드해 비교(Storybook, Playwright 등). OSS | Hobby $0: 월 5,000 스크린샷, 개인 개발자, 상업 이용과 private 저장소 가능. Pro $100/월부터(35,000 포함) | Argos 클라우드 |
| **Vitest `toMatchScreenshot`** | Browser Mode에서 요소를 찍어 저장소의 기준 이미지와 비교. Vitest 4부터 | 무료(CI 시간만) | 저장소 `__screenshots__/`(커밋) |
| **Playwright `toHaveScreenshot`** | Playwright Test에서 페이지나 요소를 비교 | 무료 | 저장소 `*-snapshots/`(커밋) |

출처: [Chromatic Pricing](https://www.chromatic.com/pricing), [Chromatic Billing](https://www.chromatic.com/docs/billing/), [Argos Pricing](https://argos-ci.com/pricing), [Vitest Visual Regression Testing](https://github.com/vitest-dev/vitest/blob/v5.1.0/docs/guide/browser/visual-regression-testing.md), [Playwright Visual comparisons](https://github.com/microsoft/playwright/blob/v1.65.0/docs/src/test-snapshots-js.md), [Storybook Visual tests](https://github.com/storybookjs/storybook/blob/v10.6.6/docs/writing-tests/visual-testing.mdx)

### Chromatic 세부

- **billed snapshot 계산**: 시각 snapshot = 변경된 테스트 × 빌드 × 브라우저 × **모드**. TurboSnap을 켜면 바뀌지 않은 story는 기존 기준을 복사하고, 이를 0.2 snapshot으로 센다. ([Billing](https://www.chromatic.com/docs/billing/))
- Free 플랜은 한도에 닿으면 테스트가 **멈춘다**. 유료 플랜은 멈추지 않고 초과분을 청구한다.
- **오픈소스 후원 조건**(월 35,000 snapshot, Chrome만): 커뮤니티 프로젝트는 기여자 100명 이상, 주간 npm 다운로드 4만 이상, GitHub 별 1만 이상 중 하나를 만족해야 한다. 회사용 UI 라이브러리는 기여자 5명 이상이다. 공개 Storybook이 된다. ([Open source sponsorships](https://www.chromatic.com/docs/open-source/)) Tide 같은 개인 프로젝트는 처음에는 이 조건에 해당하지 않을 가능성이 높다.
- **계산 예시**(가정): story 100개 × light/dark 2모드 = 빌드당 200 snapshot이다. TurboSnap 없이 Free 한도로 월 25회 빌드할 수 있다. 실제 story 수는 아직 정해지지 않았다.

### flaky 원인 (공식 문서 기준)

- Vitest 문서: 렌더링은 환경마다 결정적이지 않다. GPU와 드라이버, OS, **폰트 렌더링 파이프라인**, 브라우저 버전, headless 여부, 화면 배율과 색 프로필에 따라 달라진다. 그래서 Docker, CI 전용 워크플로, 클라우드 서비스를 강하게 권한다.
- Playwright 문서: 호스트 OS, 버전, 설정, 하드웨어, 전원(배터리 vs 어댑터), headless에 따라 달라진다. 기준 이미지 이름에 브라우저와 플랫폼이 붙는다(`...-chromium-darwin.png`). 즉 Mac에서 만든 기준 이미지는 Linux CI에서 그대로 맞지 않는다.
- Vitest의 폰트 대응: 웹폰트를 쓰고 `await document.fonts.ready`로 기다린다. 텍스트가 많은 영역은 `allowedMismatchedPixelRatio`를 올린다. 공유 환경을 쓴다.
- Vitest는 허용 오차 기본값을 정하지 않는다. `allowedMismatchedPixelRatio`(비율)를 권한다.
- 애니메이션: Playwright provider의 내장 단언은 `animations: "disabled"`가 기본이다. Vitest는 안정된 화면이 나올 때까지 여러 번 찍는 "Stable Screenshot Detection"을 한다.
- 팀 운영: Vitest 문서는 세 가지 길을 제시한다. ① 자체 Docker. ② 기준 이미지를 CI에서만 생성하고 로컬 `--update`는 CI 환경 검사로 막기. ③ 클라우드 서비스. "망설여지면 CI 방식부터 시작하라"고 권한다.

### 시사점

- Tide는 Pretendard(한글 11,172자)를 쓴다. 한글 글리프는 OS마다 렌더링 차이가 커서 폰트가 flaky의 주원인이 될 가능성이 높다. 폰트 로드를 기다리는 것과 렌더링 환경을 고정하는 것이 함께 필요하다.
- light/dark 두 Theme 모두 v0에 포함되므로 시각 테스트의 촬영 수는 2배가 된다. 유료 서비스에서는 이 배수가 비용에 그대로 반영된다.
- 무료로 시작할 수 있는 길은 세 가지다. Chromatic Free(Chrome만, 한도에서 정지), Argos Hobby, 저장소 기준 이미지(Vitest나 Playwright, CI에서만 갱신).

---

## 5. forced-colors 에뮬레이션 (24번에서 확인하지 못한 항목)

### API

- Playwright `browser.newContext({ forcedColors: 'active' | 'none' | null })`와 `page.emulateMedia({ forcedColors })`. 기본값은 `'none'`이다. 같은 방식으로 `contrast: 'more'`(prefers-contrast)도 있다. ([Playwright params.md](https://github.com/microsoft/playwright/blob/v1.65.0/docs/src/api/params.md) `context-option-forcedColors`)
- Vitest Browser Mode에서는 `playwright({ contextOptions: { forcedColors: 'active' } })`를 **instance 단위**로 줄 수 있다. 그러면 같은 테스트를 일반 모드와 forced-colors 모드에서 각각 돌릴 수 있다.
- 테스트 도중에 바꾸려면 Vitest custom command에서 Playwright `page`를 쓸 수 있다. 다만 Vitest 문서는 command의 `page`가 orchestrator 페이지라서 직접 건드리지 말라고 경고한다(`frame`, `iframe`, `context`를 쓰라고 함). 이 경로로 `emulateMedia`를 부르는 것은 **실험하지 않았다**. ([Commands](https://github.com/vitest-dev/vitest/blob/v5.1.0/docs/api/browser/commands.md))
- CDP 직접 호출(`cdp()`)은 Playwright provider와 Chromium에서만 되고, `api.allowWrite`와 `api.allowExec`가 켜져 있어야 한다.

### 실험: 에뮬레이션이 렌더링까지 바꾸는가 (Playwright 1.65.0)

24번에서 미뤘던 패턴을 그대로 만들었다. light raised(`border: 1px solid transparent` + 2레이어 box-shadow), field(`outline: 2px solid transparent` + inset box-shadow), 버튼 ring(`outline: 2px solid #3183f5`, offset 2px).

| 항목 | 기본 | Chromium 158 `forcedColors: 'active'` | Firefox 159 | WebKit 27.2 |
| --- | --- | --- | --- | --- |
| `matchMedia('(forced-colors: active)')` | false | true | true | true |
| raised 투명 border의 계산값 | `rgba(0,0,0,0)` | **`rgb(0,0,0)`**(보임) | **`rgb(0,0,0)`** | `rgba(0,0,0,0)`(변화 없음) |
| raised box-shadow | 2레이어 | **`none`** | **`none`** | 그대로 |
| field 투명 outline | 투명 | **`rgb(0,0,0)`** | **`rgb(0,0,0)`** | 투명 그대로 |
| field inset box-shadow | 파랑 | `none` | `none` | 그대로 |
| 버튼 ring outline | `#3183f5` | `rgb(0,0,0)` | `rgb(0,0,0)` | 그대로 |
| 버튼 배경 | `#1f6fe0` | `rgb(255,255,255)` | `rgb(233,233,237)` | 그대로 |
| `page.emulateMedia({ forcedColors: 'active' })`로 런타임 전환 | — | 렌더링까지 바뀜 | 렌더링까지 바뀜 | 미디어 쿼리만 바뀜 |

- **Chromium과 Firefox는 forced colors 렌더링까지 적용한다.** Chromium 스크린샷에서도 raised의 경계선, field의 굵은 테두리, 버튼 테두리가 검은 선으로 보였다.
- **WebKit은 미디어 쿼리만 true가 되고 색 강제는 하지 않는다.** WebKit으로는 forced-colors 시각 검증을 할 수 없다.
- Vitest 5.1 Browser Mode(Chromium, instance `contextOptions`)에서도 같은 결과였다. `matchMedia` true, 투명 border가 `rgb(0, 0, 0)`.
- 실험은 field outline을 항상 켠 정적 마크업으로 했다. 실제 `:focus` 상태에서의 결과는 구현 후 확인해야 한다. 강제 색은 브라우저마다 다르다(버튼 배경: Chromium 흰색, Firefox `rgb(233,233,237)`). 실제 Windows 고대비 테마의 색과 같은지는 **확인 불가**다.

### 시사점

- 24번이 미룬 세 항목(raised 투명 border, field 투명 outline, highlight 투명 outline)은 Chromium 에뮬레이션으로 계산값 단언과 스크린샷 비교를 모두 자동화할 수 있다.
- 단언 방식은 두 가지다. 계산값(`getComputedStyle`)으로 확인하거나 시각 회귀(스크린샷)로 확인한다. 계산값 단언은 폰트 flaky가 없다.

---

## 6. `prefers-reduced-motion` 에뮬레이션

- Playwright `newContext({ reducedMotion: 'reduce' | 'no-preference' | null })`, `page.emulateMedia({ reducedMotion })`. 기본값은 `'no-preference'`. ([params.md](https://github.com/microsoft/playwright/blob/v1.65.0/docs/src/api/params.md) `context-option-reducedMotion`)
- 실험: `@media (prefers-reduced-motion: reduce)`에서 `transition`을 `transform`에서 `opacity`로 바꾸는 규칙을 넣었다. 그 결과 **Chromium, Firefox, WebKit 모두** `transitionProperty`가 `opacity`로 바뀌었다. 런타임 `emulateMedia`도 세 브라우저에서 동작했다. Vitest instance `contextOptions`에서도 `matchMedia` true를 확인했다.
- jsdom에는 `matchMedia`가 없다(1절). happy-dom에는 있지만 미디어 기능 값을 바꿔 CSS 적용 결과까지 확인할 수 있는지는 **확인 불가**다.
- Tailwind의 `motion-safe:` variant는 `@media (prefers-reduced-motion: no-preference)`로 만들어지는 것으로 알려져 있다. 이번에는 Tailwind 4.3.5 출력으로 직접 확인하지 않았다(**확인 불가**). 구현 후 계산값 단언으로 확인할 수 있다.

### 시사점

- 「motion Foundation 결정」의 "이동·확대·blur는 `motion-safe:`일 때만, 줄이기를 원하면 opacity 전환"은 계산값(`transitionProperty`, `transform`)으로 단언할 수 있다. 24번에서 확인하지 못한 "reduced-motion에서 opacity 전환만 남는지"를 자동 테스트로 만들 수 있다.
- forced-colors와 reduced-motion은 같은 메커니즘(context 옵션)이므로 Vitest instance 하나에 함께 줄 수 있다. 실험에서도 그렇게 돌렸다.

---

## 7. Token 대비 쌍 128개 CI 검사

### WCAG 2.x 대비비 정의

- 상대 휘도: `L = 0.2126R + 0.7152G + 0.0722B`. 각 채널이 `≤ 0.04045`이면 `c/12.92`, 아니면 `((c+0.055)/1.055)^2.4`. 대비비는 `(L1 + 0.05) / (L2 + 0.05)`. ([WCAG 2.2 relative luminance](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance), W3C Recommendation 2024-12-12)
- 2021년 5월 전에는 임계값이 0.03928이었다. W3C는 실질적인 차이가 없다고 적었다.
- **반올림하지 않는다.** 4.499:1은 4.5:1을 통과하지 못한다. ([Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))

### 실험: 직접 계산과 라이브러리 비교 (`#3183f5` 대 `#ffffff`)

| 방식 | 결과 |
| --- | --- |
| 직접 작성(위 공식, 약 10줄) | 3.6870386333147316 |
| `culori` 4.0.2 `wcagContrast()` | 3.6870386333147316 |
| `wcag-contrast` 3.0.0 `hex()` | 3.6870386333147316 |
| `colorjs.io` 0.7.1 `contrast(..., 'WCAG21')` | 3.6872060144019243(**소수 넷째 자리부터 다름**) |

- 128쌍을 계산하는 데 약 0.2ms가 걸렸다. 브라우저도 DOM도 필요 없다.
- colorjs.io의 차이는 sRGB 변환 상수나 행렬이 다르기 때문으로 보인다. 원인은 확인하지 않았다. 4.5나 3.0 경계 근처의 쌍에서는 라이브러리에 따라 판정이 갈릴 수 있다.

### 시사점

- 「컬러 Foundation 결정」이 Primitive 정본을 hex로 정했고, [ADR 0003](../decisions/0003-token-source-and-utility-namespaces.md)이 Token 원본을 TS 객체와 직접 만든 스크립트로 정했다. 따라서 대비 검사도 Node 환경의 Vitest 테스트로 Token 객체를 직접 읽어 계산할 수 있다. Browser Mode가 필요 없다.
- 공식은 짧고 W3C 원문으로 검증할 수 있다. 직접 작성하면 의존성이 0이고, 라이브러리는 검증된 구현이라는 장점이 있다. 어느 쪽이든 결과가 W3C 공식과 일치하는지 테스트로 고정할 수 있다.
- 실패 메시지에 쌍 이름(역할 × 속성 × Theme)과 실제 비율을 함께 내면 원인을 바로 찾을 수 있다. 이 부분은 구현 상세다.
- axe의 `color-contrast`는 렌더링된 DOM을 검사하는 것이고 Token 쌍 검사와 겹치지 않는다. 앞의 것은 Component가 Token을 맞게 썼는지, 뒤의 것은 Token 자체가 기준을 통과하는지를 본다.

---

## 8. `pnpm pack` tarball을 Next.js 앱에 설치하는 smoke test

### 공개 저장소 사례 (GitHub 코드 검색, 2026-11-09)

| 저장소 | 하는 일 |
| --- | --- |
| [sachinchoolur/lightGallery `ci.yml`](https://github.com/sachinchoolur/lightGallery/blob/main/.github/workflows/ci.yml) | `pnpm pack` → tarball마다 `publint --strict` → 임시 consumer 앱(Vite build + `vue-tsc`, Nuxt SSR prerender, Angular AOT+SSR)에 설치 |
| [zanreal-labs/nemo `nextjs-compat.yml`](https://github.com/zanreal-labs/nemo/blob/canary/.github/workflows/nextjs-compat.yml) | `npm pack` → `next@latest`와 `next@preview` matrix에서 `next build` |
| [nextlyhq/nextly `package-smoke.yml`](https://github.com/nextlyhq/nextly/blob/main/.github/workflows/package-smoke.yml) | tarball 설치 후 Next.js가 서브패스를 다루는 방식과 `"use client"` 배너를 검사 |
| [MoleCare/react-body-map `ci.yml`](https://github.com/MoleCare/react-body-map/blob/main/.github/workflows/ci.yml) | peer 범위의 가장 낮은 React로 server render, `"use client"`, 타입을 tarball consumer에서 검사 |

이 저장소들의 품질은 평가하지 않았다. 구성 방식의 예로만 든다.

### 실험: 최소 구성 smoke test (로컬 Mac)

ESM `dist`(`Button.js`에 `"use client"`와 `useState`, `index.js` 재export), d.ts(`./Button.js` 확장자 포함)를 담은 `@tide-tds/desktop` 흉내 패키지를 `pnpm pack`했다. 그리고 workspace 밖의 Next 16.4.5 앱(TS 7.0.2)에 `file:` tarball로 설치했다.

| 단계 | 결과 | 시간 |
| --- | --- | --- |
| `pnpm install`(store가 이미 채워진 상태) | 통과 | 1.2s |
| `tsc -p`(TS 7.0.2, `moduleResolution: nodenext`, `skipLibCheck: false`, Tide d.ts만 대상) | 통과 | 0.5s |
| `next build`(Turbopack, TS 검사 포함, 서버 컴포넌트 `page.tsx`에서 import) | 통과, `/` 정적 prerender | 2.8s(컴파일 1.0s, TypeScript 0.2s) |
| `attw <tgz> --profile esm-only` | `node16 (from ESM)`과 `bundler` 🟢 | 0.6s |
| `publint` | All good | 1s 미만 |

**대조 실험**(각 검사가 실제로 문제를 잡는지)

- 설치된 `Button.js`에서 `"use client"`를 지우면 `next build`가 `TypeError: (0 , c.useState) is not a function`으로 prerender에서 실패한다. 19번과 같은 결과다.
- `index.d.ts`의 `./Button.js`를 `./Button`으로 바꾸면 `tsc`(nodenext)가 `TS2835: Relative import paths need explicit file extensions`로 실패한다. attw도 `node16 (from ESM)`에서 `Internal resolution error`를 낸다. 이는 16번이 "구현할 때 확인할 것"으로 남긴 `rewriteRelativeImportExtensions` 문제를 잡는 검사가 된다.
- 주의: Next가 앱 `tsconfig.json`을 고쳐 쓴다. `skipLibCheck: false`로 두면 Next 자체 d.ts에서 오류가 난다(`@types/react-dom` 누락 등). Tide d.ts만 엄격하게 보려면 smoke 전용 tsconfig를 따로 두는 편이 단순했다.
- attw README: `--pack`은 npm만 지원한다. pnpm은 `pnpm pack`으로 tarball을 먼저 만들고 `attw <tarball>`로 넘겨야 한다. `esm-only` profile은 CJS 해석 실패를 무시한다. ([attw CLI README](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/packages/cli/README.md))

### CI 시간

- **Tide 구성으로 CI에서 잰 값은 없다(확인 불가).** 위 숫자는 로컬 Mac의 warm store 기준이다.
- 참고 사례: zanreal-labs/nemo의 `nextjs-compat` job(ubuntu-latest, bun 사용, pack → install → `next build`)은 최근 성공한 실행에서 job 전체가 **약 29~75초**였다(GitHub API의 job 시작·종료 시각으로 계산).
- CI에서는 의존성 설치(cold store, Next와 React 다운로드)가 대부분을 차지할 것으로 보인다. 이는 추정이다.

### 시사점

- 하나의 smoke job으로 세 가지를 확인할 수 있다. ① `"use client"` 경계(`next build` prerender). ② d.ts의 nodenext 해석(`tsc` 또는 attw). ③ `exports` 구조(publint). 19번이 손으로 검증한 것을 CI로 옮기는 셈이다.
- attw는 내부에 TS 5.6.1-rc를 고정해서 쓴다. Tide는 TS 7 단독이므로 실제 사용자의 TS 7 해석은 TS 7 `tsc`로 보는 것이 더 직접적이다. attw는 보조 수단이다.
- CSS 경로(`@import "@tide-tds/desktop/styles.css"`, 패키지 안 `@source`)도 같은 consumer 앱에서 확인할 수 있다. 19번의 2~3번 항목이다. 이번 실험에는 넣지 않았다.

---

## 9. GitHub Actions에서 Turborepo 캐시와 함께 돌리기

### Turborepo 2.11.10 공식 문서

- **Remote Cache 두 가지**
  1. **Vercel Remote Cache**: 모든 플랜에서 무료이고 Vercel에 배포하지 않아도 된다. `TURBO_TOKEN`(secret)과 `TURBO_TEAM`(variable)을 쓰거나, OIDC(권장, `vercel/setup-turborepo-remote-cache-action`)를 쓴다. ([Remote Caching](https://github.com/vercel/turborepo/blob/v2.11.10/apps/docs/content/docs/core-concepts/remote-caching.mdx), [GitHub Actions 가이드](https://github.com/vercel/turborepo/blob/v2.11.10/apps/docs/content/docs/guides/ci-vendors/github-actions.mdx))
  2. **`actions/cache@v4`로 `.turbo` 디렉터리 캐시**: key `${{ runner.os }}-turbo-${{ github.sha }}`, restore-keys `${{ runner.os }}-turbo-`. 외부 서비스가 필요 없다. 자체 호스팅 Remote Cache API(OpenAPI 명세)도 있다.
- **`--affected`**: PR에서는 `GITHUB_BASE_REF`로 바뀐 패키지만 실행한다. push에서는 `GITHUB_EVENT_PATH`로 기준을 찾는다. shallow clone이면 전체 실행으로 돌아간다. ([Constructing CI](https://github.com/vercel/turborepo/blob/v2.11.10/apps/docs/content/docs/crafting-your-repository/constructing-ci.mdx))
- 권장 패턴: `turbo run lint check-types test`로 전체를 돌리고 바뀌지 않은 패키지는 캐시 hit로 넘긴다.
- **env 모드 기본값은 Strict다.** `turbo.json`의 `env`와 `globalEnv`에 적은 변수만 task에 전달한다. CI 벤더가 넣는 변수도 걸러진다. 필요하면 `passThroughEnv`나 `globalPassThroughEnv`에 등록한다. ([Using environment variables](https://github.com/vercel/turborepo/blob/v2.11.10/apps/docs/content/docs/crafting-your-repository/using-environment-variables.mdx))

### 브라우저 설치

- Playwright 공식 문서는 **브라우저 바이너리 캐시를 권하지 않는다.** 캐시를 복원하는 시간이 다운로드 시간과 비슷하고, Linux의 OS 의존성은 캐시할 수 없기 때문이다. 그래도 캐시하려면 Playwright 버전 해시로 key를 만든다. ([Playwright CI](https://github.com/microsoft/playwright/blob/v1.65.0/docs/src/ci.md) "Caching browsers")
- 대안 두 가지. ① `npx playwright install --with-deps --only-shell`(Vitest 문서의 GitHub Actions 예시). ② 공식 컨테이너 `mcr.microsoft.com/playwright:v1.65.0-noble`. 2026-11-09 기준 MCR에 `v1.65.0`, `-noble`, `-jammy`, `-resolute` 태그가 있다.
- 로컬에서 Playwright 1.65.0의 Chromium, Firefox, WebKit을 함께 받는 데 약 61초 걸렸다. Chromium 하나만 받으면 더 짧다(측정하지 않음).

### GitHub Actions 비용

- 공개 저장소의 표준 GitHub-hosted runner는 무료다. larger runner는 공개 저장소에서도 과금된다. ([GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)) Tide 저장소의 공개 여부에 따라 달라진다.

### 시사점

- 결정된 turbo task는 build, typecheck, test, dev 네 개다. 위 검사들(Token 대비, Component 동작, Storybook smoke+a11y, 시각 회귀, tarball smoke)을 `test` 하나에 넣을지, task를 나눌지가 캐시 단위를 정한다. 예를 들어 시각 회귀와 smoke는 입력(`inputs`)과 실행 비용이 다르다.
- 캐시 hit가 맞게 나려면 task의 `inputs`와 `outputs`가 정확해야 한다. 브라우저 테스트는 Playwright 버전과 브라우저 종류가 결과에 영향을 준다. 이런 값을 해시에 넣을지(`env`나 `inputs`)는 구현 시 정할 일이다.
- 시각 회귀의 기준 이미지를 CI(Linux)에서만 만들기로 하면, 로컬 Mac 실행 결과와 섞이지 않게 막아야 한다(4절의 Vitest 권고).
- `--affected`와 Remote Cache는 함께 쓸 수 있다. 저장소가 작을 때는 `actions/cache`만으로도 외부 계정 없이 시작할 수 있다.

---

## 확인 불가 목록

- `@react-aria/test-utils`(user-event 기반)를 Vitest Browser Mode의 CDP `userEvent`와 함께 쓸 수 있는지
- Vitest custom command에서 Playwright `page.emulateMedia`로 테스트 도중 forced-colors를 전환하는 방법(문서가 orchestrator `page`를 건드리지 말라고 경고함)
- Playwright 에뮬레이션의 강제 색이 실제 Windows 고대비 테마 색과 같은지
- forced-colors 에뮬레이션 중에 axe가 `color-contrast` 위반을 내는 원인
- happy-dom에서 미디어 기능 값을 바꿔 CSS 결과까지 확인할 수 있는지
- Tailwind 4.3.5의 `motion-safe:`가 만드는 미디어 쿼리(이번에 출력으로 확인하지 않음)
- colorjs.io의 WCAG21 대비 값이 다른 원인
- Tide 구성의 tarball smoke test CI 소요 시간(로컬과 다른 저장소 사례만 있음)
- Storybook Vitest addon 프로젝트에 forced-colors instance를 추가하는 조합(Vitest 단독으로만 실험함)
