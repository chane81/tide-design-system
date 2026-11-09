# 버전과 배포 정책 결정

Type: grilling
Status: open
Blocked by: 29

## Question

언제, 어떻게 버전을 올리고 배포할지 정한다.

- 릴리스 도구(changesets 등)와 흐름
- 세 패키지의 버전을 함께 올릴지 따로 올릴지
- v0(0.x) 동안의 semver 규칙. breaking change를 무엇으로 볼지(Token 이름 변경, Component props 변경, 아이콘 이름 변경)
- 단계별 중간 릴리스 여부(「v0 Component 목록과 우선순위 결정」: 5단계 구현 순서)
- CI publish 인증(trusted publishing 또는 토큰)과 2FA
- prerelease dist-tag 사용 여부
- CHANGELOG 언어(한글 우선, 영문 병행)
- Lucide 업스트림이 아이콘 이름을 바꾸거나 지울 때 `@tide-tds/icons`의 처리(「아이콘 전략 결정」, ADR 0007)

### 참고 (다른 티켓에서 넘어온 것)

- 「버전 관리와 npm 배포 흐름 조사」(29번)의 결과를 근거로 쓴다.
- 「npm scope @tide-tds 확보」: org `tide-tds`, owner `charles-green`, 2FA 켜짐.
- 의존성 버전은 pnpm catalog로 관리한다(지도 Notes).
- 「Storybook 문서 구성 결정」: 문서는 릴리스(npm publish)마다 Dokploy(`tide-tds.lakegreen.net`)에 배포한다. 릴리스 workflow 마지막 단계에서 Dokploy API를 호출한다. 문서 배포는 저장소 공개 여부와 상관없다. 아이콘 페이지에 alias를 보여 줄지는 이 티켓의 alias 결정을 따른다.
