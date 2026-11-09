import { defineConfig } from "vitest/config";

// Vitest projects(vitest 5.1.0 docs/guide/projects.md). browser·storybook project는 티켓 03에서 더한다.
export default defineConfig({
  test: {
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
