# v0 Foundation 범위 결정

Type: grilling
Status: resolved
Blocked by: 02, 03

## Question

v0에 넣을 Foundation 항목을 확정한다. 컬러와 타이포그래피 외에 간격, radius, elevation, motion, breakpoint, z-index, 아이콘 중 무엇을 넣을지 정한다. 항목마다 Tailwind 기본값을 유지할지, 교체할지, 확장할지도 정한다.

## Answer

컬러와 타이포그래피 외에 v0 Foundation에 넣을 항목과, 항목마다 Tailwind 기본값을 어떻게 다룰지 정했다. 색 팔레트를 교체한 ADR 0002, ADR 0003의 규칙(`--tide-*` 공개 계약, 표준 namespace에 연결)을 그대로 따르므로 새 ADR은 만들지 않았다.

| 항목                          | v0 포함  | Tailwind 기본값                                                                            | 후속                                                                    |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 간격                          | ○        | **유지**. 숫자 규칙(`--spacing` 0.25rem)만 씀. 이름 붙은 간격(`gutter` 등)은 두지 않음     | 이 티켓에서 끝남                                                        |
| radius                        | ○        | **교체**. 기본값을 지우고 `sm`/`md`/`lg`/`xl`/`full` 5단계만 둠                            | 「radius·elevation·focus ring 형태 결정」                               |
| elevation(그림자 형태)        | ○        | **교체**. Tide 그림자 단계만 두고, 모든 단계가 `--tide-shadow-color`를 씀                  | 「radius·elevation·focus ring 형태 결정」                               |
| focus ring 형태(두께, offset) | ○        | Token으로 정함. 근거는 WCAG 2.4.11(AA)과 비텍스트 대비 3:1. 2.4.13(AAA)은 최소 기준이 아님 | 「radius·elevation·focus ring 형태 결정」                               |
| motion                        | ○ (최소) | **Token으로 정함**. duration과 easing 몇 개, `prefers-reduced-motion` 규칙                 | 「motion Foundation 결정」                                              |
| breakpoint                    | ○        | **유지**(`sm` 40rem ~ `2xl` 96rem)                                                         | 이 티켓에서 끝남                                                        |
| z-index                       | ○        | Semantic 층 이름을 둠. 이름은 표면 층(surface level)과 섞이지 않게 정함                    | 「z-index 층 결정」(헤드리스 결정에 따라 top-layer를 쓰면 Token을 줄임) |
| 아이콘                        | ○        | —                                                                                          | 「아이콘 전략 결정」                                                    |
| border width, opacity         | —        | **유지**. Token을 따로 두지 않음                                                           | 없음                                                                    |

### 근거

- 간격과 breakpoint 유지: ④ 발견할 수 있음(사용자가 이미 아는 값)과 ③ 단순함(이름 규칙과 숫자 규칙을 함께 두지 않음).
- radius와 그림자 교체: 단계를 적게 둬야 Component 사이 모양이 일관된다(② 명확함, ③ 단순함). Tailwind 기본 그림자는 자기 색을 써서 dark Theme 매핑과 어긋난다.
- motion: Component마다 숫자 duration이 달라지는 것을 막는다. ① 접근성 때문에 reduced-motion 규칙이 필수다.

### 다른 티켓에 주는 영향

- 「Component 공통 API 규칙 결정」: radius와 shadow 이름을 교체하므로 `extendTailwindMerge`에 등록해야 한다(Token TS 원본에서 생성).
- 「z-index 층 결정」은 「접근성 동작 구현 방식 결정」, 「아이콘 전략 결정」은 「v0 Component 목록과 우선순위 결정」에 막혀 있다.

## Comments

- 2026-11-08 grilling 진행. radius는 처음에 sm/md/lg/full 4단계를 제안했으나 사용자가 `xl`을 더해 5단계로 정했다. 나머지 항목은 추천안대로 확정했다.
