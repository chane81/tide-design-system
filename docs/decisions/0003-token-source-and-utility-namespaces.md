# Token 원본은 TS 객체, Semantic 색은 Tailwind 속성별 namespace로 노출

> **ADR 0011로 일부 정정됨(2026-11-10)**: [`color`는 열린 색 이름이고, `data-color`로 accent 슬롯에 꽂는다](0011-open-color-names-data-color-accent.md). 아래 「정정 (2026-11-10)」을 본다.

근거 원칙: ② 명확함이 화려함보다 우선한다, ③ 단순함이 유연함보다 우선한다, ④ 발견할 수 있음이 외워야 함보다 우선한다

Semantic 색은 속성마다 참조하는 단계가 다르다(primary는 bg 600, text 800). 그래서 Utility class를 tailwindcss 4.3.5의 속성별 theme namespace(`--background-color-*`, `--text-color-*`, `--border-color-*`, `--outline-color-*`)로 노출한다. 이렇게 하면 `bg-primary-solid`는 배경에만, `text-primary`는 글자에만 생기고, 의미 없는 조합은 자동완성에 나타나지 않는다. 이 namespace는 공식 문서의 namespace 표에는 없다. 배포 소스(`dist/lib.mjs`의 `bg`의 themeKeys `["--background-color", "--color"]` 등)에서만 확인했다. 그래서 빌드한 CSS에 기대한 class가 있는지 CI 테스트로 확인해서, Tailwind를 올렸을 때 깨지면 바로 알 수 있게 한다.

Token 원본은 TypeScript 객체로 두고, 직접 만든 빌드 스크립트로 CSS(`--tide-*` 변수, `[data-theme]` 덮어쓰기, `@theme inline`)와 tailwind-merge 설정을 만든다. vitest 대비 쌍 검사는 원본을 직접 import한다.

## 검토한 대안

- **`--color-*`에 속성을 이름에 넣기**(`bg-bg-primary`): 문서화된 방식이다. 하지만 이름이 반복되고 `text-bg-primary` 같은 무의미한 class가 생긴다.
- **shadcn 방식**(`--color-primary` + `-foreground`): `text-primary`가 solid 색이 되어 컬러 Foundation 결정과 어긋난다.
- **DTCG 2025.10 JSON + Style Dictionary 5.8**: 표준 포맷이다. 하지만 Style Dictionary는 Resolver(Theme 조합)를 지원하지 않고, `@theme inline` 출력은 어차피 커스텀 format을 직접 짜야 한다. 혼자 유지하는 상황에서는 도구가 늘어나는 것에 비해 얻는 것이 작다.

## Consequences

- Tailwind를 올릴 때 속성별 namespace가 사라지면 CI가 실패한다. 그때는 `--color-*` + 속성 접두 이름 방식으로 옮기는 것을 검토한다.
- Tailwind 없이 쓰는 사용자를 위한 공개 계약은 `--tide-*` CSS 변수다. Tailwind 변수 이름은 공개 계약이 아니다.
- DTCG JSON이 필요해지면(Figma 연동 등) TS 원본에서 출력물로 내보낸다.

## 정정 (2026-11-10)

[ADR 0011](0011-open-color-names-data-color-accent.md)에서 공개 계약을 더했다. Tailwind 없이 쓰는 사용자의 공개 계약에 색 계열 변수(`--tide-<계열>-<슬롯>`), accent 슬롯(`--tide-accent-<슬롯>`), `[data-color]` 규칙이 들어간다. 이 변수들은 Utility class가 없는 묶음이라 `--tide-<Utility class 이름>` 규칙의 예외다. accent Utility class(`bg-accent-solid` 등)는 같은 속성별 namespace로 노출한다. 색 계열 Utility class(`bg-blue-solid`)는 노출하지 않는다.
