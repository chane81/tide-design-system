import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Badge,
  Button,
} from "@tide-design/components";
import { useState, type ReactElement } from "react";
import { expect, userEvent, within } from "storybook/test";

// Accordion 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언(Enter·Space 토글, 단일·여러 펼침, 제어/비제어, ring, forced-colors, motion)은
// components의 `Accordion.test.tsx`에 있다.
//
// 키보드 포커스 상태(focus-ring)의 a11y도 보려고 story마다 play에서 Tab으로 첫 트리거에 들어간다.

const meta = {
  title: "Component/Accordion",
  component: Accordion,
  // 부분 Component의 props 표도 함께 보여 준다.
  subcomponents: { AccordionItem, AccordionTrigger, AccordionPanel },
  argTypes: {
    children: { control: false, table: { type: { summary: "ReactNode" } } },
    value: { control: false },
    onValueChange: { control: false },
    multiple: { control: "boolean" },
  },
  args: { defaultValue: ["shipping"], multiple: false },
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 캔버스 안 첫 트리거에 Tab으로 들어가 키보드 포커스를 둔다. */
async function focusFirstTrigger(canvasElement: HTMLElement): Promise<void> {
  const canvas = within(canvasElement);
  await userEvent.tab();
  const [first] = canvas.getAllByRole("button");
  await expect(first).toHaveFocus();
}

/** 자주 묻는 질문 항목 세 개. 예시마다 같은 내용을 쓴다. */
function FaqItems(): ReactElement {
  return (
    <>
      <AccordionItem value="shipping">
        <AccordionTrigger>배송은 얼마나 걸리나요?</AccordionTrigger>
        <AccordionPanel>주문 후 영업일 기준 2~3일 안에 도착합니다.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="refund">
        <AccordionTrigger>환불은 어떻게 하나요?</AccordionTrigger>
        <AccordionPanel>받은 날부터 7일 안에 주문 내역에서 환불을 요청합니다.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="exchange">
        <AccordionTrigger>교환할 수 있나요?</AccordionTrigger>
        <AccordionPanel>같은 상품의 다른 크기·색으로 한 번 교환할 수 있습니다.</AccordionPanel>
      </AccordionItem>
    </>
  );
}

/** 기본: 한 번에 한 항목만 펼친다. 다른 항목을 펼치면 펼쳐 있던 항목이 접힌다. */
export const Basic: Story = {
  name: "기본",
  render: (args) => (
    <Accordion {...args} className="max-w-lg">
      <FaqItems />
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    await focusFirstTrigger(canvasElement);
  },
};

/** 여러 항목 펼치기: `multiple`이면 펼친 항목이 그대로 남는다. */
export const Multiple: Story = {
  name: "여러 항목 펼치기",
  render: () => (
    <Accordion multiple defaultValue={["shipping", "refund"]} className="max-w-lg">
      <FaqItems />
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    await focusFirstTrigger(canvasElement);
  },
};

/** 비활성 항목. 흐리게 보이고 펼치거나 접을 수 없으며 Tab 순서에서 빠진다. */
export const Disabled: Story = {
  name: "비활성 항목",
  render: () => (
    <Accordion className="max-w-lg">
      <AccordionItem value="plan">
        <AccordionTrigger>요금제</AccordionTrigger>
        <AccordionPanel>지금 쓰는 요금제는 기본형입니다.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="invoice" disabled>
        <AccordionTrigger>청구서(관리자만)</AccordionTrigger>
        <AccordionPanel>청구서 목록입니다.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    await focusFirstTrigger(canvasElement);
  },
};

/** 제어: 펼친 값을 앱 상태로 갖고, 밖의 버튼으로도 바꾼다. */
function ControlledExample(): ReactElement {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Accordion multiple value={value} onValueChange={setValue}>
        <FaqItems />
      </Accordion>
      <div className="flex items-center gap-2">
        <Badge>{value.length === 0 ? "모두 접힘" : value.join(", ")}</Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setValue(["shipping", "refund", "exchange"])}
        >
          모두 펼치기
        </Button>
        <Button size="sm" variant="outline" onClick={() => setValue([])}>
          모두 접기
        </Button>
      </div>
    </div>
  );
}

export const Controlled: Story = {
  name: "제어",
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    await focusFirstTrigger(canvasElement);
  },
};

/** Do: 제목만 보고도 무엇이 펼쳐질지 알 수 있게 짧은 질문·이름으로 둔다. */
export const DoClearTitles: Story = {
  name: "Do: 내용을 알리는 제목",
  render: () => (
    <Accordion className="max-w-lg">
      <FaqItems />
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    await focusFirstTrigger(canvasElement);
  },
};

/** Don't: 모두가 꼭 읽어야 하는 내용을 접어 둔다. 필수 안내는 펼친 채 본문에 둔다. */
export const DontHideEssential: Story = {
  name: "Don't: 필수 내용 숨기기",
  render: () => (
    <Accordion className="max-w-lg">
      <AccordionItem value="terms">
        <AccordionTrigger>더 보기</AccordionTrigger>
        <AccordionPanel>결제하면 7일 뒤부터 환불할 수 없습니다.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    await focusFirstTrigger(canvasElement);
  },
};
