import type { Meta, StoryObj } from "@storybook/react-vite";

import { FocusIndicators, Radii, Shadows } from "../../components/Shape";

const meta = {
  title: "Foundation/모양과 깊이",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** radius 5단계 */
export const Radius: Story = {
  name: "radius",
  render: () => <Radii />,
};

/** 그림자 3단계(light/dark) */
export const Elevation: Story = {
  name: "그림자",
  render: () => <Shadows />,
};

/** 포커스 표시 ring과 field(light/dark) */
export const Focus: Story = {
  name: "포커스 표시",
  render: () => <FocusIndicators />,
};
