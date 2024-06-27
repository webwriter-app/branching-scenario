import { css } from "lit";

export default css`
  .preview {
    display: flex;
    flex-direction: column;
    align-items: center; /* Center items vertically */
    background-color: #f7f7f7;
    height: auto;
    padding: 10px;
  }

  .gamebook {
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* Center items vertically */
    gap: 0px;
    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;
    width: 100%;
  }

  .gamebookTitle {
    font-family: "Roboto", sans-serif;
    font-weight: 600;
    background-color: #f7f7f7;
    height: auto;
    display: flex;
    align-items: center; /* Vertically center */
    justify-content: flex-start; /* Horizontally align at the start */
    padding-top: 10px;
    padding-left: 15px;
    width: calc(100% - 20px); /* Adjust width to account for padding */
  }

  .pageTitle {
    font-family: "Roboto", sans-serif;
    font-size: 14px;
    background-color: #f7f7f7;
    height: auto;
    display: flex;
    align-items: center; /* Vertically center */
    justify-content: flex-start; /* Horizontally align at the start */
    padding-left: 15px;
    padding-bottom: 10px;
    width: calc(100% - 20px); /* Adjust width to account for padding */
  }

  .page {
    display: flex;
    position: relative;
    flex-direction: column;
    gap: 10px; /* Adjust the value to your desired spacing */
    padding: 10px;
    box-sizing: border-box;
    width: 100%;
    background-color: white;
    min-height: 800px;
  }

  quiz-container {
    position: unset !important; /* Use !important to override any inline styles */
  }
`;
