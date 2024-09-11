import { css } from "lit";

export default css`
  .popup-node-details {
    width: auto;
    height: auto;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    border-radius: 0px 0px 8px 8px;

    background-color: white;
    box-sizing: border-box;
  }

  .preview {
    width: 100%;
    height: auto;

    box-sizing: border-box;

    background-color: white;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .page {
    box-sizing: border-box;
    width: 100%;
    height: auto;

    color: black;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .overlay {
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    color: white;
    z-index: 1; /* Ensure the overlay is above other content */
    padding: 10px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    background-color: rgba(0, 0, 0, 0.25);
  }

  .dialog {
    height: auto;
    border-radius: 3px;
    background-color: white;
    width: 100%;
    color: black;
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
`;
