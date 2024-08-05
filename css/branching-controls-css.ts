import { css } from "lit";

export default css`
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
    user-select: none;

    background-color: rgba(255, 255, 255, 0.95);
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
`;
