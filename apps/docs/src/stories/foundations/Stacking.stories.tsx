import type { Meta, StoryObj } from "@storybook/react-vite";

import { StackingTiers, StickyHeaderScrollPadding } from "../../components/Stacking";

// 쌓임 단계(z-index) Foundation 문서의 Token 블록과 가이드 예시. MDX에서 Canvas로 보여 주고,
// storybook project가 렌더·a11y를 검사한다.
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
