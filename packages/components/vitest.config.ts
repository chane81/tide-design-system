import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

import { mouseDownOn, mouseUp, screenshotTestId } from "./test/commands.ts";

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
        // next/link(CJS)를 처음부터 사전 번들한다. 실행 중에 발견하면 Vite가 다시 최적화하며 페이지를 새로 고쳐
        // 차가운 캐시에서 테스트 파일 import가 실패한다(2026-11-10 로컬에서 재현).
        // react-aria·react-stately(오버레이 hook, 티켓 25)도 같은 이유로 처음부터 사전 번들한다. Component는 루트 entry만 import한다.
        optimizeDeps: { include: ["next/link.js", "react-aria", "react-stately"] },
        test: {
          name: "browser",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./test/browser-setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            // `:active`를 붙잡아 둘 마우스 명령(Button press 축소 단언용)과 요소 화면 찍기(Avatar fallback 단언용)
            commands: { mouseDownOn, mouseUp, screenshotTestId },
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
