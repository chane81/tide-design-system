import type { Meta, StoryObj } from "@storybook/react-vite";
// 내부 서브패스(앱 개발자용 아님). 렌더된 타일 글자색의 대비비를 계산한다.
import { colorFamilyNames, contrastRatio } from "@tide-design/foundation/internal";
import { expect, within } from "storybook/test";

import { ColorNameContrast, ColorNames, ColorSlotRules } from "../docs-blocks/ColorNames.tsx";
import { ColorScale } from "../docs-blocks/ColorScale.tsx";
import { colorTileGroups } from "../docs-blocks/colorTiles.ts";
import { ContrastExclusions, ContrastPairs } from "../docs-blocks/ContrastPairs.tsx";

// 컬러 Foundation 문서의 Token 블록. MDX에서 Canvas로 보여 주고, storybook project가 렌더·a11y를 검사한다.
const meta = {
  title: "Foundation/컬러",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** Primitive 8계열 11단계와 white, black */
export const Scale: Story = {
  name: "색 스케일",
  render: () => <ColorScale />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 계열 8개 카드는 11단계, white·black 카드는 2칸이다.
    for (const family of colorFamilyNames) {
      const card = canvas.getByRole("region", { name: new RegExp(`^${family}`) });
      expect(within(card).getAllByRole("listitem")).toHaveLength(11);
    }
    const base = canvas.getByRole("region", { name: /^white, black/ });
    expect(within(base).getAllByRole("listitem")).toHaveLength(2);
    // 타일에 보이는 단계 앞에 스크린리더용 계열 이름이 붙는다.
    const blue = canvas.getByRole("region", { name: /^blue/ });
    expect(within(blue).getAllByRole("listitem")[0]).toHaveTextContent(/^blue-50#/);
    // 렌더된 글자색이 타일 바탕 위에서 4.5:1 이상이다.
    const tiles = canvas.getAllByTestId("color-tile");
    expect(tiles).toHaveLength(colorTileGroups.flatMap((group) => group.tiles).length);
    for (const tile of tiles) {
      const style = getComputedStyle(tile);
      expect(
        contrastRatio(toHex(style.color), toHex(style.backgroundColor)),
      ).toBeGreaterThanOrEqual(4.5);
    }
  },
};

// 계산된 `rgb(r, g, b)` → `#rrggbb`. 타일은 불투명 hex로만 칠하므로 알파는 없다.
function toHex(rgb: string): string {
  const channels = rgb.match(/\d+/g)?.slice(0, 3) ?? [];
  return `#${channels.map((value) => Number(value).toString(16).padStart(2, "0")).join("")}`;
}

/** light Theme의 대비 쌍 */
export const LightPairs: Story = {
  name: "대비 쌍: light",
  render: () => <ContrastPairs theme="light" />,
};

/** dark Theme의 대비 쌍 */
export const DarkPairs: Story = {
  name: "대비 쌍: dark",
  render: () => <ContrastPairs theme="dark" />,
};

/** 슬롯 12개와 Theme별 단계·덮기 규칙. 브랜드 색 더하기 문서도 이 story를 쓴다. */
export const Slots: Story = {
  name: "슬롯 규칙",
  render: () => <ColorSlotRules />,
};

/** 색 이름(Role과 색 계열)을 data-color로 고른 accent class 미리보기 */
export const Names: Story = {
  name: "색 이름",
  render: () => <ColorNames />,
};

/** light Theme의 색 이름별 최저 대비비 */
export const LightNameContrast: Story = {
  name: "색 이름 대비: light",
  render: () => <ColorNameContrast theme="light" />,
};

/** dark Theme의 색 이름별 최저 대비비 */
export const DarkNameContrast: Story = {
  name: "색 이름 대비: dark",
  render: () => <ColorNameContrast theme="dark" />,
};

/** 대비 검사에서 뺀 Token */
export const Exclusions: Story = {
  name: "대비 검사 제외",
  render: () => <ContrastExclusions />,
};
