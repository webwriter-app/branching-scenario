import { css } from "lit";

export default css`
  :host {
    width: 100%;
    height: fit-content;
    box-sizing: border-box;
    border: 1px solid #e4e4e4;
    overflow: hidden;
    display: flex;
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
    width: 100%;
  }

  .author-only .header p {
    margin: 0px;
    font-weight: 500;
    font-size: 15px;
    box-sizing: border-box;
    color: #52525b;
  }

  .author-only .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-items: center;
    border-bottom: 2px solid #52525b;
    gap: 7px;
    padding-bottom: 10px;
  }

  .author-only .searchBar {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-items: center;
    width: 100%;
    height: 65px;
  }

  .author-only .searchBar * {
    width: 100%;
  }

  .author-only sl-icon {
    color: #52525b;
  }

  .author-only .horizontalStack {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
    width: 100%;
  }

  sl-button.square {
    width: 42px; /* Set this value to whatever size you want */
    height: 42px; /* Same value as width to ensure it's a square */
  }

  p {
    margin: 0px;
    font-weight: 400;
    font-size: 15px;
    box-sizing: border-box;
    color: #52525b;
  }

  /* .author-only .horizontalStack .flex-item {
    flex: 1;
    width: 65px;
  }

  .author-only sl-button {
    flex: 0;
  } */

  sl-dialog::part(base) {
    position: absolute;
  }

  sl-dialog::part(overlay) {
    position: absolute;
  }
`;
