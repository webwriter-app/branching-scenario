import { css } from "lit";

export default css`
  .title-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 15px;

    width: 100%;
    height: 100px;
    padding: 20px;

    background-color: white;

    box-sizing: border-box;

    border-bottom: 1px solid #e4e4e4;
  }

  .div-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    height: 100%; /* Remove the fixed height */
    aspect-ratio: 1;
    background-color: #f7efff;
    border: 1px solid #c798ff;
  }

  .svg {
    width: 50%;
    height: 50%;
    aspect-ratio: 1; /* Ensure the svg is square */
    filter: brightness(0) saturate(100%) invert(70%) sepia(12%) saturate(6869%)
      hue-rotate(212deg) brightness(103%) contrast(102%);
  }

  .div-title {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .title {
    font-family: "Roboto", sans-serif;
    font-size: 16px;
    font-weight: bold;
    color: #c798ff;
    margin: 0px;
  }

  .subtitle {
    font-family: "Roboto", sans-serif;
    font-size: 12px;
    color: gray;
    margin: 0px;
  }

  .number {
    font-family: "Roboto", sans-serif;
    font-size: 14px;
    color: black;
    margin: 0px;
  }

  .last-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: auto;
  }

  .number-input {
    display: flex;
    flex-direction: column;
    justify-content: left;
    align-items: left;
  }

  .horizontal {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .icon-button {
    margin: 0;
  }

  .controls {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center; /* Center items vertically */
    gap: 10px; /* Adjust the value to your desired spacing */

    padding: 10px;

    font-weight: bold;

    border-bottom: 1px solid #e4e4e4;
  }

  .answersContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .answer {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding: 10px;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;

    background-color: #fafafb;
  }

  .answer sl-textarea {
    flex-grow: 1;
  }

  .question {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center; /* Center items vertically */

    padding: 10px;

    border-bottom: 1px solid #e4e4e4;

    background-color: #fafafb;
  }

  sl-select input {
    color: black;
    visibility: 100%;
    opacity: 1;
  }
`;
