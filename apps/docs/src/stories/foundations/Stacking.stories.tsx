import type { Meta, StoryObj } from "@storybook/react-vite";

import { StackingTiers, StickyHeaderScrollPadding } from "../../components/Stacking";

const meta = {
  title: "Foundation/쌓임 단계",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** 쌓임 단계 5개 */
export const Tiers: Story = {
  name: "쌓임 단계",
  render: () => <StackingTiers />,
};

/** sticky 헤더와 scroll-padding-top */
export const StickyHeader: Story = {
  name: "sticky 헤더와 scroll-padding-top",
  render: () => <StickyHeaderScrollPadding />,
};
