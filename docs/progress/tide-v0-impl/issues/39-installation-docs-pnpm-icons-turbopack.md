# 39: 설치 문서 정정(pnpm에서 icons 직접 설치, Turbopack Tailwind)

Status: ready-for-agent
Blocked by: 12 (0.1.0 첫 publish)

## What to build

앱 개발자가 설치 페이지만 보고 따라 해도 막히지 않는다. 12에서 새 Next 앱에 0.1.0을 설치해 보니 문서와 실제가 두 군데 어긋났다(12 Comments 참고).

## 수용 기준

- [ ] `apps/docs/src/getting-started/`의 설치 문서와 `foundations/Icons.mdx`의 "설치"에서 icons가 components와 "함께 설치된다"는 설명을 고친다. 아이콘을 import하려면 `@tide-tds/icons`를 components와 같은 버전으로 직접 설치해야 한다(pnpm은 전이 의존성을 앱에서 import할 수 없게 한다).
- [ ] "준비" 절의 Tailwind 설명을 create-next-app 16.4 기본값에 맞춘다. Turbopack 기본값은 `@tailwindcss/turbopack`(`next.config.ts`의 `turbopack.rules`)을 쓰고, `@tailwindcss/postcss`는 필수가 아니다. 두 방식 모두 Tide CSS가 동작함을 적는다. 버전 근거는 context7 또는 공식 문서로 확인해 밝힌다.
- [ ] 문서 작성 기준(37)을 따른다.
- [ ] 문서만 바뀌므로 changeset은 넣지 않는다(패키지 변경이 생기면 넣는다).

## Comments
