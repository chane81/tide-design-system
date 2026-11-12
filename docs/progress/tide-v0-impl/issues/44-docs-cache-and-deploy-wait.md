# 44: 문서 사이트 캐시 헤더와 배포 완료 대기

Status: done
Blocked by: 11 (릴리스 파이프라인)

## What to build

2026-11-12 0.6.0 릴리스 때 배포 뒤에도 사용자에게 이전 문서가 보였다(캐시를 비우거나 강력 새로고침하면 새 문서). 원인은 둘이다.

- 문서 사이트는 `nginx:1.30-alpine` 기본 설정으로 서빙해 응답에 `Cache-Control`이 없다(`ETag`·`Last-Modified`만 있음). 브라우저가 heuristic caching으로 해시 없는 `iframe.html`·`index.html`·`index.json`을 옛 판으로 계속 쓴다. `assets/*`는 파일 이름에 해시가 붙는다.
- 릴리스 workflow의 `docs` job은 Dokploy에 배포를 요청만 하고 곧바로 성공한다. 실제 빌드는 Dokploy 큐에서 몇 분 더 걸려, Actions가 초록이 된 직후 사이트는 아직 옛 빌드다. 그 뒤 `storybook-tag`가 docs 성공을 근거로 tag를 만든다.

해시 없는 파일은 매번 재검증하고 해시 붙은 파일은 오래 캐시하게 nginx 설정을 두고, `docs` job이 배포가 실제로 끝날 때까지 기다리게 한다.

## 수용 기준

- [x] `*.html`, `index.json`, `project.json` 등 해시 없는 파일 응답에 `Cache-Control: no-cache`. 재검증 때 `ETag`로 304를 받는다.
- [x] 해시 붙은 `assets/*` 응답에 `Cache-Control: public, max-age=31536000, immutable`.
- [x] 기존 동작(정적 파일 서빙, 없는 파일 404, 50x 페이지, IPv4·IPv6 listen)은 그대로다. gzip 등 다른 설정은 늘리지 않는다.
- [x] `docs` job이 배포 요청 뒤 Dokploy 배포 상태를 폴링해 성공이면 성공, 실패·취소·타임아웃이면 실패한다. 실패하면 `storybook-tag`가 만들어지지 않는다(기존 설계).
- [x] 기존 인증(`x-api-key`, `vars.DOKPLOY_URL`, `vars.DOKPLOY_APPLICATION_ID`, `secrets.DOKPLOY_API_KEY`)을 그대로 쓰고 API 키를 로그에 찍지 않는다.
- [x] 상태 판정을 `scripts/` 단위 테스트로 검증한다(`pnpm test:scripts`).
- [x] 배포 흐름을 설명하는 문서(spec 문서 앱 「배포」, CONTRIBUTING 릴리스 절)를 사실에 맞게 고친다.

## Comments

- 2026-11-12 완료(브랜치 `worktree-agent-aee48817eae71abf0`, main d5190e0 위).
  - **근거 버전**: nginx 1.30.6(`nginx:1.30-alpine` 이미지), Dokploy v0.31.1(2026-11-12 최신 release), Node 26, vitest 5.1.0. 새 의존성 없음.
  - **nginx 지시어 확인**(nginx.org `ngx_http_headers_module` 「add_header」, `ngx_http_core_module` 「location」):
    - `add_header`는 현재 레벨에 `add_header`가 하나도 없을 때만 바깥 레벨에서 상속된다. 그래서 server 레벨에 두지 않고 `location /`와 `location /assets/`에 하나씩 둔다.
    - `always` 없이는 200·201·204·206·301·302·303·304·307·308에만 붙는다. 304 재검증 응답에도 `Cache-Control`이 붙고 404에는 붙지 않는다.
    - prefix location은 가장 긴 것을 고르고 정규식 location은 없으므로 `/assets/…`는 `location /assets/`로 간다.
    - 이미지의 기본 `default.conf`(정적 서빙, `index`, 50x 페이지)를 그대로 옮기고 헤더만 더했다. `try_files`는 쓰지 않는다(기본 정적 서빙과 404 동작 그대로). `10-listen-on-ipv6-by-default.sh`는 `default.conf`가 패키지 원본과 다르면 건너뛰므로 `listen [::]:80;`을 직접 적었다.
    - 빌드 출력 확인: `storybook-static/assets/` 154개 파일 모두 이름에 해시가 있다. `sb-manager/`·`sb-addons/`·`sb-common-assets/`·폰트·favicon은 해시가 없어 `no-cache`로 둔다.
  - **nginx 헤더 확인**: OrbStack Docker로 `docker build -f apps/docs/Dockerfile .` 이미지를 만들어 컨테이너를 띄웠다. `nginx -t` 통과. `curl -I` 결과 `/`·`/index.html`·`/iframe.html`·`/index.json`·`/project.json`·`/sb-manager/runtime.js`·`/favicon.svg` → `Cache-Control: no-cache`(+`ETag`·`Last-Modified`), `/assets/<해시>.js` → `public, max-age=31536000, immutable`, 없는 파일 → 404(헤더 없음), `If-None-Match`로 `/iframe.html` → 304 + `no-cache`. IPv6(`[::1]`)도 200.
  - **Dokploy API 근거**:
    - docs.dokploy.com API reference 「Application」: `POST /api/application.deploy`(본문 `applicationId`, 선택 `title`·`description`). 「Deployment」: `GET /api/deployment.all?applicationId=`. 인증은 기존대로 `x-api-key`.
    - reference는 두 응답 본문 스키마가 비어 있다(`{}`). 그래서 필드는 Dokploy 저장소 소스(v0.31.1 tag)로 확인했다. router `deployment.all`은 `findAllDeploymentsByApplicationId` 결과(배포 행 배열, `createdAt` 내림차순)를 그대로 돌려주고, REST 경로는 `@dokploy/trpc-openapi` handler라 출력이 그대로 JSON 본문이다. 배포 행은 `deploymentId`, `status`(enum `running`·`done`·`error`·`cancelled`), `createdAt`(ISO 문자열), `errorMessage`.
    - 큐 worker `deployApplication`이 시작할 때 배포 행을 `running`으로 만들고, 끝나면 `done`, 실패하면 `error`로 바꾼다(`done`은 `mechanizeDockerContainer` 뒤).
    - `application.one`의 `applicationStatus`(`idle`·`running`·`done`·`error`, reference의 `application.update` 본문 스키마에 있음)는 쓰지 않았다. 요청 직후에는 이전 배포의 `done`이 남아 있어 새 배포가 끝났는지 구분할 수 없다.
  - **구현**:
    - `scripts/dokploy-deploy.ts`(규칙): 요청 전 `deployment.all`의 deploymentId를 기억하고, 요청 뒤 그 목록에 없던 새 행 중 가장 최근 것의 `status`로 판정한다. 새 행 없음 → 큐 대기, `running` → 계속, `done` → 성공, `error`·`cancelled`·알 수 없는 값 → 실패. 응답이 배열이 아니거나 `deploymentId`·`createdAt`이 없으면 던진다(모양이 바뀌었을 때 성공으로 치지 않게). 목록 조회는 연달아 3번 실패할 때만 멈춘다.
    - `scripts/deploy-docs.ts`(CLI): 환경 변수 세 개, Node 내장 `fetch`, 10초 간격, 15분 타임아웃(Dokploy가 pnpm install → turbo build → nginx 이미지를 만드는 몇 분 + 큐 대기를 넉넉히 덮되 멈춘 배포로 한없이 돌지 않게). API 키는 헤더에만 넣고, 오류에는 응답 status와 본문 앞 300자만 찍는다.
    - `release.yml` docs job: checkout·setup-node를 더하고(`contents: read`), curl 대신 `node scripts/deploy-docs.ts`. `timeout-minutes: 20`을 안전장치로 둔다. `storybook-tag` 조건은 그대로다.
  - **테스트**: `scripts/dokploy-deploy.test.ts` 11 tests(응답 확인 2, 판정 4, 대기 흐름 5). `pnpm test:scripts` 34 tests 통과. 가짜 Dokploy HTTP 서버로 CLI를 돌려 `done` → exit 0, `error` → exit 1(errorMessage 출력), 틀린 키 → 401로 exit 1을 확인했고 출력에 키가 없었다.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `pnpm test:scripts`, `pnpm turbo run typecheck build` 통과, `node scripts/check-changesets.ts origin/main` 통과. 루트 `scripts/`는 typecheck 대상이 아니어서(기존과 같음) `tsc --noEmit --strict`로 따로 한 번 확인했다.
  - **changeset**: `apps/docs`(Dockerfile·nginx.conf)를 바꿔서 `check-changesets.ts`가 changeset을 요구한다(ADR 0020). 패키지·문서 내용이 아니라 배포 인프라라 Storybook 버전은 올리지 않고 empty changeset(`.changeset/docs-cache-headers.md`)을 넣었다. `scripts/`·`release.yml` 변경은 changeset 대상이 아니다.
  - **문서 정정**: spec 문서 앱 「배포」, CONTRIBUTING 릴리스 절 4번에 배포 완료 대기를 한 줄씩 더했다. 새 ADR은 만들지 않았다.
  - **실제 배포에서만 확인 가능한 것**:
    1. 운영 Dokploy 버전이 v0.31.1과 다르면 `deployment.all` 응답 모양이 다를 수 있다. 다르면 스크립트가 「배열이 아니다」로 실패하고 tag는 만들어지지 않는다(잘못된 성공은 없음).
    2. 운영 API 키에 `deployment.all` 읽기 권한(`deployment: read`)이 있어야 한다.
    3. `done`은 Docker 서비스 갱신 직후라 컨테이너 교체가 몇 초 더 걸릴 수 있다.
    4. 첫 배포 뒤 이미 heuristic caching으로 옛 파일을 가진 브라우저는 그 캐시가 만료될 때까지 한 번 더 옛 판을 볼 수 있다. 앞에 다른 프록시·CDN이 있으면 그 캐시 설정도 따로 봐야 한다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 같은 때 다른 경로(대시보드 수동 배포 등)로 배포가 하나 더 생기면 가장 최근 배포의 결과로 판정한다. 사이트에 남는 것이 그 배포라서다.
    2. 타임아웃 15분·폴링 10초. 실제 빌드 시간을 몇 번 본 뒤 줄일 수 있다.
