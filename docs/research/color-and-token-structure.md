# 컬러 시스템과 Token 구조 조사

> 티켓: [02-research-color-token](../progress/tide-v0/issues/02-research-color-token.md)
> 조사일: 2026-11-08
> 원칙: 1차 출처(공식 문서, 명세, 소스 코드, npm 레지스트리)만 근거로 삼는다. 확인하지 못한 내용은 "확인 불가"로 적는다.
> 공개 저장소 규칙에 따라 참고한 외부 디자인 시스템은 이름·링크·색 값·토큰 이름을 적지 않고 「시스템 A~E」로 부른다.

## 0. 근거 버전

| 대상                                  | 확인한 버전                       | 확인 방법                                                                                                                                             |
| ------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| DTCG Format / Color / Resolver Module | 2025.10 (Stable, 2025-10-28 발행) | [designtokens.org/technical-reports](https://www.designtokens.org/technical-reports/)                                                                 |
| Style Dictionary                      | 5.8.0 (npm latest)                | npm registry, [CHANGELOG](https://github.com/style-dictionary/style-dictionary/blob/main/CHANGELOG.md), context7 `/style-dictionary/style-dictionary` |
| 시스템 A~E의 색·토큰 패키지 5종       | 2026-11-08 기준 npm latest        | npm registry, 공개 소스 저장소와 배포 파일                                                                                                            |
| `tailwindcss`                         | 4.3.5 (참고용)                    | npm registry, unpkg `theme.css`                                                                                                                       |

출처: 공개 디자인 시스템 문서·소스 5곳(조회일 2026-11-08). 공개 저장소 규칙에 따라 이름·링크는 적지 않는다.

---

## 1. 컬러 스케일을 만드는 방식

### 1.1 시스템 A: 지각 색 공간 기반 톤 팔레트

- **색공간**: 한 시스템의 지각 색 공간 기반 생성 방식이다. 색상(hue)과 채도(chroma)는 CAM16에서, 톤(tone)은 CIE L\*a\*b\*의 L\*에서 가져온다. 출처: 시스템 A의 공개 색 유틸리티 소스
- **톤과 대비의 관계**: 소스 주석은 톤 차이가 40이면 대비비 3.0 이상, 50이면 4.5 이상을 보장한다고 적는다. 톤이 L\*이므로 대비를 선형으로 다룰 수 있다는 것이 이 색공간을 쓰는 이유다.
- **스케일(톤 팔레트)**: 색상과 채도를 고정하고 톤만 바꾼 색 묶음이다. 단계가 고정된 배열이 아니고 0~100 사이 어떤 톤이든 꺼낸다.
- **gamut 처리**: 표현할 수 없는 값은 톤을 유지하고 채도를 줄여 sRGB 안에 넣는다.
- **Role 매핑**: primary 역할은 light에서 톤 40, dark에서 톤 80이다. 배경과의 대비 목표는 contrast level(저/기본/중/고)에 따라 3 → 4.5 → 7 → 7로 달라진다. 레거시 매핑도 같다(light: 역할색 40 / 그 위 글자 100 / 컨테이너 90 / 컨테이너 위 글자 10, dark: 80 / 20 / 30 / 90).
- **원본색 보존 스킴**: 일부 스킴은 원본색(source color)을 컨테이너 역할에 둔다. 소스 주석에 따르면 light는 톤을 약 5 올리고 dark는 약 5 내려 보정한다.
- 시스템 A 문서 사이트는 SPA라 본문을 가져오지 못했다. 위 내용은 공개 소스로 확인했다.

### 1.2 시스템 B: 12단계, 단계마다 용도 지정

- **단계 수와 용도**: 스케일마다 12단계가 있고 단계별 용도가 정해져 있다. 1 앱 배경, 2 은은한 배경, 3~5 UI 요소 배경(기본/hover/active), 6~8 테두리(구분선/요소 테두리와 focus ring/hover 테두리), 9~10 solid 배경(기본/hover), 11 저대비 텍스트, 12 고대비 텍스트.
- **대비 보장**: 11단계와 12단계는 같은 스케일의 2단계 배경 위에서 APCA Lc 60과 Lc 90을 보장한다. 기준은 WCAG 2 대비비가 아니라 APCA다. 9단계는 채도가 가장 높은 "가장 순수한" 단계이고, 대부분 흰 글자와 짝을 이루도록 만들었다. 밝은 색상 계열 몇 개(노랑·연두 계열 등)는 어두운 글자와 짝을 이룬다.
- **light/dark**: 같은 이름으로 light 스케일과 dark 스케일을 따로 제공한다. P3 버전(`color(display-p3 …)`)과 alpha 버전도 있다.
  - 관찰: 파랑 9단계는 light와 dark 값이 같고, 1단계는 light와 dark가 완전히 다르다.
- **커스텀 팔레트 생성 알고리즘**: 공개된 커스텀 생성 도구의 소스를 읽어 확인했다.
  1. 모든 계산을 OKLCH로 한다(colorjs.io 사용).
  2. 입력 accent와 가장 가까운(`deltaEOK`) 기존 스케일 두 개를 찾고, 거리 비율에 따라 두 스케일을 섞어 기본 스케일을 만든다.
  3. **입력색을 그대로 9단계에 넣는다.** 단, 배경과 너무 가까우면(deltaEOK×100 < 25) 기존 9단계를 쓴다.
  4. 10단계(hover)는 9단계의 L을 조금 바꾸고 C를 0.93배 해서 만든다.
  5. 11~12단계(텍스트)는 채도 상한을 8~9단계 수준으로 제한한다.
- 기본 스케일 자체를 어떤 알고리즘으로 만들었는지(수작업 조정인지)는 공식 문서에 설명이 없다. **확인 불가.**

### 1.3 시스템 C: base 0~9, HSL 값

- **단계 수**: base color는 `0`~`9`의 10단계다.
- **값 표기**: DTCG 2025.10 color 객체(`colorSpace: 'hsl'`, `components`, `hex`)로 저장한다.
- **테마별 base 파일**: base 색 자체가 테마별로 나뉜다. light, light 고대비, dark, dark 어둑한 판, dark 고대비 등이 있다.
- 생성 알고리즘(손으로 고르는지, 도구로 만드는지)은 공식 문서에서 찾지 못했다. **확인 불가.**

### 1.4 시스템 D: 10단계 + 흰색/검정, "단계 차이"로 대비 보장

- **단계 수**: 색마다 10~100의 10단계에 검정과 흰색을 더해 12 grade다.
- **대비 규칙**: grade 차이로 대비를 보장하는 표를 제공한다. 예: 가장 어두운 100단계 위의 텍스트는 4.5:1이 필요하면 50~흰색(5단계 차이), 3:1이면 60~흰색(4단계 차이)을 쓴다. 50단계 위는 4.5:1에 90~검정을 쓴다.
- **interactive/focus**: light 테마의 focus는 brand 파랑 60단계 테두리, dark 테마는 흰 테두리다. focus는 3:1 대비가 필수다.
- 생성 알고리즘은 공개 문서에서 찾지 못했다. **확인 불가.**

### 1.5 시스템 E: 100~1000

- **단계 수**: palette는 100~1000의 10단계다(최신 브랜드 팔레트 기준).
- light 테마에서 brand 진한 배경 토큰과 brand 텍스트 토큰은 같은 단계(700)를 가리킨다.
- 생성 알고리즘은 **확인 불가.**

### 1.6 참고: Tailwind CSS v4 기본 팔레트

ADR 0002에서 Tailwind 기본 팔레트를 Tide 팔레트로 바꾸기로 했으므로 참고로 확인했다. Tailwind 4.3.5의 `theme.css`는 기본 팔레트를 OKLCH(`oklch(L C H)` 형식)로 정의하고 50~950의 11단계를 쓴다. 출처: [unpkg tailwindcss@4.3.5/theme.css](https://unpkg.com/tailwindcss@latest/theme.css)

### 1.7 레퍼런스 blue의 흰색/검정 대비(직접 계산)

WCAG 상대 휘도 공식으로 직접 계산했다(아래 4장과 같은 코드). 외부 시스템의 색 값은 옮기지 않고 단계 위치와 대비만 적는다.

| 시스템 · 단계    | hex       | 흰색 대비 | 검정 대비 | 용도                          |
| ---------------- | --------- | --------- | --------- | ----------------------------- |
| **Tide 앵커**    | `#3183f5` | **3.69**  | **5.70**  | —                             |
| 시스템 B 9단계   | —         | 3.26      | 6.43      | solid 배경                    |
| 시스템 B 11단계  | —         | 4.77      | 4.41      | 저대비 텍스트                 |
| 시스템 C 4단계   | —         | 3.39      | 6.20      |                               |
| 시스템 C 5단계   | —         | 5.19      | 4.04      | accent 진한 배경(light)       |
| 시스템 D 50단계  | —         | 3.35      | 6.28      |                               |
| 시스템 D 60단계  | —         | 5.00      | 4.20      | interactive / focus           |
| 시스템 E 600단계 | —         | 4.00      | 5.25      |                               |
| 시스템 E 700단계 | —         | 5.20      | 4.04      | brand 진한 배경, brand 텍스트 |

관찰: 시스템 C·D·E는 흰 글자를 올리는 brand solid 배경에 흰색 대비 약 5:1인 단계를 쓴다. 시스템 B는 9단계(3.26:1)를 solid로 쓰지만 대비 기준을 APCA로 잡는다. `#3183f5`(3.69)는 이 시스템들의 "중간 밝기" 단계(C 4단계, D 50단계, E 600단계)와 밝기가 비슷하다.

---

## 2. Primitive / Semantic Token 네이밍과 계층

| 시스템   | Primitive 층                      | Semantic 층                                                                         | 네이밍 구조                                                 |
| -------- | --------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 시스템 A | 톤 팔레트(역할 팔레트의 톤 0~100) | Color role: 역할색, 그 위 글자색, 컨테이너, 컨테이너 위 글자색 …                    | 역할 + "위에 얹는 색" 접두사로 짝을 표시                    |
| 시스템 B | `{hue}{step}`(1~12)               | 색 패키지 자체에는 semantic 층이 없다. 단계 번호 자체가 용도를 담는다.              | `{hue}{step}`                                               |
| 시스템 C | `base.color.{hue}.{step}`         | functional 층: 배경·전경·테두리 × 역할 × 강도                                       | `{속성}.{역할}.{강도}`. CSS 변수는 `--{속성}-{역할}-{강도}` |
| 시스템 D | `{hue}{grade}`                    | 배경, 레이어, 아이콘(기본/interactive), focus …                                     | `{UI 요소}-{역할}`                                          |
| 시스템 E | `color.palette.{Hue}{step}`       | `color.background.<역할>.<강도>.<상태>`, `color.text.<역할>`, `color.border.<역할>` | Foundation · Property · Modifier(역할, 강도, 상태)          |

위 이름 예는 각 시스템의 구조를 Tide식 가상 이름으로 일반화한 것이다.

세부 사항:

- **시스템 C**: semantic 토큰은 `{base.color.blue.0}` 같은 참조로 base를 가리킨다. 테마별 차이는 `$extensions` 안의 override 항목에 둔다. 예: accent 진한 배경은 기본 5단계이고 dark 고대비 테마에서 9단계다. `alpha` 속성으로 투명도만 바꾼 파생 토큰도 만든다. 토큰 이름은 camelCase 또는 kebab-case만 허용하고, `@` 키로 그룹 기본값을 둔다(그룹 이름과 그 하위 강도 이름을 함께 쓰기 위해).
- **시스템 C의 짝 규칙**: 배경 토큰과 전경 토큰의 짝을 표로 둔 안내 문서가 있다.
- **시스템 E**: 이름은 최대 세 부분이다. Foundation(color, elevation, space), Property(background, border, text, icon), Modifier(역할, 강도, 상태)다. 강도는 다섯 단계(가장 옅음/옅음/기본/진함/가장 진함), 상태는 hover와 press 두 가지다.
- **시스템 D**: 토큰은 "적용되는 UI 요소" 기준으로 묶인다(Background, Layer, Field, Border, Text, Icon 등).

공통 패턴: 모든 시스템이 **"속성(bg/text/border/icon) × 역할(brand/neutral/danger…) × 강도 × 상태"** 의 조합으로 semantic 이름을 만든다. Tide GLOSSARY의 `bg-primary`, `text-muted`도 같은 패턴이다.

---

## 3. light/dark Theme 매핑과 대비 보장

| 시스템   | Theme 매핑 방식                                                                                                                                     | 대비 보장 방식                                                       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 시스템 A | 같은 톤 팔레트에서 톤만 바꾼다(primary: light 40 ↔ dark 80). contrast level에 따라 톤을 다시 계산한다.                                              | 톤 차이(40 → 3:1, 50 → 4.5:1)와 contrast level별 대비 목표 곡선      |
| 시스템 B | light 스케일과 dark 스케일을 따로 제공하고, 같은 단계 번호를 같은 용도로 쓴다.                                                                      | 11·12단계가 2단계 위에서 APCA Lc 60/90                               |
| 시스템 C | base 색 자체가 테마별 파일로 나뉜다. semantic의 override로 테마마다 참조를 바꾼다. light/dark 외에 고대비, 색각 이상 대응, 어둑한 dark 테마가 있다. | CI의 대비 검사 워크플로(README 배지). 검사 세부 기준은 **확인 불가** |
| 시스템 D | 4개 테마: light 2개, dark 2개. light는 레이어가 흰색과 아주 옅은 회색을 번갈아 쓰고, dark는 레이어마다 한 단계씩 밝아진다.                          | grade 차이 표(위 1.4)                                                |
| 시스템 E | 토큰 이름은 그대로 두고 값만 바꾼다. light, dark, 고대비 같은 테마가 있다. CSS는 `html` 요소의 data 속성 선택자로 바꾼다.                           | 공식 문서에서 구체적인 보장 방식을 찾지 못했다. **확인 불가**        |

출처: 시스템 A~E의 공개 문서·소스(조회일 2026-11-08). 공개 저장소 규칙에 따라 이름·링크는 적지 않는다.

---

## 4. `#3183f5` 직접 계산

WCAG 2.2의 상대 휘도 정의([WCAG 2.2 relative luminance](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance))로 scratch에서 계산했다. sRGB 선형화 임계값은 0.04045를 썼다. WCAG 본문의 0.03928과는 8비트 값에서 결과가 같다.

| 항목                                     | 값                                    |
| ---------------------------------------- | ------------------------------------- |
| 상대 휘도 Y                              | 0.2348                                |
| **흰색(#fff) 대비**                      | **3.69 : 1** (1.05 / (0.2348 + 0.05)) |
| **검정(#000) 대비**                      | **5.70 : 1** ((0.2348 + 0.05) / 0.05) |
| OKLCH                                    | L 0.6215, C 0.1882, H 257.77          |
| 시스템 A 색공간(공개 색 유틸리티로 계산) | H 264.31, C 64.17, **톤 55.56**       |

해석:

- 흰 배경 위 텍스트(4.5:1)에는 **미달**이다. 흰 배경 위 큰 텍스트와 UI 요소(3:1)는 통과한다.
- 반대로 `#3183f5` 배경 위에 **검정 글자**를 쓰면 4.5:1을 통과한다(5.70). 흰 글자는 큰 텍스트(3:1)만 통과한다.
- 흰 배경에서 4.5:1을 넘으려면 Y ≤ 0.1833(L\* ≤ 49.9)이어야 한다. 3:1은 Y ≤ 0.30(L\* ≤ 61.7), 7:1은 Y ≤ 0.10(L\* ≤ 37.8)이다. 앵커의 L\*(= 시스템 A 색공간의 톤)는 55.6이므로, 4.5:1을 통과하려면 톤을 약 6 이상 낮춰야 한다.

참고로, 앵커의 색상과 채도로 시스템 A의 공개 색 유틸리티에서 톤 팔레트를 만든 결과(scratch 실행)는 아래와 같다. 외부 시스템의 색이 아니라 Tide 앵커를 넣어 계산한 값이다. 대비는 같은 라이브러리의 톤 대비 함수로 계산했다.

| tone | hex       | 흰색 대비 | 검정 대비 |
| ---- | --------- | --------- | --------- |
| 95   | `#ecf0ff` | 1.13      | 18.52     |
| 90   | `#d7e2ff` | 1.29      | 16.26     |
| 80   | `#abc7ff` | 1.70      | 12.34     |
| 70   | `#7dabff` | 2.30      | 9.15      |
| 60   | `#458fff` | 3.17      | 6.62      |
| 56   | `#3384f6` | 3.63      | 5.78      |
| 50   | `#1674e6` | 4.48      | 4.68      |
| 40   | `#005cbc` | 6.46      | 3.25      |
| 30   | `#004590` | 9.35      | 2.25      |
| 20   | `#002f66` | 13.14     | 1.60      |
| 10   | `#001b3f` | 17.14     | 1.23      |

주의: tone 56은 `#3384f6`으로, 앵커 `#3183f5`와 정확히 같지 않다(앵커의 tone은 55.56). 정수 tone 격자로 스케일을 만들면 **앵커가 스케일 안에 정확히 들어가지 않는다.** 앵커를 그대로 쓰려면 앵커 단계만 원본 hex로 고정해야 한다. tone 50(4.48)도 4.5:1에 아주 조금 못 미친다.

---

## 5. W3C Design Tokens(DTCG) 포맷 현황

- **상태**: 2025.10이 **첫 안정판(Stable)** 으로 2025-10-28에 발행됐다. 이전 판은 Editors' Draft(세 번째 판 2025-07-21 등)였다. 문서 지위는 W3C 표준(Recommendation)이 아닌 Community Group Report다. 출처: [Technical Reports](https://www.designtokens.org/technical-reports/), [DTCG 공지](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
- **모듈 구성**: Format, Color, Resolver 세 모듈로 나뉜다. 출처: [Format](https://www.designtokens.org/tr/2025.10/format/), [Color](https://www.designtokens.org/tr/2025.10/color/), [Resolver](https://www.designtokens.org/tr/2025.10/resolver/)
- **기본 문법**: 토큰은 `$value`와 `$type`을 가진 객체다. 참조는 중괄호 `{colors.blue}`로 쓰고, 대상 토큰의 `$value` 전체로 해석된다. JSON Pointer `$ref`(`#/base/blue/$value/components/0`)로 값의 일부만 참조할 수도 있다. 출처: [Format › 7. Aliases / References](https://www.designtokens.org/tr/2025.10/format/#aliases-references)
- **그룹**: 예약 이름 `$root`로 그룹 기본값 토큰을 둔다(`color.accent.$root`). `$extends`와 `$deprecated`도 명세에 있다. 출처: [Format › 6. Groups](https://www.designtokens.org/tr/2025.10/format/)
- **기본 타입**: Color, Dimension, Font family, Font weight, Duration, Cubic Bézier, Number. 출처: [Format › 8. Types](https://www.designtokens.org/tr/2025.10/format/)
- **Color 값**: 문자열이 아니라 객체다. `{ colorSpace, components, alpha?, hex? }` 형식이고, `hex`는 sRGB 대체값이다. 지원 색공간은 `srgb`, `srgb-linear`, `hsl`, `hwb`, `lab`, `lch`, `oklab`, `oklch`, `display-p3`, `a98-rgb`, `prophoto-rgb`, `rec2020`, `xyz-d65`, `xyz-d50`이다. **OKLCH를 원본 값으로 저장할 수 있다.** 출처: [Color Module › 4.2](https://www.designtokens.org/tr/2025.10/color/)
- **Theme(Resolver Module)**: `sets`와 `modifiers`로 토큰 파일을 조합한다. modifier는 `contexts` 맵(예: `theme: { light: [...], dark: [...] }`)을 가지며, 배열 순서상 나중 값이 이긴다. 최종 순서는 `resolutionOrder`가 정한다. 출처: [Resolver › 4.1.5 Modifiers](https://www.designtokens.org/tr/2025.10/resolver/#modifiers)

## 6. 변환 도구: Style Dictionary

- **버전**: 5.8.0(npm latest). 출처: npm registry
- **DTCG 지원**: "v4부터 DTCG 포맷을 1급(first-class)으로 지원"한다. 다만 공식 문서는 "**2025.10은 아직 완전 지원이 아니며 v5에서 작업 중**"이라고 적는다. 출처: [Style Dictionary › DTCG](https://styledictionary.com/info/dtcg/)
- 2025.10 지원 추적 이슈 [#1590](https://github.com/style-dictionary/style-dictionary/issues/1590)은 2026-11-08 기준 **open**이다. 본문 체크리스트 기준 상태는 아래와 같다.
  - 완료: Color 모듈, Border, Shadow, Dimension
  - 진행 중: Gradient, Duration
  - 미표시: **Resolver 모듈**
- CHANGELOG로 확인한 내용:
  - 5.3.0: 모든 color transform이 DTCG color 객체(`colorSpace`, `components`, `alpha`, `hex`)를 지원한다. sRGB gamut 밖의 색에는 `hex`를 대체값으로 쓴다.
  - 5.4.0: dimension 객체 값을 지원한다.
  - 5.7.x: `duration` 값과 `$root` 이름 처리를 지원한다(`--color-text-warning-root`가 아니라 `--color-text-warning`으로 출력).
  - 출처: [CHANGELOG](https://github.com/style-dictionary/style-dictionary/blob/main/CHANGELOG.md). 이슈 #1590은 Duration을 진행 중으로 표시하지만, CHANGELOG에는 5.7.0에서 지원을 추가했다고 나온다. 체크리스트가 갱신되지 않았을 수 있다.
- **CSS 출력**: `css/variables` 포맷의 `outputReferences: true`는 참조를 `var(--color-red)`로 남긴다. Semantic Token이 Primitive를 `var()`로 참조하는 테마 CSS를 만들 때 필요하다. `selector` 옵션으로 `:root` 대신 `[data-theme="dark"]` 같은 선택자를 지정할 수 있다. 출처: context7 `/style-dictionary/style-dictionary`의 [predefined formats](https://github.com/style-dictionary/style-dictionary/blob/main/docs/src/content/docs/reference/Hooks/Formats/predefined.md), [References in output files](https://github.com/style-dictionary/style-dictionary/blob/main/docs/src/content/docs/reference/Hooks/Formats/index.md)
- **실사용 예**: 시스템 C는 Style Dictionary로 토큰을 빌드하고, 그 위에 override, alpha, Figma `$extensions` 기능을 직접 더했다.
- Style Dictionary 말고 다른 DTCG 변환 도구(Terrazzo 등)는 이번에 1차 출처로 확인하지 않았다. **확인 불가(미조사).**

---

## 7. Tide에 주는 시사점

이 장은 결정하지 않는다. 후보와 판단 근거만 늘어놓는다.

### 7.1 관찰 요약

1. 단계 수는 10~12가 표준이다. 시스템 B 12, 시스템 D 10(+흑백), 시스템 C 10, 시스템 E 10, Tailwind 11. ADR 0002에 따라 Tailwind 팔레트를 교체하므로, Tailwind와 같은 50~950(11단계) 명명을 쓰면 사용자가 덜 낯설어한다는 점은 고려 대상이다.
2. 지각적 균등 색공간(시스템 A의 색공간, OKLCH)으로 생성하는 시스템은 공개 알고리즘이 있다(시스템 A의 색 유틸리티, 시스템 B의 커스텀 생성기). 시스템 C·D·E의 생성 방식은 공개 문서로 확인하지 못했다.
3. 다른 시스템은 흰 글자를 얹는 brand solid 배경에 흰색 대비 약 5:1인 단계를 쓴다(시스템 C 5단계, 시스템 D 60단계, 시스템 E 700단계). 지도에 적힌 "텍스트와 solid 배경에는 더 진한 단계를 쓴다"는 방향과 맞다.
4. DTCG 2025.10은 OKLCH 원본 저장과 Resolver 기반 테마를 지원한다. 그러나 Style Dictionary 5.8.0은 Resolver 모듈을 아직 지원하지 않는다(이슈 #1590 open). 테마 조합은 당분간 Style Dictionary 설정(파일별 빌드, `selector`)으로 처리해야 할 가능성이 크다.

### 7.2 `#3183f5`를 앵커로 스케일을 만드는 방법 후보

| #   | 후보                                 | 방법                                                                                                                                              | 장점                                                                                                                                    | 단점 / 확인할 점                                                                                                                                                                                                                                                              |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | **OKLCH lightness 계단 + 앵커 고정** | 앵커의 H(257.8)는 고정한다. 단계별 L 목표값을 정하고 C는 곡선(양 끝에서 줄임)으로 둔다. 앵커 단계(예: 500)만 원본 hex로 고정한다.                 | Tailwind v4 기본 팔레트(OKLCH)와 성격이 같다. DTCG에 `oklch`로 그대로 저장할 수 있다. CSS `oklch()`와도 맞는다.                         | OKLCH L은 WCAG 대비와 선형 관계가 아니다. 단계별 대비는 따로 검증해야 한다. 파란색은 hue drift와 gamut 문제가 있다.                                                                                                                                                           |
| B   | **시스템 A 방식 톤 팔레트**          | 앵커의 H 264.3, C 64.2로 톤 팔레트를 만든다. 단계를 톤 값(예: 95/90/…/10)에 대응시킨다.                                                           | 톤 차이 40/50으로 3:1과 4.5:1이 보장되므로, 단계 간 대비 규칙을 만들기 쉽다. 대형 디자인 시스템 운영사가 유지하는 라이브러리다.         | 앵커 톤이 55.56이라 정수 톤 격자에 들어가지 않는다(tone 56 = `#3384f6`). 조사 시점 npm 최신판의 ESM 배포 파일은 import 경로 문제로 기본 진입점 import가 실패했다(scratch에서 확인). 빌드 의존성으로 쓰기 전에 검증해야 한다.                                                  |
| C   | **대비 목표 역산(WCAG 기반)**        | 단계마다 흰색 대비 목표(예: 1.1, 1.3, …, 3.0, 4.5, 7, …)를 먼저 정한다. 그 목표를 만족하는 Y(L\*)를 역산하고, hue와 chroma는 OKLCH 등에서 맞춘다. | 지도의 WCAG 2.2 AA 기준과 바로 연결된다. "N단계 이상은 흰 글자 OK" 같은 규칙을 수치로 보장한다(시스템 D의 grade 차이 표와 비슷한 효과). | 단계 간 지각적 간격은 고르지 않을 수 있다. 앵커(3.69)를 목표 표 어디에 둘지 정해야 한다.                                                                                                                                                                                      |
| D   | **시스템 B 커스텀 생성기 방식**      | 생성기에 앵커를 넣는다. 가장 가까운 기존 스케일을 섞어 12단계를 만들고 앵커를 9단계에 둔다. light와 dark가 함께 나온다.                           | 12단계마다 용도가 정해져 있어 Semantic Token 매핑이 쉽다. dark 스케일을 따로 얻는다. P3 값도 나온다.                                    | 대비 기준이 APCA라 WCAG 2.2 AA는 따로 검증해야 한다. 9단계(solid)에 앵커가 들어가면 흰 글자 대비가 3.69라 지도의 방향("solid에는 더 진한 단계")과 충돌할 수 있다. 생성기는 웹 UI이고, 소스는 그 시스템의 웹사이트 저장소에 있다(npm 패키지로 공개된 API인지는 **확인 불가**). |
| E   | **수작업 조정 + 자동 검증**          | 위 방법 중 하나로 초안을 만든다. 디자이너가 hex를 다듬고, CI에서 대비를 검사한다(시스템 C의 대비 검사 워크플로 방식).                             | 결과 품질을 사람이 통제한다. 대부분의 대형 시스템(C·D·E)이 생성 알고리즘을 공개하지 않은 것과 같은 길이다.                              | 재현성이 낮다. 다른 hue(neutral, danger 등)로 넓힐 때 비용이 든다.                                                                                                                                                                                                            |

### 7.3 dark Theme 후보(참고)

- **같은 스케일, 단계 반전**: 시스템 A(light 40 ↔ dark 80) 방식. Primitive가 하나라 단순하다.
- **dark 전용 스케일**: 시스템 B(dark 전용 스케일)와 시스템 C(테마별 base) 방식. 어두운 배경에서 채도와 밝기를 따로 맞출 수 있지만, Primitive가 두 배로 늘어난다.

### 7.4 후속 티켓에서 정해야 할 질문

- 단계 명명: `50~950`(Tailwind와 같음), `1~12`(시스템 B), `100~1000`(시스템 E) 중 무엇을 쓸까.
- 대비 기준: WCAG 2.2 대비비만 볼까, APCA도 함께 볼까.
- 원본 값 색공간: Token 원본을 hex(sRGB)로 둘까, `oklch`로 둘까. Style Dictionary 5.x는 DTCG color 객체와 `hex` 대체값을 지원한다.
- 테마 조합: Resolver 모듈 지원을 기다릴까, Style Dictionary 설정으로 light와 dark를 따로 빌드할까.
