import { css } from "lit";

export default css`
  :host * {
    box-sizing: border-box;
  }

  .titlebar {
    display: flex;
    justify-content: left;
    align-items: center;
    padding-right: 10px;
    padding-left: 10px;
    padding-top: 10px;
  }

  .title {
    font-size: 16px;
    font-weight: bold;
    color: #505055;
    margin: 0px;
    margin-right: auto;
  }

  .ruleList {
    display: flex;
    flex-direction: column;
    padding: 10px;
  }

  .ruleItem {
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    gap: 10px;
    width: 100%;
  }

  .ruleItem > *:not(.draggable, .minus, #index, #percent) {
    flex: 1 !important; /* Make each child (except .draggable) take up equal space */
    min-width: 0; /* Prevent overflow issues */
    flex-grow: 1 !important;
  }

  sl-select::part(listbox) {
    width: 250px;
    height: 100px;
  }

  .no-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80px;
    background-color: #fbfbfb;
    color: darkgray;
  }

  .draggable {
    cursor: row-resize;
  }

  .rule-divider {
    --color: #0084c7;
    --width: 2px;
    margin: 0px;
    transition: opacity 0s ease-in-out;
  }

  .shadow-effect {
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  }

  .dragging {
    opacity: 0.5;
    border: 2px dashed #ccc;
  }

  .rule-divider {
    transition: visibility 0.2s ease-in-out;
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
  }

  .div-title {
    display: flex;
    flex-direction: column;
    flex: 1; /* This makes the node-connection-list elements take up remaining space evenly */
    margin-right: auto;
  }

  .subtitle {
    font-size: 12px;
    color: gray;
    margin: 0px;
    padding: 0px;
  }

  .inputOutputControls {
    max-width: 190px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-items: center;
  }

  node-connection-list {
    height: 100%; /* Adjust as needed */
    width: 100%;
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

  .div-icon-branch sl-icon {
    width: 42px;
    height: 42px;
    color: white;
  }
`;
