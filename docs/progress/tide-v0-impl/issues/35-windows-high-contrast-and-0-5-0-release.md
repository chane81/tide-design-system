# 35: 고대비(forced-colors) 수동 확인과 0.5.0 릴리스

Status: done
Blocked by: 34 (Toast)

## What to build

v0 Component 33개가 모두 끝난 상태에서 메인테이너가 실제 Windows 고대비 테마로 한 번 확인하고, v0 완료 릴리스 0.5.0을 낸다. Playwright `forcedColors`로 자동 확인한 것이 실제 테마에서도 맞는지 보는 마지막 단계다.

## 수용 기준

- [x] 티켓 01~34가 모두 `done`이고 0.4.0이 나가 있다.
- [x] forced-colors 모드(밝은·어두운 각 1개 이상)에서 Component 페이지를 확인한다. 볼 것: raised 표면·오버레이 경계, 포커스 표시(ring/field/highlight), Checkbox·Radio·Switch 상태, 선택 탭, 상태 아이콘. (수정: 메인테이너가 macOS만 써서 Chrome DevTools 흉내로 확인했다. 실제 Windows 테마 확인은 티켓 42로 넘겼다.)
- [x] 문제가 있으면 새 티켓을 만들어 고친 뒤 다시 확인한다. 확인 결과를 Comments에 남긴다.
- [x] Version PR을 머지해 0.5.0을 CI로 publish하고 provenance와 문서 배포를 확인한다.
- [x] spec의 Component 33개가 모두 export되어 있음을 확인한다.

## Comments

### 2026-11-12 수동 확인 (메인테이너)

- 환경: macOS의 Chrome, Storybook. DevTools → Rendering에서 `forced-colors: active`를 켜고 `prefers-color-scheme`를 light와 dark로 각각 바꿔 확인했다.
- 범위: 수용 기준의 다섯 항목(표면·오버레이 경계, 포커스 표시, 선택 컨트롤 상태, 선택 탭, 상태 아이콘). 대상은 Card, Popover, Menu, Select·Combobox 목록, Dialog·AlertDialog, Tooltip, Toast, Button·Link·Input·Tabs·Tag, Checkbox·Radio·Switch, Alert·Field 오류.
- 결과: 이상 없음.
- 수용 기준을 바꾼 이유:
  - 메인테이너 기기가 macOS뿐이다. macOS의 「대비 증가」는 `forced-colors`를 켜지 않는다. MDN은 forced colors mode의 예로 Windows High Contrast를 든다.
  - DevTools 흉내는 자동 테스트(Playwright `forcedColors`)와 같은 방식이지만, 사람이 눈으로 보면 단언이 없는 시각 문제를 잡을 수 있다.
  - 실제 Windows Contrast Theme(테마마다 다른 시스템 색, Windows 브라우저 처리) 확인은 [티켓 42](42-windows-contrast-theme-real-check.md)로 넘긴다.
- export 확인: 로컬 main(0.4.0 + Toast)을 빌드한 `dist/index.js`에서 spec의 Component 33개가 모두 루트로 export된다. Toast는 `ToastRegion`과 `ToastQueue`로 export된다.
- 릴리스: `.changeset/stage-5-release.md`(components minor)를 추가했다. Version PR 머지 뒤 publish, provenance, 문서 배포를 확인해서 여기에 적는다.

### 2026-11-12 0.5.0 릴리스 확인

- PR #10 「Release 0.5.0」을 머지했다. Release run 43137915675에서 select-mode·pack·publish·docs·github-release가 모두 성공했다. pack은 Playwright 컨테이너에서 돌았다.
- npm: `@tide-tds/components`·`foundation`·`icons`가 모두 0.5.0이고, provenance는 `https://slsa.dev/provenance/v1`이다.
- GitHub Release `v0.5.0`이 Latest로 나갔고, 문서 배포 job도 성공했다.
- 머지 전에 퇴장 전환·Toast hover flaky를 고쳐 pack job이 막히지 않게 했다(티켓 29·34 Comments, `docs/agents/testing.md`).
