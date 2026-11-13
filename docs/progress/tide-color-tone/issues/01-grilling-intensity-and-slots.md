# 파스텔 강도와 슬롯 구성 결정

Type: grilling
Status: resolved

## Question

파스텔 묶음은 바탕·테두리·글자 세 색을 한 묶음으로 쓴다. 지금 Tide 슬롯(`subtle`/`-hover`/`-active`, `text`, `border`)으로는 이 묶음을 담지 못한다. `text`(800)는 배지 밖 강조 글자와 함께 쓰이고, `border`(light 600)는 outline용이다.

정할 것:

- 파스텔 글자(950 근처)와 파스텔 테두리를 새 슬롯으로 둘지, 기존 `text`·`border`의 뜻을 바꿀지
- 두 번째 파스텔(C 0.015 안팎)을 새 **강도**로 둘지, `subtle`의 변형으로 둘지. 이름도 정한다
- 링크·강조 글자를 solid와 같은 색으로 둘지, 어느 슬롯이 맡는지
- 새 슬롯이 accent 슬롯(`--tide-accent-*`), `defineColorFamily`, 대비 쌍 검사에 어떻게 따라 붙는지
- Badge 등 이 묶음을 쓸 Component 목록

근거: [파스텔 색감 조사 §4](../../../research/pastel-color-tone.md)

## Answer

- 새 슬롯 셋: `on-subtle`(파스텔 위 글자), `subtle-border`(파스텔 테두리, 꾸밈이라 대비 검사 제외), `faint`(새 강도, 바탕 한 자리)
- 강도는 solid > subtle > faint 세 가지가 된다
- `text`는 단독 색 글자 전용, `border`는 outline·선택 표시용으로 그대로 둔다
- 적용 범위: `on-subtle`은 Badge subtle·Tag·Avatar·Alert·Button subtle, `subtle-border`는 Badge subtle·Tag·Alert, `faint`는 Badge만
- 대비 쌍: `on-subtle` × subtle 3단계·faint 4.5:1. Alert 경계 3:1 쌍은 지운다
- 새 슬롯은 Role·accent·색 계열·앱 계열에 똑같이 붙는다. neutral `on-subtle` = `text-default`

## Comments

### 1라운드(2026-11-12)

- Q1: 파스텔 위 글자는 새 슬롯 `on-subtle`(950 근처)로 둔다. `on-solid`와 짝
- Q2: 파스텔 테두리는 새 슬롯 `subtle-border`로 둔다. 기존 `border`(outline·선택 표시용)는 그대로
- Q3: 두 번째 파스텔은 새 강도 `faint`로 둔다(solid > subtle > faint). `muted`는 `text-muted`와, `soft`는 다른 시스템의 기존 용법과 겹쳐서 피함
- Q4: `text` 슬롯은 단독 색 글자(Link, Progress, Switch, Pagination, Toast) 전용으로 남기고, 값은 03에서 정한다

### 2라운드(2026-11-12)

- Q5: `on-subtle`은 subtle 바탕 Component(Badge subtle, Tag, Avatar, Alert, Button subtle)가 쓴다. Button outline·ghost는 `text-accent` 그대로
- Q6: `subtle-border`는 Badge subtle, Tag, Alert(`border-accent` 대체)가 쓴다. Button subtle, Avatar는 테두리 없음
- Q7: `subtle-border`는 꾸밈(바탕+글자로 식별 가능)이라 대비 검사에서 뺀다. Alert 경계 3:1 쌍도 지운다. 남는 쌍은 `on-subtle` × `subtle`/`-hover`/`-active`/`faint` 4.5:1
- Q8: `faint`는 바탕 슬롯 하나만 둔다(hover·active·전용 글자·테두리 없음). 글자는 `on-subtle`
- Q9: `faint`는 Badge(`variant="faint"`)에만 쓴다
- Q10: 세 슬롯 모두 `colorSlots`에 더해 Role Token, accent 변수, 색 계열 변수, `[data-color]` 규칙, `defineColorFamily` 덮어쓸 값에 똑같이 붙는다. neutral의 `on-subtle`은 `text-default`를 공유한다. Token 이름은 06에서 정한다

### 02에서 바뀐 점(2026-11-12)

- 2라운드의 subtle-hover 200 / subtle-active 300 매핑은 02의 덮기 방식(100 + gray-950 4%·8%)으로 바뀌었다
