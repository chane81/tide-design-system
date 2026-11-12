# 46: 대비 하한을 상태별 세 등급으로

Status: done
Blocked by: 40 (열린 색 이름과 앱 브랜드 색 계열)

## What to build

대비 쌍의 하한이 「글자 4.5:1, UI 요소 3:1」 두 가지라, 잠깐 보이는 hover·누름 상태 때문에 기본 색까지 진하게 당기거나 쓰임을 막아야 했다. 파스텔 색감을 다듬을 여지를 두려고 하한을 상태별로 나눈다. 2026-11-12 사용자 결정(「4.5:1 조건을 약간 완화시키자. 너무 이 규칙만 지키다 보니 심미성을 놓칠 수 있어」, 선택안 「상태별 차등」).

- 기본(정지) 상태의 글자는 4.5:1을 지킨다.
- hover·누름 같은 일시 상태의 글자, solid 위 글자(on-solid)는 4.0:1이다.
- 경계·포커스 표시·thumb 같은 UI 요소는 그대로 3:1이다.

색 값(스케일·슬롯 규칙)은 바꾸지 않는다. 규칙과 등록 쌍, 문서만 바꾼다.

## 수용 기준

- [x] ADR로 세 등급, 이유(심미성, 파스텔 색감 방향), 결과·트레이드오프(WCAG 1.4.3 엄격 해석보다 낮을 수 있음)를 남긴다. 4.5를 단정한 기존 ADR은 새 ADR을 가리킨다.
- [x] 용어집에 하한 등급을 더한다.
- [x] Foundation 대비 쌍과 색 이름 규칙이 등급별로 하한을 갖는다. 일시 상태 쌍과 solid 위 글자 쌍은 4.0, 정지 상태 글자 쌍은 4.5다.
- [x] 낡은 주석(Pagination 현재 페이지가 text × subtle을 쓴다는 문장)을 고친다.
- [x] Switch 꺼짐 누름 thumb(text-accent × subtle-active)을 3:1 UI 쌍으로 등록한다.
- [x] Component 대비 등록 검사가 새 등급을 확인한다.
- [x] raised 표면 위 Role 색 ghost·outline 버튼의 hover·누름 대비를 다시 계산해 표로 남기고, 결과에 맞게 문서 안내를 고친다.
- [x] 컬러 Foundation 「대비」 절과 Component 문서의 4.5:1 문장을 새 등급에 맞춘다. 대비 쌍 표와 색 이름별 대비 표가 4.0 등급을 보여 준다.
- [x] 색감 조정 판단 보류 목록에서 처리한 항목에 표시를 남긴다.
- [x] changeset 판단.

## Comments

- 2026-11-12 완료.
  - **근거 버전**: vitest 5.1.0, typescript 7.0.2, @changesets/cli 3.0.3(저장소 설치 버전). 새 의존성이나 새로 쓴 라이브러리 API는 없다(기존 vitest `toMatchSnapshot` 갱신 `-u`만 썼다). 기준 근거는 WCAG 2.2 성공 기준 1.4.3·1.4.11(접근성 기준 문서의 표와 같다).
  - **구현**:
    - `packages/foundation/src/contrast.ts`: 공개 타입 `ContrastMinRatio`(`4.5 | 4 | 3`)를 더하고 `ContrastPair`·`ColorContrastRule`의 `minRatio`가 이 타입을 쓴다. 등록 쌍을 등급별로 나눴다.
      - 4.5: 글자 × 표면 층, `text-default` × neutral faint·subtle·subtle-active, 역할 text × 표면 층·같은 역할 subtle, on-subtle × faint·subtle.
      - 4: `text-default` × neutral subtle-hover, on-subtle × subtle-hover·subtle-active, 글자 × `bg-hover`·`bg-active`(canvas·raised 위 합성), on-solid × solid 3단계.
      - 3: 경계·포커스 표시 × 표면 층, 포커스 표시 × 역할 subtle, Switch thumb(`text-<role>` × `bg-<role>-subtle-active`, 새로 5쌍).
    - 색 이름 규칙(`colorContrastRules`)도 같은 등급이다. 16개에서 17개(`text × subtle-active` 3)가 되어 tide-color 검사가 34개(light·dark)가 된다.
    - 낡은 주석: text × subtle의 실제 쓰임(Progress 막대 × 트랙, Menu·Select·Combobox highlight, Switch 꺼짐 hover thumb)으로 고쳤다. Pagination 현재 페이지는 on-subtle 쌍이다.
    - Component 주석(pressable·Toast·Switch·list-style·Table·Tag·Badge·choice-style·alert-style)의 4.5 문장을 실제 등급으로 고쳤다. 코드 동작은 그대로다.
    - 문서: ADR 0023 새로 씀. ADR 0022·0017에는 본문을 고치지 않고 「덧붙임(ADR 0023)」을 달았다(저장소 관례). 접근성 기준 문서의 텍스트 대비 줄과 대비 규칙, 원칙 문서의 ADR 목록, GLOSSARY 「하한 등급」.
    - Storybook: Color.mdx 「대비」에 등급 표를 더하고 색 이름별 대비 표에 하한 열을 더했다. 대비 쌍 블록은 등급 이름(글자 / 일시 상태·solid 위 글자 / UI 요소)을 적고, 색 이름별 대비 블록은 글자·파스텔 글자를 정지 / 호버·누름으로 나눠 등급마다 최저값을 보여 준다(한 열에 등급이 섞이면 최저값과 기준이 어긋난다). BrandColor.mdx 검사 표, Button·Badge·Pagination·Tag·Toast·Table·Alert·Accordion·Switch 문서의 대비 줄.
  - **등급별 쌍 개수(light·dark 각각)**: 전 109쌍(4.5 82, 3 27) → 후 114쌍(4.5 39, 4 43, 3 32). 늘어난 5쌍은 Switch thumb이다. 대비비 값은 하나도 바뀌지 않았다(회귀 스냅숏 diff는 `≥` 값과 thumb 5줄뿐).
  - **raised 표면 위 Role 색 ghost·outline 버튼(bg-raised 위에 bg-hover·bg-active를 합성)**:

    | Role    | light hover | light 누름 | dark hover | dark 누름 | 4.0 통과       |
    | ------- | ----------- | ---------- | ---------- | --------- | -------------- |
    | primary | 5.93        | 5.48       | 4.56       | 4.01      | 통과           |
    | success | 5.57        | 5.15       | 4.67       | 4.10      | 통과           |
    | warning | 6.00        | 5.54       | 4.54       | 3.99      | dark 누름 미달 |
    | danger  | 6.38        | 5.89       | 4.42       | 3.89      | dark 누름 미달 |
    | info    | 5.75        | 5.31       | 4.61       | 4.05      | 통과           |

    hover는 모두 4.0을 넘지만 dark 누름 warning·danger가 남는다. 그래서 이 조합은 등록하지 않고, Button.mdx·Color.mdx의 「raised 안에선 `color="neutral"`」 안내를 유지하며 이유 문장만 사실(누름 배경 위 warning·danger가 4:1 미달)로 고쳤다. Toast 버튼은 neutral 그대로다.

  - **02에서 지운 쌍 다시 보기**: 역할 text × subtle-hover·subtle-active는 4.0 기준으로 모두 통과한다(최저 info dark × subtle-active 4.31). 하지만 그 위에 글자를 그리는 Tide Component가 없어(그 위 글자는 on-subtle, ADR 0022) 글자 쌍으로는 다시 등록하지 않았다. subtle-active는 Switch thumb용 UI 쌍(3)으로만 등록했다.
  - **멈출 조건 확인**: 4.5 정지 상태 쌍이 새로 미달한 것은 없다. 등급만 바꿔 모든 쌍이 통과한다.
  - **changeset**: `@tide-tds/foundation` minor(공개 타입 `ContrastMinRatio` 추가, `ContrastPair["minRatio"]` 넓어짐, 공개 `contrastPairs` 목록과 등급이 바뀜. fixed 묶음이라 icons·components도 함께 오른다). 문서는 `@tide-tds/docs` minor를 따로 둔다(대비 블록이 등급을 보여 주는 기능 변화. ADR 0020에 따라 TDS와 docs는 다른 changeset 파일).
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. **solid 위 글자 4.0은 Badge solid(정지 상태)에도 적용된다.** 결정은 「solid 위 버튼 글자」였지만 on-solid × solid는 한 쌍이라 Badge·Checkbox 표시도 같은 등급이 된다. 지금 값은 최저 4.70:1(success)이라 실제로 4.5 아래인 곳은 없다.
    2. **「굵은 글자」의 실제 굵기**: Button·Badge label은 `text-label-*`(medium, 500)이다. WCAG의 큰 글자(14pt bold 또는 18pt)에는 해당하지 않아 ADR에는 「짧은 label 글자」로 적었다.
    3. **neutral subtle-active는 4.5 유지**: Button subtle neutral 누름은 일시 상태지만 같은 짝이 목록의 선택 유지 바탕이라 엄한 쪽(4.5)으로 한 번만 등록했다.
    4. **raised 위 Role 색 hover 쌍을 등록하지 않음**: hover만 보면 모두 4.0을 넘지만 누름이 미달이고 Tide Component가 쓰지 않아 등록하지 않았다.
    5. **Menu·Select highlight(text-primary × primary subtle)는 4.5**: 마우스 hover로도 생기지만 키보드 위치(정지 상태)이기도 해서 정지 등급으로 두었다.
    6. **docs changeset을 minor로 봤다.** 대비 블록 표시가 바뀌는 문서 기능 변화라서다. patch로 낮춰도 무방하다.
