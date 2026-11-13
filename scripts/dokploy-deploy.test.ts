// Dokploy 배포 대기 규칙(티켓 44). 배포 행 모양은 Dokploy v0.31.1 `deployment` 테이블과 같다
// (scripts/dokploy-deploy.ts 머리 주석).
import { describe, expect, it } from "vitest";

import {
  type Deployment,
  deployAndWait,
  judgeDeployment,
  parseDeployments,
} from "./dokploy-deploy.ts";

const row = (deploymentId: string, status: string | null, createdAt: string): Deployment => ({
  deploymentId,
  status,
  createdAt,
  errorMessage: null,
});
const old = row("old", "done", "2026-11-11T00:00:00.000Z");

describe("deployment.all 응답 확인", () => {
  it("필요한 필드만 꺼내고 status가 문자열이 아니면 null로 둔다", () => {
    expect(
      parseDeployments([
        {
          deploymentId: "a",
          status: "running",
          createdAt: "2026-11-12T00:00:00.000Z",
          title: "Manual deployment",
          logPath: "/x.log",
        },
        { deploymentId: "b", status: null, createdAt: "2026-11-11T00:00:00.000Z" },
      ]),
    ).toEqual([
      row("a", "running", "2026-11-12T00:00:00.000Z"),
      row("b", null, "2026-11-11T00:00:00.000Z"),
    ]);
  });

  it("배열이 아니거나 deploymentId·createdAt이 없으면 던진다", () => {
    expect(() => parseDeployments({ deployments: [] })).toThrow("배열");
    expect(() => parseDeployments([{ status: "done" }])).toThrow("deploymentId");
    expect(() => parseDeployments([null])).toThrow("0번");
  });
});

describe("새 배포 상태 판정", () => {
  const before = new Set(["old"]);

  it("요청 전에 있던 배포만 있으면 큐에서 기다리는 중이다", () => {
    expect(judgeDeployment(before, [old])).toEqual({ kind: "queued" });
    expect(judgeDeployment(new Set(), [])).toEqual({ kind: "queued" });
  });

  it("요청 전 배포가 done이어도 새 배포의 상태를 본다", () => {
    expect(
      judgeDeployment(before, [row("new", "running", "2026-11-12T00:00:00.000Z"), old]),
    ).toEqual({ kind: "running", deploymentId: "new" });
    expect(judgeDeployment(before, [row("new", "done", "2026-11-12T00:00:00.000Z"), old])).toEqual({
      kind: "done",
      deploymentId: "new",
    });
  });

  it("error·cancelled·알 수 없는 status는 실패다", () => {
    for (const status of ["error", "cancelled", "queued", null]) {
      expect(
        judgeDeployment(before, [
          { ...row("new", status, "2026-11-12T00:00:00.000Z"), errorMessage: "build failed" },
        ]),
      ).toEqual({ kind: "failed", deploymentId: "new", status, errorMessage: "build failed" });
    }
  });

  it("새 배포가 여럿이면 순서와 상관없이 가장 최근 것을 본다", () => {
    const earlier = row("a", "error", "2026-11-12T00:00:00.000Z");
    const later = row("b", "done", "2026-11-12T00:05:00.000Z");
    expect(judgeDeployment(before, [earlier, later, old])).toEqual({
      kind: "done",
      deploymentId: "b",
    });
    expect(judgeDeployment(before, [later, earlier, old])).toEqual({
      kind: "done",
      deploymentId: "b",
    });
  });
});

/** list 응답을 차례로 돌려주는 가짜 Dokploy. 시계는 sleep만큼 흐른다. */
function fakeDokploy(responses: Array<Deployment[] | Error>) {
  let time = 0;
  let calls = 0;
  const events: string[] = [];

  return {
    events,
    options: {
      list: async () => {
        const next = responses[Math.min(calls, responses.length - 1)];
        calls += 1;
        if (next instanceof Error) throw next;

        return next;
      },
      request: async () => {
        events.push("request");
      },
      sleep: async (ms: number) => {
        time += ms;
      },
      now: () => time,
      log: (message: string) => events.push(message),
      timeoutMs: 60_000,
      intervalMs: 10_000,
      maxListFailures: 3,
    },
  };
}

describe("배포 요청 뒤 기다리기", () => {
  const running = row("new", "running", "2026-11-12T00:00:00.000Z");
  const done = row("new", "done", "2026-11-12T00:00:00.000Z");

  it("요청 전 목록을 받은 뒤 요청하고, 큐 대기 → running → done이면 새 deploymentId를 돌려준다", async () => {
    const { options, events } = fakeDokploy([[old], [old], [running, old], [done, old]]);
    await expect(deployAndWait(options)).resolves.toBe("new");
    expect(events[0]).toBe("request");
    expect(events.filter((event) => event.includes("큐"))).toHaveLength(1);
  });

  it("새 배포가 error면 errorMessage를 담아 던진다", async () => {
    const failed = { ...row("new", "error", "2026-11-12T00:00:00.000Z"), errorMessage: "exit 1" };
    const { options } = fakeDokploy([[old], [running, old], [failed, old]]);
    await expect(deployAndWait(options)).rejects.toThrow(
      "배포 new가 실패했다(status: error): exit 1.",
    );
  });

  it("타임아웃까지 끝나지 않으면 던진다", async () => {
    const { options } = fakeDokploy([[old], [running, old]]);
    await expect(deployAndWait(options)).rejects.toThrow(
      "1분 안에 배포가 끝나지 않았다(마지막 상태: running)",
    );
  });

  it("목록 조회가 가끔 실패하면 이어서 기다리고, 연달아 maxListFailures번 실패하면 던진다", async () => {
    const blip = new Error("fetch failed");
    const recovered = fakeDokploy([[old], blip, blip, [done, old]]);
    await expect(deployAndWait(recovered.options)).resolves.toBe("new");

    const broken = fakeDokploy([[old], blip, blip, blip]);
    await expect(deployAndWait(broken.options)).rejects.toThrow("fetch failed");
  });

  it("요청 전 목록을 받지 못하면 배포를 요청하지 않는다", async () => {
    const { options, events } = fakeDokploy([new Error("401")]);
    await expect(deployAndWait(options)).rejects.toThrow("401");
    expect(events).not.toContain("request");
  });
});
