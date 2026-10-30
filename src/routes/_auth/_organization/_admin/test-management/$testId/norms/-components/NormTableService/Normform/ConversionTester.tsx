import { useState } from "react";
import { toNum } from "../norm-utils";
import { Input } from "./ui";

export interface TestResult {
  text: string;
  isGap: boolean;
}

interface Props {
  compute: (raw: number) => TestResult;
}

export default function ConversionTester({ compute }: Props) {
  const [raw, setRaw] = useState("");
  const n = toNum(raw);
  const result = n === null ? null : compute(n);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-black/3 px-3 py-2 text-sm dark:bg-white/5">
      <span className="font-medium">Uji konversi</span>
      <span>skor mentah</span>
      <Input
        type="number"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        aria-label="Skor mentah untuk diuji"
        size="sm"
        className="w-20"
      />
      {result && (
        <>
          <span>menjadi</span>
          <span className={result.isGap ? "text-yellow-700" : "font-medium"}>
            {result.text}
          </span>
        </>
      )}
    </div>
  );
}
