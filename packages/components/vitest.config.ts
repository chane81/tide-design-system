import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Vitest projects(vitest 5 docs/guide/projects.md, docs/config/browser/playwright.md).
// - unit: Node에서 공개 함수(cn 등)를 본다.
// - browser: 실제 Chromium에서 Component 동작을 본다. 두 번째 instance는 forced-colors와 reduced-motion을 켠다.
//   instance의 provider 옵션은 부모와 병합되지 않고 덮어쓴다.
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
      {
        plugins: [tailwindcss()],
        test: {
          name: "browser",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./test/browser-setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              { browser: "chromium", name: "chromium" },
              {
                browser: "chromium",
                name: "chromium-forced-colors",
                provider: playwright({
                  contextOptions: { forcedColors: "active", reducedMotion: "reduce" },
                }),
              },
            ],
          },
        },
      },
    ],
  },
});
