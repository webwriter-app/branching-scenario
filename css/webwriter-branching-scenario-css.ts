import { css } from "lit";

export default css`
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
    gap: 10px; /* Adjust the value to your desired spacing */
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
    gap: 10px;

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
    gap: 10px;

    box-sizing: border-box;

    float: right;
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 5;

    padding: 5px 10px;

    color: white;
    background: #555555;

    border-radius: 4px;
    border-right: 1px solid white;
  }

  .zoomValue {
    box-sizing: border-box;

    opacity: 0;

    float: right;
    position: absolute;
    bottom: 65px;
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

  #selected-node-details {
    height: 100%;
    width: 100%;

    box-sizing: border-box;
    border-radius: 0px 0px 8px 8px;

    font-family: "Roboto", sans-serif;
    font-size: 18px;
  }

  #no-node-selected {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #a7a7a7;
    padding: 30px;
  }

  .dialog {
    font-family: "Roboto", sans-serif;
  }
`;
