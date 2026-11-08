# 모노레포 패키지 구조와 빌드 결정

Type: grilling
Status: open
Blocked by: 05, 03, 17, 19

## Question

패키지 목록과 이름, npm scope, 각 패키지의 exports 경로(Token CSS, Tailwind theme, React), 빌드 도구 구성, Storybook 앱 위치, 공통 설정(tsconfig, oxlint, oxfmt)을 어떻게 공유할지 결정한다. 제약: npm scope는 `@tide-tds`이고, Next.js App Router 앱에서 import해서 바로 쓸 수 있어야 한다("Next.js App Router 호환성 조사" 티켓 참고). 리서치로 남은 쟁점: TS 6/7 병행 여부, d.ts 생성 도구, `"use client"` 보존 방식.
