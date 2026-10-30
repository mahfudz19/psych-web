import { useState } from "react";
import { parsePaste, type DraftRow } from "../norm-utils";
import { hasData, type RowsAction } from "./state";
import { Button, Textarea } from "./ui";

interface Props {
  rows: DraftRow[];
  dispatch: (action: RowsAction) => void;
  onApplied: () => void;
}

export default function PastePanel({ rows, dispatch, onApplied }: Props) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const apply = (replace: boolean) => {
    const result = parsePaste(text);
    setErrors(result.errors);
    if (result.rows.length === 0) return;
    if (
      replace &&
      hasData(rows) &&
      !window.confirm("Isi tabel saat ini akan diganti. Lanjutkan?")
    ) {
      return;
    }
    dispatch({ type: replace ? "replace" : "append", rows: result.rows });
    if (result.errors.length === 0) onApplied();
  };

  return (
    <div className="space-y-2 rounded-xl border border-divider p-3">
      <p className="text-xs text-text-secondary">
        Satu baris per konversi. Kolom: skor mentah (24 atau 23-24), skor
        standar (14 atau 17-20), kategori (opsional), persentil (opsional).
        Pisahkan dengan tab (salinan dari spreadsheet), titik koma, atau koma.
        Baris judul di atas diabaikan.
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        spellCheck={false}
        placeholder={"29-30\t17-20\tBS\n27-28\t16\tB"}
        className="font-mono"
      />
      {errors.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-4 text-xs text-error-main">
          {errors.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => apply(true)}>
          Ganti isi tabel
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outlined"
          onClick={() => apply(false)}
        >
          Tambahkan ke tabel
        </Button>
      </div>
    </div>
  );
}
