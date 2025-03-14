import { css } from "lit";

export default css`
  :host {
    box-sizing: border-box;
    height: fit-content;

    background-color: #fbfbfb;
    width: 100%;
  }

  :host * {
    box-sizing: border-box;
  }

  /* .selected-node {
  } */

  .no-node-selected {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    height: 100%;
    background-color: #fbfbfb;
    color: darkgray;
  }

  .title-bar {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-items: center;

    box-sizing: border-box;
    width: 100%;
    height: 150px;

    gap: 15px;
    padding: 15px;

    background-color: white;
    border-bottom: 1px solid #d4d4d8;
    /* 
    border-top-left-radius: 8px;
    border-top-right-radius: 8px; */
  }

  .inputOutputControls {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-items: center;
  }

  node-connection-list {
    height: 100%; /* Adjust as needed */
    flex: 1; /* This makes the node-connection-list elements take up remaining space evenly */
  }

  .div-title {
    display: flex;
    flex-direction: column;
  }

  .subtitle {
    font-size: 12px;
    color: gray;
    margin: 0px;
    padding: 0px;
  }

  .div-icon-popup {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    height: 65px; /* Remove the fixed height */
    aspect-ratio: 1;
    background-color: #9762b4;
  }

  .div-icon-page {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    height: 65px; /* Remove the fixed height */
    aspect-ratio: 1;
    background-color: #3077ba;
  }

  .div-icon-branch {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    height: 65px; /* Remove the fixed height */
    aspect-ratio: 1;
    background-color: #05ae9e;
  }

  .div-icon-popup sl-icon,
  .div-icon-page sl-icon,
  .div-icon-branch sl-icon {
    width: 42px;
    height: 42px;
    color: white;
  }
`;
