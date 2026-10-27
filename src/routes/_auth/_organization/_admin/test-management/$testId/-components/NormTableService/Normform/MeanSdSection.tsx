import { useState } from "react";
import { toNum } from "../norm-utils";
import type { NormTargetScoreType } from "../../../../-api/test-definitions.type";
import { TARGET_LABEL } from "./constants";
import { Input, Label } from "./ui";
import ConversionTester from "./ConversionTester";

interface Props {
  defaultMean: string;
  defaultSd: string;
  target: NormTargetScoreType | null;
}

export default function MeanSdSection({
  defaultMean,
  defaultSd,
  target,
}: Props) {
  const [mean, setMean] = useState(defaultMean);
  const [sd, setSd] = useState(defaultSd);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label
            htmlFor="norm-mean"
            required
            tooltip="Rata-rata skor mentah kelompok pembanding."
          >
            Rata-rata (mean)
          </Label>
          <Input
            id="norm-mean"
            name="mean"
            type="number"
            step="any"
            value={mean}
            onChange={(e) => setMean(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Label
            htmlFor="norm-sd"
            required
            tooltip="Simpangan baku skor mentah kelompok pembanding. Harus lebih dari 0."
          >
            Simpangan baku (SD)
          </Label>
          <Input
            id="norm-sd"
            name="sd"
            type="number"
            step="any"
            value={sd}
            onChange={(e) => setSd(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <p className="text-xs text-text-secondary">
        Skor mentah diubah menjadi z-score. Cara z-score menjadi{" "}
        {target ? (TARGET_LABEL[target] ?? target) : "skor tujuan"} ditentukan
        oleh scorer, bukan oleh norma ini.
      </p>

      <ConversionTester
        compute={(n) => {
          const m = toNum(mean);
          const s = toNum(sd);
          return {
            text:
              m !== null && s !== null && s > 0
                ? `z = ${((n - m) / s).toFixed(2)}`
                : "isi mean dan SD dulu",
            isGap: false,
          };
        }}
      />
    </div>
  );
}
