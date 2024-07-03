import { css } from "lit";

export default css`
  .page-node-details {
    width: auto;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    border-radius: 0px 0px 8px 8px;

    background-color: white;
    box-sizing: border-box;
  }

  .controls {
    border-top: 1px solid #e4e4e4;
    border-bottom: 1px solid #e4e4e4;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center; /* Center items vertically */
    gap: 10px; /* Adjust the value to your desired spacing */

    font-family: "Roboto", sans-serif;
    font-size: 20px;
    font-weight: bold;

    width: 100%;
    background-color: white;

    padding: 15px;
    box-sizing: border-box;
  }

  .pageDiv {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;

    box-sizing: border-box;

    background-color: #fafafb;

    padding: 10px;
  }

  .page {
    background-color: white;
    box-sizing: border-box;
    border: 1px solid #d4d4d8;
    width: 100%;
    min-height: 800px;
    height: auto;
    color: black;
    padding: 20px;
  }

  .title-bar {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-items: center;
    gap: 15px;

    width: 100%;
    height: 150px;
    padding: 20px;

    background-color: white;

    box-sizing: border-box;
  }

  .div-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #3077ba;
    border-radius: 8px;
    height: 65px; /* Remove the fixed height */
    aspect-ratio: 1;
    background-color: #f4faff;
    color: #3077ba;
  }

  .div-icon sl-icon {
    width: 60%;
    height: 60%;
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
    color: #3077ba;
    margin: 0px;
  }

  .subtitle {
    font-family: "Roboto", sans-serif;
    font-size: 12px;
    color: gray;
    margin: 0px;
    padding: 0px;
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

  .control-node {
    display: flex;
    flex-direction: column;
    height: 120px;
    justify-content: left;
    align-items: left;
  }

  .horizontal {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #d4d4d8;
  }

  .icon-button {
    margin: 0;
  }

  .horizontalStack {
    display: flex;
    flex-direction: column;
    height: 80px;
    width: 150px;
    overflow-y: auto;
    padding-right: 10px;
  }

  .horizontalStack::-webkit-scrollbar {
    width: 6px; /* Width of the vertical scrollbar */
  }

  .horizontalStack::-webkit-scrollbar-thumb {
    background-color: darkgrey; /* Color of the scrollbar thumb */
    border-radius: 10px; /* Roundness of the scrollbar thumb */
  }

  .horizontalStack::-webkit-scrollbar-track {
    background: none; /* Color of the scrollbar track */
  }

  .horizontalStack p {
    padding: 0px;
    margin: 0px;
    font-size: 12px;
  }
`;
