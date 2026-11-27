import type { ReactNode } from "react";
import type {
  AnswerResponse,
  ExamItem,
  ExamItemOption,
  SectionInfo,
} from "../-api/exam.types";
import {
  UNSUPPORTED_TYPES,
  isAnswered,
  numConstraint,
} from "../-api/exam.types";
import Radio from "../../../../components/ui/Radio";
import type { SectionConfig } from "../../_organization/_admin/test-management/$testId/-components/SectionForm";

interface WidgetProps {
  item: ExamItem;
  value: AnswerResponse | null | undefined;
  onChange: (v: AnswerResponse | null) => void;
  disabled?: boolean;
  config?: SectionConfig;
}

const optionLabel = (o: ExamItemOption) => o.label ?? o.key;
const sortedOptions = (item: ExamItem) =>
  [...item.options].sort((a, b) => a.order - b.order);
const keysOf = (v: AnswerResponse | null | undefined): string[] =>
  v && "keys" in v ? v.keys : [];

const cardClass = (active: boolean, isHorizontal = false) =>
  `flex ${
    isHorizontal
      ? "flex-col items-center justify-center text-center"
      : "items-center"
  } gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
    active
      ? "border-primary-main bg-primary-main/5 ring-1 ring-primary-main/20"
      : "border-divider bg-bg-default hover:border-primary-main/50 hover:bg-bg-subtle/40"
  }`;

function OptionContent({
  option,
  isHorizontal = false,
}: {
  option: ExamItemOption;
  isHorizontal?: boolean;
}) {
  const hasImage = Boolean(option.imageUrl);
  const hasLabel = Boolean(option.label);

  return (
    <span
      className={`flex min-w-0 ${
        isHorizontal
          ? "flex-col items-center gap-2 text-center"
          : "items-center gap-3"
      }`}
    >
      {hasImage && (
        <img
          src={option.imageUrl!}
          alt={hasLabel ? option.label! : `Opsi ${option.key}`}
          loading="lazy"
          className={`shrink-0 rounded-xl border border-divider bg-white object-contain p-1 ${
            isHorizontal ? "max-h-32 w-full" : "h-20 w-20"
          }`}
        />
      )}
      {(hasLabel || !hasImage) && (
        <span className="text-sm font-medium leading-snug text-text-primary">
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
function ChoiceWidget({
  item,
  value,
  onChange,
  disabled,
  config,
}: WidgetProps) {
  const selected = keysOf(value)[0];
  const options = sortedOptions(item);
  const isHorizontal = config?.layout === "HORIZONTAL";

  return (
    <div
      className={
        isHorizontal
          ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
          : "space-y-2.5"
      }
      role="radiogroup"
      aria-label="Pilihan jawaban"
    >
      {options.map((o) => (
        <Radio
          key={o.key}
          name={`item-${item.id}`}
          checked={selected === o.key}
          disabled={disabled}
          onChange={() => onChange({ keys: [o.key] })}
          label={<OptionContent option={o} isHorizontal={isHorizontal} />}
          classNames={{ root: cardClass(selected === o.key, isHorizontal) }}
        />
      ))}
    </div>
  );
}

function LikertWidget({ item, value, onChange, disabled }: WidgetProps) {
  const selected = keysOf(value)[0];
  const options = sortedOptions(item);

  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-5"
      style={
        options.length < 5
          ? {
              gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
            }
          : undefined
      }
      role="radiogroup"
      aria-label="Skala jawaban"
    >
      {options.map((o) => {
        const active = selected === o.key;
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange({ keys: [o.key] })}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-3.5 text-center transition-all ${
              active
                ? "border-primary-main bg-primary-main/10 text-primary-main ring-1 ring-primary-main/20"
                : "border-divider bg-bg-default text-text-primary hover:border-primary-main/50"
            }`}
          >
            <span className="text-base font-bold">{o.key}</span>
            <span className="text-[11px] leading-tight text-text-secondary">
              {optionLabel(o)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MultiChoiceWidget({
  item,
  value,
  onChange,
  disabled,
  config,
}: WidgetProps) {
  const selected = keysOf(value);
  const max = numConstraint(item, "maxSelect");
  const min = numConstraint(item, "minSelect");
  const isHorizontal = config?.layout === "HORIZONTAL";

  const toggle = (key: string) => {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    onChange(next.length > 0 ? { keys: next } : null);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-text-secondary">
        {min && max && min === max
          ? `Pilih tepat ${min} jawaban.`
          : `Pilih ${min ?? 1}${max ? ` sampai ${max}` : " atau lebih"} jawaban.`}
        {max !== null && (
          <span className="ml-1 text-text-primary">
            ({selected.length}/{max} dipilih)
          </span>
        )}
      </p>
      <div
        className={
          isHorizontal
            ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
            : "space-y-2.5"
        }
      >
        {sortedOptions(item).map((o) => {
          const checked = selected.includes(o.key);
          const blocked = !checked && max !== null && selected.length >= max;
          return (
            <label
              key={o.key}
              className={`${cardClass(checked, isHorizontal)} ${
                blocked ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled || blocked}
                onChange={() => toggle(o.key)}
                className="h-4 w-4 shrink-0 accent-primary-main"
              />
              <OptionContent option={o} isHorizontal={isHorizontal} />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function MostLeastWidget({ item, value, onChange, disabled }: WidgetProps) {
  const current = value && "most" in value ? value : { most: "", least: "" };

  const pick = (kind: "most" | "least", key: string) => {
    const other = kind === "most" ? "least" : "most";
    onChange({
      ...current,
      [kind]: key,
      [other]: current[other] === key ? "" : current[other],
    } as AnswerResponse);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[minmax(0,1fr)_72px_72px] gap-2 px-3 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
        <span>Pernyataan</span>
        <span className="text-center">Paling</span>
        <span className="text-center">Paling tidak</span>
      </div>
      {sortedOptions(item).map((o) => {
        const isMost = current.most === o.key;
        const isLeast = current.least === o.key;
        const isPicked = isMost || isLeast;

        return (
          <div
            key={o.key}
            className={`grid grid-cols-[minmax(0,1fr)_72px_72px] items-center gap-2 rounded-2xl border p-3.5 transition-colors ${
              isPicked
                ? "border-primary-main/60 bg-primary-main/5"
                : "border-divider bg-bg-default"
            }`}
          >
            <OptionContent option={o} />
            <label className="flex cursor-pointer justify-center py-1">
              <input
                type="radio"
                name={`most-${item.id}`}
                checked={isMost}
                disabled={disabled}
                onChange={() => pick("most", o.key)}
                aria-label={`Paling: ${optionLabel(o)}`}
                className="h-4 w-4 accent-primary-main"
              />
            </label>
            <label className="flex cursor-pointer justify-center py-1">
              <input
                type="radio"
                name={`least-${item.id}`}
                checked={isLeast}
                disabled={disabled}
                onChange={() => pick("least", o.key)}
                aria-label={`Paling tidak: ${optionLabel(o)}`}
                className="h-4 w-4 accent-primary-main"
              />
            </label>
          </div>
        );
      })}
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
              className="flex items-center gap-3 rounded-2xl border border-divider bg-bg-default p-3 transition-colors hover:border-primary-main/40"
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
                  className="rounded-lg border border-divider px-2.5 py-1.5 text-xs font-semibold hover:border-primary-main hover:text-primary-main disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={disabled || i === order.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label={`Turunkan ${optionLabel(option)}`}
                  className="rounded-lg border border-divider px-2.5 py-1.5 text-xs font-semibold hover:border-primary-main hover:text-primary-main disabled:opacity-40"
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
          className="rounded-xl bg-primary-main px-4 py-2 text-xs font-bold text-primary-contrast transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Konfirmasi urutan ini
        </button>
      )}
    </div>
  );
}

/** NUMERIC_INPUT dan TEXT_INPUT */
function InputWidget({ item, value, onChange, disabled, config }: WidgetProps) {
  const numeric =
    item.type === "NUMERIC_INPUT" || config?.inputType === "NUMBER";
  const allowDecimals = config?.allowDecimals ?? true;
  const current = value && "value" in value ? value.value : "";
  const maxLength = numConstraint(item, "maxLength");
  const min = numConstraint(item, "min");
  const max = numConstraint(item, "max");

  const handleChange = (raw: string) => {
    if (raw === "") {
      onChange(null);
      return;
    }

    if (numeric) {
      const allowNegative = min === null || min < 0;
      const pattern = allowDecimals
        ? allowNegative
          ? /^-?\d*[.,]?\d*$/
          : /^\d*[.,]?\d*$/
        : allowNegative
          ? /^-?\d*$/
          : /^\d*$/;

      if (!pattern.test(raw)) return;
    }

    onChange({ value: raw });
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        inputMode={numeric ? (allowDecimals ? "decimal" : "numeric") : "text"}
        value={current}
        disabled={disabled}
        maxLength={maxLength ?? undefined}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={
          numeric
            ? allowDecimals
              ? "Ketik angka jawaban..."
              : "Ketik bilangan bulat..."
            : "Ketik jawaban Anda..."
        }
        aria-label="Jawaban"
        className="w-full rounded-2xl border border-divider bg-bg-default px-4 py-3 text-base text-text-primary focus:border-primary-main focus:outline-none focus:ring-2 focus:ring-primary-main/20 disabled:opacity-60"
      />
      {numeric && (min !== null || max !== null || !allowDecimals) && (
        <p className="text-xs text-text-secondary">
          {min !== null || max !== null
            ? `Rentang jawaban: ${min ?? "bebas"} sampai ${max ?? "bebas"}${!allowDecimals ? " (bilangan bulat)" : ""}.`
            : "Hanya menerima bilangan bulat (tanpa desimal)."}
        </p>
      )}
    </div>
  );
}

function UnsupportedWidget({ item }: WidgetProps) {
  return (
    <div className="rounded-2xl border border-dashed border-divider bg-bg-default p-4 text-sm text-text-secondary">
      Soal bertipe <span className="font-mono font-semibold">{item.type}</span>{" "}
      belum bisa dikerjakan di halaman ini. Soal ini akan dilewati.
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

interface ItemViewProps extends Omit<WidgetProps, "config"> {
  displayNumber: number;
  section: SectionInfo;
}

export default function ItemView(props: ItemViewProps) {
  const { displayNumber, section, ...widget } = props;
  const { item, value, onChange, disabled } = widget;
  const unsupported = UNSUPPORTED_TYPES.includes(item.type);
  const config = section.config as SectionConfig | undefined;

  return (
    <div className="space-y-6">
      {/* Area Stimulus Soal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-primary-main/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-main">
            Soal {displayNumber}
          </span>
        </div>

        {item.content.text && (
          <p className="whitespace-pre-line text-base font-medium leading-relaxed text-text-primary">
            {item.content.text}
          </p>
        )}

        {item.content.images.length > 0 && (
          <div
            className={`grid gap-3 ${
              item.content.images.length === 1
                ? "grid-cols-1"
                : "grid-cols-2 sm:grid-cols-3"
            }`}
          >
            {item.content.images.map((img) => (
              <figure
                key={img.label}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-divider bg-white p-3"
              >
                <img
                  src={img.url}
                  alt={`Gambar ${img.label}`}
                  loading="lazy"
                  className="max-h-64 w-auto object-contain"
                />
                {img.label && (
                  <figcaption className="text-center text-xs font-semibold text-text-secondary">
                    {img.label}
                  </figcaption>
                )}
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

      {/* Pemisah & Area Jawaban */}
      <div className="border-t border-divider pt-5">
        {renderWidget({ ...widget, config })}
      </div>

      {/* Aksi Hapus Jawaban */}
      {!unsupported && isAnswered(item, value) && !disabled && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs font-semibold text-text-secondary underline-offset-2 transition-colors hover:text-error-main hover:underline"
          >
            Hapus jawaban
          </button>
        </div>
      )}
    </div>
  );
}
