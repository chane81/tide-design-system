# npm scope를 `@tide-tds`에서 `@tide-design`으로 바꾼다

근거 원칙: ④ 발견할 수 있음이 외워야 함보다 우선한다

`tds`는 Tide Design System의 약자라서 `@tide-tds`는 `tide`가 두 번 들어간다. 문서 사이트 주소를 `tide-tds.lakegreen.net`에서 `tds.lakegreen.net`으로 바꾸면서 npm 이름도 맞추기로 했다(2026-11-13, 사용자 결정).

## 결정

- 배포 패키지 셋을 새 scope로 옮긴다: `@tide-design/foundation`, `@tide-design/icons`, `@tide-design/components`. 문서 앱은 `@tide-design/docs`, smoke 앱은 `@tide-design/smoke-next`다.
- components의 원본 export 조건도 `@tide-tds/source`에서 `@tide-design/source`로 바꾼다.
- 버전은 끊지 않고 이어 간다. 이름이 바뀌는 것은 [공개 계약](../../GLOSSARY.md)을 바꾸는 것이므로 세 패키지 모두 minor(0.11.0)로 올린다(0.x에서 minor는 breaking).
- 옛 `@tide-tds/*` 패키지는 지우지 않고 `npm deprecate`로 새 이름을 안내한다. 옛 이름으로는 더 publish하지 않는다.
- 새 패키지는 trusted publisher를 패키지 설정에서만 걸 수 있다. 그래서 새 이름마다 사람이 placeholder를 한 번 publish해 패키지를 만들고, trusted publisher를 건 뒤 Version PR을 머지해 CI가 0.11.0을 publish한다([ADR 0008](0008-fixed-versions-and-oidc-direct-publish.md)의 설정을 그대로 옮긴다).

## 고른 이름

npm에서 디자인 시스템 관련 scope 653개를 모아 이름 꼴을 세었다. 브랜드 이름만 쓰는 꼴이 85%로 가장 많고, `-ui`(7%), `-design-system`(3%), 붙여 쓴 `ds`(2%), `-design`(2%), `-ds`(1%) 순이었다.

- `@tide`, `@tide-ui`, `@tideui`는 이미 다른 사람이 쓴다.
- `@tide-design`은 `-design` 꼴이라 디자인 시스템으로 바로 읽히고, `@tide-design-system`보다 짧다.
- `@tide-ds`는 쓸 수 있지만 흔하지 않은 꼴이다.

## 결과

- 앱은 import와 CSS `@import` 경로의 `@tide-tds/`를 `@tide-design/`로 바꿔야 한다. CSS 변수(`--tide-*`), Utility class, Component 이름은 그대로다.
- 지난 티켓·리서치·ADR과 CHANGELOG는 당시 기록이라 옛 이름을 그대로 둔다.
- Storybook tag도 `@tide-design/docs@<버전>`이 된다.
