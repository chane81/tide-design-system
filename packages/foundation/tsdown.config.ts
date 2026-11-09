// tsdown 0.23.7(rolldown 1.3.0, rolldown-plugin-dts 0.30.0). 옵션은 설치본 타입 선언으로 확인했다(티켓 36).
// JS와 d.ts만 만든다. CSS와 tailwind-merge 설정은 빌드 뒤에 scripts/build.ts가 만든다.
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
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
  // exports는 package.json에서 손으로 관리한다.
  exports: false,
});
