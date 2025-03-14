import { css } from "lit";

export default css`
  .popup-node-detail-view {
    width: 100%;
    min-height: min-content;
    height: 100%;

    box-sizing: border-box;

    background-color: rgba(0, 0, 0, 0.25);
    padding: 10px;

    display: flex;
    flex-direction: column;

    align-items: center;
  }

  .preview {
    display: flex;
    flex-direction: column;

    align-items: center;

    width: 100%;
    height: auto;

    box-sizing: border-box;
  }

  .dialog {
    background-color: white;
    box-sizing: border-box;
    border: 1px solid #d4d4d8;
    width: 100%;
    height: auto;
    min-height: min-content;
    color: black;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    border-radius: 8px;
  }

  .header {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-items: center;
    padding-left: 4px;
    padding-right: 20px;
    padding-top: 10px;
    padding-bottom: 10px;
    width: 100%;
  }

  .page {
    box-sizing: border-box;

    width: 100%;
    height: auto;
    min-height: min-content;
    color: black;

    /* box-shadow: 0 2px 20px 2px #d0d0d0; */
  }

  sl-input {
    flex-grow: 1;
  }

  sl-input::part(base) {
    --sl-input-border-width: 0px;
    --sl-input-padding: 0px;
    /* Resembling the style in the picture */
    box-sizing: border-box;

    font-family: -apple-system, BlinkMacSystemFont, "Avenir Next", Avenir,
      "Nimbus Sans L", Roboto, "Noto Sans", "Segoe UI", Arial, Helvetica,
      "Helvetica Neue", sans-serif;
    font-feature-settings: normal;
    font-kerning: auto;
    font-optical-sizing: auto;
    font-size: 20px;
    font-size-adjust: none;
    font-stretch: 100%;
    font-style: normal;
    font-variant-alternates: normal;
    font-variant-caps: normal;
    font-variant-east-asian: normal;
    font-variant-ligatures: normal;
    font-variant-numeric: normal;
    font-variant-position: normal;
    font-variation-settings: normal;
    font-weight: 400;
    line-height: 28px;
    color: black;
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
