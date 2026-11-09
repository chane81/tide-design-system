# 35: Windows 고대비 수동 확인과 0.5.0 릴리스

Status: ready-for-human
Blocked by: 34 (Toast)

## What to build

v0 Component 33개가 모두 끝난 상태에서 메인테이너가 실제 Windows 고대비 테마로 한 번 확인하고, v0 완료 릴리스 0.5.0을 낸다. Playwright `forcedColors`로 자동 확인한 것이 실제 테마에서도 맞는지 보는 마지막 단계다.

## 수용 기준

- [ ] 티켓 01~34가 모두 `done`이고 0.4.0이 나가 있다.
- [ ] 실제 Windows 고대비 테마(밝은·어두운 각 1개 이상)에서 문서의 Component 페이지를 확인한다: raised 표면·오버레이 경계, 포커스 표시(ring/field/highlight), Checkbox·Radio·Switch 상태, 선택 탭, 상태 아이콘.
- [ ] 문제가 있으면 새 티켓을 만들어 고친 뒤 다시 확인한다. 확인 결과를 Comments에 남긴다.
- [ ] Version PR을 머지해 0.5.0을 CI로 publish하고 provenance와 문서 배포를 확인한다.
- [ ] spec의 Component 33개가 모두 export되어 있음을 확인한다.

## Comments
