// Vite 8 라이브러리 모드(vite docs: build.lib, build.rolldownOptions).
// preserveModules로 원본 파일 단위를 유지해 "use client" 경계가 빌드 결과에 남게 한다(tide-v0 티켓 19).
import { readFileSync } from "node:fs";

import { defineConfig } from "vite";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const externalPackages = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
];

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    lib: { entry: "src/index.ts", formats: ["es"] },
    rolldownOptions: {
      // 의존성과 peer는 번들에 넣지 않는다(서브패스 포함).
      external: (id) => externalPackages.some((name) => id === name || id.startsWith(`${name}/`)),
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
});
