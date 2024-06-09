import { css } from "lit";

export default css`
  #widget {
    display: flex;
    flex-direction: column;
    width: 100%;
    border-radius: 8px;
    border: 1px solid;
    border-color: #e4e4e4;
  }

  .controls {
    border-bottom: 1px solid #e4e4e4;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center; /* Center items vertically */
    gap: 10px; /* Adjust the value to your desired spacing */
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

  .bar-zoom {
    float: right;
    position: absolute;
    bottom: 10px;
    right: 10px;

    display: flex;
    flex-direction: row;
    gap: 10px;

    color: white;
    padding: 5px 10px;
    background: #555555;
    border-radius: 4px;
    border-right: 1px solid white;
    z-index: 5;
  }

  #selected-node-details {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: 100%;
    padding: 20px;
    align-items: center; /* Center items vertically */
    gap: 10px;
    font-family: "Roboto", sans-serif;
    font-size: 18px;
    background-color: #fafafb;
    border-radius: 0px 0px 8px 8px;
  }

  .dialog {
    font-family: "Roboto", sans-serif;
  }

  .page {
    height: auto;
    background-color: white;
    padding: 10px;
    border: 1px solid;
    border-color: #e4e4e4;
  }
`;
