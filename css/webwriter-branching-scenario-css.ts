import { css } from "lit";

export default css`
  :host {
    width: 100%;
    height: fit-content;
    box-sizing: border-box;
    border: 1px solid #e4e4e4;
    overflow: hidden;
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

  //parts options

  :host(:not([contenteditable="true"]):not([contenteditable=""])) .author-only {
    display: none;
  }

  :host([contenteditable="true"]) .author-only,
  :host([contenteditable=""]) .author-only {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding-left: 10px;

    gap: 10px;
  }

  .author-only p {
    margin: 0px;
    font-weight: 500;
    font-size: 15px;
    box-sizing: border-box;

    /* border-bottom: 1.5px solid #52525b; */
    color: #52525b;
  }

  .author-only div {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-items: center;
    border-bottom: 2px solid #52525b;
    gap: 7px;
    padding-bottom: 10px;
  }

  .author-only sl-icon {
    color: #52525b;
  }
`;
