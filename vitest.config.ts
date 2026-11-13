import { defineConfig } from "vitest/config";

// 저장소 루트 `scripts/`(릴리스·CI 스크립트)의 단위 테스트만 돈다. `pnpm test:scripts`.
// vitest 5.1.0은 상위 디렉터리 config를 찾지 않아 패키지 테스트에 영향이 없다.
export default defineConfig({
  test: {
    name: "scripts",
    include: ["scripts/**/*.test.ts"],
    environment: "node",
  },
});
