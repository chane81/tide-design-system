import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

import { maxWorkers } from "../../vitest.workers";

import {
  mouseDownAtCorner,
  mouseDownOn,
  mouseLeavePage,
  mouseUp,
  screenshotTestId,
} from "./test/commands";

// browser 두 번째 instance는 forced-colors·reduced-motion을 켠다. instance의 provider 옵션은 부모와 병합되지 않고 덮어쓴다.
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
      {
        plugins: [tailwindcss()],
        // 실행 중 발견되면 Vite가 다시 최적화하며 페이지를 새로 고쳐 import가 실패한다. 그래서 처음부터 사전 번들한다.
        optimizeDeps: { include: ["next/link.js", "react-aria", "react-stately", "react-dom"] },
        test: {
          name: "browser",
          include: ["src/**/*.test.tsx", "test/**/*.test.tsx"],
          setupFiles: ["./test/browser-setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            commands: { mouseDownOn, mouseDownAtCorner, mouseLeavePage, mouseUp, screenshotTestId },
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
