import path from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// unit project: 문서 앱의 순수 함수(원문 링크 변환 등)를 Node에서 검사한다.
// storybook project: 모든 story를 실제 Chromium에서 렌더하고 a11y(axe) 검사를 돌린다.
// storybookTest(@storybook/addon-vitest 10.6.6)가 .storybook/main.ts의 stories·viteFinal을 읽어 test로 바꾼다.
// preview의 project annotations는 플러그인이 내부 setup 파일로 자동 적용하므로 별도 setup 파일을 두지 않는다.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        plugins: [storybookTest({ configDir: path.join(import.meta.dirname, ".storybook") })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
