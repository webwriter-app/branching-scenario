import { css } from "lit";

export default css`
  .help {
    float: right;
    position: absolute;
    bottom: 10px;
    left: 10px;

    width: auto;
    height: auto;
    background-color: rgba(255, 255, 255, 0.95);

    box-sizing: border-box;
    padding: 10px;

    display: flex;
    flex-direction: row;
    align-items: left;
    justify-content: left;
    border-radius: 4px;

    gap: 20px;

    box-sizing: border-box;

    border-radius: 8px;
    border: 1px solid #e4e4e7;
  }

  .helpIconButton {
    float: right;
    position: absolute;
    bottom: 10px;
    left: 10px;
    background-color: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;

    box-sizing: border-box;

    border-radius: 8px;
    border: 1px solid #e4e4e7;
  }

  .close-icon {
    position: absolute;
    top: 1px;
    right: 5px;
    font-size: 10px;
    aspect-ratio: 1;
    cursor: pointer;
  }

  .column {
    display: flex;
    flex-direction: column;
    align-items: left;
    justify-content: left;
    gap: 10px;
  }

  .help-item {
    height: 25px;
    display: flex;
    align-items: center;
    color: #3f3f46;
  }

  .icon-plus {
    display: flex;
    align-items: center;
    gap: 5px; /* Add some space between the elements */
    color: #3f3f46;
  }

  .icon-plus p {
    margin: 1px;
    font-size: 10px;
    color: #3f3f46;
  }

  .label {
    font-size: 10px;
    color: #3f3f46;
  }
`;
