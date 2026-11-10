import type { MsgFn } from "@lit/localize";

export function buttonOptions(msg: MsgFn) {
  const choice = (value: string, label: string) => ({ value, label: { _: label } });
  return {
    name: {type: String, label: {_: msg("Title")}},
    size: {
      type: "select" as const, label: {_: msg("Size")},
      options: [choice("small", msg("Small")), choice("medium", msg("Medium")), choice("large", msg("Large"))],
    },
    variant: {
      type: "select" as const, label: {_: msg("Variant")},
      options: [
        choice("default", msg("Default")), choice("text", msg("Text")), choice("primary", msg("Primary")),
        choice("success", msg("Success")), choice("neutral", msg("Neutral")), choice("warning", msg("Warning")),
        choice("danger", msg("Danger")),
      ],
    },
    pill: {type: Boolean, label: {_: msg("Rounded")}},
    outline: {type: Boolean, label: {_: msg("Outline")}},
    width: {type: Number, control: "range", min: 10, max: 100, step: 1, unit: "%", label: {_: msg("Width")}},
    alignment: {
      type: "select" as const, label: {_: msg("Alignment")},
      options: [choice("flex-start", msg("Left")), choice("center", msg("Center")), choice("flex-end", msg("Right"))],
    },
  };
}
