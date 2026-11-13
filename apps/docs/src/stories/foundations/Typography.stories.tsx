import type { Meta, StoryObj } from "@storybook/react-vite";

import { FontFamilies, FontWeights, TextStyles } from "../../components/TextStyles";

const meta = {
  title: "Foundation/타이포그래피",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** 텍스트 스타일 14개 */
export const Styles: Story = {
  name: "텍스트 스타일",
  render: () => <TextStyles />,
};

/** 굵기 5개 */
export const Weights: Story = {
  name: "굵기",
  render: () => <FontWeights />,
};

/** font-family 2개 */
export const Families: Story = {
  name: "font-family",
  render: () => <FontFamilies />,
};
