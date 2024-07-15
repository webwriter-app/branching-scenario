import { css } from "lit";

export default css`
  .preview {
    display: flex;
    flex-direction: column;
    align-items: center; /* Center items vertically */
    box-sizing: border-box;
    background-color: white;

    height: auto;
    width: auto;
    margin: 10px;
  }

  .gamebook {
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* Center items vertically */
    gap: 0px;
    //-webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    //box-shadow: 0 2px 20px 2px #d0d0d0;
    border: 1px solid#e4e4e4;
    box-sizing: border-box;
    width: 100%;
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

  .page {
    display: flex;
    position: relative;
    flex-direction: column;
    gap: 10px; /* Adjust the value to your desired spacing */
    box-sizing: border-box;
    width: 100%;
    background-color: white;
    min-height: 800px;
  }

  quiz-container {
    position: unset !important; /* Use !important to override any inline styles */
  }
`;
