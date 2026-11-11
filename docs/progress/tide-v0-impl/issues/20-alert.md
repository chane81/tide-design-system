# 20: Alert

Status: done
Blocked by: 18 (trusted publisher 설정과 0.2.0 CI 릴리스)

## What to build

앱 개발자가 `Alert`로 info·success·warning·danger 메시지를 보여 준다. 색각 이상 사용자도 상태 아이콘 모양으로 종류를 구분한다. 닫을 수 있는 Alert는 IconButton으로 닫는다. Toast가 이 스타일을 재사용한다.

## 수용 기준

- [x] Role별 상태 아이콘(info, success, warning, danger)은 모양으로도 서로 구분된다(WCAG 1.4.1). 내부 아이콘은 장식용이다.
- [x] 닫기는 IconButton이고 이름이 있다.
- [x] radius는 `lg`다. 역할 text·border·subtle 배경 조합이 대비 쌍에 등록되어 있다.
- [x] 알림 성격에 맞는 역할(정적 표시 vs live region)을 정하고 근거를 Comments에 남긴다.
- [x] Toast에서 재사용할 수 있게 스타일을 나눈다.
- [x] `browser`: 역할, 아이콘이 읽히지 않음, 닫기 버튼 이름과 동작, forced-colors 경계를 단언한다.

### 공통 API 규칙

- [x] `ref`는 일반 prop으로 받아 루트 DOM 요소에 연결한다(`forwardRef` 없음).
- [x] props는 루트 DOM 요소의 props를 확장하고 겹치는 HTML 속성은 `Omit`한다. `XxxProps` 타입을 루트에서 export한다.
- [x] prop 이름은 DOM 이름을 쓰고, React Aria 이름(`isDisabled`, `onPress` 등)은 드러내지 않는다.
- [x] 사용자 `className`은 `cn`의 마지막에 넣어 충돌 시 이긴다.
- [x] 상태는 네이티브 pseudo-class가 있으면 그것을, 없으면 boolean `data-*` 속성으로 노출한다.
- [x] `"use client"`는 hook·state·이벤트를 쓰는 파일에만 붙인다.
- [x] Semantic Token만 쓰고, 지원하지 않는 `variant`·`size` 값은 타입 오류가 된다.
- [x] 세부 props(값, 기본값, padding)는 공통 규칙 안에서 정하고 props 표로 확정한다.
- [x] changeset을 포함한다.

### Component 완료 기준 (spec Testing Decisions)

- [x] `*.test.tsx`에 동작 단언이 있다(`browser` project).
- [x] 모든 예시가 story로 있고 a11y 검사를 통과한다(`storybook` project).
- [x] 포커스 표시, forced-colors, reduced-motion 계산값을 단언한다(해당하는 경우).
- [x] MDX 문서가 고정된 섹션 순서(설명 → 사용 시점/쓰지 않을 때 → 예시 → Do/Don't → 접근성 → props 표)를 따른다.
- [x] 쓰는 Token이 대비 쌍에 등록되어 있다(`unit` project).
- [x] smoke 앱에서 import해 빌드가 통과한다(`smoke`).

## Comments

- 2026-11-11 완료(브랜치 `ticket-20-alert`, main 134ce12 위).
  - **근거 버전**: react 19.3.1(@types/react 19.3.0), tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, vitest-browser-react 2.3.0, storybook 10.6.6, typescript 7.0.2. React Aria는 쓰지 않았다(ADR 0004, 네이티브로 완결). 새 의존성은 없고 `minimumReleaseAge`는 그대로다.
  - **API 확인**: `ref`를 일반 prop으로 받는 것(`forwardRef` 불필요)은 context7 `/reactjs/react.dev`(forwardRef.md, useRef.md). `@types/react` 19.3.0 `DOMAttributes`에 `onClose?: ReactEventHandler`(dialog의 close 이벤트)가 있어 `Omit`하고 인자 없는 콜백으로 다시 정의했다(설치된 index.d.ts 3196행). live region은 WAI-ARIA APG Alert Pattern(<https://www.w3.org/WAI/ARIA/apg/patterns/alert/>)과 MDN `alert`·`status` role 문서로 확인했다. 아이콘 이름은 설치된 `@tide-tds/icons` 이름표(Lucide 이름 변경 반영: `TriangleExclamationPointIcon`, `OctagonExclamationPointIcon`)에서 골랐다.
  - **color 범위(ADR 0016)**: Alert는 행동·의미 Component라 `color`는 `Role`(Tide Role 6개 + 앱 Role)이다. 티켓 본문의 「info·success·warning·danger」는 상태 알림 4개로 읽고, 값 범위를 4개로 좁히지 않았다. 좁히면 ADR 0016의 「앱 Role 포함」과 어긋나고(앱 브랜드 알림을 못 씀), 다른 행동·의미 Component(Button·Switch)와 타입이 달라진다. `neutral`·`primary`·앱 Role은 「상태가 아닌 일반 알림」으로 보고 info와 같은 i 아이콘을 쓴다. 색 계열 이름(`blue`)은 타입 오류다. 기본값은 `info`다(아래 판단 보류 1).
  - **live region 결정**: 기본은 역할 없는 정적 표시이고, `role?: "alert" | "status"`로 앱이 고른다. 근거: APG Alert Pattern은 「screen readers do not inform users of alerts that are present on the page before page load completes」라고 하고, 잦은 alert가 사용성을 해친다고 경고한다. MDN `status`는 「advisory information that is not important enough to justify an alert」(암묵 `aria-live="polite"`, `aria-atomic="true"`)다. Alert는 대부분 화면과 함께 렌더되는 정적 내용(점검 예정, 오류 요약)이라 기본으로 live region을 붙이면 효과는 없고 오용만 늘린다. 사용자 동작 뒤 새로 나타나는 경우만 앱이 `alert`(급한 오류)나 `status`(결과)를 준다. 다른 role 값은 타입 오류다. 자동으로 사라지는 알림은 Toast(34) 몫이다(APG: 자동으로 사라지는 alert를 피한다).
  - **Toast 재사용**: 배치·subtle 표면·아이콘 자리·제목·본문·닫기 버튼 class와 `alertStatusIcon(color)`를 내부 모듈 `alert-style.ts`로 나눴다. 루트에서 export하지 않는다(`pressable.ts`와 같은 방식). Toast는 같은 패키지 안이라 내부 import로 충분하고, 공개하면 class 문자열이 공개 계약이 되어 바꿀 때마다 breaking이 된다. 표면(`alertSurfaceClass`)을 배치(`alertLayoutClass`)와 따로 둬서 Toast가 raised·`shadow-md`로 바꿔 끼울 수 있다.
  - **`"use client"` 없음**: Alert는 hook·state가 없고 핸들러도 만들지 않는다. 받은 `onClose`를 IconButton(client)에 그대로 넘긴다. 서버 컴포넌트에서 `onClose` 없이 쓰면 닫기 버튼 없이 렌더되고, `onClose`를 쓰는 곳은 함수를 넘길 수 있는 앱의 client Component다. smoke에서 `Alert.js`·`alert-style.js`에 지시어가 없음을 확인한다.
  - **props 표**:

    Alert(`div`, 서버 컴포넌트)

    | prop         | 타입·값                                                        | 기본값   | 비고                                                                    |
    | ------------ | -------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
    | `color`      | `Role`                                                         | `"info"` | 루트 `data-color`. 상태 4개는 아이콘 모양이 다르다. 색 계열은 타입 오류 |
    | `title`      | `ReactNode`                                                    | —        | 굵은 제목(`div`, heading 아님). HTML `title` 속성은 받지 않는다         |
    | `children`   | `ReactNode`                                                    | —        | 본문. 목록, 같은 Role의 `Link`                                          |
    | `role`       | `"alert" \| "status"`                                          | 없음     | 새로 나타나 알릴 때만                                                   |
    | `onClose`    | `() => void`                                                   | —        | 주면 닫기 IconButton(xs, ghost, 같은 Role, `XIcon`)이 생긴다. 제어형    |
    | `closeLabel` | `string`                                                       | `"닫기"` | 닫기 버튼 이름                                                          |
    | `className`  | —                                                              |          | 기본 class를 이긴다(`p-6`, `rounded-none`)                              |
    | 나머지       | `ComponentProps<"div">`(`color`·`title`·`role`·`onClose` 제외) |          | `ref`, `id`, `aria-label` 등                                            |

  - **모양**: `flex items-start gap-3`, radius `lg`(8px), border 1px `border-accent`, `bg-accent-subtle`, 글자·아이콘 `text-accent`, 여백 16px, 그림자 없음. 아이콘 20px(본문 줄 높이 20px와 같아 첫 줄 가운데), 제목 `text-body-sm font-semibold`(14px 600), 본문 `text-body-sm`(14px 400), 제목·본문 사이 4px. 닫기 버튼 24px는 `-my-0.5 -me-1`로 첫 줄 높이를 늘리지 않는다. 내용 칸은 `min-w-0`이라 긴 단어가 버튼을 밀어내지 않는다.
  - **상태 아이콘**: info `InfoIcon`(원 안 i), success `CircleCheckIcon`(원 안 체크), warning `TriangleExclamationPointIcon`(삼각형), danger `OctagonExclamationPointIcon`(팔각형). 바깥 모양이 원·원·삼각형·팔각형이고 안 기호도 달라 넷 모두 모양으로 구분된다. IconBase가 이름 없는 아이콘에 `aria-hidden`을 붙이고, Alert도 `aria-hidden="true"`를 명시한다.
  - **Token·대비**: 글자·아이콘 `text-<role>` × `bg-<role>-subtle` 4.5(neutral은 `text-default` × `bg-neutral-subtle`), 경계 × 바깥 표면 층 3(`border-<role>`, neutral `border-strong`)은 이미 등록되어 있었다. 없던 두 가지를 foundation `contrastPairs`에 더했다: 역할 경계 × 같은 역할 subtle 3:1(안쪽 배경, 6쌍), `outline-focus` × 역할 subtle 3:1(닫기 버튼 ring이 Alert 배경 위에 그려짐, 6쌍). 모두 light·dark 통과(최저 `border-strong` × `bg-neutral-subtle` 3.32 / 3.88, `outline-focus` × `bg-neutral-subtle` dark 3.85). 회귀 스냅숏은 줄만 12개 늘고 기존 값은 그대로다. 닫기 버튼 hover·누름 글자는 `text-<role>` × subtle-hover/active로 이미 등록. 앱 Role은 `colorContrastRules`의 text × subtle, border × 표면 층으로 검사된다(아래 판단 보류 4).
  - **forced-colors**: 따로 class를 두지 않는다. 경계·글자·아이콘이 `CanvasText`, 배경이 `Canvas`가 되어 경계로 영역이 남고, 닫기 버튼(ghost)의 투명 경계도 보인다.
  - **테스트**: components browser에 Alert 74 tests(37 × instance 2): 역할(기본 역할 없음·live region 아님, `alert`/`status` 전달, 동작 뒤 새로 렌더된 `role="alert"`, 다른 role 타입 오류), 아이콘(aria-hidden·img 없음, 상태 4개 도형이 서로 다름, neutral·primary·brand는 info와 같음, 20px·currentColor), 닫기(onClose 없으면 버튼 없음, 이름 「닫기」·`closeLabel`, 클릭·Enter·Space로 onClose 3회, 제어형으로 사라짐, xs 24px·같은 Role 글자, focus-ring 2px/2px·`outline-focus`), 모양(radius 8·여백 16·경계 1px·그림자 없음, 제목 14/600·본문 14/400, 빈 부분 생략, 긴 본문), 색(Role 6 × light·dark의 배경·글자·경계 계산색, 기본 info, `data-color` 비상속, `blue` 타입 오류, 앱 Role `brand` 슬롯), forced-colors(CanvasText 경계·글자·아이콘, Canvas 배경, 닫기 버튼 경계), 공통 API(ref·id·aria-label·className 우선·HTML title 없음, `variant` 타입 오류). 경계(`border`)를 빼거나 warning 아이콘을 info로 바꾸면 해당 테스트가 실패함을 확인하고 되돌렸다. unit에 Alert 대비 쌍 31 tests. docs storybook에 Alert 11 story(a11y `error`, 끈 story 없음).
  - **smoke**: page에 서버 컴포넌트로 `<Alert color="warning" title>`(정적)과 `<Alert color="brand" role="status">`. `Alert.js`·`alert-style.js`에 `"use client"`가 없는지, 출력 CSS에 `-me-1`·`-my-0.5`(@source), prerender HTML에 `data-color`·정적 Alert 역할 없음·`role="status"`·아이콘 `aria-hidden`·닫기 버튼 없음, 빌드 결과에 Info·TriangleExclamationPoint 아이콘 도형, nodenext `AlertProps`(`brand`, `role: "status"`, `onClose`)와 `"blue"`·`role: "button"` 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 460(이전 436), icons 18, components 853(이전 748), docs 191(이전 180) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(`@tide-tds/components`·`@tide-tds/foundation` patch). 첫 `--force` 실행에서 components browser 11개 파일이 「Failed to import test file … SyntaxError」로 한 번 실패했고, 바로 다시 돌린 단독 실행과 전체 `--force` 재실행은 모두 통과했다(Alert 코드와 무관한 파일들도 함께 실패). 원인은 아래 2026-11-11 조사 기록 참고(찾지 못함).
  - **ADR과 티켓 본문 차이**: 티켓 본문은 「info·success·warning·danger 메시지」만 말하지만 ADR 0016은 Alert `color`를 `Role`(앱 Role 포함)로 정한다. ADR을 따라 Role 전체를 받고, 상태 4개 밖의 Role은 info 아이콘으로 처리했다. 그 밖에는 어긋남이 없다. 새 구조적 결정이 없어 ADR은 더하지 않았다(색 범위는 ADR 0016, 내부 공유 모듈은 `pressable.ts` 선례).
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 기본 `color`를 `info`로 했다(다른 행동·의미 Component는 `primary`, Badge는 `neutral`). 뜻을 고르지 않은 Alert는 「안내」로 읽히는 편이 자연스럽다고 봤다.
    2. `variant`가 없다(subtle 표면 하나). solid·outline 알림이 필요하면 따로 정한다.
    3. 제목은 `title` prop(HTML `title` 속성을 `Omit`)이고 `AlertTitle`·`AlertDescription` 하위 Component는 두지 않았다. 제목은 heading 요소가 아니다(수준을 앱이 모름). heading이 필요하면 `title={<h2 …>}`처럼 넣는다.
    4. 앱 Role의 경계 × 자기 subtle, `outline-focus` × 자기 subtle은 `tide-color`가 검사하지 않는다(`colorContrastRules`를 바꾸면 기존 앱 브랜드 CSS 빌드가 새로 실패할 수 있어 손대지 않았다). 넣을지 정해야 한다.
    5. 상태 아이콘을 바꾸는 `icon` prop이 없다. 앱 Role은 i 아이콘 고정이다.
    6. 닫은 뒤 포커스 이동은 앱 몫으로 문서에만 적었다(제어형이라 Alert가 다음 포커스 자리를 모름).
    7. 본문 Link는 같은 Role로 칠해야 대비 쌍이 맞는다(`<Link color="danger">`). 기본 `primary` Link를 넣으면 `text-primary` × `bg-danger-subtle`은 등록되지 않은 조합이다. 문서 Do로만 안내하고 강제하지 않았다.
  - **다음 티켓 메모**: 34(Toast)는 `alert-style.ts`의 `alertLayoutClass`·`alertIconClass`·`alertContentClass`·`alertTitleClass`·`alertDescriptionClass`·`alertCloseClass`·`alertStatusIcon`을 import하고, 표면은 `alertSurfaceClass` 대신 raised(`border border-raised bg-raised shadow-md`)로 바꾼다. 그때 글자가 `text-accent`가 아니라면 대비 쌍(`text-<role>` × `bg-raised`는 등록됨)을 다시 확인한다. Toast는 region이 live region을 맡으므로 Alert의 `role`을 쓰지 않는다. 30(AlertDialog)은 Alert와 이름만 비슷하고 스타일을 공유하지 않는다.
- 2026-11-11 첫 cold 실행의 「Failed to import test file … SyntaxError: Unexpected token '}'」 조사(코디네이터 요청). **원인을 찾지 못했고 고치지 않았다.**
  - **관찰**: 실패는 `chromium` instance에서만, 38개 파일 중 11개(Alert·Badge·Card·Field·foundation-motion·foundation-shape·IconButton·Input·Link·Separator·Typography)가 같은 cause로 났다. 같은 instance의 Button·Checkbox·Radio·Switch·Spinner·VisuallyHidden·foundation-color는 통과했고, 실패 파일끼리 공통 import는 없다. vitest 5.1.0 browser tester(`@vitest/browser` `tester-*.js`)는 브라우저 `import()` 실패를 cause만 남기고 감싸므로, 어느 모듈의 몇째 줄인지는 로그에 없다.
  - **재현 시도(모두 통과)**: 티켓 20 브랜치 cold(`rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force`) 13회, 세션 순서 재연(components `node_modules/.vite`·`.vitest` 삭제 → Alert 테스트만 실행해 캐시 생성 → cold 전체) 3회, main 134ce12 cold 3회, components 단독 3회, optimizer 캐시를 지운 단독 1회. import 실패 0회. 별개로 cold 1회에서 `chromium-forced-colors` Typography 테스트 1개가 「frame.evaluate: Frame was detached」로 실패했다(이것도 재현 안 됨).
  - **배제한 가설**: ① turbo 순서: `test`는 `dependsOn: ["^build"]`라 foundation·icons build가 끝난 뒤 시작한다. components 자신의 build(dist 재작성)를 12회 반복하며 동시에 테스트해도 통과했다(테스트는 components dist를 import하지 않는다). ② dep optimizer 재최적화: `DEBUG=vite:deps`에서 cold는 「the scanner found every used dependency」, 캐시가 있으면 「Hash is consistent. Skipping」이고 실행 중 「new dependencies optimized」·reload 로그가 없다. Alert만 돌려 만든 캐시에도 전체 실행에 필요한 dep이 모두 있었다. ③ smoke의 `pnpm pack`: 세 패키지 pack을 15회 반복하며 동시에 테스트해도 통과(prepack 등 lifecycle 없음). ④ components·docs 두 browser 서버의 포트 충돌: 동시 실행 중 `[::1]:23315`와 `[::1]:23316`으로 따로 bind했다. ⑤ vitest `fsModuleCache`: 기본 `false`이고 browser에는 적용되지 않는다(vitest v5 docs `config/fsmodulecache.md`).
  - **남은 가능성(미확인)**: 첫 실행 시각(10:46경)에 이 worktree 밖의 프로세스(다른 worktree 에이전트의 테스트·빌드)가 함께 돌며 생긴 부하나 간섭. 증거가 없어 추측으로 남긴다. 다시 나면 실패 직후 `packages/components/.vitest/attachments`와 같은 시각의 다른 worktree 작업을 함께 기록한다.
