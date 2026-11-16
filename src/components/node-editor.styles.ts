import { css } from "lit";

export default css`
  :host {
    height: 100%;
    width: 100%;
  }

  :host * {
    box-sizing: border-box;
  }

  #nodeEditor {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative; /* Ensure position relative for child positioning */
  }

  node-editor-toolbar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1;
  }

  .zoomControls {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-items: center;

    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 0;

    padding: 0px;

    background-color: rgba(255, 255, 255, 0.9);

    box-sizing: border-box;

    border-radius: 8px;
    border: 1px solid #e4e4e7;
  }

  .zoomControls.sl-icon-button::part(base) {
    padding: 0px;
  }

  .zoomValue {
    box-sizing: border-box;

    opacity: 0;

    float: right;
    position: absolute;
    bottom: 40px;
    right: 20px;
    z-index: 0;

    font-size: 12px;
  }

  .deleteButton {
    position: absolute;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 2px solid #b94543;
    border-radius: 50%;
    background: #b94543;
    color: white;
    cursor: pointer;
  }

  sl-dialog::part(base) {
    position: absolute;
  }

  sl-dialog::part(overlay) {
    position: absolute;
  }
`;
