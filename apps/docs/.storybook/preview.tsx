import "./preview.css";

import { DecoratorHelpers } from "@storybook/addon-themes";
import type { Decorator, Preview } from "@storybook/react-vite";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { addons, useEffect } from "storybook/preview-api";

import { DocsAnchor } from "../src/docs-blocks/DocsAnchor.tsx";

// Theme은 `<html data-theme>`로 적용한다. 기본은 light이고 OS 설정(prefers-color-scheme)은 따르지 않는다.
const THEMES = ["light", "dark"] as const;
type ThemeName = (typeof THEMES)[number];
const DEFAULT_THEME: ThemeName = "light";

function toTheme(value: unknown): ThemeName {
  return THEMES.find((theme) => theme === value) ?? DEFAULT_THEME;
}

/**
 * Theme을 바꾸는 유일한 함수. 툴바 decorator와 globals 채널 구독이 함께 쓴다.
 * 전환 순간에는 transition을 꺼서 색이 한꺼번에 바뀌게 한다.
 */
function applyTheme(theme: ThemeName): void {
  const root = document.documentElement;
  if (root.dataset.theme === theme) return;

  const style = document.createElement("style");
  style.textContent = "*, *::before, *::after { transition: none !important; }";
  document.head.append(style);

  root.dataset.theme = theme;
  // reflow를 강제해 transition 없는 상태로 새 계산값을 확정한 뒤, 다음 frame에 원래대로 돌린다.
  void root.offsetHeight;
  requestAnimationFrame(() => style.remove());
}

// addon-themes 툴바(storybook 10.6.6 DecoratorHelpers): 툴바에 Theme 목록을 등록하고 story마다 global을 읽는다.
// story parameters의 `themes.themeOverride`가 있으면 그것을 먼저 쓴다.
DecoratorHelpers.initializeThemeState([...THEMES], DEFAULT_THEME);

const withTheme: Decorator = (Story, context) => {
  const override: unknown = context.parameters["themes"]?.themeOverride;
  const theme = toTheme(override ?? DecoratorHelpers.pluckThemeFromContext(context));
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  return <Story />;
};

// story가 없는 글(MDX) 페이지에는 decorator가 닿지 않으므로 globals 채널을 직접 구독한다.
const channel = addons.getChannel();
const onGlobals = ({ globals }: { globals: Record<string, unknown> }): void => {
  applyTheme(toTheme(globals["theme"]));
};
channel.on(SET_GLOBALS, onGlobals);
channel.on(GLOBALS_UPDATED, onGlobals);
// preview를 HMR로 다시 읽을 때 구독이 쌓이지 않게 한다.
import.meta.hot?.dispose(() => {
  channel.off(SET_GLOBALS, onGlobals);
  channel.off(GLOBALS_UPDATED, onGlobals);
});

applyTheme(DEFAULT_THEME);

const preview: Preview = {
  decorators: [withTheme],
  initialGlobals: {
    theme: DEFAULT_THEME,
  },
  parameters: {
    // 사이드바 순서(storybook 10.6.6 `parameters.options.storySort`). order에 없는 항목은 method로 정렬한다.
    // method의 실제 기본값은 'configure'(파일 순서)라서(10.6.6 preview runtime `storySort`) 'alphabetical'을 명시한다.
    // Component 아래는 order를 주지 않으므로 이름순이다. locales를 고정해 실행 환경의 언어 설정에 따라 순서가 바뀌지 않게 한다.
    options: {
      storySort: {
        method: "alphabetical",
        locales: "ko",
        order: [
          "시작하기",
          ["설치", "폰트 로드", "Theme 전환"],
          "원칙",
          "기준",
          "Foundation",
          "Component",
        ],
      },
    },
    // MDX의 Markdown 문법 링크도 외부 주소는 새 탭으로 연다(storybook 10.6.6 `parameters.docs.components`).
    docs: {
      components: { a: DocsAnchor },
    },
    // 모든 story에 axe 검사를 돌리고 위반을 테스트 실패로 다룬다(storybook 10.6.6 A11yParameters).
    // 의도적으로 잘못된 Don't story만 story parameters에서 `a11y: { test: "off" }`로 끈다.
    a11y: {
      test: "error",
      options: {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
        },
      },
    },
  },
};

export default preview;
