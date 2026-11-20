# 01: Checkbox 채움·그리기와 Radio 점 움직임 더하기

Status: resolved

## What to build

Checkbox를 체크하면 상자 채움이 커지며 차고, 그 뒤에 체크 표시가 시작점에서 끝점으로 그려진다. indeterminate 가로줄도 같다. Radio를 고르면 점이 가운데에서 살짝 넘쳤다가 자리 잡는다. 처음 렌더할 때 이미 선택된 표시는 움직이지 않는다(사용자 요청 2026-11-20, 참고 UI 예시로 사양 보정). 사양은 [ADR 0037](../../../decisions/0037-choice-selection-motion.md) 표를 따른다.

## 할 일

- [x] Checkbox 전용 SVG(`Checkbox/components/CheckboxMark.tsx`): Lucide `check`·`minus` path, `pathLength="1"`, 화면 두께를 viewBox 단위로 환산
- [x] Checkbox 채움 레이어(`data-fill` span): scale 0.7→1 `normal`, opacity `fast`. 오류 색은 레이어에 다시 적고, 비활성·forced-colors에서는 숨겨 input이 칠한다
- [x] 체크·가로줄: `fast` 지연 뒤 dash + opacity `normal`. 해제는 지연 없이 `fast`로 거꾸로 지우기
- [x] Radio 점: scale 0→1 + opacity `normal`, overshoot `cubic-bezier(0.34, 1.56, 0.64, 1)`(Radio 상수). 사라짐은 `fast`·`ease-out`
- [x] 공용 `choiceMarkClass`의 숨김을 `display:none`에서 opacity로 바꾸기
- [x] 움직임 줄이기: dash·scale은 `motion-safe:`, opacity 전환만 남김
- [x] 체크·가로줄 선 두께 3→2px(추가 요청 2026-11-20)
- [x] browser 테스트: 체크·해제 시간과 지연, 그리는 도중 되돌아가기, Space·방향키, 누름·hover에 크기 그대로, 첫 렌더 미재생(비제어·제어·indeterminate), indeterminate↔체크, reduced-motion opacity만(채움은 `emulateReducedMotion`), Radio overshoot가 테두리 안쪽에 닿지 않음(sm·md), 선 두께 2px
- [x] 테스트 helper: `test/motion.ts`에 `afterChange`, `transitions`에 시간·easing, `test/commands.ts`에 `emulateReducedMotion`
- [x] smoke: Checkbox class 검사를 `peer-indeterminate:opacity-100`으로
- [x] 문서: Checkbox·Radio MDX, Motion MDX 「무엇을 움직이나」·「움직임 줄이기」, ADR 0037, 원칙 목록
- [x] changeset(`@tide-design/components` minor)

## 판단한 곳

- **첫 렌더 미재생은 transition으로 보장한다.** 표시·채움을 늘 렌더하고 값을 `:checked`·`:indeterminate`에 묶었다. transition은 값이 바뀔 때만 돈다. `display`를 바꾸면 transition이 시작되지 않아 숨김을 opacity로 바꿨다.
- **채움은 input `::before`가 아니라 형제 span이다.** `appearance: none` input의 가상 요소는 브라우저마다 그려지지 않을 수 있다. 오류 색 변수는 input에 걸려 형제에 닿지 않아 레이어에 `peer-aria-invalid:`로 다시 적었다.
- **아이콘 Component 대신 전용 SVG.** non-scaling-stroke와 `pathLength`를 함께 쓰면 Chromium·Firefox·WebKit 모두 dash가 화면 픽셀로 계산되어 맞지 않았다. 같은 두께로 환산하면 세 브라우저에서 기존 아이콘과 픽셀이 같았다(Playwright로 확인).
- **누름 축소는 넣지 않았다.** 누름 축소는 Button·IconButton 관례(ADR 0010)다. Checkbox와 Radio를 같게 두려고 둘 다 넣지 않는다.
- **채움의 움직임 줄이기는 기본 instance에서 검사한다.** 두 번째 instance는 forced-colors와 reduced-motion을 함께 켜 채움 레이어가 숨기 때문이다.

## 범위 밖

- Switch thumb 움직임 바꾸기
- pop 변형(스프링 확대)
- overshoot 곡선을 foundation easing Token으로 올리기(쓰는 곳이 늘면)

## Comments

- 브라우저 확인: 저장소 browser 테스트는 Chromium(기본, forced-colors+reduced-motion) 두 instance다. Firefox·WebKit·Firefox reduced-motion은 임시 설정으로 움직임 테스트를 돌려 통과를 확인했고 설정은 커밋하지 않았다.
- 처음 구현은 해제를 opacity로만 사라지게 했고 Radio 점은 0.5배에서 `fast`로 커졌다. 참고 예시로 사양을 보정해 지금 사양으로 바꿨다.
