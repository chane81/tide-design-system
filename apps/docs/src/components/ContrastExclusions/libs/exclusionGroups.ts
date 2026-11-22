import type { ContrastExclusion } from "@tide-design/foundation";

/** 이유가 같은 제외 Token 묶음 */
export interface ExclusionGroup {
  readonly tokens: readonly ContrastExclusion["token"][];
  /** 이유의 첫 문장. 나머지는 견본이 보여 준다. */
  readonly summary: string;
}

/** 이유가 같은 Token을 처음 나온 순서대로 한 묶음으로 모은다. */
export function groupExclusions(exclusions: readonly ContrastExclusion[]): ExclusionGroup[] {
  const groups = new Map<string, ContrastExclusion["token"][]>();
  for (const { token, reason } of exclusions) {
    const tokens = groups.get(reason) ?? [];
    tokens.push(token);
    groups.set(reason, tokens);
  }

  return [...groups].map(([reason, tokens]) => ({ tokens, summary: firstSentence(reason) }));
}

/** 괄호 밖에서 처음 나오는 「. 」까지의 첫 문장. 없으면 전체를 돌려준다. */
export function firstSentence(text: string): string {
  let depth = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "." && depth === 0 && (index === text.length - 1 || text[index + 1] === " ")) {
      return text.slice(0, index + 1);
    }
  }

  return text;
}
