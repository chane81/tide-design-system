import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { defaultClientConditions, mergeConfig } from "vite";

// Storybook 10.6.6 설정.
// - reactDocgen: 기본값도 'react-docgen'이지만 props 표 생성기가 바뀌지 않게 고정한다(@storybook/react-vite 10.6.6 타입 선언).
// - resolve.conditions: Vite 8.3.6에서 사용자 조건을 넣으면 기본 조건을 대체하므로 defaultClientConditions를 함께 펼친다
//   (Vite 8 docs config/shared-options `resolve.conditions`).
//   `@tide-tds/source` 조건이 있는 desktop은 원본(src)으로, 조건이 없는 foundation은 빌드 결과(dist)로 resolve된다.
const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-themes",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  typescript: {
    reactDocgen: "react-docgen",
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      resolve: {
        conditions: ["@tide-tds/source", ...defaultClientConditions],
      },
    }),
};

export default config;
