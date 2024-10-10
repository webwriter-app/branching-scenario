import { css } from "lit";

export default css`
  :host * {
    box-sizing: border-box;
  }

  :host {
    width: 100%;
    height: fit-content;
    box-sizing: border-box;
    overflow: hidden;
  }

  .gamebook {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* Center items vertically */
    gap: 0px;
    //-webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    //box-shadow: 0 2px 20px 2px #d0d0d0;

    box-sizing: border-box;
    width: 100%;
    border: 1px solid #e4e4e4;
  }

  .titlebar {
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* Add a subtle shadow */
    width: 100%;
    background-color: white;
    color: #3f3f46;
    border-bottom: 1px solid #e4e4e4;
  }

  .gamebookTitle {
    position: relative;

    font-weight: 600;

    box-sizing: border-box;
    font-size: 22px;

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
    font-size: 16px;

    height: auto;
    display: flex;
    align-items: center; /* Vertically center */
    justify-content: flex-start; /* Horizontally align at the start */
    box-sizing: border-box;

    width: 100%; /* Adjust width to account for padding */
    padding-left: 10px;
    padding-bottom: 10px;
  }

  .surrounding {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fbfbfb;
    padding: 20px;
    box-shadow: inset 0px 4px 8px rgba(0, 0, 0, 0.1); /* Drop-in shadow */
    min-width: 100%;
    position: relative;
  }

  .page {
    display: flex;
    position: relative;
    flex-direction: column;
    gap: 10px; /* Adjust the value to your desired spacing */
    box-sizing: border-box;
    min-width: 100%;
    height: 600px; /* Set a fixed height (adjust as needed) */
    background-color: white;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2); /* Stronger shadow */
    overflow-y: auto; /* Make the content scrollable if it overflows */
    z-index: 1; /* Ensure content in page appears above the overlay */
  }

  webwriter-gamebook-popup {
    position: unset !important; /* Use !important to override any inline styles */
  }

  .overlay {
    position: absolute; /* To overlay the .page div */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8); /* Black background with opacity */
    display: flex; /* Flexbox for centering */
    justify-content: center; /* Center horizontally */
    align-items: center; /* Center vertically */
  }
`;
