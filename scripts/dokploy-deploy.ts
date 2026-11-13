// application.deploy는 큐에 넣고 바로 응답하므로, 배포 목록(deployment.all)을 폴링해 새 배포가 끝났는지 본다.
// 응답 모양·status는 Dokploy v0.31.1 기준이다. applicationStatus는 이전 배포의 done이 남아 있어 쓰지 않는다.

/** `deployment.all` 응답 한 항목 중 판정에 쓰는 필드. */
export type Deployment = {
  deploymentId: string;
  status: string | null;
  createdAt: string;
  errorMessage?: string | null;
};

export type DeployState =
  | { kind: "queued" }
  | { kind: "running"; deploymentId: string }
  | { kind: "done"; deploymentId: string }
  | { kind: "failed"; deploymentId: string; status: string | null; errorMessage: string | null };

/**
 * `deployment.all` 응답 본문을 확인한다. 소스로 확인한 모양(배열, 항목마다 문자열 `deploymentId`·`createdAt`)이
 * 아니면 던진다. 모양이 바뀌었는데 성공으로 치지 않게 하려는 것이다.
 */
export function parseDeployments(body: unknown): Deployment[] {
  if (!Array.isArray(body)) {
    throw new Error("deployment.all 응답이 배열이 아니다. Dokploy API 모양이 바뀌었는지 확인한다.");
  }

  return body.map((item: unknown, index) => {
    const record = (typeof item === "object" && item !== null ? item : {}) as Record<
      string,
      unknown
    >;
    const { deploymentId, status, createdAt, errorMessage } = record;
    if (typeof deploymentId !== "string" || typeof createdAt !== "string") {
      throw new Error(
        `deployment.all 응답 ${index}번 항목에 deploymentId·createdAt 문자열이 없다.`,
      );
    }

    return {
      deploymentId,
      status: typeof status === "string" ? status : null,
      createdAt,
      errorMessage: typeof errorMessage === "string" ? errorMessage : null,
    };
  });
}

/**
 * 요청 전 목록(`before`)에 없던 배포 중 가장 최근 것으로 상태를 정한다. 그것이 사이트에 남는다.
 * 알 수 없는 status(null 포함)는 실패로 본다.
 */
export function judgeDeployment(
  before: ReadonlySet<string>,
  deployments: readonly Deployment[],
): DeployState {
  const latest = deployments
    .filter((deployment) => !before.has(deployment.deploymentId))
    .reduce<Deployment | null>(
      (newest, deployment) =>
        newest === null || deployment.createdAt > newest.createdAt ? deployment : newest,
      null,
    );
  if (latest === null) return { kind: "queued" };
  const { deploymentId, status } = latest;
  if (status === "running") return { kind: "running", deploymentId };
  if (status === "done") return { kind: "done", deploymentId };

  return { kind: "failed", deploymentId, status, errorMessage: latest.errorMessage ?? null };
}

export type WaitOptions = {
  /** 배포 목록을 받는다(`deployment.all`). */
  list: () => Promise<Deployment[]>;
  /** 배포를 요청한다(`application.deploy`). */
  request: () => Promise<void>;
  sleep: (ms: number) => Promise<void>;
  now: () => number;
  log: (message: string) => void;
  timeoutMs: number;
  intervalMs: number;
  /** 목록 조회가 연달아 이만큼 실패하면 멈춘다. 한두 번의 네트워크 오류로 job을 실패시키지 않으려는 것이다. */
  maxListFailures: number;
};

/** 배포를 요청하고 끝날 때까지 기다린다. `done`이면 그 deploymentId를 돌려주고, 실패·타임아웃이면 던진다. */
export async function deployAndWait(options: WaitOptions): Promise<string> {
  const { list, request, sleep, now, log, timeoutMs, intervalMs, maxListFailures } = options;
  const before = new Set((await list()).map((deployment) => deployment.deploymentId));
  await request();
  log(`배포를 요청했다. 요청 전 배포 ${before.size}개. 새 배포가 끝나기를 기다린다.`);

  const start = now();
  let lastKind = "";
  let listFailures = 0;
  for (;;) {
    if (now() - start >= timeoutMs) {
      throw new Error(
        `${Math.round(timeoutMs / 60_000)}분 안에 배포가 끝나지 않았다(마지막 상태: ${lastKind || "확인 못 함"}).`,
      );
    }
    await sleep(intervalMs);
    let state: DeployState;
    try {
      state = judgeDeployment(before, await list());
      listFailures = 0;
    } catch (error) {
      listFailures += 1;
      if (listFailures >= maxListFailures) throw error;
      log(`배포 목록을 받지 못했다(${listFailures}/${maxListFailures}): ${String(error)}`);
      continue;
    }
    if (state.kind !== lastKind) {
      log(
        state.kind === "queued"
          ? "Dokploy 큐에서 기다리는 중(새 배포 행이 아직 없음)."
          : `배포 ${state.deploymentId}: ${state.kind}`,
      );
      lastKind = state.kind;
    }
    if (state.kind === "done") return state.deploymentId;
    if (state.kind === "failed") {
      throw new Error(
        `배포 ${state.deploymentId}가 실패했다(status: ${state.status ?? "없음"})${state.errorMessage ? `: ${state.errorMessage}` : ""}.`,
      );
    }
  }
}
