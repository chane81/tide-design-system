// Avatar의 이름, JS 없는 fallback, 모양을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 21).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors)에서도 이미지가 그려지고 fallback 아이콘이 남는지 본다.
import { describe, expect, test } from "vitest";
import { commands, page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Avatar, type AvatarProps } from "./Avatar.tsx";

// 앱 장식 계열(leaf)을 색 계열 이름 타입에 더한다(앱의 augmentation과 같다. 티켓 41, ADR 0016).
declare module "@tide-tds/foundation" {
  interface ColorFamilyRegistry {
    leaf: true;
  }
}

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
function resolve(value: string): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  // 시스템 색 이름(CanvasText 등)을 forced-colors가 덮지 않고 그대로 계산하게 한다.
  probe.style.forcedColorAdjust = "none";
  probe.style.borderColor = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).borderTopColor;
  probe.remove();
  return resolved;
}

const byTestId = (id: string): HTMLElement => page.getByTestId(id).element() as HTMLElement;

/** 한 가지 색으로 채운 PNG data URL. 불러오기 성공 경우에 쓴다. */
function solidPng(color: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 8;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas 2d context가 없다");
  context.fillStyle = color;
  context.fillRect(0, 0, 8, 8);
  return canvas.toDataURL("image/png");
}

// 불러오기 실패 경우. 깨진 PNG 데이터와 개발 서버에 없는 경로(404 또는 이미지가 아닌 응답)다.
const brokenData = "data:image/png;base64,AAAA";
const missingPath = "/__tide-avatar-missing__.png";

/** 같은 주소를 브라우저가 받아 끝낼(성공 또는 실패) 때까지 기다린다. 배경 이미지도 같은 캐시를 쓴다. */
async function settle(src: string): Promise<"load" | "error"> {
  const probe = new Image();
  const result = await new Promise<"load" | "error">((resolveResult) => {
    probe.onload = () => resolveResult("load");
    probe.onerror = () => resolveResult("error");
    probe.src = src;
  });
  // 배경 이미지가 그려질 시간을 둔다(두 프레임).
  await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
  return result;
}

/** 찍은 화면(base64 PNG)의 한 점 색을 [r, g, b]로 읽는다. */
async function pixelAt(base64: string, x: number, y: number): Promise<number[]> {
  const image = new Image();
  image.src = `data:image/png;base64,${base64}`;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas 2d context가 없다");
  context.drawImage(image, 0, 0);
  return Array.from(context.getImageData(x, y, 1, 1).data.subarray(0, 3));
}

describe("역할과 이름", () => {
  test("alt를 주면 루트가 role=img이고 alt가 이름이다", async () => {
    await render(<Avatar alt="홍길동" src={solidPng("#e62828")} data-testid="avatar" />);
    const element = byTestId("avatar");
    expect(element.tagName).toBe("SPAN");
    await expect.element(page.getByRole("img", { name: "홍길동" })).toBeInTheDocument();
    // 이름을 가진 것은 루트 하나다. 아이콘과 이미지 층은 숨긴다.
    expect(page.getByRole("img").elements()).toHaveLength(1);
    expect(element.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  test("이미지가 없어도 alt가 이름이다", async () => {
    await render(<Avatar alt="홍길동" />);
    await expect.element(page.getByRole("img", { name: "홍길동" })).toBeInTheDocument();
  });

  test('장식용(alt="")이면 역할과 이름이 없어 읽히지 않는다', async () => {
    await render(
      <p>
        <Avatar alt="" src={solidPng("#e62828")} data-testid="avatar" /> 홍길동
      </p>,
    );
    const element = byTestId("avatar");
    expect(element).not.toHaveAttribute("role");
    expect(element).not.toHaveAttribute("aria-label");
    expect(page.getByRole("img").elements()).toHaveLength(0);
  });

  test("Button 안에 넣으면 alt가 버튼 이름에 들어간다", async () => {
    await render(
      <button type="button">
        <Avatar alt="홍길동" size="sm" /> 프로필
      </button>,
    );
    await expect.element(page.getByRole("button", { name: "홍길동 프로필" })).toBeInTheDocument();
  });

  test("alt는 필수이고 role·aria-label·children은 받지 않는다", () => {
    // @ts-expect-error -- 이름을 줄지 장식용("")일지 반드시 정한다.
    const noAlt: AvatarProps = { src: "/a.png" };
    // @ts-expect-error -- 역할은 alt가 정한다.
    const withRole: AvatarProps = { alt: "홍길동", role: "button" };
    // @ts-expect-error -- 이름은 alt로 준다.
    const withLabel: AvatarProps = { alt: "", "aria-label": "홍길동" };
    // @ts-expect-error -- 안에 넣을 내용이 없다(fallback은 아이콘).
    const withChildren: AvatarProps = { alt: "", children: "홍" };
    expect([noAlt, withRole, withLabel, withChildren]).toHaveLength(4);
  });
});

describe("JS 없는 fallback", () => {
  test("src가 없으면 fallback 아이콘만 있고 이미지 층이 없다", async () => {
    await render(<Avatar alt="홍길동" data-testid="avatar" />);
    const element = byTestId("avatar");
    expect(element.querySelector("svg")).not.toBeNull();
    expect(element.children).toHaveLength(1);
  });

  test("src가 빈 문자열이면 이미지 층이 없다", async () => {
    await render(<Avatar alt="홍길동" src="" data-testid="avatar" />);
    expect(byTestId("avatar").children).toHaveLength(1);
  });

  test("이미지를 받으면 fallback 아이콘을 덮는다", async () => {
    const src = solidPng("#e62828");
    await render(<Avatar alt="홍길동" src={src} size="lg" data-testid="avatar" />);
    expect(await settle(src)).toBe("load");
    const shot = await commands.screenshotTestId("avatar");
    // 가운데(아이콘이 있는 자리)가 이미지 색이다. forced-colors에서도 배경 이미지는 그대로 그려진다.
    expect(await pixelAt(shot, 24, 24)).toEqual([230, 40, 40]);
    expect(await pixelAt(shot, 24, 10)).toEqual([230, 40, 40]);
  });

  test.each([
    ["깨진 데이터", brokenData],
    ["없는 경로", missingPath],
  ])("불러오지 못하면(%s) src가 없을 때와 똑같이 그려진다", async (_, src) => {
    await render(
      <div data-theme="light" className="flex gap-2 bg-canvas p-2">
        <Avatar alt="홍길동" src={src} data-testid="broken" />
        <Avatar alt="홍길동" data-testid="fallback" />
      </div>,
    );
    expect(await settle(src)).toBe("error");
    const broken = await commands.screenshotTestId("broken");
    const fallback = await commands.screenshotTestId("fallback");
    expect(broken).toBe(fallback);
  });

  test("대조: <img>를 아이콘 위에 겹치면 실패했을 때 깨진 이미지 표시가 fallback을 가린다", async () => {
    // Avatar가 <img>를 쓰지 않는 이유를 남겨 둔다. Chromium은 실패한 <img> 상자 안에
    // 깨진 이미지 아이콘과 alt 텍스트를 그리고, CSS로 이를 지울 수 없다.
    await render(
      <div data-theme="light" className="flex gap-2 bg-canvas p-2">
        <Avatar alt="" data-testid="with-img" />
        <Avatar alt="" data-testid="fallback" />
      </div>,
    );
    const image = document.createElement("img");
    image.alt = "홍길동";
    image.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover";
    image.src = brokenData;
    byTestId("with-img").append(image);
    expect(await settle(brokenData)).toBe("error");
    const withImg = await commands.screenshotTestId("with-img");
    const fallback = await commands.screenshotTestId("fallback");
    expect(withImg).not.toBe(fallback);
  });

  test("src의 따옴표·역슬래시·괄호는 url 문자열 안에 머문다", async () => {
    const src = '/a").b{color:red} x("\\y.png';
    await render(<Avatar alt="홍길동" src={src} data-testid="avatar" />);
    const layer = byTestId("avatar").lastElementChild as HTMLElement;
    // 계산값은 문서 기준으로 푼 절대 URL 하나다. 따옴표 밖으로 나간 선언이 없다.
    expect(getComputedStyle(layer).backgroundImage).toBe(
      `url("${new URL(src, document.baseURI).href}")`,
    );
    expect(getComputedStyle(layer).color).not.toBe("rgb(255, 0, 0)");
  });

  test("이미지 층은 원 전체를 덮고 가운데를 채운다(cover)", async () => {
    await render(<Avatar alt="홍길동" src="/a.png" data-testid="avatar" />);
    const layer = byTestId("avatar").lastElementChild as HTMLElement;
    const style = getComputedStyle(layer);
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(style.position).toBe("absolute");
    expect(layer.getBoundingClientRect().width).toBe(40);
    expect(layer.getBoundingClientRect().height).toBe(40);
    expect(style.backgroundSize).toBe("cover");
    expect(style.backgroundPosition).toBe("50% 50%");
    expect(style.backgroundRepeat).toBe("no-repeat");
  });
});

describe("모양", () => {
  const sizes = [
    ["xs", 24, 16],
    ["sm", 32, 20],
    ["md", 40, 24],
    ["lg", 48, 28],
  ] as const;

  test.each(sizes)("size %s는 %ipx 원이고 아이콘은 %ipx다", async (size, box, icon) => {
    await render(<Avatar alt="홍길동" size={size} data-testid="avatar" />);
    const element = byTestId("avatar");
    const rect = element.getBoundingClientRect();
    expect(rect.width).toBe(box);
    expect(rect.height).toBe(box);
    const svg = element.querySelector("svg") as SVGElement;
    expect(svg.getBoundingClientRect().width).toBe(icon);
    expect(svg.getBoundingClientRect().height).toBe(icon);
  });

  test("기본 size는 md이고 radius는 full이며 overflow를 자른다", async () => {
    await render(<Avatar alt="홍길동" data-testid="avatar" />);
    const style = getComputedStyle(byTestId("avatar"));
    expect(style.width).toBe("40px");
    // rounded-full은 매우 큰 값이다. 원이 되려면 반지름이 한 변의 절반 이상이면 된다.
    expect(Number.parseFloat(style.borderTopLeftRadius)).toBeGreaterThanOrEqual(20);
    expect(style.overflow).toBe("hidden");
    expect(style.display).toBe("inline-flex");
    expect(style.flexShrink).toBe("0");
  });

  test("지원하지 않는 size는 타입 오류다", () => {
    // @ts-expect-error -- size는 xs·sm·md·lg다.
    const props: AvatarProps = { alt: "", size: "xl" };
    expect(props.size).toBe("xl");
  });
});

describe("색", () => {
  const families = ["gray", "blue", "green", "amber", "red", "cyan", "purple", "mint"] as const;

  test("기본은 gray이고 루트에 data-color가 붙는다", async () => {
    await render(
      <div data-theme="light">
        <Avatar alt="홍길동" data-testid="avatar" />
      </div>,
    );
    const element = byTestId("avatar");
    expect(element).toHaveAttribute("data-color", "gray");
    if (forcedColors()) return;
    expect(getComputedStyle(element).backgroundColor).toBe(resolve("var(--tide-gray-subtle)"));
    expect(getComputedStyle(element).color).toBe(resolve("var(--tide-gray-text)"));
  });

  test.each(families)("%s는 그 계열의 subtle 배경과 text 아이콘색이다", async (family) => {
    await render(
      <div data-theme="dark">
        <Avatar alt="홍길동" color={family} data-testid="avatar" />
      </div>,
    );
    const element = byTestId("avatar");
    expect(element).toHaveAttribute("data-color", family);
    if (forcedColors()) return;
    const probe = document.createElement("span");
    probe.dataset["theme"] = "dark";
    probe.dataset["color"] = family;
    probe.className = "bg-accent-subtle text-accent";
    document.body.append(probe);
    const expected = getComputedStyle(probe);
    expect(getComputedStyle(element).backgroundColor).toBe(expected.backgroundColor);
    expect(getComputedStyle(element).color).toBe(expected.color);
    // 아이콘은 currentColor다.
    expect(getComputedStyle(element.querySelector("svg") as SVGElement).stroke).toBe(
      expected.color,
    );
    probe.remove();
  });

  test("바깥 요소의 data-color를 물려받지 않는다", async () => {
    await render(
      <div data-theme="light" data-color="red">
        <Avatar alt="홍길동" data-testid="avatar" />
      </div>,
    );
    expect(byTestId("avatar")).toHaveAttribute("data-color", "gray");
    if (forcedColors()) return;
    expect(getComputedStyle(byTestId("avatar")).backgroundColor).toBe(
      resolve("var(--tide-gray-subtle)"),
    );
  });

  test("color는 색 계열 이름(ColorFamilyName)만 받고 Role은 타입 오류다(ADR 0016·0017 후속)", () => {
    const tide: AvatarProps = { alt: "", color: "cyan" };
    const decorative: AvatarProps[] = [
      { alt: "", color: "purple" },
      { alt: "", color: "mint" },
    ];
    const app: AvatarProps = { alt: "", color: "leaf" };
    // @ts-expect-error -- fallback 배경은 뜻이 없는 장식 색이라 Role을 받지 않는다.
    const role: AvatarProps = { alt: "", color: "primary" };
    // @ts-expect-error -- neutral도 Role이다. 회색은 gray를 쓴다.
    const neutral: AvatarProps = { alt: "", color: "neutral" };
    // @ts-expect-error -- 등록하지 않은 이름이다.
    const unknown: AvatarProps = { alt: "", color: "purple-ish" };
    expect([tide, ...decorative, app, role, neutral, unknown]).toHaveLength(7);
  });
});

describe("forced-colors", () => {
  test("fallback 아이콘은 forced-colors에서 CanvasText로 남는다", async () => {
    await render(
      <div data-theme="light">
        <Avatar alt="홍길동" color="blue" data-testid="avatar" />
      </div>,
    );
    const style = getComputedStyle(byTestId("avatar"));
    if (forcedColors()) {
      expect(style.color).toBe(resolve("CanvasText"));
      expect(style.backgroundColor).toBe(resolve("Canvas"));
    } else {
      expect(style.color).not.toBe(resolve("CanvasText"));
    }
  });
});

describe("공통 API", () => {
  test("ref와 나머지 props를 루트 span에 넘기고, className이 기본 class를 이긴다", async () => {
    let node: HTMLSpanElement | null = null;
    await render(
      <Avatar
        ref={(element) => {
          node = element;
        }}
        alt="홍길동"
        id="me"
        title="내 계정"
        className="rounded-md"
        data-testid="avatar"
      />,
    );
    expect(node).toBeInstanceOf(HTMLSpanElement);
    const element = byTestId("avatar");
    expect(element).toHaveAttribute("id", "me");
    expect(element).toHaveAttribute("title", "내 계정");
    expect(element).toHaveClass("rounded-md");
    expect(element).not.toHaveClass("rounded-full");
    expect(Number.parseFloat(getComputedStyle(element).borderTopLeftRadius)).toBeLessThan(20);
  });
});
