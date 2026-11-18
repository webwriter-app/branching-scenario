import { css } from "lit";

export default css`
  .controls {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-end;
    align-items: center; /* Center items vertically */
    gap: 6px 8px;

    width: 100%;

    box-sizing: border-box;
    border-bottom: 1px solid #e4e4e4;

    padding: 10px 15px;

    font-size: 20px;
    font-weight: bold;
    user-select: none;

    background-color: rgba(255, 255, 255, 0.95);
  }

  .controls .first-item {
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center; /* Center items vertically */
    margin-right: auto; /* Push this item to the start */
    flex: 1 1 9rem;
    min-width: 0;
  }

  .first-item sl-input {
    flex: 1;
    min-width: 0;
  }

  .iconButton {
    border: 1px solid #cecece;
    border-radius: 4px;
    font-size: auto;
  }
`;
