// Dokploy 문서 배포를 요청하고 끝날 때까지 기다리는 규칙(티켓 44). CLI는 scripts/deploy-docs.ts.
//
// `POST /api/application.deploy`는 배포 작업을 Dokploy 큐에 넣고 곧바로 응답한다. 실제 빌드는 큐 worker가
// 이어서 하므로, 응답만 보고 성공으로 치면 사이트는 아직 옛 빌드다. 그래서 배포 목록을 폴링한다.
//
// 근거(Dokploy v0.31.1, 2026-11-12 확인):
// - docs.dokploy.com API reference 「Deployment」: `GET /api/deployment.all?applicationId=...`(`x-api-key` 인증).
//   reference에는 응답 본문 스키마가 비어 있어(`{}`) 필드는 Dokploy 저장소 소스(v0.31.1 tag)로 확인했다.
//   - router `deployment.all`은 `findAllDeploymentsByApplicationId`의 결과(배열)를 그대로 돌려준다.
//     REST 경로는 `@dokploy/trpc-openapi` handler라 procedure 출력이 그대로 JSON 본문이다.
//   - 배포 행(`deployment` 테이블): `deploymentId`, `status`(enum `running`|`done`|`error`|`cancelled`),
//     `createdAt`(ISO 문자열), `errorMessage`. 목록은 `createdAt` 내림차순이다.
//   - 큐 worker의 `deployApplication`이 시작할 때 배포 행을 `running`으로 만들고, 끝나면 `done`, 실패하면 `error`로
//     바꾼다. 취소하면 `cancelled`다. 그래서 요청 직후(큐 대기 중)에는 새 행이 아직 없을 수 있다.
// - 애플리케이션의 `applicationStatus`(`idle`|`running`|`done`|`error`)는 쓰지 않는다. 요청 직후에는 이전 배포의
//   `done`이 남아 있어 새 배포가 끝났는지 구분할 수 없다. 요청 전 배포 목록에 없던 새 행만 본다.

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
 * 요청 전 배포 목록(`before`)에 없던 배포 중 가장 최근 것으로 상태를 정한다.
 * 새 배포가 여럿이면(같은 때 다른 경로로도 배포함) 마지막 것이 사이트에 남으므로 그것을 본다.
 * 알 수 없는 status(null 포함)는 실패로 본다. 모르는 상태를 성공으로 치지 않는다.
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
