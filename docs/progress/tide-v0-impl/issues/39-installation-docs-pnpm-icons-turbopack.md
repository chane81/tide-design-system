# 39: 설치 문서 정정(pnpm에서 icons 직접 설치, Turbopack Tailwind)

Status: done
Blocked by: 12 (0.1.0 첫 publish)

## What to build

앱 개발자가 설치 페이지만 보고 따라 해도 막히지 않는다. 12에서 새 Next 앱에 0.1.0을 설치해 보니 문서와 실제가 두 군데 어긋났다(12 Comments 참고).

## 수용 기준

- [x] `apps/docs/src/getting-started/`의 설치 문서와 `foundations/Icons.mdx`의 "설치"에서 icons가 components와 "함께 설치된다"는 설명을 고친다. 아이콘을 import하려면 `@tide-tds/icons`를 components와 같은 버전으로 직접 설치해야 한다(pnpm은 전이 의존성을 앱에서 import할 수 없게 한다).
- [x] "준비" 절의 Tailwind 설명을 create-next-app 16.4 기본값에 맞춘다. Turbopack 기본값은 `@tailwindcss/turbopack`(`next.config.ts`의 `turbopack.rules`)을 쓰고, `@tailwindcss/postcss`는 필수가 아니다. 두 방식 모두 Tide CSS가 동작함을 적는다. 버전 근거는 context7 또는 공식 문서로 확인해 밝힌다.
- [x] 문서 작성 기준(37)을 따른다.
- [x] 문서만 바뀌므로 changeset은 넣지 않는다(패키지 변경이 생기면 넣는다).

## Comments

- 2026-11-10 완료.
  - `getting-started/Installation.mdx`: 첫 줄 요약의 「패키지 하나」를 「Tide 패키지」로 고쳤다. 「1. 패키지 설치」를 `pnpm add @tide-tds/components @tide-tds/icons`로 바꾸고 이유를 목록으로 적었다. foundation은 함께 설치되고, icons는 pnpm에서 직접 설치해야 하며, npm처럼 끌어올리는 매니저에서도 전이 의존성에 기대지 않으려고 직접 설치한다. 「같은 버전으로」 절 문장도 icons 직접 설치에 맞게 다듬었다.
  - 같은 파일 「준비」: 플러그인을 `@tailwindcss/turbopack` 또는 `@tailwindcss/postcss`로 적고, 두 구성을 표(구성·플러그인·설정 파일)와 직접 설치 소제목 두 개로 나눴다. Turbopack 예시는 create-next-app 16.4.5가 만든 `next.config.ts`의 `turbopack.rules`(`loaders: ["@tailwindcss/turbopack"]`, `as: "*.css"`) 그대로다.
  - `foundations/Icons.mdx` 「설치」: 「components를 설치하면 함께 설치」를 「components와 같은 버전으로 직접 설치, pnpm에서는 components만으로 import 불가」로 고치고 설치 페이지를 링크했다.
  - 근거: create-next-app 템플릿(context7 `/vercel/next.js` canary `packages/create-next-app/templates/index.ts`)은 Turbopack이면 `@tailwindcss/turbopack`, 아니면 `@tailwindcss/postcss`를 넣는다. `@tailwindcss/turbopack` 4.3.5 README의 사용법도 `turbopack.rules`의 `*.css` loader다.
  - 확인: 12의 scratch 앱(Next 16.4.5, Tailwind 4.3.5, pnpm 12)을 `@tailwindcss/postcss` 4.3.5 + `postcss.config.mjs`로 바꿔 `next build`(Turbopack)와 `next build --webpack`을 돌렸다. 둘 다 통과했고, CSS에 `bg-primary-solid`가 있고 Tailwind 기본 팔레트(`--color-red-500`)는 0개였다. 확인 뒤 앱은 원래 구성으로 되돌렸다. Turbopack 구성은 12에서 확인했다.
  - `docs/progress/tide-v0-impl/README.md` 40번 행의 표 정렬(공백 1칸)을 `pnpm format:check` 통과를 위해 고쳤다.
  - 문서만 바뀌어 changeset은 넣지 않았다. 패키지 CHANGELOG의 옛 문장은 기록이라 두었다.
