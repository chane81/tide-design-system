import { defineConfig } from "vitest/config";

import { maxWorkers } from "../../vitest.workers.ts";

// Vitest projects(vitest 5.1.0 docs/guide/projects.md). 패키지 출력 검사는 Node의 `unit` project다.
export default defineConfig({
  test: {
    // 로컬은 동시 실행 수를 줄인다(루트 vitest.workers.ts).
    maxWorkers,
    projects: [
      {
        test: {
          name: "unit",
          include: ["test/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
