import { css } from "lit";

export default css`
  #selected-node-details {
    height: 100%;
    width: 100%;

    box-sizing: border-box;
    border-radius: 0px 0px 8px 8px;

    font-family: "Roboto", sans-serif;
    font-size: 18px;
    background-color: white;
  }

  .no-node-selected {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #a7a7a7;
    padding: 30px;
    background-color: white;
    height: 100%;
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

  .div-title {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .subtitle {
    font-family: "Roboto", sans-serif;
    font-size: 12px;
    color: gray;
    margin: 0px;
    padding: 0px;
  }

  .last-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: auto;
  }
`;
