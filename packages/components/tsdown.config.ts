// 원본 파일 단위로 내서 "use client" 경계를 파일마다 남긴다. 지시어를 banner로 일괄 주입하지 않는다.
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  unbundle: true,
  format: "esm",
  platform: "neutral",
  fixedExtension: false,
  target: "es2024",
  minify: false,
  tsconfig: "tsconfig.build.json",
  dts: { generator: "oxc" },
  // unbundle이라 지시어가 남는다. Rolldown의 MODULE_LEVEL_DIRECTIVE 경고는 번들링용이라 "use client"만 끈다.
  suppressWarnings: /MODULE_LEVEL_DIRECTIVE.*"use client"/,
  // exports는 package.json에서 손으로 관리한다(@tide-design/source 조건, publishConfig.exports).
  exports: false,
});
