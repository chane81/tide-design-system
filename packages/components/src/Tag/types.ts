import type { ListState } from "react-stately";

export type CollectionNode = ListState<object>["collection"] extends Iterable<infer N> ? N : never;
