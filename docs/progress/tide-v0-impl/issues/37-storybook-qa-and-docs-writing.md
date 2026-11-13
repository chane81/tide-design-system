# 37: Storybook 브라우저 점검과 문서 문체 개편

Status: done
Blocked by: 10 (문서: 시작하기·원칙·기준)

## What to build

앱 개발자가 Storybook 문서에서 핵심을 먼저 읽는다. 각 페이지는 첫 줄 한 문장 요약, 할 일 중심 소제목, 표로 정리한 사실로 구성한다. 브라우저 점검으로 찾은 렌더·Theme·Props 표 문제를 고친다. 2026-11-10 사용자 요청("설명이 너무 장황하다", 짧은 공개 디자인 시스템 문서 한 곳 참고).

## 수용 기준

- [x] 참고한 디자인 시스템 문서의 작성 패턴을 조사해 `docs/research/docs-writing-reference.md`에 남긴다.
- [x] 문서 작성 기준 `docs/standards/docs-writing.md`를 만들고 `docs/agents/domain.md`에서 링크한다.
- [x] MDX 12개에 작성 기준을 적용한다. 사실·코드·링크는 바꾸지 않는다.
- [x] `remark-gfm`으로 MDX Markdown 표를 렌더한다.
- [x] 원칙·접근성 기준 원문 맨 위에 한 문장 요약을 넣고, 본문의 결정 경위 설명을 뺀다.
- [x] 브라우저 점검에서 찾은 8건을 고치고 브라우저로 다시 확인한다.

## Comments

- 2026-11-10 사용자 결정
  - 문체는 합니다체를 유지한다.
  - 줄이는 정도는 시범 페이지 수준이면 된다(페이지별 글자 수 2~18% 감소, 요지가 보이게 하는 데 집중).
  - MDX에서도 표를 쓴다(`remark-gfm` 4.0.1 도입).
  - 원칙·기준 원문에는 요약만 넣고, 결정 경위 설명과 링크는 넣지 않는다.
  - Props 표는 story `argTypes`로 보완하고, Docs 링크 색은 Tide `text-primary`를 쓴다.
- 2026-11-10 브라우저 점검(main 766ff90, ego-browser, Docs 14개·story 40개, light/dark × 1280/768px, axe)
  - 높음: dark에서 Docs 배경이 흰색으로 남아 예시가 보이지 않음 → Docs 컨테이너가 Theme을 따르게 수정.
  - 중간: GFM 표 미렌더, Spinner `size`가 `Extract`로 표시, Typography Props 누락 → 수정.
  - 낮음: 768px 색 스케일 끊김, VisuallyHidden 빈 Props 표와 링크 대상 없음, Typography h1 중복, 아이콘 검색 정렬과 0건 문구 → 수정.
  - 재점검: 8건 통과, `color-contrast` 위반 0건. 남은 것: 768px 대비 쌍 표 Token 이름 줄바꿈, "home" 검색에서 `HouseIcon`이 앞에 오지 않음(태그 일치 이름순).
- 검증: lint, format, dist 삭제 후 `pnpm turbo run typecheck test build smoke --force` 15/15, changeset 검사 통과. docs test가 한 번 간헐 실패했고 이후 3회 통과.
