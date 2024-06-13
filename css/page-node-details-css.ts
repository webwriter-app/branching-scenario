import { css } from "lit";

export default css`
  .page-node-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .controls {
    border-top: 1px solid #e4e4e4;
    border-bottom: 1px solid #e4e4e4;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center; /* Center items vertically */
    gap: 10px; /* Adjust the value to your desired spacing */
    /* padding-left: 15px;
    padding-right: 15px; */
    padding-top: 10px;
    padding-bottom: 10px;
    margin-bottom: 10px;
    font-family: "Roboto", sans-serif;
    font-size: 20px;
    font-weight: bold;
  }

  .page {
    height: auto;
    background-color: white;
    padding: 10px;
    border: 1px solid #d4d4d8;
  }

  .title-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 15px;
    padding: 5px;
    height: 50px;
    width: 100%;
  }

  .div-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    height: 100%; /* Remove the fixed height */
    aspect-ratio: 1;
  }

  .svg {
    display: block;
    fill: black;
    width: 50%;
    height: 50%;
    aspect-ratio: 1; /* Ensure the svg is square */
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
    color: black;
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
    padding: 0;
    margin: 0;
  }
`;
