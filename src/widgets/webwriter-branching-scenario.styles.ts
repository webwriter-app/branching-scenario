import { css } from "lit";

export default css`
  :host {
    width: 100%;
    height: fit-content;
    box-sizing: border-box;

    overflow: hidden;
    display: flex;
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
`;
