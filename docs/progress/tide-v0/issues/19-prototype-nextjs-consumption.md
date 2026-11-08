# Next.js 소비 흐름 end-to-end 검증

Type: prototype
Status: open
Blocked by: 없음

## Question

문서만으로는 확인할 수 없었던 다음 항목이 실제로 동작하는가? 최소 구성의 pnpm workspace(token 패키지 하나, React 패키지 하나, Button 하나)를 Vite 8로 빌드하고, Next.js 16 App Router 앱에서 `@tide-tds/*`로 import해 확인한다.

1. 빌드한 결과물에 `"use client"` 지시어가 남는가? `preserveModules`를 쓰는 방식과 entry를 나누는 방식을 비교한다.
2. 앱이 `@import`로 theme CSS를 불러올 때 패키지의 `exports` 경로가 해석되는가?
3. pnpm symlink 환경에서 `@source`가 동작하는가? `@source` 줄을 Tide의 theme CSS 안에 넣어도 되는가?
4. node_modules에서 import한 theme의 Token이 Tailwind IntelliSense 자동완성에 뜨는가? (`w-`, `bg-` 입력 시)
5. TS 7만 설치된 환경에서 d.ts 생성이 되는가, 아니면 TS 6을 함께 설치해야 하는가?

결과는 "모노레포 패키지 구조와 빌드 결정" 티켓의 입력이 된다. 프로토타입 코드는 `prototype/nextjs-consumption` 브랜치에 두고 main에는 merge하지 않는다.
