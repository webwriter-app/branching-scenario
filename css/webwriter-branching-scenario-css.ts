import { css } from "lit";

export default css`
  :host {
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
    border: 2px solid orange;
  }

  #widget {
    display: flex;
    flex-direction: column;

    width: 100%;
    box-sizing: border-box;

    border: 1px solid;
    border-color: #e4e4e4;
  }

  .controls {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center; /* Center items vertically */

    width: 100%;

    box-sizing: border-box;
    border-bottom: 1px solid #e4e4e4;

    padding-left: 15px;
    padding-right: 15px;
    padding-top: 10px;
    padding-bottom: 10px;

    font-family: "Roboto", sans-serif;
    font-size: 20px;
    font-weight: bold;
  }

  .controls .first-item {
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center; /* Center items vertically */

    margin-right: auto; // Push this item to the start
  }

  .iconButton {
    border: 1px solid #cecece;
    border-radius: 4px;
    font-size: auto;
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
    background: #555555;

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
`;
