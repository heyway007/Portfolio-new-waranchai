import type { LocalizedText } from "../../../lib/content/types";

export function BilingualField({
  label,
  value,
  multiline = false,
  onChange,
}: {
  label: string;
  value: LocalizedText;
  multiline?: boolean;
  onChange(value: LocalizedText): void;
}) {
  const Input = multiline ? "textarea" : "input";
  return (
    <fieldset className="bilingual-field">
      <legend>{label}</legend>
      <label>
        <span>English</span>
        <Input
          value={value.en}
          rows={multiline ? 4 : undefined}
          onChange={(event) => onChange({ ...value, en: event.target.value })}
        />
      </label>
      <label>
        <span>ภาษาไทย</span>
        <Input
          value={value.th}
          rows={multiline ? 4 : undefined}
          onChange={(event) => onChange({ ...value, th: event.target.value })}
        />
      </label>
    </fieldset>
  );
}

