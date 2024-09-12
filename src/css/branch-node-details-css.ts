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
    font-family: "Roboto", sans-serif;
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

  .horizontalStack {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    //padding: 10px;
    //border-bottom: 1px solid #d4d4d8;
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

  sl-divider {
    --color: #0084c7;
    --width: 2px;
    margin: 0px;
  }

  .rule-divider {
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
`;
