# 18: trusted publisher 설정과 0.2.0 CI 릴리스

Status: ready-for-human
Blocked by: 14 (IconButton과 Link), 16 (Checkbox와 Radio), 17 (Switch)

## What to build

2단계(액션·폼)를 0.2.0으로 낸다. 이번 릴리스부터 CI가 OIDC로 publish하므로, 메인테이너가 세 패키지에 trusted publisher를 설정한 직후 Version PR을 머지해 설정이 실제로 동작하는지 검증한다.

## 수용 기준

- [ ] 2단계 티켓(13~17)이 모두 `done`이다.
- [ ] 세 패키지에 trusted publisher(직접 publish 허용)를 설정한다.
- [ ] 설정 직후 Version PR을 머지하고, 48시간 안에 CI 릴리스로 publish가 성공함을 확인한다.
- [ ] npm에서 세 패키지 0.2.0의 provenance를 확인한다.
- [ ] GitHub Release가 하나로 합쳐져 있고 패키지별 tag가 있다.
- [ ] publish 뒤 문서가 자동 배포되고 0.2.0을 설명한다.

## Comments
