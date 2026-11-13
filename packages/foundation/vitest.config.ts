import { defineConfig } from "vitest/config";

import { maxWorkers } from "../../vitest.workers";

// Vitest projects(vitest 5.1.0 docs/guide/projects.md). 원본 옆 단위 테스트(src)와 패키지 전체·출력 검사(test)는 Node의 `unit` project다.
export default defineConfig({
  test: {
    // 로컬은 동시 실행 수를 줄인다(루트 vitest.workers.ts).
    maxWorkers,
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.test.ts", "test/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
