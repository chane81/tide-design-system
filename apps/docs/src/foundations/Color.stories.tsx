import type { Meta, StoryObj } from "@storybook/react-vite";

import { ColorNameContrast, ColorNames } from "../docs-blocks/ColorNames.tsx";
import { ColorScale } from "../docs-blocks/ColorScale.tsx";
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
};

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
