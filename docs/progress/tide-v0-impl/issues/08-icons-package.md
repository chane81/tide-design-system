# 08: 아이콘 패키지

Status: ready-for-agent
Blocked by: 03 (Storybook과 브라우저 테스트 골격), 36 (패키지 빌드를 tsdown으로 전환)

## What to build

앱 개발자가 `@tide-tds/icons`에서 `PlusIcon`처럼 Tide 이름으로 아이콘을 import하고, 쓰지 않는 아이콘은 번들에 들어가지 않는다. Tide 이름은 이름표가 정본이라 업스트림 사정으로 조용히 바뀌지 않는다. 문서의 아이콘 페이지에서 이름과 태그로 검색하고 import 문을 복사한다.

## 수용 기준

### 이름표와 생성

- [ ] `lucide-static`은 devDependency다. 이름표 파일 하나(`Tide 이름 → lucide-static 원본 SVG 이름`)를 커밋한다. 처음에는 정식 Lucide 아이콘 이름으로 자동 초기화하고(ADR 0007), 이후 이름표가 정본이다.
- [ ] 생성 스크립트는 이름표의 줄마다 Component를 만든다. 원본 SVG가 없으면 빌드를 실패시키고, 이름표에 없는 새 SVG는 목록만 출력한다. Lucide alias는 만들지 않는다. 생성 결과는 커밋하지 않는다.
- [ ] 이름은 모두 `Icon` 접미사가 붙는다.

### 공통 틀

- [ ] 손으로 쓰는 것은 공통 틀 하나다. `size` 기본 16(px), `strokeWidth` 기본 2와 `vector-effect: non-scaling-stroke`, 색은 `currentColor`.
- [ ] `aria-label`이 있으면 `role="img"`, 없으면 `aria-hidden="true"`, `focusable="false"`. 나머지 SVG 속성은 그대로 넘긴다.

### 빌드와 배포

- [ ] desktop·foundation과 같은 tsdown 설정(`unbundle`, oxc d.ts, 티켓 36)으로 빌드해 파일 단위로 나눠 tree-shaking이 된다.
- [ ] LICENSE에 Lucide ISC와 Feather MIT 고지 전문을 넣는다. 공개 API, 패키지 설명, Storybook 본문에는 Lucide를 드러내지 않고 감사 문구만 한 줄 둔다.
- [ ] desktop dependencies에 icons를 연결한다.

### 테스트 (`unit`)

- [ ] 이름표 키와 실제 export 목록이 일치한다.
- [ ] 대표 아이콘 몇 개를 서버 렌더해 `aria-hidden`/`role="img"`, 기본 크기, 선 두께를 확인한다.

### 문서

- [ ] 아이콘 페이지: 이름표의 이름과 Lucide `tags.json`으로 검색하고, 클릭하면 import 문을 복사한다. 가상화는 없다. 검색 메타데이터는 공개 API가 아니다.
- [ ] 아이콘 사용 가이드(크기 규칙 표, 선 두께, 장식용·이름 있는 아이콘)를 둔다.

## Comments
