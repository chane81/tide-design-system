# Tailwind theme 노출과 자동완성 조사

Type: research
Status: resolved
Blocked by: 없음

## Question

Tailwind 최신 안정 버전에서 다음을 확인한다. (1) 커스텀 theme을 정의하는 방식 (2) 기본 컬러 팔레트를 제거하고 간격 규칙은 유지하는 방법 (3) 라이브러리 패키지가 theme CSS를 배포하고 앱이 이를 import하는 방식 (4) 앱이 node_modules에 있는 Component 클래스를 스캔하게 하는 방법 (5) Tailwind IntelliSense가 커스텀 Token을 자동완성하는 조건 (6) dark Theme variant를 CSS 변수와 연결하는 방식 (7) tailwind-merge가 커스텀 theme을 다룰 수 있는지. 모든 항목은 공식 문서와 context7로 확인하고 버전을 명시한다.

## Answer

기준 버전은 tailwindcss 4.3.5, tailwind-merge 3.7.0, IntelliSense v0.16.0이다.

- theme은 CSS의 `@theme`로 정의한다. `--color-*: initial`을 쓰면 기본 팔레트만 지워지고, `--spacing`(0.25rem) 기반 숫자 간격 규칙은 그대로 남는다. `--*: initial`은 간격까지 지운다.
- 라이브러리는 `@theme`만 담은 CSS를 배포하고, 앱은 `@import "tailwindcss"` 다음에 그 CSS를 import한다. node_modules는 기본 스캔에서 제외되므로 Component 패키지는 `@source`로 등록해야 한다.
- IntelliSense는 `@import "tailwindcss"`가 있는 root `.css`의 `@theme`를 근거로 자동완성한다. 감지가 안 되면 `tailwindCSS.experimental.configFile`을 쓴다. `cn()` 등 함수 안의 자동완성은 `classFunctions`로 켠다.
- dark Theme은 선택자에서 CSS 변수 값을 바꾸고 `@theme inline`으로 연결하면 `dark:` 없이 전환할 수 있다. `dark:` variant의 전환 기준은 `@custom-variant`로 바꾼다.
- tailwind-merge 3.7.0은 Tailwind 4.0~4.3을 지원한다. 커스텀 색은 설정이 필요 없지만, 커스텀 text size, radius 같은 이름은 `extendTailwindMerge`에 등록해야 한다. pnpm symlink 환경의 `@source` 동작 등 미검증 항목이 3개 있다.

리서치: [docs/research/tailwind-theme-and-autocomplete.md](../../../research/tailwind-theme-and-autocomplete.md)
