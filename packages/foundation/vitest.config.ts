import { defineConfig } from "vitest/config";

import { maxWorkers } from "../../vitest.workers";

export default defineConfig({
  test: {
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
