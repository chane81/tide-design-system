// 원본 파일 단위로 내서 쓰지 않는 아이콘이 사용자 번들에서 빠지게 한다(tsdown 0.23.7).
// 아이콘에는 hook이 없어 "use client"를 붙이지 않는다(서버 컴포넌트로 쓴다).
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  unbundle: true,
  format: "esm",
  platform: "neutral",
  fixedExtension: false,
  target: "es2024",
  minify: false,
  // react(peer)와 react/jsx-runtime은 tsdown 기본값으로 external이다.
  tsconfig: "tsconfig.build.json",
  dts: { generator: "oxc" },
  // exports는 package.json에서 손으로 관리한다.
  exports: false,
});
