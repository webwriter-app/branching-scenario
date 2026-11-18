import { css } from "lit";

export default css`
  :host {
    display: block;
    width: 100%;
    min-width: 300px;
    max-width: 2100px;
    height: fit-content;
    box-sizing: border-box;
    overflow: hidden;
    color: var(--ww-text-color, inherit);
    font-family: var(--ww-font-family, inherit);
  }

  :host([contenteditable="true"]),
  :host([contenteditable=""]) {
    border: 1px solid #e4e4e4;
  }

  :host * {
    box-sizing: border-box;
  }

  sl-split-panel {
    height: auto; /* Allow height to be determined by content */
  }

  sl-split-panel sl-icon {
    color: darkgray;
  }

  sl-split-panel::part(divider) {
    z-index: 0;
    border-top: 1px solid #e4e4e4;
    box-sizing: border-box;
    background: white;
  }

  sl-dialog::part(base) {
    position: absolute;
  }

  sl-dialog::part(overlay) {
    position: absolute;
  }

  .print-note {
    display: none;
  }

  @media print {
    :host {
      overflow: visible;
      max-width: none;
      border: 0 !important;
    }

    /* The editor is a canvas with controls: paper gets a note instead. */
    :host([contenteditable="true"]) > split-view,
    :host([contenteditable=""]) > split-view,
    dialog {
      display: none !important;
    }

    :host([contenteditable="true"]) .print-note,
    :host([contenteditable=""]) .print-note {
      display: block;
      margin: 0;
      padding: 1rem;
      border: 1px solid currentColor;
    }
  }
`;
