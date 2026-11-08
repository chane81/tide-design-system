# 타이포그래피 Foundation 결정

Type: grilling
Status: open
Blocked by: 04, 10

## Question

기본 폰트와 fallback 스택, 웹폰트 배포 방식, 타입 스케일(단계 수, 크기, 행간, 자간), 텍스트 스타일 Token의 이름과 Utility class 노출 방식을 결정한다.

### 참고 (다른 티켓에서 넘어온 것)

- 「Token 네이밍과 Utility class 노출 규칙 결정」: 공개 계약은 `--tide-<class 이름>`이고, Tailwind 쪽은 표준 namespace(`--text-*`, `--leading-*` 등)에 연결한다. `text-*`는 색(`text-default`, `text-muted`, `text-primary` 등)과 font size가 같은 접두를 쓰므로, 크기 단계 이름이 색 Token 이름과 겹치지 않게 정한다. 커스텀 크기 이름은 tailwind-merge 설정에 등록되도록 TS 원본에 둔다.
