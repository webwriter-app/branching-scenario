import { css } from "lit";

export default css`
  /* :host {
    display: flex;
    box-sizing: border-box;
    outline: none;
    user-select: none;
  }

  ::after {
    user-select: none;
  }

  :host(.ww-beforeprint) {
    display: inline-block;
  }

  :host(.ww-selected) {
    //border: 2px solid orange;
    background-color: transparent;
  } */

  #widget {
    display: flex;
    flex-direction: column;

    width: 100%;
    box-sizing: border-box;

    border: 1px solid;
    border-color: #e4e4e4;
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
    z-index: 5;

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
    z-index: 5;

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

  .none {
    display: none;
  }

  sl-dialog::part(base) {
    position: absolute;
  }

  sl-dialog::part(overlay) {
    position: absolute;
  }

  quiz-container {
    position: unset !important; /* Use !important to override any inline styles */
  }

  #nodeEditor {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative; /* Ensure position relative for child positioning */
  }

  node-editor-controls-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1;
  }

  #drawflowEditorDiv {
    display: block;
    position: relative;
    width: 100%;
    height: 400px;

    border-bottom: 1px solid #e4e4e4; //You can adjust the thickness and color as needed
  }

  #drawflowEditorDiv ::selection {
    background: transparent;
    color: inherit;
  }

  drawflow-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0; /* Place background behind #drawflowEditorDiv */
  }

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
    border-bottom: 1.5px solid #52525b;
    gap: 7px;
    padding-bottom: 10px;
  }

  .author-only sl-icon {
    color: #52525b;
  }
`;
