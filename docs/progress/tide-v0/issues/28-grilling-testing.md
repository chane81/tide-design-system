# 테스트 전략 결정

Type: grilling
Status: resolved
Blocked by: 26, 27

## Question

무엇을 어떤 도구로, 언제 검사할지 정한다.

- 테스트 층: Token(대비 쌍, Utility class 노출 확인), Component 동작(키보드, ARIA), 접근성 자동 검사, 시각 회귀, 소비 smoke test
- 각 층의 도구와 실행 환경(jsdom인지 실제 브라우저인지)
- stories를 테스트로 재사용할지(Storybook 결정과 연결)
- 시각 회귀를 v0에 넣을지, 넣는다면 도구와 기준 이미지 관리
- forced-colors, reduced-motion 확인을 자동화할지, 수동 체크리스트로 둘지
- CI에서 언제 돌릴지(PR마다, main 머지 후, publish 전)
- Component마다 "완료"로 볼 테스트 최소 기준(spec에서 쓸 Definition of Done)

### 참고 (다른 티켓에서 넘어온 것)

- 「테스트 도구와 방식 조사」(27번)의 결과를 근거로 쓴다.
- 「컬러 Foundation 결정」: 명시한 대비 쌍 128개를 WCAG 2.x 대비비로 CI에서 검사한다.
- 「Token 네이밍과 Utility class 노출 규칙 결정」: Semantic 색이 Tailwind 속성별 namespace로 노출되는지 CI로 확인한다.
- 「radius·elevation·focus ring 형태 결정」: error 입력창에서 field 포커스가 error보다 우선하는지 확인해야 한다(24번 prototype에서 실제로 깨졌던 부분).
- 「그림자·포커스 표시·motion 시각 비교」: forced-colors 모드는 확인하지 못했다.
- 「Storybook 문서 구성 결정」: 렌더링되는 예시(Do/Don't 포함)는 모두 CSF story로 만든다. 의도적으로 잘못된 Don't story만 개별로 a11y 검사를 끈다. a11y 검사를 CI 실패로 다룰지(`parameters.a11y.test` 수준), `runOnly`에 `wcag22aa`를 넣을지는 이 티켓에서 정한다.

## Answer

근거: [docs/research/testing.md](../../../research/testing.md)(vitest 5.1.0, playwright 1.65.0, axe-core 4.14.0, storybook 10.6.6, turbo 2.11.10). 2026-11-09 grilling으로 정함.

### 테스트 층과 환경

Vitest `projects`로 층을 나눈다. jsdom과 happy-dom은 쓰지 않는다.

| project                      | 환경                                                                            | 대상                                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unit`                       | Node                                                                            | Token 대비 쌍 128개(「컬러 Foundation 결정」, `focus-ring` 쌍 포함), Semantic 색 Utility namespace 노출(생성된 CSS 검사), `cn`과 tailwind-merge 설정, variant 맵 |
| `browser`                    | Vitest Browser Mode + Playwright Chromium                                       | Component 동작 `*.test.tsx`: 키보드, ARIA, 포커스                                                                                                                |
| `browser`의 두 번째 instance | Chromium + `contextOptions` `forcedColors: 'active'`, `reducedMotion: 'reduce'` | forced-colors와 reduced-motion 계산값 단언                                                                                                                       |
| `storybook`                  | `@storybook/addon-vitest` + Chromium                                            | 모든 story 렌더 smoke와 a11y 검사                                                                                                                                |

- **Browser Mode를 고른 이유**: jsdom에는 `matchMedia`가 없고, jsdom·happy-dom 모두 레이아웃 크기가 0이다. 실제 브라우저에서는 React Aria의 포커스·위치 계산을 mock으로 메울 필요가 없다. 대가로 React Aria 공식 테스트 예시와 `@react-aria/test-utils`(jsdom 전제)는 쓰지 않는다.
- **interaction test 위치**: 동작 단언은 모두 `*.test.tsx`에 둔다. Vitest `userEvent`는 CDP로 실제 이벤트를 보낸다. story는 문서, 렌더 smoke, a11y만 맡고 `play` 함수는 쓰지 않는다.
- **브라우저**: Chromium만 쓴다. Firefox·WebKit은 v0 이후 후보다. WebKit은 forced-colors를 렌더링하지 않았다(27번 실험).

### 접근성

- **Storybook a11y**: 전역 `parameters.a11y.test: 'error'`. `runOnly`는 `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`(`target-size` 추가). `best-practice`는 넣지 않는다. 의도적으로 잘못된 Don't story만 `test: 'off'`.
- **axe가 못 잡는 부분**(키보드, 포커스 순서·가두기·복귀, 포커스 표시)은 `browser` project의 직접 단언으로 채운다. 포커스 표시 대비(1.4.11)는 Token 대비 쌍의 `focus-ring` × {canvas, raised} 3:1로 덮는다.
- **forced-colors·reduced-motion**: 수동 체크리스트가 아니라 자동으로 확인한다. 대상은 「그림자·포커스 표시·motion 시각 비교」가 미룬 세 항목(raised 투명 border, field 투명 outline, highlight 투명 outline)과, 「motion Foundation 결정」의 "reduced-motion에서는 이동·확대 대신 opacity 전환"이다. `getComputedStyle` 계산값으로 단언한다. 에뮬레이션 색이 실제 Windows 고대비 테마와 같은지는 확인하지 못했으므로, v0 출시 전에 실제 Windows에서 한 번 수동 확인한다.

### 시각 회귀

v0에는 넣지 않는다(Out of scope, v0 이후 후보). Pretendard 렌더링 때문에 결과가 흔들릴 위험이 크고, light/dark 때문에 촬영 수가 2배가 된다. 또 Chromatic Free 한도(월 5,000 snapshot)에 닿을 수 있다. 시각 회귀로 보려던 항목은 계산값 단언으로 대신 확인한다. 계산값 단언은 폰트 때문에 흔들리지 않는다.

### smoke test

- private `apps/smoke-next`(Next.js App Router 앱)를 두고, turbo task `smoke`를 새로 둔다(`dependsOn: ["^build"]`). 입력과 비용이 `test`와 달라 캐시 단위를 나눈다. turbo task는 build, typecheck, test, smoke, dev 다섯 개가 된다(「모노레포 패키지 구조와 빌드 결정」 Comments에 보완).
- 내용: `pnpm pack` tarball 설치, `next build`(`"use client"` 경계와 prerender), TS 7 `tsc`(nodenext d.ts 해석), publint(`exports`). CSS 경로 확인(`@import "@tide-tds/desktop/styles.css"`, 패키지 안 `@source`)도 포함한다. 「Next.js 소비 흐름 end-to-end 검증」에서 손으로 확인한 것을 CI로 옮긴다. attw는 내부 TS 버전이 고정이라 쓰지 않는다.

### CI

- **PR마다**: `turbo run typecheck test build smoke --affected`
- **main 머지 후 릴리스 workflow**: 전체를 다시 돌린다. 통과해야 npm publish와 Dokploy 문서 배포(「Storybook 문서 구성 결정」)로 넘어간다.
- 시각 회귀가 없으므로 nightly job은 두지 않는다.
- **캐시**: `.turbo`를 `actions/cache`로 저장한다. Vercel Remote Cache는 쓰지 않는다(외부 계정이 필요하고, 지금 규모에서는 이득이 작음).
- **브라우저 설치**: Playwright 브라우저는 캐시하지 않고 `playwright install --with-deps --only-shell chromium`으로 설치한다. Playwright 버전은 pnpm catalog로 고정한다.

### Component 완료 기준(Definition of Done)

spec 단계에서 Component마다 아래를 완료 기준으로 쓴다.

1. variant, size, 상태(disabled, invalid 등)마다 story가 있고, a11y `'error'`를 통과한다.
2. `*.test.tsx`(Browser Mode)로 다음을 단언한다.
   - 키보드 조작(해당하는 경우)
   - 오버레이 Component의 포커스 이동과 복귀
   - ARIA role과 state
   - 포커스 표시 종류(ring, field, highlight) 적용
3. 입력류(Input, Textarea, Select 등)는 invalid 상태에서도 field 포커스가 error보다 우선하는지 계산값으로 단언한다. 「그림자·포커스 표시·motion 시각 비교」 prototype에서 실제로 깨졌던 부분이다.
4. raised, field, highlight나 motion을 쓰는 Component는 forced-colors·reduced-motion instance 단언을 추가한다.
5. Component MDX 페이지의 고정 섹션을 모두 채운다.
6. `apps/smoke-next`의 Server Component 페이지에서 한 번 이상 import해 렌더링한다.

GLOSSARY에 새 용어는 없다. 되돌리기 쉬운 결정이라 ADR은 만들지 않는다.
