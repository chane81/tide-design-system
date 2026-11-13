import type { Meta, StoryObj } from "@storybook/react-vite";

import { FocusIndicators, Radii, Shadows } from "../../components/Shape.tsx";

// radius·Elevation·포커스 표시 Foundation 문서의 Token 블록. MDX에서 Canvas로 보여 주고, storybook project가 렌더·a11y를 검사한다.
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
