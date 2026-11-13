// 이름·설명은 브라우저가 계산한 접근 가능한 이름·설명으로 단언한다.
import { useState, type ReactElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Field } from "./Field";
import { Input } from "../Input/Input";
import { Textarea } from "../Textarea/Textarea";

describe("label 연결", () => {
  test("label이 입력창의 이름이 되고, label을 누르면 입력창에 포커스가 간다", async () => {
    await render(
      <Field label="이메일">
        <Input type="email" />
      </Field>,
    );
    const input = page.getByRole("textbox", { name: "이메일" });
    await expect.element(input).toHaveAccessibleName("이메일");

    await userEvent.click(page.getByText("이메일"));
    await expect.element(input).toHaveFocus();
  });

  test("Textarea도 같은 방식으로 이름이 붙는다", async () => {
    await render(
      <Field label="메모" description="200자까지 씁니다.">
        <Textarea />
      </Field>,
    );
    const textarea = page.getByRole("textbox", { name: "메모" });
    await expect.element(textarea).toHaveAccessibleDescription("200자까지 씁니다.");
    expect(textarea.element().tagName).toBe("TEXTAREA");
  });

  test("htmlFor로 입력창 id를 정한다", async () => {
    await render(
      <Field label="이름" htmlFor="name">
        <Input />
      </Field>,
    );
    expect(page.getByRole("textbox", { name: "이름" }).element()).toHaveAttribute("id", "name");
  });

  test("Field가 여러 개여도 id가 겹치지 않는다", async () => {
    await render(
      <div>
        <Field label="이름" description="실명">
          <Input />
        </Field>
        <Field label="별명" description="화면에 보이는 이름">
          <Input />
        </Field>
      </div>,
    );
    await expect
      .element(page.getByRole("textbox", { name: "이름" }))
      .toHaveAccessibleDescription("실명");
    await expect
      .element(page.getByRole("textbox", { name: "별명" }))
      .toHaveAccessibleDescription("화면에 보이는 이름");
  });

  test("required면 네이티브 required가 붙고, label의 *는 이름에 들어가지 않는다", async () => {
    await render(
      <Field label="이메일" required>
        <Input />
      </Field>,
    );
    const input = page.getByRole("textbox", { name: "이메일" });
    await expect.element(input).toHaveAccessibleName("이메일");
    await expect.element(input).toBeRequired();
    await expect.element(page.getByText("*")).toBeVisible();
  });

  test("disabled면 네이티브 disabled가 붙고 Field 루트에 data-disabled가 붙는다", async () => {
    await render(
      <Field label="이메일" disabled data-testid="field">
        <Input />
      </Field>,
    );
    await expect.element(page.getByRole("textbox", { name: "이메일" })).toBeDisabled();
    expect(page.getByTestId("field").element()).toHaveAttribute("data-disabled", "");
  });
});

describe("설명과 오류", () => {
  test("설명은 aria-describedby로 연결되고, 오류 상태가 아니면 aria-invalid가 없다", async () => {
    await render(
      <Field label="비밀번호" description="8자 이상 씁니다.">
        <Input type="password" />
      </Field>,
    );
    // password 입력창은 textbox 역할이 없어 label로 찾는다.
    const input = page.getByLabelText("비밀번호");
    await expect.element(input).toHaveAccessibleDescription("8자 이상 씁니다.");
    expect(input.element()).not.toHaveAttribute("aria-invalid");
    expect(input.element()).not.toHaveAttribute("data-invalid");
  });

  test("error가 있으면 오류 상태가 되고, 설명 다음에 오류 메시지를 읽는다", async () => {
    await render(
      <Field
        label="이메일"
        description="회사 메일을 씁니다."
        error="이메일 형식이 아닙니다."
        data-testid="field"
      >
        <Input defaultValue="tide" />
      </Field>,
    );
    const input = page.getByRole("textbox", { name: "이메일" });
    await expect.element(input).toHaveAttribute("aria-invalid", "true");
    await expect.element(input).toHaveAttribute("data-invalid", "");
    expect(page.getByTestId("field").element()).toHaveAttribute("data-invalid", "");
    await expect
      .element(input)
      .toHaveAccessibleDescription("회사 메일을 씁니다. 이메일 형식이 아닙니다.");
    await expect.element(page.getByText("이메일 형식이 아닙니다.")).toBeVisible();
    const icon = page.getByTestId("field").element().querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  test("invalid={false}면 error가 있어도 숨기고 오류 상태가 아니다", async () => {
    await render(
      <Field label="이메일" error="이메일 형식이 아닙니다." invalid={false}>
        <Input />
      </Field>,
    );
    const input = page.getByRole("textbox", { name: "이메일" });
    expect(input.element()).not.toHaveAttribute("aria-invalid");
    await expect.element(input).not.toHaveAccessibleDescription();
    await expect.element(page.getByText("이메일 형식이 아닙니다.")).not.toBeInTheDocument();
  });

  test("invalid만 주면 오류 메시지 없이 오류 상태가 된다", async () => {
    await render(
      <Field label="이메일" invalid>
        <Input />
      </Field>,
    );
    const input = page.getByRole("textbox", { name: "이메일" });
    await expect.element(input).toHaveAttribute("aria-invalid", "true");
    await expect.element(input).not.toHaveAccessibleDescription();
  });

  test("오류를 고치면 aria-invalid와 오류 메시지가 사라진다", async () => {
    function EmailField(): ReactElement {
      const [value, setValue] = useState("");

      return (
        <Field label="이메일" error={value.includes("@") ? undefined : "@를 넣어 주세요."}>
          <Input value={value} onChange={(event) => setValue(event.target.value)} />
        </Field>
      );
    }
    await render(<EmailField />);
    const input = page.getByRole("textbox", { name: "이메일" });
    await expect.element(input).toHaveAttribute("aria-invalid", "true");

    await userEvent.fill(input, "a@b.c");
    await expect.element(input).toHaveValue("a@b.c");
    expect(input.element()).not.toHaveAttribute("aria-invalid");
    await expect.element(page.getByText("@를 넣어 주세요.")).not.toBeInTheDocument();
  });

  test("입력창에 직접 준 aria-describedby는 Field 연결 뒤에 이어 붙는다", async () => {
    await render(
      <div>
        <p id="hint">예: tide@example.com</p>
        <Field label="이메일" description="회사 메일을 씁니다.">
          <Input aria-describedby="hint" />
        </Field>
      </div>,
    );
    await expect
      .element(page.getByRole("textbox", { name: "이메일" }))
      .toHaveAccessibleDescription("회사 메일을 씁니다. 예: tide@example.com");
  });

  test("입력창에 직접 준 값이 Field 값보다 이긴다", async () => {
    await render(
      <Field label="이메일" error="오류" disabled required>
        <Input invalid={false} disabled={false} required={false} />
      </Field>,
    );
    const input = page.getByRole("textbox", { name: "이메일" });
    await expect.element(input).toBeEnabled();
    await expect.element(input).not.toBeRequired();
    expect(input.element()).not.toHaveAttribute("aria-invalid");
  });
});

describe("form", () => {
  test("Input·Textarea 값이 네이티브 form으로 제출된다", async () => {
    const submitted: FormData[] = [];
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted.push(new FormData(event.currentTarget));
        }}
      >
        <Field label="이름">
          <Input name="name" />
        </Field>
        <Field label="메모">
          <Textarea name="memo" defaultValue="안녕하세요" />
        </Field>
        <button type="submit">보내기</button>
      </form>,
    );
    await userEvent.fill(page.getByRole("textbox", { name: "이름" }), "타이드");
    await userEvent.click(page.getByRole("button", { name: "보내기" }));

    expect(submitted).toHaveLength(1);
    const data = submitted[0]!;
    expect(data.get("name")).toBe("타이드");
    expect(data.get("memo")).toBe("안녕하세요");
  });

  test("required가 비어 있으면 브라우저가 제출을 막는다", async () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    await render(
      <form onSubmit={onSubmit}>
        <Field label="이름" required>
          <Input name="name" />
        </Field>
        <button type="submit">보내기</button>
      </form>,
    );
    await userEvent.click(page.getByRole("button", { name: "보내기" }));
    expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.fill(page.getByRole("textbox", { name: "이름" }), "타이드");
    await userEvent.click(page.getByRole("button", { name: "보내기" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
