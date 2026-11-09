# 07: motion·z-index Foundation

Status: ready-for-agent
Blocked by: 06 (radius·Elevation·포커스 표시 Foundation)

## What to build

앱 개발자가 `duration-fast`, `duration-normal`, `ease-out`을 쓰고, 시간을 적지 않은 `transition-colors`도 Tide 기본값을 따른다. 쌓임 단계를 `z-modal` 같은 class로 쓰고, 100 간격 사이에 자기 단계를 끼울 수 있다. 이로써 Foundation이 완성된다.

## 수용 기준

- [ ] duration `fast` 150ms, `normal` 300ms(`--transition-duration-*`). easing은 `out` 하나다.
- [ ] `--default-transition-duration`과 `--default-transition-timing-function`을 Tide 값으로 지정한다.
- [ ] 공개 계약 `--tide-duration-fast`, `--tide-duration-normal`, `--tide-ease-out`.
- [ ] 쌓임 단계: `--z-index-*` namespace, `sticky` 100, `modal` 200, `popover` 300, `toast` 400, `tooltip` 500. 공개 계약은 `--tide-z-*`다.
- [ ] tailwind-merge 설정이 z-index와 duration 이름 충돌을 해결한다(`z-modal`, `duration-fast`).
- [ ] `unit`: 컴파일한 CSS에 z-index 5개와 duration 2개, 기본 transition 값이 있다. 공개 계약 목록이 갱신된다.
- [ ] 문서: motion 블록(재생 가능)을 Token 원본에서 그린다. z-index 페이지에 sticky 헤더용 `scroll-padding-top` 가이드를 둔다.

## Comments
