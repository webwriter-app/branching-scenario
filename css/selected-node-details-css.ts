import { css } from "lit";

export default css`
  #selected-node-details {
    height: 100%;
    width: 100%;

    box-sizing: border-box;
    border-radius: 0px 0px 8px 8px;

    font-family: "Roboto", sans-serif;
    font-size: 18px;
    background-color: white;
  }

  .no-node-selected {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #a7a7a7;
    padding: 30px;
    background-color: white;
    height: 100%;
  }
`;
