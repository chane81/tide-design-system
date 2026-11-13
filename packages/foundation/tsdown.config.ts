// tsdown 0.23.7. JS와 d.ts만 만들고, CSS와 tailwind-merge 설정은 빌드 뒤에 scripts/build.ts가 만든다.
// 설정 배열의 두 빌드 중 첫 빌드만 clean한다.
import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/internal.ts", "src/colorFamily.ts"],
    unbundle: true,
    format: "esm",
    // node가 아니므로 확장자는 package.json type(module)을 따라 .js가 된다.
    platform: "neutral",
    fixedExtension: false,
    target: "es2024",
    minify: false,
    // isolatedDeclarations를 켠 tsconfig로 oxc d.ts를 만든다.
    tsconfig: "tsconfig.build.json",
    dts: { generator: "oxc" },
    clean: true,
    // exports는 package.json에서 손으로 관리한다.
    exports: false,
  },
  {
    // tide-color CLI는 node: 내장 모듈을 쓴다. 파일 하나로 묶어 첫 빌드의 출력과 겹치지 않게 한다.
    entry: ["src/cli.ts"],
    format: "esm",
    platform: "node",
    fixedExtension: false,
    target: "es2024",
    minify: false,
    tsconfig: "tsconfig.build.json",
    dts: false,
    clean: false,
    exports: false,
  },
]);
