import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import remarkGfm from "remark-gfm";
import { defaultClientConditions, mergeConfig, type UserConfig } from "vite";

// Storybook 10.6.6 설정.
// - reactDocgen: 기본값도 'react-docgen'이지만 props 표 생성기가 바뀌지 않게 고정한다(@storybook/react-vite 10.6.6 타입 선언).
// - addon-docs의 mdxPluginOptions.mdxCompileOptions.remarkPlugins에 remark-gfm을 넣어 MDX의 Markdown 표를 그린다.
//   MDX 3은 GFM을 기본으로 지원하지 않는다(Storybook 10.6.5 docs `storybook-main-config-remark-options`,
//   설치본 @storybook/addon-docs 10.6.6 `mdx-plugin`이 이 옵션을 compile에 넘기는 것 확인).
// - resolve.conditions: Vite 8.3.6에서 사용자 조건을 넣으면 기본 조건을 대체하므로 defaultClientConditions를 함께 펼친다
//   (Vite 8 docs config/shared-options `resolve.conditions`).
//   `@tide-design/source` 조건이 있는 components는 원본(src)으로, 조건이 없는 foundation은 빌드 결과(dist)로 resolve된다.
const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
  addons: [
    {
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
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
        conditions: ["@tide-design/source", ...defaultClientConditions],
      },
      // components 원본이 쓰는 react-aria·react-stately(오버레이 hook, 티켓 25)를 처음부터 사전 번들한다. 실행 중에 발견하면
      // Vite가 다시 최적화하며 페이지를 새로 고쳐 story 테스트가 흔들린다. docs가 직접 의존하지 않으므로 중첩 문법을 쓴다
      // (Vite docs dep-optimization-options `optimizeDeps.include`).
      // `@tide-design/icons`는 workspace 링크라 기본으로는 사전 번들되지 않는다("linked packages not inside node_modules are
      // not pre-bundled", 같은 문서). dev 서버는 트리셰이킹을 하지 않아 index.js가 아이콘 파일 2031개를 하나씩 요청하므로,
      // 사전 번들해 한 파일로 받는다. icons dist를 다시 빌드했다면 `storybook dev --force`로 다시 번들한다.
      optimizeDeps: {
        include: [
          "@tide-design/icons",
          "@tide-design/components > react-aria",
          "@tide-design/components > react-stately",
        ],
      },
      // components 원본을 직접 번들하므로 Rolldown이 원본의 "use client"마다 MODULE_LEVEL_DIRECTIVE 경고를 낸다.
      // Storybook은 RSC 경계가 없는 SPA라 이 지시어가 쓰이지 않고, 배포 패키지는 tsdown이 파일 단위로 내며 지시어를 남긴다.
      // 그래서 "use client"에 한해 끈다. defaultHandler를 부르지 않으면 그 경고가 억제된다
      // (Vite 8.3.6 build.ts `normalizeUserOnWarn`, `build.rollupOptions`는 `rolldownOptions`의 deprecated alias).
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
