// 공개 표면(`src/index.ts`가 내보내는 것)을 Node에서 확인한다. 아이콘은 서버 렌더한 마크업으로 본다.
// renderToStaticMarkup(reactNode): react-dom 19.3.1 `react-dom/server`(react.dev reference, context7).
import { readFile } from "node:fs/promises";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import * as icons from "../src/index.ts";
import { CheckIcon, ChevronDownIcon, HouseIcon, PlusIcon, XIcon } from "../src/index.ts";

const table = JSON.parse(
  await readFile(new URL("../icon-names.json", import.meta.url), "utf8"),
) as Record<string, string>;

/** 루트 svg 요소의 여는 태그만 꺼낸다. */
function rootTag(markup: string): string {
  return /^<svg[^>]*>/.exec(markup)?.[0] ?? "";
}

describe("이름표와 export", () => {
  it("이름표의 키와 export 목록이 같다", () => {
    expect(Object.keys(icons).sort()).toEqual(Object.keys(table).sort());
  });

  it("모든 이름이 Icon 접미사로 끝난다", () => {
    expect(Object.keys(icons).filter((name) => !name.endsWith("Icon"))).toEqual([]);
  });
});

describe("대표 아이콘 서버 렌더", () => {
  const representatives = { PlusIcon, XIcon, CheckIcon, ChevronDownIcon, HouseIcon };

  it.each(Object.entries(representatives))("%s: 기본값은 장식용, 16px, 선 두께 2", (_, Icon) => {
    const markup = renderToStaticMarkup(<Icon />);
    const tag = rootTag(markup);
    expect(tag).toContain('aria-hidden="true"');
    expect(tag).toContain('focusable="false"');
    expect(tag).not.toContain("role=");
    expect(tag).toContain('width="16"');
    expect(tag).toContain('height="16"');
    expect(tag).toContain('stroke-width="2"');
    expect(tag).toContain('stroke="currentColor"');
    // 도형마다 렌더 기준 선 두께를 유지한다.
    const shapes = markup.match(/<(path|circle|rect|line|ellipse|polyline|polygon)\b[^>]*>/g) ?? [];
    expect(shapes.length).toBeGreaterThan(0);
    for (const shape of shapes) {
      expect(shape).toContain('vector-effect="non-scaling-stroke"');
    }
  });

  it("aria-label이 있으면 이름 있는 이미지가 된다", () => {
    const tag = rootTag(renderToStaticMarkup(<PlusIcon aria-label="추가" />));
    expect(tag).toContain('role="img"');
    expect(tag).toContain('aria-label="추가"');
    expect(tag).not.toContain("aria-hidden");
    expect(tag).not.toContain("focusable");
  });

  it("size와 strokeWidth를 바꾸고 나머지 SVG 속성은 그대로 넘긴다", () => {
    const tag = rootTag(
      renderToStaticMarkup(
        <XIcon size={24} strokeWidth={1.5} className="text-danger" data-testid="close" />,
      ),
    );
    expect(tag).toContain('width="24"');
    expect(tag).toContain('height="24"');
    expect(tag).toContain('stroke-width="1.5"');
    expect(tag).toContain('class="text-danger"');
    expect(tag).toContain('data-testid="close"');
  });
});
