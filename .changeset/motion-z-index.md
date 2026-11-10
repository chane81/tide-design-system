---
"@tide-tds/foundation": patch
---

duration 2단계(`duration-fast` 150ms, `duration-normal` 300ms), easing `ease-out`, 쌓임 단계 5개(`z-sticky` 100, `z-modal` 200, `z-popover` 300, `z-toast` 400, `z-tooltip` 500)를 더했다. 시간을 적지 않은 `transition-colors` 등도 Tide 기본값(`fast`, `out`)을 따른다.

- 공개 계약 CSS 변수: `--tide-duration-fast`, `--tide-duration-normal`, `--tide-ease-out`, `--tide-z-<단계>`
- Tailwind 기본 transition 값(`--default-transition-duration` 150ms, `--default-transition-timing-function` `cubic-bezier(0.4, 0, 0.2, 1)`)을 `--tide-duration-fast`, `--tide-ease-out`으로 바꿨다. 시간을 적지 않은 transition의 곡선이 `ease-out`으로 바뀐다.
- `ease-in`, `ease-in-out`, 숫자 class(`duration-150`, `z-10`)는 Tailwind 기본값대로 남는다.
- 단계가 100 간격이라 앱 단계를 사이에 끼울 수 있다(예: `z-[250]`).
- tailwind-merge 설정에 duration·쌓임 단계 이름을 등록해서 `className`의 `duration-normal`, `z-modal`이 Tide class를 이긴다.
- Token 객체 `duration`, `easing`, `zIndex`를 루트에서 export한다.
