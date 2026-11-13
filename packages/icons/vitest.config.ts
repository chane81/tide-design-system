import { defineConfig } from "vitest/config";

import { maxWorkers } from "../../vitest.workers.ts";

// Vitest projects(vitest 5.1.0 docs/guide/projects.md). 공개 표면 검사(test)와 스크립트 옆 단위 테스트(scripts)는 Node의 `unit` project다.
// 아이콘은 서버 렌더 결과(마크업)로 확인하므로 브라우저 project는 두지 않는다.
export default defineConfig({
  test: {
    // 로컬은 동시 실행 수를 줄인다(루트 vitest.workers.ts).
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
