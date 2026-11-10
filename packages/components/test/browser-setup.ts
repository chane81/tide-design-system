// browser project에서 Tide CSS를 실제로 적용한다. 계산된 스타일을 단언하려면 필요하다.
import "./browser.css";

// `next/link`(Button `render` 테스트)는 모듈에서 `process.env`를 읽는다. 브라우저에는 `process`가 없어 빈 값을 둔다.
// Next 앱에서는 Next 번들러가 이 값을 채운다.
(globalThis as { process?: unknown }).process ??= { env: { NODE_ENV: "test" } };
