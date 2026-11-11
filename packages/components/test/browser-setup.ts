import { beforeEach } from "vitest";
import { commands } from "vitest/browser";

// browser project에서 Tide CSS를 실제로 적용한다. 계산된 스타일을 단언하려면 필요하다.
import "./browser.css";

// `next/link`(Button `render` 테스트)는 모듈에서 `process.env`를 읽는다. 브라우저에는 `process`가 없어 빈 값을 둔다.
// Next 앱에서는 Next 번들러가 이 값을 채운다.
(globalThis as { process?: unknown }).process ??= { env: { NODE_ENV: "test" } };

// 테스트마다 시작 전에 마우스를 페이지 밖으로 뺀다. 앞 테스트가 마우스를 어떤 요소 위에 둔 채 끝나면, 다음 테스트가
// 같은 자리에 그린 요소에 Chromium이 약 0.1초 뒤 가짜 mouse move로 pointerenter를 보낸다. 그러면 hover로 여는 오버레이
// (Tooltip·Menu 하위 메뉴)가 마우스를 올리지 않았는데 열린다. 이 타이머와 render 직후 단언이 경합해 부하에 따라 실패했다
// (Tooltip 「마우스를 올리면 열리고…」, Release run 43005291973 attempt 2, 2026-11-11).
// 이 hook은 vitest-browser-react의 cleanup(beforeEach)보다 먼저 등록되어 앞 테스트의 DOM이 남은 채로 돈다. 포인터가
// 떠나며 그 DOM에 pointerleave가 생길 뿐이고 그 DOM은 곧 지워진다.
beforeEach(async () => {
  await commands.mouseLeavePage();
});
