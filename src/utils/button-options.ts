function choices(values: Array<[string, string, string]>) {
  return values.map(([value, en, de]) => ({value, label: {_: en, de}}));
}

export const buttonOptions = {
  name: {type: String, label: {_: "Title", de: "Titel"}},
  size: {type: "select" as const, label: {_: "Size", de: "Größe"},
    options: choices([["small", "Small", "Klein"], ["medium", "Medium", "Mittel"], ["large", "Large", "Groß"]])},
  variant: {type: "select" as const, label: {_: "Variant", de: "Variante"},
    options: choices([["default", "Default", "Standard"], ["text", "Text", "Text"], ["primary", "Primary", "Primär"], ["success", "Success", "Erfolg"], ["neutral", "Neutral", "Neutral"], ["warning", "Warning", "Warnung"], ["danger", "Danger", "Gefahr"]])},
  pill: {type: Boolean, label: {_: "Rounded", de: "Abgerundet"}},
  outline: {type: Boolean, label: {_: "Outline", de: "Umrandung"}},
  width: {type: Number, control: "range", min: 10, max: 100, step: 1, unit: "%", label: {_: "Width", de: "Breite"}},
  alignment: {type: "select" as const, label: {_: "Alignment", de: "Ausrichtung"},
    options: choices([["flex-start", "Left", "Links"], ["center", "Center", "Mitte"], ["flex-end", "Right", "Rechts"]])},
};
