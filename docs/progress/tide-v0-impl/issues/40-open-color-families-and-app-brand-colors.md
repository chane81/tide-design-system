# 40: 열린 색 이름(color)과 앱 브랜드 색 계열

Status: claimed
Blocked by: 07 (motion·z-index Foundation)

## What to build

앱 개발자가 Component의 `color`로 Role(`primary`, `danger` 등)뿐 아니라 색 계열 이름(`gray`, `blue`, `green` 등)과 자기 앱의 브랜드 색 계열(예: `brand`)을 고른다. Tide가 색 계열을 추가하면 Foundation 한 곳만 고치면 되고, 앱은 Tide 패키지를 고치지 않고 브랜드 색을 더한다.

2026-11-10 사용자 결정: 실무에서는 Role 외의 여러 색을 버튼 등에 쓰고, 색 계열은 늘어난다. 앱 브랜드 색 추가도 필수다. 설계는 아래 C안(추천안)으로 정했다.

## 설계 (C안: 계열 변수 묶음 + `data-color` → accent 슬롯)

- 색 계열마다 Theme별 Semantic 변수 묶음을 생성한다(예: `--tide-blue-solid`, `-solid-hover`, `-solid-active`, `-subtle`, `-subtle-hover`, `-subtle-active`, `-text`, `-border`, `-on-solid`). Theme 블록(`[data-theme]`)이 계열 변수를 정한다.
- 매핑 규칙은 한 곳에 둔다: solid 600/700/800(두 Theme), subtle light 50/100/200 · dark 950/900/800, text light 800 · dark 200, border light 600 · dark 400, on-solid white. 계열별 덮어쓸 값(예: 노란 계열의 진한 on-solid)을 둘 수 있다.
- `[data-color="<이름>"]` 규칙은 accent 변수(`--tide-accent-*`)를 해당 계열 변수의 별칭으로 둔다. 새 Semantic utility: `bg-accent-solid/-hover/-active`, `bg-accent-subtle/-hover/-active`, `text-accent`, `text-accent-on-solid`, `border-accent`(정확한 목록은 구현에서 확정).
- Role은 「계열 + 덮어쓸 값」의 별칭이다. `neutral`은 `gray`와 **다른** 색이다(사용자 결정): dark subtle 900/800/700, text `default`, border `strong`을 덮어쓴다. `gray`는 일반 계열 규칙을 따른다.
- 기존 Role utility(`bg-primary-solid` 등)와 공개 계약은 유지한다. 계열 utility(`bg-blue-solid`)는 기본으로 노출하지 않는다.
- 타입: foundation에 `interface ColorRegistry`(Role + 색 계열)를 두고 `type Color = keyof ColorRegistry`. 계열을 더하면 타입이 자동으로 넓어진다.

## 앱 브랜드 색 (필수)

- foundation 서브패스에 `defineColorFamily({ name, scale, overrides })`를 둔다. 앱은 11단계 스케일 전체를 넘기고 필요할 때만 덮어쓸 값을 준다.
- CLI(예: `tide-color build brand.ts > brand.css`)가 같은 매핑 규칙으로 light/dark 변수와 `[data-color="brand"]` 규칙이 든 CSS를 만든다. 같은 대비 쌍 규칙으로 light·dark를 검사하고, 미달이면 exit 1로 실패한다(사용자 결정: 대비 CLI 포함). 기존 `contrastRatio`·대비 쌍 생성 로직을 다시 쓴다.
- 타입 확장: `declare module "@tide-tds/foundation" { interface ColorRegistry { brand: true } }`. `@tide-tds/components`에서 re-export한 interface도 augmentation이 되는지 설치된 TypeScript로 먼저 실험하고, 안 되면 foundation을 augmentation 대상으로 문서화한다.
- Component는 앱 계열 class를 쓰지 않으므로 Tailwind 자동 완성과 tailwind-merge 설정은 바뀌지 않는다. 앱이 `bg-brand-solid` 같은 계열 utility를 직접 `@theme`에 더하는 것은 선택 사항이고, Tide `cn`이 그 충돌을 해결하지 않는다고 문서에 경고한다.
- 검토하고 뺀 안: 앱이 hex 하나만 주고 CSS relative color로 단계를 만드는 방식(대비를 정적으로 검사할 수 없다).

## 수용 기준

- [ ] ADR 0011: `color`는 열린 색 이름이고 `data-color` → accent 변수로 꽂는다. ADR 0003(공개 계약 추가)·0005(variant 맵 모양: 색 축이 `data-color`로 빠짐)를 정정한다. 대체·정정 표시를 단다. (ADR 0010은 티켓 13 브랜치에 이미 있다.)
- [ ] 위 설계대로 계열 변수, Role 별칭, accent namespace, `[data-color]` 규칙을 `color.ts`/`semantic.ts`/빌드 스크립트에서 생성한다. 색 계열을 하나 더하는 테스트(테스트 전용 계열)로 타입·변수·대비 쌍이 자동으로 따라옴을 확인한다.
- [ ] 대비 쌍을 계열마다 자동 생성하고, 기존 Role 대비 쌍 결과가 바뀌지 않았음을 회귀 테스트로 확인한다.
- [ ] 요소 단위 `data-theme` 안의 `data-color`가 그 Theme 값을 따름을 browser 테스트로 단언한다.
- [ ] `ColorRegistry`/`Color` 타입과 module augmentation 동작(테스트 또는 타입 테스트).
- [ ] `defineColorFamily`와 대비 CLI(bin 엔트리), 미달 시 exit 1 테스트.
- [ ] smoke에 앱 계열 하나를 넣어 소비 앱에서 CSS·타입이 동작함을 확인한다.
- [ ] GLOSSARY: Role 정의의 「Component에서는 `color` prop으로 Role을 고른다」, Variant 항목의 「색은 Role로 고른다」를 고치고 「색 이름(Color)」·「accent 슬롯」 용어를 더한다. spec 공통 API 절의 `color` 정의, `data-color`, variant 맵 모양, 앱 확장점을 고친다.
- [ ] 문서: Color Foundation MDX 갱신, 시작하기에 「브랜드 색 더하기」 페이지(문서 작성 기준 37을 따른다).
- [ ] changeset(foundation minor).

## 후속

- Button(13)은 이 티켓 뒤에 variant 맵을 `Record<FillVariant, string>` + `data-color`로 바꾸고, `color`를 `Color` 전체로 넓힌다. Button은 `data-color`를 항상 붙여(기본 `primary`) 바깥 색을 물려받지 않는다.

## Comments
