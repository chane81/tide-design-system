// Dokploy에 문서 배포를 요청하고 끝날 때까지 기다린다. `done`이면 exit 0, 실패·취소·타임아웃이면 exit 1.
// API 키는 헤더에만 넣고 출력하지 않는다. 오류에는 응답 status와 본문 앞부분만 찍는다.
import { setTimeout as sleep } from "node:timers/promises";

import { deployAndWait, parseDeployments } from "./dokploy-deploy.ts";

// 빌드는 몇 분이지만 큐 대기까지 넉넉하게 두고, 멈춘 배포로 job이 한없이 돌지 않게 한다.
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
