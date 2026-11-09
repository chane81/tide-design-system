// tsdown 0.23.7(rolldown 1.3.0, rolldown-plugin-dts 0.30.0). 설정은 foundation·desktop과 같다(티켓 36).
// 원본 파일 단위로 내서 아이콘 하나가 파일 하나가 된다. 그래서 쓰지 않는 아이콘은 사용자 번들에서 빠진다.
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
  // isolatedDeclarations를 켠 tsconfig로 oxc d.ts를 만든다. TS 컴파일러 API를 쓰지 않는다.
  tsconfig: "tsconfig.build.json",
  dts: { generator: "oxc" },
  // exports는 package.json에서 손으로 관리한다.
  exports: false,
});
