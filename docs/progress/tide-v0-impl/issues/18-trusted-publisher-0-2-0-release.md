# 18: trusted publisher 설정과 0.2.0 CI 릴리스

Status: done
Blocked by: 14 (IconButton과 Link), 16 (Checkbox와 Radio), 17 (Switch)

## What to build

2단계(액션·폼)를 0.2.0으로 낸다. 이번 릴리스부터 CI가 OIDC로 publish하므로, 메인테이너가 세 패키지에 trusted publisher를 설정한 직후 Version PR을 머지해 설정이 실제로 동작하는지 검증한다.

## 수용 기준

- [x] 2단계 티켓(13~17)이 모두 `done`이다.
- [x] 세 패키지에 trusted publisher(직접 publish 허용)를 설정한다.
- [x] 설정 직후 Version PR을 머지하고, 48시간 안에 CI 릴리스로 publish가 성공함을 확인한다.
- [x] npm에서 세 패키지 0.2.0의 provenance를 확인한다.
- [x] GitHub Release가 하나로 합쳐져 있고 패키지별 tag가 있다.
- [x] publish 뒤 문서가 자동 배포되고 0.2.0을 설명한다.

## Comments

- 2026-11-10 0.2.0 CI 릴리스 완료. 이로써 `done`.
  - 순서: main push(Release workflow가 Version PR #2 생성) → 메인테이너가 세 패키지에 trusted publisher 설정(`chane81` / `tide-design-system` / `release.yml` / Environment 비움 / 직접 publish 허용) → 저장소 변수 `NPM_TRUSTED_PUBLISHING=true` → PR #2 머지 → Release workflow(run 42791530141).
  - 결과: 세 패키지 0.2.0이 npm에 있고 provenance(`https://slsa.dev/provenance/v1`)가 붙어 있다. components는 foundation·icons를 `0.2.0` 정확한 버전으로 의존한다. tag `@tide-tds/{foundation,icons,components}@0.2.0`과 GitHub Release `v0.2.0` 하나. 문서가 자동 배포되어 2단계 Component(Button~Switch) 문서가 올라왔다.
  - 겪은 것(다음 사람용):
    - 첫 실행에서 foundation·icons만 publish되고 components는 `ERR_PNPM_FAILED_TO_PUBLISH … (status 404 Not Found)`로 실패했다. components에 trusted publisher가 설정되지 않았기 때문이다. npm은 설정을 검증하지 않으므로 세 패키지 모두 저장됐는지 확인한다.
    - 복구: 실패 job만 다시 돌리면 publish 계획에 이미 올라간 패키지가 남아 있으므로, 레지스트리에 0.2.0이 반영될 때까지(몇 분) 기다린 뒤 workflow 전체를 다시 실행했다(`gh run rerun <id>`). select-mode가 계획을 components만으로 다시 세웠다.
    - 재실행의 github-release job은 그 실행에서 publish된 패키지만 본문에 넣는다. `PUBLISHED_PACKAGES='[…세 패키지…]' node scripts/release-notes.ts notes.md` 후 `gh release edit v0.2.0 --notes-file notes.md`로 본문을 고쳤다.
    - Version PR #2의 CI가 job 0개, 「workflow file issue」로 실패했다(25분). workflow 파일 변경은 없었고 PR #1은 같은 파일로 성공했다. 원인은 확인하지 못했다. 같은 검사는 Release workflow pack job에서 다시 돌아 통과했다.
