import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import remarkGfm from "remark-gfm";
import { defaultClientConditions, mergeConfig, type UserConfig } from "vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
  addons: [
    {
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
          // MDX 3은 GFM을 기본으로 지원하지 않아 Markdown 표를 그리려면 remark-gfm이 필요하다.
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    "@storybook/addon-themes",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  // 기본값과 같지만 props 표 생성기가 바뀌지 않게 고정한다.
  typescript: {
    reactDocgen: "react-docgen",
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      // Vite 8은 사용자 조건이 기본 조건을 대체하므로 defaultClientConditions를 함께 펼친다.
      resolve: {
        conditions: ["@tide-design/source", ...defaultClientConditions],
      },
      // 실행 중 발견된 의존성을 다시 최적화하면 페이지가 새로 고쳐져 story 테스트가 흔들린다. 미리 번들한다.
      // workspace 링크인 icons는 기본으로 사전 번들되지 않아 dev 서버가 아이콘 파일을 하나씩 요청한다(dist 재빌드 후 `--force`).
      optimizeDeps: {
        include: [
          "@tide-design/icons",
          "@tide-design/components > react-aria",
          "@tide-design/components > react-stately",
        ],
      },
      // components 원본의 "use client"마다 나는 MODULE_LEVEL_DIRECTIVE 경고를 끈다(Vite 8 Rolldown).
      // SPA인 Storybook에선 쓰이지 않고, 배포 패키지는 tsdown이 지시어를 남긴다.
      build: {
        rolldownOptions: {
          onwarn(warning, defaultHandler) {
            if (
              warning.code === "MODULE_LEVEL_DIRECTIVE" &&
              warning.message.includes('"use client"')
            ) {
              return;
            }
            defaultHandler(warning);
          },
        },
      },
    } satisfies UserConfig),
};

export default config;
