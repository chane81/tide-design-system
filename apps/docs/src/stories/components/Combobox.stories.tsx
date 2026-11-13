import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Combobox,
  ComboboxItem,
  ComboboxSection,
  Field,
  Input,
  Select,
  SelectItem,
} from "@tide-design/components";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

// Combobox 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언(거르기, 화살표로 고르기, 한글 IME 조합, 결과 개수 안내, 폼 제출,
// focus-field)은 components의 `Combobox.test.tsx`에 있다.
//
// 목록은 document.body로 portal된다. 열린 상태(가상 포커스 highlight 포함)의 a11y를 검사하려고 목록이 있는 story는
// play에서 입력에 포커스하고 ↓로 연다(또는 글자를 친다). play는 Docs 페이지에서 돌지 않으므로 문서에서는 닫혀 있다.

const meta = {
  title: "Component/Combobox",
  component: Combobox,
  subcomponents: { ComboboxItem, ComboboxSection },
  argTypes: {
    children: { control: false, table: { type: { summary: "ReactNode" } } },
    onValueChange: { control: false },
    onOpenChange: { control: false },
    emptyMessage: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  args: { size: "md", children: null },
} satisfies Meta<typeof Combobox>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 입력에 포커스하고 글자를 치거나(없으면 ↓로) 목록을 연다. 첫 옵션이 가상 포커스(highlight)가 된다. */
async function open(canvasElement: HTMLElement, text = "", index = 0): Promise<void> {
  const body = within(canvasElement.ownerDocument.body);
  // 키보드 입력 방식으로 바꾸려고 Tab을 누른 뒤 입력으로 포커스를 옮긴다.
  await userEvent.tab();
  const inputs = canvasElement.querySelectorAll<HTMLInputElement>('[role="combobox"]');
  inputs[index]?.focus();
  if (text) await userEvent.keyboard(text);
  await userEvent.keyboard("{ArrowDown}");
  const listbox = await body.findByRole("listbox");
  await expect(listbox).toBeVisible();
}

const countries = (
  <>
    <ComboboxItem value="kr">대한민국</ComboboxItem>
    <ComboboxItem value="jp">일본</ComboboxItem>
    <ComboboxItem value="cn">중국</ComboboxItem>
    <ComboboxItem value="tw">대만</ComboboxItem>
    <ComboboxItem value="vn">베트남</ComboboxItem>
    <ComboboxItem value="th">태국</ComboboxItem>
    <ComboboxItem value="us">미국</ComboboxItem>
    <ComboboxItem value="ca">캐나다</ComboboxItem>
    <ComboboxItem value="gb">영국</ComboboxItem>
    <ComboboxItem value="fr">프랑스</ComboboxItem>
    <ComboboxItem value="de">독일</ComboboxItem>
    <ComboboxItem value="au">호주</ComboboxItem>
  </>
);

/** 기본: Field 안의 Combobox. 글자를 치면 거른 목록이 열린다. */
export const Basic: Story = {
  name: "기본",
  render: (args) => (
    <div className="w-72">
      <Field label="국가" description="이름 일부를 쳐서 찾습니다.">
        <Combobox {...args} name="country" placeholder="국가 이름">
          {countries}
        </Combobox>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "대");
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getAllByRole("option")).toHaveLength(2);
    await expect(body.getByRole("listbox").querySelector("[data-highlighted]")).not.toBeNull();
  },
};

/** size: 같은 size의 Input·Select·Button과 높이가 같다. */
export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex w-[36rem] items-center gap-2">
          <Combobox size={size} aria-label={`국가 ${size}`} className="w-48">
            {countries}
          </Combobox>
          <Select size={size} aria-label={`정렬 ${size}`} defaultValue="new" className="w-32">
            <SelectItem value="new">최신순</SelectItem>
            <SelectItem value="old">오래된순</SelectItem>
          </Select>
          <Input size={size} aria-label={`메모 ${size}`} placeholder="메모" className="w-32" />
          <Button size={size}>검색</Button>
        </div>
      ))}
    </div>
  ),
};

/** 결과 없음: 거른 결과가 없으면 목록이 닫히지 않고 `emptyMessage`가 보인다. */
export const Empty: Story = {
  name: "결과 없음",
  render: () => (
    <div className="w-72">
      <Field label="국가">
        <Combobox emptyMessage="일치하는 국가가 없습니다">{countries}</Combobox>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    canvasElement.querySelector<HTMLInputElement>('[role="combobox"]')?.focus();
    await userEvent.keyboard("없는나라");
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByText("일치하는 국가가 없습니다")).toBeVisible();
  },
};

/** 묶음과 비활성 옵션. 거른 뒤 남은 옵션이 없는 묶음은 빠진다. */
export const Sections: Story = {
  name: "묶음·비활성 옵션",
  render: () => (
    <div className="w-72">
      <Field label="공항">
        <Combobox defaultValue="icn">
          <ComboboxSection heading="국내">
            <ComboboxItem value="icn">인천</ComboboxItem>
            <ComboboxItem value="gmp">김포</ComboboxItem>
            <ComboboxItem value="pus">김해</ComboboxItem>
            <ComboboxItem value="cju" disabled>
              제주(운항 중지)
            </ComboboxItem>
          </ComboboxSection>
          <ComboboxSection heading="해외">
            <ComboboxItem value="nrt">나리타</ComboboxItem>
            <ComboboxItem value="hnd">하네다</ComboboxItem>
            <ComboboxItem value="kix">간사이</ComboboxItem>
          </ComboboxSection>
        </Combobox>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement);
  },
};

/** 제어: 고른 값을 상태로 갖고 화면에 보인다. 입력을 모두 지우면 `null`이 된다. */
export const Controlled: Story = {
  name: "제어",
  render: function Controlled() {
    const [value, setValue] = useState<string | null>("jp");

    return (
      <div className="flex w-72 flex-col items-start gap-3">
        <Field label="국가">
          <Combobox value={value} onValueChange={setValue}>
            {countries}
          </Combobox>
        </Field>
        <output className="text-body-sm text-muted">고른 값: {value ?? "없음"}</output>
        <Button size="sm" variant="ghost" color="neutral" onClick={() => setValue("fr")}>
          프랑스로 바꾸기
        </Button>
      </div>
    );
  },
};

/** 폼: `name`으로 고른 옵션의 value가 제출된다. `required`면 비어 있을 때 제출이 막히고 입력으로 포커스가 온다. */
export const InForm: Story = {
  name: "폼 제출과 오류",
  render: function InForm() {
    const [submitted, setSubmitted] = useState("아직 없음");

    return (
      <form
        className="flex w-72 flex-col items-start gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const entries = [...new FormData(event.currentTarget)];
          setSubmitted(entries.map(([key, value]) => `${key}=${String(value)}`).join("&"));
        }}
      >
        <Field label="배송 국가" error="배송 국가를 고르세요." required>
          <Combobox name="country">{countries}</Combobox>
        </Field>
        <Field label="통화" disabled>
          <Combobox name="currency" defaultValue="krw">
            <ComboboxItem value="krw">원(KRW)</ComboboxItem>
            <ComboboxItem value="usd">달러(USD)</ComboboxItem>
          </Combobox>
        </Field>
        <Button type="submit">주문</Button>
        <output className="text-body-sm text-muted">제출한 값: {submitted}</output>
      </form>
    );
  },
};

/** Do: 옵션이 많아 찾아야 하는 목록에 쓴다. */
export const DoManyOptions: Story = {
  name: "Do: 많은 옵션 찾기",
  render: () => (
    <div className="w-72">
      <Field label="국가" description="이름 일부를 쳐서 찾습니다.">
        <Combobox>{countries}</Combobox>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "국");
  },
};

/** Don't: 옵션 몇 개뿐인 목록을 Combobox로 둔다. 칠 일이 없으므로 Select나 RadioGroup이 낫다. */
export const DontFewOptions: Story = {
  name: "Don't: 옵션 몇 개",
  render: () => (
    <div className="w-72">
      <Field label="정렬">
        <Combobox>
          <ComboboxItem value="new">최신순</ComboboxItem>
          <ComboboxItem value="old">오래된순</ComboboxItem>
        </Combobox>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement);
  },
};
