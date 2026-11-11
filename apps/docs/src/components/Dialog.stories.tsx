import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertDialog,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Field,
  IconButton,
  Input,
  Select,
  SelectItem,
} from "@tide-tds/components";
import { TrashIcon } from "@tide-tds/icons";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

// Dialog·AlertDialog 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언(포커스 가두기·복귀, Esc, 바깥 막 누름, Select·Tooltip과 함께, motion)은
// components의 `Dialog.test.tsx`에 있다.
//
// 내용은 document.body로 portal된다. 열린 상태의 a11y를 검사하려고 story마다 play에서 트리거를 눌러 연다.
// play는 Docs 페이지에서 돌지 않으므로 문서에서는 닫혀 있다. 열린 동안 바깥은 inert라 문서 예시에 defaultOpen을 두지 않는다.

const meta = {
  title: "Component/Dialog",
  component: Dialog,
  // 부분 Component의 props 표도 함께 보여 준다.
  subcomponents: {
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
    AlertDialog,
  },
  argTypes: {
    children: { control: false, table: { type: { summary: "ReactNode" } } },
    onOpenChange: { control: false },
  },
  args: { children: null },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 트리거 이름으로 트리거를 눌러 연다. 등장 전환(opacity 0에서 시작)이 끝날 때까지 기다린다. */
async function open(
  canvasElement: HTMLElement,
  name: string,
  role: "dialog" | "alertdialog" = "dialog",
): Promise<void> {
  await userEvent.click(within(canvasElement).getByRole("button", { name }));
  const body = within(canvasElement.ownerDocument.body);
  const dialog = await body.findByRole(role);
  const backdrop = dialog.parentElement as HTMLElement;
  await Promise.all(
    [dialog, backdrop].flatMap((element) =>
      element.getAnimations().map((animation) => animation.finished),
    ),
  );
  await expect(dialog).toBeVisible();
}

/** 기본: 제목·설명·입력과 동작 버튼 줄 */
export const Basic: Story = {
  name: "기본",
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button variant="outline" />}>프로젝트 이름 바꾸기</DialogTrigger>
      <DialogContent>
        <DialogTitle>프로젝트 이름 바꾸기</DialogTitle>
        <DialogDescription>새 이름은 프로젝트의 모든 멤버에게 보입니다.</DialogDescription>
        <Field label="새 이름">
          <Input defaultValue="디자인 리뷰" />
        </Field>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" color="neutral" />}>취소</DialogClose>
          <DialogClose render={<Button />}>저장</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "프로젝트 이름 바꾸기");
  },
};

/** 크기: 최대 폭 sm 24rem, md 32rem(기본), lg 40rem. 화면이 좁으면 화면 폭에 맞춰 줄어든다. */
export const Sizes: Story = {
  name: "크기",
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Dialog key={size}>
          <DialogTrigger render={<Button variant="outline" size="sm" />}>{size}</DialogTrigger>
          <DialogContent size={size}>
            <DialogTitle>{size} 크기</DialogTitle>
            <DialogDescription>내용 길이에 맞는 폭을 고릅니다.</DialogDescription>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "lg");
  },
};

/** AlertDialog: 되돌릴 수 없는 동작을 확인받는다. 취소를 앞에 두면 열 때 취소에 포커스가 온다. */
export const Alert: Story = {
  name: "AlertDialog",
  render: () => (
    <AlertDialog>
      <DialogTrigger render={<Button color="danger" variant="outline" />}>
        프로젝트 삭제
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogTitle>프로젝트를 삭제할까요?</DialogTitle>
        <DialogDescription>
          「디자인 리뷰」와 안의 파일 24개가 모두 지워집니다. 되돌릴 수 없습니다.
        </DialogDescription>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" color="neutral" />}>취소</DialogClose>
          <DialogClose render={<Button color="danger" />}>삭제</DialogClose>
        </DialogFooter>
      </DialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "프로젝트 삭제", "alertdialog");
  },
};

/** 제어: 폼을 제출하면 저장하고 닫는다. 트리거 없이 다른 곳(Menu 항목 등)에서 `open`으로 열 수도 있다. */
export const Controlled: Story = {
  name: "제어와 폼",
  render: function Controlled() {
    const [name, setName] = useState("디자인 리뷰");
    const [isOpen, setOpen] = useState(false);
    return (
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline" />}>이름: {name}</DialogTrigger>
        <DialogContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const value = new FormData(event.currentTarget).get("name");
              if (typeof value === "string" && value) setName(value);
              setOpen(false);
            }}
          >
            <DialogTitle>이름 바꾸기</DialogTitle>
            <Field label="새 이름">
              {/* oxlint-disable-next-line jsx-a11y/no-autofocus -- 열자마자 입력하는 Dialog다. */}
              <Input name="name" defaultValue={name} autoFocus />
            </Field>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" color="neutral" />}>취소</DialogClose>
              <Button type="submit">저장</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
  play: async ({ canvasElement }) => {
    await open(canvasElement, "이름: 디자인 리뷰");
  },
};

/** Dialog 안의 Select. 목록은 Dialog 위(z-popover)에 뜬다. */
export const WithSelect: Story = {
  name: "Dialog 안 Select",
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>내보내기</DialogTrigger>
      <DialogContent size="sm">
        <DialogTitle>내보내기</DialogTitle>
        <Field label="파일 형식">
          <Select defaultValue="pdf">
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="svg">SVG</SelectItem>
          </Select>
        </Field>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" color="neutral" />}>취소</DialogClose>
          <DialogClose render={<Button />}>내보내기</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "내보내기");
  },
};

/** Do: 위험한 동작은 AlertDialog로 확인받고, 확인 버튼은 danger, 취소를 앞에 둔다. */
export const DoAlertForDestructive: Story = {
  name: "Do: 위험한 동작은 AlertDialog",
  render: () => (
    <AlertDialog>
      <DialogTrigger
        render={
          <IconButton aria-label="댓글 삭제" variant="ghost" color="neutral">
            <TrashIcon />
          </IconButton>
        }
      />
      <DialogContent size="sm">
        <DialogTitle>댓글을 삭제할까요?</DialogTitle>
        <DialogDescription>삭제한 댓글은 되돌릴 수 없습니다.</DialogDescription>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" color="neutral" />}>취소</DialogClose>
          <DialogClose render={<Button color="danger" />}>삭제</DialogClose>
        </DialogFooter>
      </DialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "댓글 삭제", "alertdialog");
  },
};

/** Don't: 위험한 동작을 바깥 누름으로 닫히는 Dialog와 primary 버튼으로 확인받는다. */
export const DontDialogForDestructive: Story = {
  name: "Don't: 위험한 동작을 Dialog·primary로",
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>기록 비우기</DialogTrigger>
      <DialogContent size="sm">
        <DialogTitle>기록을 비울까요?</DialogTitle>
        <DialogFooter>
          <DialogClose render={<Button />}>비우기</DialogClose>
          <DialogClose render={<Button variant="ghost" color="neutral" />}>취소</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, "기록 비우기");
  },
};
