# 01: Tabs 고른 표시 이동과 `shape` prop 더하기

Status: resolved

## What to build

탭마다 있던 `::after` 막대 대신 `TabList` 안에 고른 표시 하나(`TabIndicator`)를 두고, 고른 탭의 위치·크기로 미끄러지게 한다. `Tabs`에 `shape?: "underline" | "rounded"`(기본값 `underline`)를 더한다(사용자 요청 2026-11-20, ADR 0038).

## 할 일

- [x] components: `TabsShape` 타입, `shape` JSDoc·context·`data-shape`, `TabIndicator`(`Tabs/components/`), 측정 hook `useTabIndicator`(`Tabs/hooks/`), shape×orientation class 맵
- [x] 이동: `translate`·`width`·`height`를 `duration-normal` `ease-out`으로, `motion-safe:`에만. 고른 탭이 바뀔 때만 미끄러지고 첫 렌더·크기 변화·숨었다 보일 때는 transition 없이 놓는다
- [x] 재기 전 fallback: `TabList`에 `data-measured`가 없으면 고른 탭이 자기 막대·바탕으로 보인다(서버 렌더, 숨은 채 마운트)
- [x] forced-colors: 두 모양 모두 `Highlight`. rounded는 바탕을 빼고 2px 테두리
- [x] 대비: `text-muted` × `bg-neutral-subtle` 4.5 쌍 등록(foundation), components 대비 테스트에 rounded 쌍
- [x] 테스트: 누름·키보드 이동, 첫 렌더 transition 없음, reduced-motion, shape class, 세로 두 모양, 글자 변경 폭 따라가기, 숨은 채 마운트, forced-colors
- [x] 문서: Storybook 「모양」「세로 rounded」 예시와 `shape` control, MDX 「모양 고르기」「고른 표시의 움직임」·접근성·Props, GLOSSARY Tabs, Motion 「무엇을 움직이나」, ADR 0038
- [x] changeset(`@tide-design/components` minor, `@tide-design/foundation` patch)

## 판단한 곳

- rounded 고른 표시는 `bg-raised`가 아니라 `bg-surface`다. dark에서 `bg-raised`와 `bg-neutral-subtle`이 같은 gray-900이라 경계 1px로만 구분된다. 경계는 raised 관례(`border-raised` + `shadow-sm`)를 따른다. PR에서 Storybook 색감 확인을 요청한다.
- rounded 탭 목록은 `self-start`로 탭 폭만큼만 선다. 가로로 꽉 채우면 회색 띠가 패널 폭만큼 길어진다. 앱은 `className`으로 바꿀 수 있다.
- 스프링(stiffness 300, damping 30) 대신 `ease-out` 300ms다. Tide Component는 easing Token 하나만 쓴다.
- CSS anchor positioning은 세 엔진 지원과 anchor 변경 시 전환 동작을 1차 자료로 확인하지 못해 쓰지 않는다.
- 크기 변화(글자·창)는 미끄러지지 않고 바로 따른다. 창을 줄일 때 표시가 늦게 따라오면 탭과 어긋나 보인다.
- `TabsShape`는 `TabsOrientation`·`TabsActivationMode`처럼 내보낸다. Tabs가 이미 값 타입을 공개하는 관례를 따랐다.

## 범위 밖

- 패널 전환 애니메이션(옆으로 미끄러짐, blur, 높이 애니메이션). 패널은 지금처럼 바로 바뀐다.
- 스프링 easing Token
- 탭 목록 가로 스크롤(넘치는 탭)
