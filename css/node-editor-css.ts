import { css } from "lit";

export default css`
  :host {
    height: 100%;
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

  node-editor-controls-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1;
  }

  drawflow-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1; //Place background behind #drawflowEditorDiv
  }

  #drawflowEditorDiv {
    flex-shrink: 0;
    position: relative;
    width: 100%;
    height: 350px;
  }

  #drawflowEditorDiv ::selection {
    background: transparent;
    color: inherit;
  }

  #zoomInBtn,
  #zoomOutBtn {
    color: white;
  }

  .zoomControls {
    display: flex;
    flex-direction: row;

    box-sizing: border-box;

    float: right;
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 1;

    padding: 0px;

    color: white;
    background-color: black;
    opacity: 70%;

    border-radius: 4px;
    border-right: 1px solid white;
  }

  .exportButton {
    float: right;
    position: absolute;
    bottom: 10px;
    left: 10px;
  }

  .zoomValue {
    box-sizing: border-box;

    opacity: 0;

    float: right;
    position: absolute;
    bottom: 55px;
    right: 10px;
    z-index: 1;

    padding-inline: 5px;
    padding-block: 0px;

    border-radius: 4px;

    color: white;
    background: #555555;

    font-size: 8px;
  }

  .zoomValue.fade-in-out {
    animation: opacityOn 2s normal forwards;
    animation-iteration-count: 1;
    animation-direction: alternate;
  }

  @keyframes opacityOn {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }

  .dialog {
    font-family: "Roboto", sans-serif;
  }

  sl-dialog::part(base) {
    position: absolute;
  }

  sl-dialog::part(overlay) {
    position: absolute;
  }
`;
