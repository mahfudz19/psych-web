import { blankRow, rowsFromEntries, toNum, type DraftRow } from "../norm-utils";
import type { NormTable } from "../../../../-api/test-definitions.type";
import type { DraftCutoff } from "./types";

export type RowField =
  "rawMin" | "rawMax" | "standard" | "category" | "percentile";

export const hasData = (rows: DraftRow[]) =>
  rows.some(
    (r) => r.rawMin || r.rawMax || r.standard || r.category || r.percentile,
  );

export type RowsAction =
  | { type: "add" }
  | { type: "set"; index: number; field: RowField; value: string }
  | { type: "remove"; index: number }
  | { type: "replace"; rows: DraftRow[] }
  | { type: "append"; rows: DraftRow[] };

export function rowsReducer(state: DraftRow[], action: RowsAction): DraftRow[] {
  switch (action.type) {
    case "add": {
      const last = state[state.length - 1];
      const lastMax = last ? toNum(last.rawMax) : null;
      return [
        ...state,
        { ...blankRow(), rawMin: lastMax !== null ? String(lastMax + 1) : "" },
      ];
    }
    case "set":
      return state.map((r, i) =>
        i === action.index ? { ...r, [action.field]: action.value } : r,
      );
    case "remove":
      return state.length <= 1
        ? [blankRow()]
        : state.filter((_, i) => i !== action.index);
    case "replace":
      return action.rows;
    case "append":
      return [...state.filter((r) => hasData([r])), ...action.rows];
  }
}

export const initRows = (norm?: NormTable): DraftRow[] =>
  norm && norm.entries.length > 0
    ? rowsFromEntries(norm.entries)
    : [blankRow()];

// ---------------------------------------------------------------------------
// CUTOFFS
// ---------------------------------------------------------------------------

export type CutoffsAction =
  | { type: "add" }
  | { type: "set"; index: number; field: keyof DraftCutoff; value: string }
  | { type: "remove"; index: number };

export function cutoffsReducer(
  state: DraftCutoff[],
  action: CutoffsAction,
): DraftCutoff[] {
  switch (action.type) {
    case "add":
      return [...state, { from: "", to: "", label: "" }];
    case "set":
      return state.map((c, i) =>
        i === action.index ? { ...c, [action.field]: action.value } : c,
      );
    case "remove":
      return state.filter((_, i) => i !== action.index);
  }
}

export const initCutoffs = (norm?: NormTable): DraftCutoff[] =>
  (norm?.categoryCutoffs ?? []).map((c) => ({
    from: String(c.from),
    to: String(c.to),
    label: c.label,
  }));
