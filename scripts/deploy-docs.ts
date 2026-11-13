// 문서 사이트 배포를 Dokploy에 요청하고 배포가 끝날 때까지 기다린다(release.yml docs job, 티켓 44).
//
//   DOKPLOY_URL=... DOKPLOY_APPLICATION_ID=... DOKPLOY_API_KEY=... node scripts/deploy-docs.ts
//
// 배포가 `done`이면 exit 0, 실패·취소·타임아웃이면 exit 1이다. 판정 규칙과 API 근거는 scripts/dokploy-deploy.ts.
// 인증은 `x-api-key` 헤더다(docs.dokploy.com API 「Authentication」). API 키는 헤더에만 넣고 출력하지 않는다.
// 오류 메시지에는 응답 status와 본문 앞부분만 찍는다.
import { setTimeout as sleep } from "node:timers/promises";

import { deployAndWait, parseDeployments } from "./dokploy-deploy.ts";

// 타임아웃 15분: Dokploy가 저장소를 받아 Dockerfile로 pnpm install → turbo build(foundation·icons·components·docs)
// → nginx 이미지까지 만든다. 지금 빌드는 몇 분이고, 큐에 앞선 작업이 있으면 더 걸린다. 그보다 넉넉하게 두되,
// 멈춘 배포로 job이 한없이 돌지 않게 한다. 넘기면 job이 실패하고 storybook-tag가 만들어지지 않아 다음 실행에서 다시 배포한다.
const TIMEOUT_MS = 15 * 60_000;
const INTERVAL_MS = 10_000;
const MAX_LIST_FAILURES = 3;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`환경 변수 ${name}가 없다.`);
    process.exit(2);
  }

  return value;
}

const baseUrl = requireEnv("DOKPLOY_URL").replace(/\/+$/, "");
const applicationId = requireEnv("DOKPLOY_APPLICATION_ID");
const apiKey = requireEnv("DOKPLOY_API_KEY");

async function call(path: string, init: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`${baseUrl}/api/${path}`, {
    ...init,
    headers: { "x-api-key": apiKey, accept: "application/json", ...init.headers },
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${path.split("?")[0]} 응답 ${response.status}: ${text.slice(0, 300)}`);
  }

  return text === "" ? null : JSON.parse(text);
}

try {
  const deploymentId = await deployAndWait({
    list: async () =>
      parseDeployments(
        await call(`deployment.all?applicationId=${encodeURIComponent(applicationId)}`),
      ),
    request: async () => {
      await call("application.deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
    },
    sleep,
    now: () => Date.now(),
    log: (message) => console.log(message),
    timeoutMs: TIMEOUT_MS,
    intervalMs: INTERVAL_MS,
    maxListFailures: MAX_LIST_FAILURES,
  });
  console.log(`배포 ${deploymentId}가 끝났다(done).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
