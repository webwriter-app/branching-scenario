import { css } from "lit";

export default css`
  .controls {
    border-bottom: 1px solid #e4e4e4;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center; /* Center items vertically */
    gap: 10px; /* Adjust the value to your desired spacing */
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 10px;
    padding-bottom: 10px;
    font-family: "Roboto", sans-serif;
    font-size: 20px;
    font-weight: bold;
  }

  .answer {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .answer sl-textarea {
    flex-grow: 1;
    margin-right: 10px;
  }

  .answer sl-dropdown {
    margin-left: 10px;
  }
`;
