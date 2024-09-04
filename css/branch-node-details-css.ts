import { css } from "lit";

export default css`
  :host {
    /* height: 100%; */
  }

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
    padding: 10px;
    border-bottom: 1px solid #d4d4d8;
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
`;
