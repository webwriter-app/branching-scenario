import { css } from "lit";

export default css`
  .help {
    float: right;
    position: absolute;
    bottom: 10px;
    left: 10px;

    background-color: black;
    opacity: 70%;

    width: auto;
    height: auto;

    box-sizing: border-box;
    padding: 10px;

    color: white;
    display: flex;
    flex-direction: row;
    align-items: left;
    justify-content: left;
    border-radius: 4px;

    gap: 20px;
  }

  .helpIconButton {
    float: right;
    position: absolute;
    bottom: 10px;
    left: 10px;
    background-color: black;
    opacity: 70%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    color: white;
    border-radius: 4px;
  }

  .helpIcon {
    color: white;
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
  }

  .icon-plus {
    display: flex;
    align-items: center;
    gap: 5px; /* Add some space between the elements */
  }

  .icon-plus p {
    margin: 1px;
    font-size: 10px;
  }

  .label {
    font-size: 10px;
    color: white;
  }
`;
