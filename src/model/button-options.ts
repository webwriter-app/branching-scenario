import type { MsgFn } from "@lit/localize";

type Texts = { msg: MsgFn };

const choice = (value: string, label: (widget: Texts) => string) => ({ value, label });

/** Editor options shared by the gamebook button widgets. */
export const buttonOptions = {
  name: { type: String, label: (widget: Texts) => widget.msg("Title") },
  size: {
    type: "select" as const,
    label: (widget: Texts) => widget.msg("Size"),
    options: [
      choice("small", (widget) => widget.msg("Small")),
      choice("medium", (widget) => widget.msg("Medium")),
      choice("large", (widget) => widget.msg("Large")),
    ],
  },
  variant: {
    type: "select" as const,
    label: (widget: Texts) => widget.msg("Variant"),
    options: [
      choice("default", (widget) => widget.msg("Default")),
      choice("text", (widget) => widget.msg("Text")),
      choice("primary", (widget) => widget.msg("Primary")),
      choice("success", (widget) => widget.msg("Success")),
      choice("neutral", (widget) => widget.msg("Neutral")),
      choice("warning", (widget) => widget.msg("Warning")),
      choice("danger", (widget) => widget.msg("Danger")),
    ],
  },
  pill: { type: Boolean, label: (widget: Texts) => widget.msg("Rounded") },
  outline: { type: Boolean, label: (widget: Texts) => widget.msg("Outline") },
  width: {
    type: Number,
    control: "range" as const,
    min: 10,
    max: 100,
    step: 1,
    unit: "%",
    label: (widget: Texts) => widget.msg("Width"),
  },
  alignment: {
    type: "select" as const,
    label: (widget: Texts) => widget.msg("Alignment"),
    options: [
      choice("flex-start", (widget) => widget.msg("Left")),
      choice("center", (widget) => widget.msg("Center")),
      choice("flex-end", (widget) => widget.msg("Right")),
    ],
  },
};
