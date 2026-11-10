import type { ReactNode } from "react";
import type {
  AnswerResponse,
  ExamItem,
  ExamItemOption,
} from "../-api/exam.types";
import {
  UNSUPPORTED_TYPES,
  isAnswered,
  numConstraint,
} from "../-api/exam.types";

interface WidgetProps {
  item: ExamItem;
  value: AnswerResponse | null | undefined;
  onChange: (v: AnswerResponse | null) => void;
  disabled?: boolean;
}

const optionLabel = (o: ExamItemOption) => o.label ?? o.key;
const sortedOptions = (item: ExamItem) =>
  [...item.options].sort((a, b) => a.order - b.order);
const keysOf = (v: AnswerResponse | null | undefined): string[] =>
  v && "keys" in v ? v.keys : [];

const cardClass = (active: boolean) =>
  `flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
    active
      ? "border-primary-main bg-primary-main/5"
      : "border-divider bg-bg-default hover:border-primary-main/50"
  }`;

function OptionContent({ option }: { option: ExamItemOption }) {
  return (
    <span className="flex items-center gap-3 min-w-0">
      {option.imageUrl && (
        <img
          src={option.imageUrl}
          alt=""
          loading="lazy"
          className="h-16 w-16 shrink-0 rounded-lg border border-divider object-contain bg-white"
        />
      )}
      {(option.label || !option.imageUrl) && (
        <span className="text-sm font-medium text-text-primary">
          {optionLabel(option)}
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// WIDGET PER TIPE
// ---------------------------------------------------------------------------

/** SINGLE_CHOICE, TRUE_FALSE, YES_NO, FORCED_CHOICE */
function ChoiceWidget({ item, value, onChange, disabled }: WidgetProps) {
  const selected = keysOf(value)[0];
  return (
    <div className="space-y-3" role="radiogroup" aria-label="Pilihan jawaban">
      {sortedOptions(item).map((o) => (
        <label key={o.key} className={cardClass(selected === o.key)}>
          <input
            type="radio"
            name={`item-${item.id}`}
            checked={selected === o.key}
            disabled={disabled}
            onChange={() => onChange({ keys: [o.key] })}
            className="accent-primary-main"
          />
          <OptionContent option={o} />
        </label>
      ))}
    </div>
  );
}

function LikertWidget({ item, value, onChange, disabled }: WidgetProps) {
  const selected = keysOf(value)[0];
  const options = sortedOptions(item);
  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${Math.min(options.length, 5)}, minmax(0, 1fr))`,
      }}
      role="radiogroup"
      aria-label="Skala jawaban"
    >
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={selected === o.key}
          disabled={disabled}
          onClick={() => onChange({ keys: [o.key] })}
          className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-3 text-center transition-all ${
            selected === o.key
              ? "border-primary-main bg-primary-main/10 text-primary-main"
              : "border-divider bg-bg-default text-text-primary hover:border-primary-main/50"
          }`}
        >
          <span className="text-base font-bold">{o.key}</span>
          <span className="text-[11px] leading-tight text-text-secondary">
            {optionLabel(o)}
          </span>
        </button>
      ))}
    </div>
  );
}

function MultiChoiceWidget({ item, value, onChange, disabled }: WidgetProps) {
  const selected = keysOf(value);
  const max = numConstraint(item, "maxSelect");
  const min = numConstraint(item, "minSelect");

  const toggle = (key: string) => {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    onChange(next.length > 0 ? { keys: next } : null);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-secondary">
        {min && max && min === max
          ? `Pilih ${min} jawaban.`
          : `Pilih ${min ?? 1}${max ? ` sampai ${max}` : " atau lebih"} jawaban.`}
      </p>
      {sortedOptions(item).map((o) => {
        const checked = selected.includes(o.key);
        const blocked = !checked && max !== null && selected.length >= max;
        return (
          <label
            key={o.key}
            className={`${cardClass(checked)} ${blocked ? "opacity-50" : ""}`}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled || blocked}
              onChange={() => toggle(o.key)}
              className="accent-primary-main"
            />
            <OptionContent option={o} />
          </label>
        );
      })}
    </div>
  );
}

function MostLeastWidget({ item, value, onChange, disabled }: WidgetProps) {
  const current = value && "most" in value ? value : { most: "", least: "" };

  const pick = (kind: "most" | "least", key: string) => {
    const other = kind === "most" ? "least" : "most";
    // Satu opsi tidak boleh sekaligus "paling" dan "paling tidak".
    onChange({
      ...current,
      [kind]: key,
      [other]: current[other] === key ? "" : current[other],
    } as AnswerResponse);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[minmax(0,1fr)_72px_72px] gap-2 px-2 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
        <span>Pernyataan</span>
        <span className="text-center">Paling</span>
        <span className="text-center">Paling tidak</span>
      </div>
      {sortedOptions(item).map((o) => (
        <div
          key={o.key}
          className="grid grid-cols-[minmax(0,1fr)_72px_72px] items-center gap-2 rounded-2xl border border-divider bg-bg-default p-3"
        >
          <OptionContent option={o} />
          <label className="flex justify-center">
            <input
              type="radio"
              name={`most-${item.id}`}
              checked={current.most === o.key}
              disabled={disabled}
              onChange={() => pick("most", o.key)}
              aria-label={`Paling: ${optionLabel(o)}`}
              className="accent-primary-main"
            />
          </label>
          <label className="flex justify-center">
            <input
              type="radio"
              name={`least-${item.id}`}
              checked={current.least === o.key}
              disabled={disabled}
              onChange={() => pick("least", o.key)}
              aria-label={`Paling tidak: ${optionLabel(o)}`}
              className="accent-primary-main"
            />
          </label>
        </div>
      ))}
    </div>
  );
}

function RankingWidget({ item, value, onChange, disabled }: WidgetProps) {
  const options = sortedOptions(item);
  const committed = value && "ranking" in value ? value.ranking : null;
  const order = committed ?? options.map((o) => o.key);
  const byKey = new Map(options.map((o) => [o.key, o]));

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ranking: next });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-secondary">
        Urutkan dari yang paling sesuai (1) sampai yang paling tidak sesuai.
        {!committed &&
          " Ubah urutan, atau tekan Konfirmasi jika urutan awal sudah sesuai."}
      </p>
      <ol className="space-y-2">
        {order.map((key, i) => {
          const option = byKey.get(key);
          if (!option) return null;
          return (
            <li
              key={key}
              className="flex items-center gap-3 rounded-2xl border border-divider bg-bg-default p-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-main/10 text-xs font-bold text-primary-main">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <OptionContent option={option} />
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={disabled || i === 0}
                  onClick={() => move(i, -1)}
                  aria-label={`Naikkan ${optionLabel(option)}`}
                  className="rounded-lg border border-divider px-2 py-1 text-xs disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={disabled || i === order.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label={`Turunkan ${optionLabel(option)}`}
                  className="rounded-lg border border-divider px-2 py-1 text-xs disabled:opacity-40"
                >
                  ↓
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      {!committed && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange({ ranking: order })}
          className="rounded-xl bg-primary-main px-4 py-2 text-xs font-bold text-primary-contrast"
        >
          Konfirmasi urutan ini
        </button>
      )}
    </div>
  );
}

/** NUMERIC_INPUT dan TEXT_INPUT */
function InputWidget({ item, value, onChange, disabled }: WidgetProps) {
  const numeric = item.type === "NUMERIC_INPUT";
  const current = value && "value" in value ? value.value : "";
  const maxLength = numConstraint(item, "maxLength");
  const min = numConstraint(item, "min");
  const max = numConstraint(item, "max");

  return (
    <div className="space-y-2">
      <input
        type="text"
        inputMode={numeric ? "decimal" : "text"}
        value={current}
        disabled={disabled}
        maxLength={maxLength ?? undefined}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : { value: e.target.value })
        }
        placeholder={numeric ? "Ketik angka jawaban" : "Ketik jawaban Anda"}
        aria-label="Jawaban"
        className="w-full rounded-2xl border border-divider bg-bg-default px-4 py-3 text-base text-text-primary focus:border-primary-main focus:outline-none focus:ring-2 focus:ring-primary-main/20"
      />
      {numeric && (min !== null || max !== null) && (
        <p className="text-xs text-text-secondary">
          Rentang jawaban: {min ?? "bebas"} sampai {max ?? "bebas"}.
        </p>
      )}
    </div>
  );
}

function UnsupportedWidget({ item }: WidgetProps) {
  return (
    <div className="rounded-2xl border border-dashed border-divider bg-bg-default p-4 text-sm text-text-secondary">
      Soal bertipe <span className="font-mono">{item.type}</span> belum bisa
      dikerjakan di halaman ini. Soal ini akan dilewati.
    </div>
  );
}

function renderWidget(props: WidgetProps): ReactNode {
  switch (props.item.type) {
    case "SINGLE_CHOICE":
    case "TRUE_FALSE":
    case "YES_NO":
    case "FORCED_CHOICE":
      return <ChoiceWidget {...props} />;
    case "LIKERT":
      return <LikertWidget {...props} />;
    case "MULTI_CHOICE":
      return <MultiChoiceWidget {...props} />;
    case "MOST_LEAST":
      return <MostLeastWidget {...props} />;
    case "RANKING":
      return <RankingWidget {...props} />;
    case "NUMERIC_INPUT":
    case "TEXT_INPUT":
      return <InputWidget {...props} />;
    default:
      return <UnsupportedWidget {...props} />;
  }
}

// ---------------------------------------------------------------------------
// TAMPILAN SATU SOAL
// ---------------------------------------------------------------------------

interface ItemViewProps extends WidgetProps {
  /** Nomor yang ditampilkan ke peserta (urutan tampil, bukan `item.number`). */
  displayNumber: number;
}

export default function ItemView({ displayNumber, ...widget }: ItemViewProps) {
  const { item, value, onChange, disabled } = widget;
  const unsupported = UNSUPPORTED_TYPES.includes(item.type);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          Soal {displayNumber}
        </p>

        {item.content.text && (
          <p className="whitespace-pre-line text-base font-medium leading-relaxed text-text-primary">
            {item.content.text}
          </p>
        )}

        {item.content.images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {item.content.images.map((img) => (
              <figure key={img.label} className="space-y-1">
                <img
                  src={img.url}
                  alt={`Gambar ${img.label}`}
                  loading="lazy"
                  className="max-h-48 rounded-xl border border-divider bg-white object-contain"
                />
                <figcaption className="text-center text-[11px] font-bold text-text-secondary">
                  {img.label}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {item.content.audioUrl && (
          <audio controls src={item.content.audioUrl} className="w-full">
            Perangkat Anda tidak mendukung pemutar audio.
          </audio>
        )}
      </div>

      {renderWidget(widget)}

      {!unsupported && isAnswered(item, value) && !disabled && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs font-semibold text-text-secondary underline-offset-2 hover:text-error-main hover:underline"
        >
          Hapus jawaban
        </button>
      )}
    </div>
  );
}
