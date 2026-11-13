import "./preview.css";

import { DecoratorHelpers } from "@storybook/addon-themes";
import type { Decorator, Preview } from "@storybook/react-vite";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { addons, useEffect } from "storybook/preview-api";

import { DocsAnchor } from "../src/components/DocsAnchor";
import { applyTheme, DEFAULT_THEME, THEMES, toTheme } from "./theme";
import { ThemedDocsContainer } from "./ThemedDocsContainer";

// story parameters의 `themes.themeOverride`가 툴바 값보다 먼저다.
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

// solid 위 글자와 4:1 등급 견본만 color-contrast에서 떼어 4:1로 검사한다(ADR 0023).
// 옵션은 axe-core 4.14.0 color-contrast 기본값에서 normal.expected만 바꿨다. runOnly가 tag로 고르므로 wcag2aa를 단다.
const lowerTierSelector = '[class*="on-solid"], [data-contrast-tier="4"]';
const solidContrastConfig = {
  checks: [
    {
      id: "tide-lower-tier-contrast",
      evaluate: "color-contrast-evaluate",
      options: {
        ignoreUnicode: true,
        ignoreLength: false,
        ignorePseudo: false,
        boldValue: 700,
        boldTextPt: 14,
        largeTextPt: 18,
        contrastRatio: { normal: { expected: 4 }, large: { expected: 3 } },
        pseudoSizeThreshold: 0.25,
        shadowOutlineEmMax: 0.2,
        textStrokeEmMin: 0.03,
      },
    },
  ],
  rules: [
    { id: "color-contrast", selector: '*:not([class*="on-solid"]):not([data-contrast-tier="4"])' },
    {
      id: "tide-lower-tier-contrast",
      impact: "serious" as const,
      selector: lowerTierSelector,
      matches: "color-contrast-matches",
      excludeHidden: false,
      tags: ["cat.color", "wcag2aa"],
      any: ["tide-lower-tier-contrast"],
      all: [],
      none: [],
      metadata: {
        description: "solid 위 글자와 4:1 등급 견본은 4:1 이상이다(Tide ADR 0023)",
        help: "solid 위 글자는 4:1 이상이어야 한다",
      },
    },
  ],
};

const preview: Preview = {
  decorators: [withTheme],
  initialGlobals: {
    theme: DEFAULT_THEME,
    // Storybook 기본 목록 MINIMAL_VIEWPORTS의 `desktop`(1280×1024).
    viewport: { value: "desktop", isRotated: false },
  },
  parameters: {
    // method 기본값은 'configure'(파일 순서)라 'alphabetical'을 명시한다. locales는 실행 환경 언어와 무관하게 고정한다.
    options: {
      storySort: {
        method: "alphabetical",
        locales: "ko",
        order: [
          "시작하기",
          ["설치", "폰트 로드", "Theme 전환", "브랜드 색 더하기"],
          "원칙",
          "기준",
          "Foundation",
          "Component",
        ],
      },
    },
    // MDX의 Markdown 링크도 외부 주소는 새 탭으로 연다.
    docs: {
      components: { a: DocsAnchor },
      container: ThemedDocsContainer,
    },
    // 의도적으로 잘못된 Don't story만 story parameters에서 `a11y: { test: "off" }`로 끈다.
    a11y: {
      test: "error",
      config: solidContrastConfig,
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
