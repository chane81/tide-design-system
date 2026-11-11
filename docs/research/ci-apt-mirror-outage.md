# CI `playwright install --with-deps` apt 실패 사례 (2026-11-11)

## 증상

PR #7(Release 0.4.0) CI run 43021954463이 네 번 연속으로 같은 단계에서 실패했다.

- 단계: `pnpm --filter @tide-tds/components exec playwright install --with-deps --only-shell chromium`
- 로그:
  - `Temporary failure resolving 'azure.archive.ubuntu.com'`
  - `E: Failed to fetch https://security.ubuntu.com/... fonts-*`
  - `Installation process exited with code: 100`
- 같은 run 안에서 npm·GitHub에서 내려받는 단계는 정상이었다. 실패한 것은 Ubuntu 패키지 서버 이름 풀이(DNS)뿐이다.

## 원인: Canonical 쪽 광범위 장애

- [actions/runner-images#15296](https://github.com/actions/runner-images/issues/15296)
  - 2026-11-11 13:48 UTC부터 ubuntu-26.04(ubuntu-latest)에서 같은 증상이 보고됐다. `npx playwright install --with-deps chromium`이 exit 100으로 끝났다.
  - 댓글에 따르면 status.canonical.com이 14:26 UTC부터 DNS를 포함한 Major Outage를 표시했다.
  - ubuntu-24.04로 고정해도 똑같이 실패했다. `getent hosts archive.ubuntu.com` 자체가 결과를 돌려주지 않았다.
  - GitHub 담당자 댓글(16:24 UTC): 「Canonical이 보고한 광범위 장애로 Azure 미러와 Canonical 미러가 모두 영향을 받고 있다. 모니터링 중이다.」
- [actions/runner-images#15297](https://github.com/actions/runner-images/issues/15297): 2026-11-11 14:00 UTC부터 ubuntu-22.04·24.04에서 같은 증상이 보고됐다.

결론: 우리 코드나 설정 문제가 아니다. 이번에는 `archive.ubuntu.com`·`security.ubuntu.com`까지 이름을 풀지 못하므로, apt 소스를 원본 미러로 바꾸는 우회도 통하지 않는다.

## 평소에도 있는 Azure 미러 불안정 (참고)

- [actions/runner-images#14823](https://github.com/actions/runner-images/issues/14823): apt가 느린 azure.archive.ubuntu.com 노드에 20분 동안 붙어 있는 문제다.
- [#15040](https://github.com/actions/runner-images/issues/15040): Azure 미러에서 다른 미러로 넘어간 뒤 `apt-get update`가 15분 넘게 아무 출력 없이 멈춘다(ubuntu 24.04).
- [#15142](https://github.com/actions/runner-images/issues/15142): azure.archive.ubuntu.com 다운로드가 간헐적으로 약 0.3 MB/s로 떨어진다. closed 상태다.
- 2022–2024년에도 비슷한 이슈가 있었다(#675, #6327, #6894, #9836, #10446).
- Playwright 쪽 보고: [microsoft/playwright#36494](https://github.com/microsoft/playwright/issues/36494), [#33051](https://github.com/microsoft/playwright/issues/33051), [#28251](https://github.com/microsoft/playwright/issues/28251)

## 다른 프로젝트가 쓴 우회 방법

1. **재실행**: 미러가 회복되면 그냥 다시 돌려서 통과했다는 사례가 가장 많다.
2. **apt 소스를 `archive.ubuntu.com`으로 바꾸고 재시도**: Azure 미러 하나만 문제일 때 효과가 있다(예: [openmoq/moqx#872](https://github.com/openmoq/moqx/pull/872)). Canonical 전체 장애인 이번에는 효과가 없다.
3. **Playwright 공식 컨테이너 이미지(`mcr.microsoft.com/playwright`)에서 job 실행**: 시스템 의존성이 이미지에 미리 들어 있어 apt 단계가 없다. 이번처럼 Ubuntu 서버 장애가 나도 영향을 받지 않는다. 다만 이미지 태그를 catalog의 Playwright 버전과 맞춰야 하고, job 구성이 바뀐다.
4. **시스템 의존성 설치를 캐시하거나 분리**하고 `--with-deps` 없이 브라우저만 설치한다.

3·4번을 도입할 때는 컨테이너 job 옵션과 이미지 태그 규칙을 공식 문서(Playwright Docker·CI 문서, GitHub Actions `container`)에서 설치 버전 기준으로 확인한 뒤 적용한다. 이 문서는 해당 내용을 아직 확인하지 않았다.

## 이번 결정

CI 설정은 바꾸지 않고, 장애가 회복된 뒤 재실행한다(2026-11-11 사용자 선택). 같은 장애가 반복되면 3번을 검토한다.
