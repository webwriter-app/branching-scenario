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

  .preview {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;

    box-sizing: border-box;

    background-color: white;

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

    box-shadow: 0 2px 20px 2px #d0d0d0;
  }

  .gamebookTitle {
    font-family: "Roboto", sans-serif;
    font-weight: 600;
    background-color: #f7f7f7;
    box-sizing: border-box;

    padding-top: 10px;
    padding-left: 10px;
    padding-bottom: 10px;

    height: auto;

    display: flex;
    align-items: center; /* Vertically center */
    justify-content: flex-start; /* Horizontally align at the start */

    width: 100%;
  }

  .pageTitle {
    font-family: "Roboto", sans-serif;
    font-size: 14px;

    background-color: #f7f7f7;

    height: auto;
    display: flex;
    align-items: center; /* Vertically center */
    justify-content: flex-start; /* Horizontally align at the start */
    box-sizing: border-box;

    width: 100%; /* Adjust width to account for padding */
    padding-left: 10px;
    padding-bottom: 10px;
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
    border-radius: 8px;
    height: 65px; /* Remove the fixed height */
    aspect-ratio: 1;
    background-color: #3077ba;
  }

  .div-icon sl-icon {
    width: 42px;
    height: 42px;
    color: white;
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
