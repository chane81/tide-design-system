// tsdown 0.23.7(rolldown 1.3.0, rolldown-plugin-dts 0.30.0). 옵션은 설치본 타입 선언으로 확인했다(티켓 36).
// 원본 파일 단위로 내서 "use client" 경계가 파일마다 남게 한다(tide-v0 티켓 19).
// 지시어는 필요한 원본 파일에만 직접 붙이고 banner로 일괄 주입하지 않는다.
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  unbundle: true,
  format: "esm",
  platform: "neutral",
  fixedExtension: false,
  target: "es2024",
  minify: false,
  // dependencies·peerDependencies와 그 서브패스는 tsdown 기본값으로 external이다.
  // isolatedDeclarations를 켠 tsconfig로 oxc d.ts를 만든다. TS 컴파일러 API를 쓰지 않는다.
  tsconfig: "tsconfig.build.json",
  dts: { generator: "oxc" },
  // unbundle에서는 파일마다 지시어가 그대로 남는다(티켓 36 대조 실험, smoke의 next build가 경계를 검사한다).
  // Rolldown의 MODULE_LEVEL_DIRECTIVE 경고는 번들링할 때를 위한 것이라 "use client"에 한해 끈다.
  suppressWarnings: /MODULE_LEVEL_DIRECTIVE.*"use client"/,
  // exports는 package.json에서 손으로 관리한다(@tide-design/source 조건, publishConfig.exports).
  exports: false,
});
