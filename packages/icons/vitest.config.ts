import { defineConfig } from "vitest/config";

// Vitest projects(vitest 5.1.0 docs/guide/projects.md). 공개 표면 검사는 Node의 `unit` project다.
// 아이콘은 서버 렌더 결과(마크업)로 확인하므로 브라우저 project는 두지 않는다.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["test/**/*.test.{ts,tsx}"],
          environment: "node",
        },
      },
    ],
  },
});
