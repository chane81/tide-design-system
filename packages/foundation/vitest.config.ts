import { defineConfig } from "vitest/config";

// Vitest projects(vitest 5.1.0 docs/guide/projects.md). 패키지 출력 검사는 Node의 `unit` project다.
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
