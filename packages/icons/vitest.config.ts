import { defineConfig } from "vitest/config";

import { maxWorkers } from "../../vitest.workers";

// 아이콘은 서버 렌더 결과(마크업)로 확인하므로 브라우저 project는 두지 않는다.
export default defineConfig({
  test: {
    maxWorkers,
    projects: [
      {
        test: {
          name: "unit",
          include: ["scripts/**/*.test.ts", "test/**/*.test.{ts,tsx}"],
          environment: "node",
        },
      },
    ],
  },
});
