// tsdown 0.23.7(rolldown 1.3.0, rolldown-plugin-dts 0.30.0). 옵션은 설치본 타입 선언으로 확인했다(티켓 36).
// JS와 d.ts만 만든다. CSS와 tailwind-merge 설정은 빌드 뒤에 scripts/build.ts가 만든다.
// 설정 배열로 두 번 빌드한다(tsdown v0.23.0 docs options/cleaning 「Multiple Builds」: 첫 빌드만 clean).
import { defineConfig } from "tsdown";

export default defineConfig([
  {
    // internal은 문서 앱·빌드 스크립트용 내부 서브패스다(앱 개발자용 아님).
    // color-family는 앱 브랜드 색 계열 API 서브패스다(티켓 40).
    entry: ["src/index.ts", "src/internal.ts", "src/colorFamily.ts"],
    // 원본 파일 단위로 낸다(디렉터리 구조 유지).
    unbundle: true,
    format: "esm",
    // 런타임을 가정하지 않는다. node가 아니므로 확장자는 package.json type(module)을 따라 .js가 된다.
    platform: "neutral",
    fixedExtension: false,
    // 코드를 바꾸지 않고 tsconfig의 target과 같은 문법으로 둔다.
    target: "es2024",
    minify: false,
    // isolatedDeclarations를 켠 tsconfig로 oxc d.ts를 만든다. TS 컴파일러 API를 쓰지 않는다.
    tsconfig: "tsconfig.build.json",
    dts: { generator: "oxc" },
    clean: true,
    // exports는 package.json에서 손으로 관리한다.
    exports: false,
  },
  {
    // tide-color CLI(package.json bin). Node에서만 돌고 node: 내장 모듈을 쓰므로 platform을 node로 둔다.
    // 파일 하나로 묶어서 첫 빌드의 출력과 겹치지 않게 한다. 맨 위 `#!/usr/bin/env node`는 출력에 그대로 남는다(빌드 결과로 확인).
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
