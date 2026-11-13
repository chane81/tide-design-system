# 50: 문서의 외부 참조 정리

Status: done
Blocked by: 49 (테스트 픽스처·예시 색을 Tide 값으로)

## What to build

저장소가 공개라, 디자인 참고로 삼은 외부 제품·디자인 시스템의 회사/제품 이름, 문서·사이트 URL, 그 제품에서 뽑은 색 값, 화면 묘사를 저장소에 남기지 않는다(사용자 결정, 2026-11-13). 티켓 49에서 코드·픽스처는 정리했고, 이 티켓은 남은 문서(리서치, 티켓, ADR, 기준, Storybook MDX)를 정리한다. 뽑아낸 일반 규칙(밝기·채도 범위, 구조, 개수, 결론)과 Tide 자체 값은 남긴다.

- 외부 디자인 시스템 이름은 「시스템 A/B/C…」, 「한 디자인 시스템」, 「여섯 곳 중 세 곳」처럼 익명화한다. 이름과 문자의 대응표는 어디에도 두지 않는다.
- 결론과 근거 논리(개수, 구조, 패턴 분포, 대비 수치)는 그대로 둔다.
- git 히스토리 재작성은 하지 않는다(범위 밖).

## 수용 기준

- [x] 외부 디자인 시스템·회사 제품 이름, URL, 외부 팔레트 hex, 토큰 이름 표, 원문 인용, 화면 묘사를 전수 grep으로 목록화하고 정리한다.
- [x] 정리 뒤 같은 grep을 다시 돌려 남은 항목이 「남겨도 되는 것」뿐인지 확인한다.
- [x] 판단 보류 목록 원문의 외부 값은 항목을 지우지 않고 값만 익명화한다.
- [x] 문서 안 상대 링크·앵커가 정리 뒤에도 유효하다.
- [x] changeset 판단.

## Comments

- 2026-11-13 완료.
  - **정리한 곳**: 37개 파일, 약 400곳.
    - 리서치 10개 파일이 대부분이다(컴포넌트 관례, 릴리스 관행, 릴리스, 컬러·Token 구조, 원칙 레퍼런스, 한글 타이포그래피, Storybook, changesets Version PR 분리, Next.js 소비, 문서 작성 참고).
    - 그 밖에 ADR 6개(0005·0008·0011·0016·0017·0020), tide-v0 지도와 티켓 10개, tide-v0-impl 티켓 9개, tide-color-tone 티켓 1개와 판단 보류 목록 1곳, 기준 문서 1개를 고쳤다.
    - 문서 작성 참고 리서치는 파일 이름에 외부 이름 약칭이 들어 있어 `docs/research/docs-writing-reference.md`로 바꿨다. 링크 두 곳(기준 문서, 티켓 37)도 고쳤다.
    - 코드·주석·Storybook MDX에는 정리할 외부 참조가 없었다. 티켓 49에서 이미 정리됐다.
  - **바꾼 방식**: 사례 표와 비교 절은 문서마다 시스템 문자로 바꿨다. 릴리스 리서치 두 문서는 서로를 가리키므로 같은 문자를 같은 시스템에 썼다. 출처 절은 「공개 디자인 시스템 문서 N곳, 이름·링크는 적지 않는다」로 줄였다. 영문 원칙 문장과 원문 인용은 한글 의역으로 바꿨다. 토큰 이름 예는 `color.background.<역할>.<강도>.<상태>` 같은 일반형으로 바꿨다. 외부 팔레트 hex는 지우고 단계 위치와 대비 수치만 남겼다.
  - **과거 기록의 값**: 티켓 13·16·17 Comments의 이전 앱 계열 값은 「앱 계열 600(950)」처럼 단계로 바꾸고, 티켓 49에서 Tide 예시 값으로 바뀌었다고 적었다. 티켓 08의 명도 계단은 출처 이름을 빼고 「널리 쓰이는 11단계 팔레트의 명도 분포를 참고」로 적었다. L 값은 지금 Tide 계단이라 그대로 두었다. 포커스 표시 결정(티켓 20, 지도)에 있던 외부 서비스 화면 묘사는 사용자 판단만 남겼다.
  - **남긴 항목(분류)**:
    - Tide가 쓰거나 기술 선택으로 평가한 도구·라이브러리와 공식 문서 링크: React Aria, Base UI, Radix Primitives, Ark UI, shadcn/ui, cva, tailwind-merge, Tailwind, Next.js, React, Vite, Vitest, Storybook, pnpm, Turborepo, changesets, release-please, semantic-release, tsdown, rolldown, oxc, Playwright, axe-core, Chromatic, Argos, Vercel(호스팅·Remote Cache), Dokploy, Lucide 등 아이콘 세트, Style Dictionary.
    - 폰트와 배포처: Pretendard, SUIT, Spoqa Han Sans Neo, Noto Sans KR, Google Fonts, jsDelivr, unpkg.
    - 플랫폼과 표준: GitHub(Actions, 블로그, docs, community discussions), npm, Node, TypeScript, Ubuntu 미러, W3C(WCAG, klreq, CSS), DTCG, WAI-ARIA APG, SLSA, semver, OKLab 정의.
    - 릴리스·CI 사례로 비교한 일반 오픈소스 저장소: 상태 관리·라우팅·프레임워크 라이브러리 저장소, 장애 사례로 인용한 이슈.
    - Tide 자신: Tide 팔레트의 현재·과거 값(프로토타입, 색감 개편 전후 값), `tide-tds.lakegreen.net`, 이 저장소 링크.
  - **판단 보류(추천안대로 처리)**:
    1. 기술 선택 비교에 나온 headless·스타일 라이브러리(Radix Primitives, Base UI, Ark UI, shadcn/ui)는 도구로 보고 이름을 남겼다. 다만 원칙 리서치에서는 Radix Primitives가 같은 조직의 테마 라이브러리와 짝인 디자인 시스템 사례로 쓰여 익명화했다.
    2. 컴포넌트 관례 리서치 비교표의 Component 이름·prop 값은 토큰 이름이 아니고 표의 핵심이라 남겼다. 아는 사람은 어느 시스템인지 짐작할 수 있다.
    3. 컴포넌트 관례 리서치 npm 표의 버전·최초 publish 날짜도 남겼다. npm에서 거꾸로 찾을 수 있다.
    4. Base UI 문서의 context7 ID에 소속 조직 이름이 들어 있다. 도구 문서 조회 ID라 남겼다.
    5. 컬러 리서치 4장의 톤 팔레트 hex 11개는 외부 시스템의 색이 아니다. Tide 앵커를 공개 라이브러리로 계산한 값이다. 「앵커가 정수 톤 격자에 들어가지 않는다」는 결론의 근거라 남기고, 계산한 값이라고 문서에 밝혔다.
    6. 국내 공공 디자인 시스템도 외부 디자인 시스템으로 보고 익명화했다. 그 시스템 전용 Pretendard 파생 서체 이름도 같이 익명화했다.
    7. 외부 시스템 고유의 숫자 몇 개(텍스트 스타일 개수 변화, 개편 지표, 연구 건수)는 「약 3분의 1」, 「수십 건」처럼 대략으로 바꿨다. 결론에는 영향이 없다.
  - **확인**: 정리 뒤 이름·URL 도메인·GitHub 조직·hex를 다시 모았다. 남은 것은 위 분류뿐이다. 문서 상대 링크와 앵커를 스크립트로 검사했고, 새로 깨진 링크는 없다(Storybook `?path=` 링크와 템플릿 자리표시자는 원래 파일 링크가 아니다).
  - **히스토리**: 지운 이름·링크·값은 git 히스토리에는 남아 있다. 히스토리 재작성은 이 티켓 범위 밖이다.
  - **changeset**: `docs/` 아래 Markdown만 바뀌었다. 배포 패키지와 Storybook(`apps/docs`)은 바뀌지 않았다. 버전 관리 대상 밖이라 changeset은 두지 않았다(앞선 README PR들과 같다). `node scripts/check-changesets.ts main` 통과.
