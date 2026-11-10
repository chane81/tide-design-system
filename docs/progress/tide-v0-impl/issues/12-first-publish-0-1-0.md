# 12: 0.1.0 첫 publish

Status: ready-for-human
Blocked by: 05 (타이포그래피 Foundation과 Typography), 09 (Spinner), 10 (문서: 시작하기·원칙·기준), 11 (릴리스 파이프라인), 38 (`@tide-tds/desktop`을 `@tide-tds/components`로 바꾸기)

## What to build

1단계(Foundation 전체, 아이콘, VisuallyHidden·Typography·Spinner)를 0.1.0으로 npm에 처음 공개하고 문서 사이트를 처음 배포한다. npm trusted publisher는 패키지가 존재해야 설정할 수 있으므로 첫 publish는 메인테이너가 로컬에서 2FA로 한다.

## 수용 기준

- [ ] 1단계 티켓(01~11)이 모두 `done`이다.
- [ ] 세 패키지(`@tide-tds/foundation`, `@tide-tds/icons`, `@tide-tds/components`)를 0.1.0으로 로컬에서 2FA로 publish한다.
- [ ] 세 패키지 모두 `access: public`이고 패키지 2FA 설정이 되어 있음을 확인한다.
- [ ] components가 foundation·icons를 정확한 버전(0.1.0)으로 의존함을 npm에서 확인한다.
- [ ] 새 Next 앱에 npm에서 설치해 설치 페이지 절차대로 동작함을 확인한다.
- [ ] `tide-tds.lakegreen.net`에 문서를 첫 배포하고, 문서가 0.1.0을 설명한다.
- [ ] trusted publisher는 아직 설정하지 않는다(18에서 다음 CI 릴리스 직전에 한다).

## Comments
