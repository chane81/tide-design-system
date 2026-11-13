import { beforeEach } from "vitest";
import { commands } from "vitest/browser";

// browser project에서 Tide CSS를 실제로 적용한다. 계산된 스타일을 단언하려면 필요하다.
import "./browser.css";

// `next/link`가 모듈에서 `process.env`를 읽는데 브라우저에는 `process`가 없다.
(globalThis as { process?: unknown }).process ??= { env: { NODE_ENV: "test" } };

// 앞 테스트의 마우스 위치가 남아 hover 오버레이가 열리지 않게 뺀다(docs/agents/testing.md 「마우스 잔류」).
// vitest-browser-react cleanup보다 먼저 돌아 앞 테스트 DOM에 pointerleave가 생기지만, 그 DOM은 곧 지워진다.
beforeEach(async () => {
  await commands.mouseLeavePage();
});
