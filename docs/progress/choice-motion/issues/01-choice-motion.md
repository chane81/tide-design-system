# 01: Checkbox 그리기·Radio 점 확대 더하기

Status: resolved

## What to build

Checkbox를 체크하면 체크 표시가 시작점에서 끝점으로 그려지고, indeterminate 가로줄은 왼쪽에서 오른쪽으로 그려진다. Radio를 고르면 점이 가운데에서 커진다. 처음 렌더할 때 이미 선택된 표시는 움직이지 않는다(사용자 요청 2026-11-20).

## 할 일

- [x] Checkbox 전용 SVG(`Checkbox/components/CheckboxMark.tsx`): Lucide `check`·`minus` path, `pathLength="1"`, 화면 두께를 viewBox 단위로 환산
- [x] 체크·가로줄: `stroke-dashoffset` 1→0, `normal`·`ease-out`. 해제는 opacity `fast`, dash는 사라진 뒤 되감기
- [x] Radio 점: opacity + `scale` 0.5→1, `fast`·`ease-out`
- [x] 공용 `choiceMarkClass`의 숨김을 `display:none`에서 opacity로 바꾸기
- [x] 움직임 줄이기: dash·scale은 `motion-safe:`, opacity 전환만 남김
- [x] browser 테스트: 체크 시 transition, 해제 시 opacity·지연, 첫 렌더 미재생(비제어·제어·indeterminate), indeterminate↔체크 전환, reduced-motion opacity만, Radio 확대·첫 렌더
- [x] 테스트 helper: `test/motion.ts`에 `afterChange`, `transitions`에 시간·easing
- [x] 문서: Checkbox·Radio MDX, Motion MDX 「무엇을 움직이나」·「움직임 줄이기」, ADR 0037, 원칙 목록
- [x] 체크·가로줄 선 두께 3→2px(추가 요청 2026-11-20)
- [x] changeset(`@tide-design/components` minor)

## 판단한 곳

- **첫 렌더 미재생은 transition으로 보장한다.** 표시를 늘 렌더하고 값을 `:checked`·`:indeterminate`에 묶었다. transition은 값이 바뀔 때만 돈다. `display`를 바꾸면 transition이 시작되지 않아 숨김을 opacity로 바꿨다.
- **아이콘 Component 대신 전용 SVG.** non-scaling-stroke와 `pathLength`를 함께 쓰면 Chromium·Firefox·WebKit 모두 dash가 화면 픽셀로 계산되어 맞지 않았다. 환산 두께는 세 브라우저에서 기존 아이콘과 픽셀이 같았다(Playwright로 확인).
- **체크할 때 opacity는 바로 1이다.** opacity까지 서서히 올리면 펜 끝이 흐리게 시작해 「그리는」 느낌이 약해진다. 움직임 줄이기에서는 opacity `fast`로 나타난다.
- **누름 축소는 넣지 않았다.** 누름 축소는 Button·IconButton 관례(ADR 0010)이고 Checkbox·Radio·Switch에는 없다. 그리기와 겹치면 움직임이 두 겹이 된다. PR에서 의견만 적는다.

## 범위 밖

- Switch thumb 움직임 바꾸기
- Checkbox·Radio 누름 축소

## Comments

- 브라우저 확인: 저장소 browser 테스트는 Chromium(기본, forced-colors+reduced-motion) 두 instance다. Firefox·WebKit·Firefox reduced-motion은 임시 설정으로 움직임 테스트를 돌려 통과를 확인했고 설정은 커밋하지 않았다.
