import "./preview.css";

import { DecoratorHelpers } from "@storybook/addon-themes";
import type { Decorator, Preview } from "@storybook/react-vite";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { addons, useEffect } from "storybook/preview-api";

import { DocsAnchor } from "../src/components/DocsAnchor";
import { applyTheme, DEFAULT_THEME, THEMES, toTheme } from "./theme";
import { ThemedDocsContainer } from "./ThemedDocsContainer";

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

// solid 위 글자는 대비 하한이 4:1이다(ADR 0023, 티켓 47). axe의 color-contrast는 일반 글자에 4.5:1을 걸므로,
// solid 위 글자(`*-on-solid` class)와 문서 견본 중 4:1 등급(`data-contrast-tier="4"`)만 따로 떼어 4:1로 검사한다.
// 나머지 요소는 기본 color-contrast(4.5:1) 그대로다. 값 대비는 foundation의 대비 쌍 테스트가 따로 강제한다.
// axe-core 4.14.0 axe.configure: rules[].selector로 대상 요소를 고르고, checks[]에 기존 evaluate('color-contrast-evaluate')를
// 다른 옵션으로 등록한다. 옵션은 4.14.0 기본값(color-contrast check)에서 contrastRatio.normal.expected만 바꿨다.
// runOnly가 tag로 고르므로 새 규칙에도 wcag2aa tag를 단다.
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
    // 기본 viewport는 desktop(1280×1024)이다. storybook 10.6.6 기본 목록 MINIMAL_VIEWPORTS의 `desktop` 키.
    viewport: { value: "desktop", isRotated: false },
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
          ["설치", "폰트 로드", "Theme 전환", "브랜드 색 더하기"],
          "원칙",
          "기준",
          "Foundation",
          "Component",
        ],
      },
    },
    // MDX의 Markdown 문법 링크도 외부 주소는 새 탭으로 연다(storybook 10.6.6 `parameters.docs.components`).
    // container는 Docs 페이지의 Storybook 색을 툴바 Theme에 맞춘다(storybook 10.6.6 `parameters.docs.container`).
    docs: {
      components: { a: DocsAnchor },
      container: ThemedDocsContainer,
    },
    // 모든 story에 axe 검사를 돌리고 위반을 테스트 실패로 다룬다(storybook 10.6.6 A11yParameters).
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
