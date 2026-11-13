import * as icons from "@tide-design/icons";
import type { IconProps } from "@tide-design/icons";
import { type ReactElement, useDeferredValue, useId, useState } from "react";

import { iconIndex, importStatement, searchIcons } from "./libs/iconSearch";

// 아이콘 페이지의 검색 블록(문서 앱 전용, 배포하지 않음).
// 가상화 없이 결과를 모두 그린다(tide-v0 티켓 26). 검색어는 useDeferredValue로 늦춰 입력이 막히지 않게 한다.
// 색은 Tide Token 대신 글자색(currentColor)을 따른다. 문서 페이지 배경과 Theme 전환에 묶이지 않게 하려는 것이다.

const iconByName = icons as unknown as Record<string, (props: IconProps) => ReactElement>;

const styles = {
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "8px 12px",
    font: "inherit",
    border: "1px solid #767676",
    borderRadius: 6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
    gap: 8,
    padding: 0,
    margin: "12px 0 0",
    listStyle: "none",
  },
  button: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    width: "100%",
    minHeight: 88,
    padding: "16px 8px 12px",
    font: "inherit",
    fontSize: 12,
    color: "inherit",
    background: "transparent",
    border: "1px solid #d0d0d0",
    borderRadius: 6,
    cursor: "pointer",
    overflowWrap: "anywhere",
  },
} as const;

export function IconSearch(): ReactElement {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const deferredQuery = useDeferredValue(query);
  const results = searchIcons(iconIndex, deferredQuery);

  async function copy(name: string): Promise<void> {
    const statement = importStatement(name);
    try {
      await navigator.clipboard.writeText(statement);
      setStatus(`복사했습니다: ${statement}`);
    } catch {
      setStatus(`복사하지 못했습니다. 직접 복사하세요: ${statement}`);
    }
  }

  return (
    <section aria-label="아이콘 검색">
      <label htmlFor={inputId} style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
        이름이나 태그로 검색(영어)
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="예: arrow, home, close"
        autoComplete="off"
        style={styles.input}
      />
      <p role="status" style={{ margin: "8px 0 0", fontSize: 14 }}>
        {status ||
          (results.length === 0
            ? "찾는 아이콘이 없습니다. 다른 낱말이나 영어 태그로 검색해 보세요."
            : `${results.length.toLocaleString("ko-KR")}개. 아이콘을 누르면 import 문을 복사합니다.`)}
      </p>
      <ul style={styles.grid}>
        {results.map(({ name }) => {
          const Icon = iconByName[name];

          return (
            <li key={name}>
              <button type="button" onClick={() => void copy(name)} style={styles.button}>
                {Icon ? <Icon size={24} /> : null}
                <span>{name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
