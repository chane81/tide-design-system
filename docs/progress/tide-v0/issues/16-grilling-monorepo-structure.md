# 모노레포 패키지 구조와 빌드 결정

Type: grilling
Status: open
Blocked by: 05, 03, 17, 19

## Question

패키지 목록과 이름, npm scope, 각 패키지의 exports 경로(Token CSS, Tailwind theme, React), 빌드 도구 구성, Storybook 앱 위치, 공통 설정(tsconfig, oxlint, oxfmt)을 어떻게 공유할지 결정한다. 제약: npm scope는 `@tide-tds`이고, Next.js App Router 앱에서 import해서 바로 쓸 수 있어야 한다("Next.js App Router 호환성 조사" 티켓 참고). 리서치로 남은 쟁점: TS 6/7 병행 여부, d.ts 생성 도구, `"use client"` 보존 방식.

### 참고 (다른 티켓에서 넘어온 것)

- 「Token 네이밍과 Utility class 노출 규칙 결정」: Token 원본은 TS 객체이고, 직접 만든 빌드 스크립트가 CSS(`--tide-*`, `[data-theme]`, `@theme inline`, `@custom-variant dark`)와 tailwind-merge 설정을 만든다. 이 스크립트와 출력물을 어느 패키지에 두고 어떤 exports 경로로 내보낼지 여기서 정한다. 빌드한 CSS에 기대한 class가 있는지 확인하는 CI 테스트를 둘 위치도 정한다.
- 「접근성 동작 구현 방식 결정」: `react-aria` 3.53.1과 `react-stately` 3.51.0을 dependencies로 둘지 peer로 둘지 정한다. hook을 쓰는 Component는 클라이언트 전용이라 `"use client"` 경계 안에 있어야 한다(ADR 0004).
- 「Component 공통 API 규칙 결정」: React peer 범위는 `^19`이다. `cn`(clsx + 생성된 tailwind-merge 설정)과 공통 union 타입(`Variant`, `Color`, `Size`)을 공개 export하므로, 어느 패키지에 둘지 여기서 정한다. `"use client"`는 hook, state, 이벤트 처리를 쓰는 Component 파일에만 붙는다. 여러 부분으로 된 Component는 평평하게 export한다(`DialogTrigger`).
