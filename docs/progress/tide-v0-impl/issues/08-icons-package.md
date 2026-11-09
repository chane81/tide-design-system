# 08: 아이콘 패키지

Status: done
Blocked by: 03 (Storybook과 브라우저 테스트 골격), 36 (패키지 빌드를 tsdown으로 전환)

## What to build

앱 개발자가 `@tide-tds/icons`에서 `PlusIcon`처럼 Tide 이름으로 아이콘을 import하고, 쓰지 않는 아이콘은 번들에 들어가지 않는다. Tide 이름은 이름표가 정본이라 업스트림 사정으로 조용히 바뀌지 않는다. 문서의 아이콘 페이지에서 이름과 태그로 검색하고 import 문을 복사한다.

## 수용 기준

### 이름표와 생성

- [x] `lucide-static`은 devDependency다. 이름표 파일 하나(`Tide 이름 → lucide-static 원본 SVG 이름`)를 커밋한다. 처음에는 정식 Lucide 아이콘 이름으로 자동 초기화하고(ADR 0007), 이후 이름표가 정본이다.
- [x] 생성 스크립트는 이름표의 줄마다 Component를 만든다. 원본 SVG가 없으면 빌드를 실패시키고, 이름표에 없는 새 SVG는 목록만 출력한다. Lucide alias는 만들지 않는다. 생성 결과는 커밋하지 않는다.
- [x] 이름은 모두 `Icon` 접미사가 붙는다.

### 공통 틀

- [x] 손으로 쓰는 것은 공통 틀 하나다. `size` 기본 16(px), `strokeWidth` 기본 2와 `vector-effect: non-scaling-stroke`, 색은 `currentColor`.
- [x] `aria-label`이 있으면 `role="img"`, 없으면 `aria-hidden="true"`, `focusable="false"`. 나머지 SVG 속성은 그대로 넘긴다.

### 빌드와 배포

- [x] desktop·foundation과 같은 tsdown 설정(`unbundle`, oxc d.ts, 티켓 36)으로 빌드해 파일 단위로 나눠 tree-shaking이 된다.
- [x] LICENSE에 Lucide ISC와 Feather MIT 고지 전문을 넣는다. 공개 API, 패키지 설명, Storybook 본문에는 Lucide를 드러내지 않고 감사 문구만 한 줄 둔다.
- [x] desktop dependencies에 icons를 연결한다.

### 테스트 (`unit`)

- [x] 이름표 키와 실제 export 목록이 일치한다.
- [x] 대표 아이콘 몇 개를 서버 렌더해 `aria-hidden`/`role="img"`, 기본 크기, 선 두께를 확인한다.

### 문서

- [x] 아이콘 페이지: 이름표의 이름과 Lucide `tags.json`으로 검색하고, 클릭하면 import 문을 복사한다. 가상화는 없다. 검색 메타데이터는 공개 API가 아니다.
- [x] 아이콘 사용 가이드(크기 규칙 표, 선 두께, 장식용·이름 있는 아이콘)를 둔다.

## Comments

- 2026-11-10 완료(브랜치 `ticket/08-icons-package`).
  - **버전과 라이선스**: `lucide-static` 1.70.0(2026-11-06 배포, ISC). catalog에 `^1.70.0`(1.x라 범위 지정)으로 넣었고 `minimumReleaseAge` strict 정책은 그대로다(예외 없음). 설치본 LICENSE는 ISC 전문(Copyright (c) 2026 Lucide Icons and Contributors)과 Feather 유래 아이콘 목록, MIT 전문(Copyright (c) 2013-present Cole Bemis)이다. 런타임 dependency는 없고 peer는 `react ^19`다.
  - **API 근거**: tsdown 0.23.7 설정은 티켓 36과 같다(context7 `/rolldown/tsdown/v0.23.0`와 설치본 타입 선언). turbo 2.11.10 Package Configurations에서 패키지 전용 태스크(`generate`)를 더하고 같은 패키지 태스크를 `dependsOn`으로 기다릴 수 있다(context7 `/vercel/turborepo/v2.11.10` `reference/package-configurations.mdx`). Storybook 10.6.6의 `!dev` 태그는 사이드바에서만 빼고 `test` 태그는 그대로라 Vitest addon 검사에 남는다(context7 `/storybookjs/storybook/v10.6.5` `writing-stories/tags.mdx`). `renderToStaticMarkup`은 react.dev reference(context7), `focusable`·`vectorEffect` prop은 설치본 @types/react 19.3.0 타입이다. `lucide-static`의 파일 구조(`icons/*.svg` 2,322개, `icon-nodes.json`·`tags.json` 키 2,029개)는 공식 문서가 아니라 설치본으로 확인했다.
  - **이름표**: `packages/icons/icon-names.json`(`"HouseIcon": "house"` 형식, Tide 이름순). `scripts/init-names.ts`가 `icon-nodes.json`의 정식 이름 2,029개를 PascalCase + `Icon`으로 한 번 채웠다(이름 충돌 0). 이 스크립트는 이름표가 이미 있으면 실패해서 정본을 덮어쓰지 않는다.
  - **생성**(`scripts/generate.ts`, turbo `generate` 태스크): 이름표 줄마다 원본 SVG를 읽어 `src/generated/<kebab>.tsx`와 `index.ts`를 만들고, 업스트림 LICENSE를 패키지 `LICENSE`로 복사한다(ADR 0007 Consequences). 둘 다 `.gitignore`다. 원본 SVG는 모두 자식 없는 도형 7종(path, circle, rect, line, ellipse, polyline, polygon)만 평평하게 담고 있어서 정규식으로 읽는다. 모르는 요소나 속성이 나오면 실패한다. 이름표의 원본을 없는 이름(`house-renamed`)으로 바꾸면 `원본 SVG가 없다 … HouseIcon → house-renamed.svg`로 exit 1인 것을 확인하고 되돌렸다. 이름표에 없는 SVG는 지금 293개(전부 업스트림 alias 파일, 예: `home`, `alert-circle`)이고 목록만 출력한다.
    - **파일 이름 결정**: 처음에는 생성 파일을 Tide 이름 그대로(`LetterSIcon.tsx`) 지었다. 그런데 `LetterSIcon`과 `LettersIcon`이 macOS 기본 파일 시스템(대소문자 무시)에서 같은 파일이 되어 빌드가 `MISSING_EXPORT`로 실패했다. 사용자 설치 환경에서도 같은 일이 생기므로 파일 이름을 kebab-case(`letter-s-icon`, `letters-icon`)로 바꿨다. 대문자 앞에 `-`를 넣는 변환이라 서로 다른 Tide 이름은 서로 다른 파일이 된다. export 이름은 그대로이고 파일 경로는 공개 API가 아니다.
  - **공통 틀**(`src/IconBase.tsx`, 손으로 쓰는 유일한 아이콘 코드): `IconProps = Omit<ComponentProps<"svg">, "strokeWidth"> & { size?: number; strokeWidth?: number }`. `viewBox 0 0 24 24`, `fill none`, `stroke currentColor`, round cap·join. `aria-label`이 비어 있지 않으면 `role="img"`이고, 아니면 `aria-hidden="true"`와 `focusable="false"`다. 나머지 props는 기본값 뒤에 펼쳐서 그대로 넘긴다(`ref` 포함, React 19). `vector-effect`는 상속되지 않아서 생성할 때 도형마다 `vectorEffect="non-scaling-stroke"`를 넣었다. hook이 없으므로 `"use client"`는 붙이지 않았고, smoke의 서버 컴포넌트 page에서 바로 렌더된다. 공개 export는 아이콘 2,029개와 `IconProps` 타입이다.
  - **빌드**: `tsdown.config.ts`는 foundation·desktop과 같다(`unbundle`, esm, neutral, es2024, oxc d.ts, `exports: false`). 출력은 아이콘마다 js·d.ts 한 쌍(4,058개), `dist/generated/index.d.ts`, `index`·`IconBase`의 js·d.ts를 합쳐 4,063개다(생성 `index.ts`의 JS는 `dist/index.js`로 합쳐진다). `sideEffects: false`. tarball에는 `dist`, `LICENSE`, `package.json`이 들어간다.
  - **tree-shaking 확인**: smoke가 서버 컴포넌트 page에서 `PlusIcon`만 쓰고 `next build`(Next 16.4.5, Turbopack) 결과의 `.next/**/*.js`를 읽는다. `PlusIcon`의 도형 문자열은 있어야 하고 `HouseIcon`의 도형 문자열은 없어야 통과한다. 대조 실험으로 page에 `HouseIcon`을 더하면 「쓰지 않은 HouseIcon이 빌드 결과에 들어갔다」로 실패하는 것을 확인하고 되돌렸다.
  - **Lucide 노출 범위**: 패키지 설명은 「Tide 디자인 시스템의 React 아이콘 Component」이고, 공개 export·d.ts에는 Lucide 이름이 없다. Storybook 본문에도 없고, 페이지 맨 아래 감사 문구 한 줄(「아이콘 모양은 Lucide(ISC)와 Feather(MIT) 프로젝트의 작업을 바탕으로 합니다. 감사합니다.」)에만 나온다. 생성 스크립트·이름표·문서 앱 내부 코드 주석은 개발자용이라 업스트림 이름을 적었다.
  - **desktop 연결**: desktop `dependencies`에 `@tide-tds/icons: workspace:*`를 넣었다. 지금은 desktop이 쓰는 아이콘이 없다. desktop tarball이 icons를 정확한 버전으로 의존하므로 smoke가 icons tarball도 만들어 `overrides`로 연결한다.
  - **문서**: `apps/docs/src/foundations/Icons.mdx`(`Foundation/아이콘`), `Icons.stories.tsx`, 블록은 `src/docs-blocks/IconSearch.tsx`·`iconSearch.ts`(티켓 04의 `foundations/`·`docs-blocks/` 배치와 맞춤). 검색 목록은 이름표(저장소 상대 경로 JSON import)와 `lucide-static/tags.json`을 문서 앱 안에서 합쳐 만든다. icons 패키지에는 메타데이터 export를 두지 않았다. 검색은 Tide 이름(접미사 제외)과 태그를 대상으로 하고, 공백으로 나눈 낱말이 모두 맞아야 하며, 대소문자·하이픈은 무시한다. 결과는 가상화 없이 모두 그리고, 검색어에 `useDeferredValue`를 쓴다. 버튼을 누르면 `navigator.clipboard.writeText`로 `import { XIcon } from "@tide-tds/icons";`를 복사하고 `role="status"`로 알린다. 실패하면 직접 복사하라고 문장을 보여 준다. 사용 가이드는 props 표, 크기 규칙 표(spec 그대로), 선 두께(label 2px, body 1.5px), 장식용·이름 있는 아이콘·아이콘만 있는 버튼, 상태를 색만으로 구분하지 않기, 세트 섞지 않기를 다룬다. 예시는 모두 CSF story다. 검색 블록 story는 `!dev`, `!autodocs`로 숨겨서 storybook project의 렌더·axe 검사에만 쓰고 MDX에는 블록을 직접 넣었다. MDX 기본 설정에는 GFM 표가 없어서(remark-gfm 미설치, 처음에 Markdown 표가 `|` 문자 그대로 나옴) 표는 JSX `<table>`로 썼다. 색은 Tide Token 대신 `currentColor`와 중립 회색 inline style로 두어 티켓 04의 색 이름에 묶이지 않게 했다.
    - 빌드 결과를 Playwright(Chromium)로 열어 확인했다: 처음 2,029개가 약 0.5초 안에 그려지고, `home` 검색은 69개, `arrow down` 검색은 44개다. `HouseIcon`을 누르면 클립보드에 import 문이 들어간다. 24px 아이콘의 path computed `vector-effect`는 `non-scaling-stroke`이고, 14~24px 크기 story에서 선 두께가 같게 보이는 것을 스크린샷으로 확인했다. 사이드바에는 `Foundation/아이콘`(Docs와 예시 story 5개)이 나오고 검색 story는 나오지 않는다. page error는 0개다.
    - 아이콘 story 청크(`Icons.stories-*.js`)는 약 1.47 MB(gzip 약 263 kB)이고 Vite 500 kB 경고가 난다. 이 페이지를 열 때만 받는다(tide-v0 리서치 storybook.md 6절과 같은 구조).
  - **범위 밖**: spec 테스트 표의 「이름표에서 키가 빠졌을 때 minor changeset 요구」는 이 티켓 수용 기준에 없고 changesets가 아직 없어서 하지 않았다(티켓 11 릴리스 파이프라인). desktop 내부 아이콘 사용은 해당 Component 티켓에서 한다.
  - **확인할 결정**: 저장소와 Tide 패키지 자체의 라이선스(`license` 필드, 루트 LICENSE)는 아직 정해지지 않았다. 지금 icons의 LICENSE 파일은 업스트림 고지만 담는다. Tide 라이선스를 정하면 생성 스크립트가 Tide 고지 뒤에 업스트림 고지를 붙이도록 바꾼다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `pnpm turbo run typecheck test build smoke --force`(15개 태스크) 통과. foundation unit 5, icons unit 9, desktop 7(unit + browser 2 instance), docs 26(unit 16 + storybook 10 stories), smoke(publint `--strict` 3개 tarball, `next build`, tsc bundler·nodenext, CSS `@source`, 아이콘 tree-shaking) 통과.
