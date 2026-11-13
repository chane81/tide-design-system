# 모노레포 구조 규칙

Tide 모노레포의 **콜로케이션** 구조 규칙. 파일·폴더를 만들거나 옮길 때, 패키지·앱을 추가할 때 따른다.

- 규칙 번호별 ✅/❌ 예시: `monorepo-structure.examples.md`. 배치가 애매하면 같은 번호 예시부터 본다.
- 결정 배경: [ADR 0028](../../docs/decisions/0028-colocation-monorepo-structure.md), 공개 Component 폴더화는 [ADR 0029](../../docs/decisions/0029-components-always-folders.md), `_internal/`은 [ADR 0030](../../docs/decisions/0030-components-internal-folder.md)

## 골격

```
<root>/
├── packages/
│   ├── foundation/src/        # Token·색 계산·CSS 생성. 프레임워크 무관
│   ├── icons/src/             # Lucide 생성 아이콘 + IconBase
│   └── components/src/        # React Component
│       ├── index.ts           # 공개 API
│       ├── Button/            # 공개 Component는 모두 폴더(본문 + 테스트 + index.ts)
│       └── _internal/{components,hooks,libs,constants}/   # 여러 Component가 함께 쓰는 비공개 코드
├── apps/
│   ├── docs/src/              # Storybook 문서 사이트
│   │   ├── stories/<section>/ # 사이드바 섹션별 MDX·stories
│   │   └── {components,hooks,libs,constants}/   # 문서 앱 전역
│   └── smoke-next/            # 배포 결과를 Next.js로 검사하는 smoke 앱
├── scripts/                   # 저장소 도구(릴리스·배포) 스크립트
├── pnpm-workspace.yaml
└── turbo.json
```

스택: pnpm workspace + catalog, Turborepo, packages는 tsdown으로 `dist` 빌드, 문서는 Storybook, 테스트는 vitest, lint·format은 oxlint·oxfmt. 설정은 [빌드·패키지 설정](#빌드패키지-설정).

## 배치

1. **폴더 이름은 `components` `hooks` `libs` `constants` 네 개.** 어느 깊이에서든 같은 뜻이다.
   - `components`: 내부 React Component
   - `hooks`: React hook. hook이 읽는 Context도 그 hook 파일에 둔다.
   - `libs`: 순수 함수(class 조합·컬렉션 노드 만들기 등)
   - `constants`: class 문자열·variant 맵·고정 값
   - `utils`·`helpers`·`common`·`shared`·`style`·`blocks`가 떠오르면 이 넷 중 하나를 고른다. 한 파일에 상수와 함수가 섞이면 나눈다.
   - 타입만 모은 파일은 폴더 대신 `types.ts`로 둔다.
2. **쓰는 곳 가장 가까이 둔다.**
3. **쓰는 곳이 실제로 늘면 가장 가까운 공통 부모로 승격한다.** Component 폴더 안 `<C>/{hooks,…}` → 패키지 공용 위치 → 다른 패키지(4번 조건을 만족할 때만).
   - 패키지 공용 위치: `packages/components`는 `src/_internal/{components,hooks,libs,constants}`, 그 밖의 패키지·앱은 `src/{components,hooks,libs,constants}`.
   - `_internal/`은 공개 Component 폴더와 섞이지 않게 모은 비공개 코드 자리다. `src/index.ts`에서 재수출하지 않는다(`cn`처럼 공개해야 하면 진입점이 이름을 골라 재수출한다).
   - "언젠가 다른 Component도 쓸 테니" 처음부터 올리지 않는다.
   - 쓰는 곳이 하나로 줄면 다시 그 Component 폴더로 내린다.
4. **패키지마다 들어가는 조건이 다르다.**
   - `foundation`: React·DOM 없이 설명되는 것. Token 값, 색 계산, CSS·tailwind-merge 설정 생성(ADR 0001).
   - `icons`: 아이콘 Component와 그 생성 스크립트(ADR 0007).
   - `components`: 앱 개발자가 쓰는 React Component와 그 내부 코드. Component 패키지는 하나다(ADR 0009).
   - `apps/docs`: 문서에만 쓰는 코드(색 타일, 아이콘 검색 등). 앱 개발자가 쓸 API가 아니면 packages로 올리지 않는다.
   - 새 패키지는 만들지 않는 것이 기본이다. 필요하면 ADR을 먼저 쓴다.
5. **패키지를 넘을 때는 코드의 주인이 먼저다.** 대비 계산은 components만 써도 주인인 `foundation`에 둔다. 2번(가까이)은 같은 패키지 안에서만 적용한다.

## 의존 방향

6. **`apps → components → {foundation, icons}` 한 방향.** `foundation`과 `icons`는 서로 의존하지 않는다. packages는 apps를 import하지 않는다.
   - 강제: 쓰는 패키지를 `package.json`에 선언해야 import할 수 있다(pnpm은 선언하지 않은 패키지를 `node_modules`에 링크하지 않는다). 역방향 의존을 `dependencies`에 추가하지 않는다.
   - `@tide-design/foundation/internal`은 문서 앱·빌드 스크립트 전용이다. components에서 쓰지 않는다.

## Component 파일

7. **`packages/components`의 공개 Component는 모두 폴더로 둔다.** 본문과 테스트가 늘 함께 있으므로 처음부터 `<C>/index.ts` + `<C>/<C>.tsx` + `<C>/<C>.test.tsx`로 만든다. 테스트가 아직 없어도 폴더로 둔다.
   ```
   src/
   ├── Badge/
   │   ├── index.ts              # 재수출만
   │   ├── Badge.tsx             # 본문 (index.ts에 쓰지 않는다: 에디터·diff에서 구분 안 됨)
   │   └── Badge.test.tsx
   └── Select/
       ├── index.ts
       ├── Select.tsx
       ├── Select.test.tsx
       └── hooks/useSelectValue.ts   # 전용 조각도 이 폴더 안
   ```
   - 공개 Component 하나가 폴더 하나다. `CheckboxGroup`처럼 따로 공개되는 Component는 자기 폴더를 갖는다.
   - `TableRow`처럼 대표 Component와 늘 함께 쓰는 하위 Component는 대표 Component 본문 파일이나 `<C>/components/`에 둔다. 대표 폴더의 `index.ts`가 함께 재수출한다.
   - 그 밖의 Component(`src/_internal/components/`, 문서 앱 블록)는 단순하면 `PascalCase.tsx` 파일 하나로 두고, 전용 `components`·`hooks`·`libs`·`constants`, `types.ts`, 테스트 중 하나라도 생기면 폴더로 바꾼다.
8. **이름**
   - Component: `PascalCase.tsx`. hook: `useXxx.ts`.
   - 그 밖의 소스 파일(`libs`·`constants`·foundation 모듈·문서 앱 lib): `camelCase.ts`. 대표 export나 주제 이름을 쓴다(`cn.ts`, `renderElement.ts`, `overlayClass.ts`, `colorFamily.ts`).
   - 예외: `scripts/` 아래 실행 스크립트(루트·패키지)는 명령 이름이라 kebab-case로 둔다(`changelog-ko.ts`, `name-removal.ts`).
   - subpath export 이름(`./color-family`, `./tailwind-merge`)은 공개 계약이라 kebab-case를 유지한다. 파일 이름과 따로 `package.json` `exports`에서 잇는다.
   - 패키지: `@tide-design/<name>`.

## 테스트 위치

9. **단위 테스트는 대상 파일 옆에 `X.test.ts(x)`로 둔다.** 폴더로 바뀌면 테스트도 함께 옮긴다.
10. **패키지 `test/`에는 setup·helper·fixture와 패키지 전체를 보는 테스트만 둔다.** 공개 export 목록, 전수 대비 검사, Token 스냅샷처럼 특정 파일 하나에 속하지 않는 것이다. browser 테스트 작성 규칙은 `docs/agents/testing.md`.

## import와 진입점

- **경로:** 패키지·앱 안은 상대경로에 확장자까지 적는다(`./cn.ts`, `../hooks/useFieldControl.ts`). 빌드가 `.js`로 바꾼다(`rewriteRelativeImportExtensions`). 별칭(`@/`)은 두지 않는다.
- **내부 배럴 없음:** `_internal/`과 `components/`·`hooks/`·`libs/`·`constants/`에는 `index.ts`를 두지 않고 파일 경로로 import한다. Component 폴더의 `index.ts`는 대표 Component와 그 Props 타입(하위 Component가 있으면 그것까지)만 재수출한다.
  ```ts
  export { Select } from "./Select.tsx";
  export type { SelectProps } from "./Select.tsx";
  ```
  - 조각 경로(`./Select/hooks/…`)를 다른 Component가 쓰기 시작하면 그 조각은 이미 Select의 것이 아니다 → 승격(3번).
- **패키지 진입점(`src/index.ts`):** 공개 이름을 하나씩 네임드로 재수출한다. `export *`는 쓰지 않는다. 공개 계약(GLOSSARY)이 진입점에 그대로 보여야 하고, 내부 export가 실수로 공개되면 안 되기 때문이다.
  - Component별 subpath는 두지 않는다. unbundle 빌드(파일 단위 출력) + `"sideEffects": ["**/*.css"]`이면 안 쓰는 파일은 앱 번들에서 빠진다.
  - subpath는 용도가 다른 진입점에만 둔다(foundation의 `internal`·`color-family`·CSS 파일).
- **`"use client"`는 파일 단위다.** hook·Context·이벤트 처리기를 쓰는 파일이 자기 머리에 적는다. 배럴·`index.ts`에는 적지 않고, 빌드 banner로 일괄 주입하지 않는다. 코드를 다른 파일로 옮기면 지시어도 같이 옮긴다. smoke 앱의 `next build`가 경계를 검사한다.

## 빌드·패키지 설정

현재 설정이 기준이다. 바꿀 때는 ADR이나 티켓에 근거를 남긴다.

1. **workspace:** `pnpm-workspace.yaml`에 `packages/*`, `apps/*`. 내부 패키지 의존은 `"workspace:*"`. 외부 의존성 버전은 `catalog`에서만 정하고 `package.json`에는 `"catalog:"`로 적는다(`catalogMode: strict`).
2. **패키지 빌드:** tsdown `unbundle: true`로 원본 파일마다 출력 파일 하나를 만든다. d.ts는 `dts: { generator: "oxc" }` + tsconfig `isolatedDeclarations`로 만든다. 그래서 export하는 함수·Component·hook에 반환 타입을 적는다. 빌드가 타입 검사를 하지 않으므로 `typecheck`를 따로 돌린다.
3. **exports:** `package.json`에서 손으로 관리한다(tsdown `exports: false`). components는 `@tide-design/source` 조건으로 문서 앱이 원본(`src`)을 resolve하고, 배포본은 `publishConfig.exports`로 `dist`만 연다.
4. **`turbo.json`:** `build`·`typecheck`·`test`·`smoke`·`dev`는 `"dependsOn": ["^build"]`. `dev`는 `"cache": false, "persistent": true`.
5. **lint·format:** 루트 `.oxlintrc.json`·`.oxfmtrc.json` 하나씩. 패키지별 설정 파일을 두지 않는다.
6. **apps:**
   - `docs`: MDX·stories의 `title`을 직접 적으므로 폴더 위치가 사이드바를 정하지 않는다. 섹션 폴더는 `stories/<section>/`에 둔다.
   - `smoke-next`: `template/`은 배포 결과를 쓰는 최소 Next.js 앱 복사본이다. App Router 관례를 따르고 이 규칙의 폴더 배치는 적용하지 않는다.
   - 루트 `scripts/`: 스크립트와 그 테스트를 나란히 둔다.

## 애매할 때

규칙으로 정해지지 않는 배치는 선택지와 근거(쓰는 범위, 코드의 주인, 공개 여부)를 제시해 사용자에게 묻는다.
