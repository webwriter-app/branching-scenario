import { css } from "lit";

export default css`
  .widget {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid;
    border-color: #e4e4e4;
  }

  .selected-content-area {
    width: 100%;
    height: 500px;
    padding: 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center; /* Center items vertically */
    gap: 10px;
    font-family: "Roboto", sans-serif;
    font-size: 18px;
  }

  .dialog {
    font-family: "Roboto", sans-serif;
  }

  .controls {
    border-bottom: 1px solid #e4e4e4;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center; /* Center items vertically */
    gap: 10px; /* Adjust the value to your desired spacing */
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 10px;
    padding-bottom: 10px;
    font-family: "Roboto", sans-serif;
    font-size: 20px;
    font-weight: bold;
  }

  .controls .first-item {
    margin-right: auto; // Push this item to the start
  }

  #zoomInBtn,
  #zoomOutBtn {
    color: white;
  }

  /* ------- */
  /* DRAWFLOW */
  /* ------- */

  #drawflow {
    display: block;
    position: relative;
    width: 100%;
    height: 300px;
    background-color: #fafafb;
    background-image: radial-gradient(circle, #dedede, 1px, transparent 1px);
    background-size: 25px 25px;
    background-position: 0 0, 12.5px 12.5px;
    border-bottom: 1px solid #e4e4e4; /* You can adjust the thickness and color as needed */
  }

  /* ------- */
  /* NODE */
  /* ------- */

  /* ------- */
  /* SHEET */
  /* ------- */

  .drawflow .drawflow-node.sheet {
    background: #ffffff;
    border: 1px solid #949494;
    padding: 0px;
    width: 300px;
    font-family: "Roboto", sans-serif;
    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;
  }

  .drawflow .drawflow-node:hover.sheet {
    border: 1.5px solid #4ea9ff;
  }

  .drawflow .drawflow-node.selected.sheet {
    background: #f4faff;
    border: 1.5px solid #4ea9ff;
    color: #215f98;
  }

  .drawflow-node.sheet .title-box {
    background: #f7f7f7;
    border-bottom: 1px solid #e9e9e9;
    border-radius: 4px 4px 0px 0px;

    display: flex;
    flex-direction: row; /* This is the default, but it's good to be explicit */
    justify-content: flex-start; /* Aligns items to the start of the container */
    align-items: center; /* Aligns items along the cross-axis (vertically in this case) */
    gap: 5px; /* Adjust the gap between items as needed */
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 15px;

    font-weight: 600;
  }

  .drawflow .drawflow-node.selected.sheet .title-box {
    color: #22598c;
  }

  .drawflow-node.sheet .content {
    padding: 15px;
    color: #71717a;
  }

  /* ------- */
  /* BRANCHING */
  /* ------- */

  .drawflow .drawflow-node.branch {
    background: #f6f0fd;
    border: 1px solid #ab54f7;
    padding: 0px;
    width: 120px;
    color: black;
    text-align: center;
    font-family: "Roboto", sans-serif;
    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;
  }

  .drawflow-node.branch .title-box {
    display: flex;
    flex-direction: row;
    justify-content: center; /* Centers items horizontally */
    align-items: center; /* Centers items vertically */
    gap: 10px; /* Adjust the gap between items as needed */
    padding: 10px;
  }

  .drawflow-node .box {
    padding: 10px 20px 20px 20px;
    font-size: 14px;
    color: #555555;
  }
  .drawflow-node .box p {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .drawflow-node.welcome {
    width: 250px;
  }

  .drawflow-node input,
  .drawflow-node select,
  .drawflow-node textarea {
    border-radius: 4px;
    border: 1px solid #ededed;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    width: 158px;
    color: #555555;
    text-align: center;
  }

  .drawflow-node textarea {
    height: 100px;
  }

  /* ---- */
  /* NODE INPUT AND OUTPUTS */
  /* ---- */

  .drawflow .drawflow-node .input,
  .drawflow .drawflow-node .output {
    height: 15px;
    width: 15px;
    border: 1px solid #dedede;
  }

  .drawflow .drawflow-node .input:hover,
  .drawflow .drawflow-node .output:hover {
    background: #4ea9ff;
  }

  .drawflow .drawflow-node .output {
    right: 10px;
  }

  .drawflow .drawflow-node .input {
    left: -10px;
    background: white;
  }

  /* ---- */
  /* CONNECTIONS */
  /* ---- */

  .drawflow .connection .main-path {
    stroke: #949494;
    stroke-width: 2px;
  }

  .drawflow .connection .main-path:hover {
    stroke: #4ea9ff;
    stroke-width: 2px;
  }

  .drawflow .connection .main-path.selected {
    stroke: #2576c0;
    stroke-width: 2px;
    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;
  }

  .drawflow .connection .point {
    stroke: #000000;
    stroke-width: 2;
    fill: white;
  }

  .drawflow .connection .point.selected,
  .drawflow .connection .point:hover {
    fill: #000000;
  }

  /* ---- */
  /* OTHERS */
  /* ---- */

  .drawflow > .drawflow-delete {
    border: 2px solid #43b993;
    background: white;
    color: #43b993;
    -webkit-box-shadow: 0 2px 20px 2px #43b993;
    box-shadow: 0 2px 20px 2px #43b993;
  }

  .drawflow-delete {
    border: 2px solid #4ea9ff;
    background: white;
    color: #4ea9ff;
    -webkit-box-shadow: 0 2px 20px 2px #4ea9ff;
    box-shadow: 0 2px 20px 2px #4ea9ff;
  }

  /* ------- */
  /* MODAL */
  /* ------- */

  .modal {
    display: none;
    position: fixed;
    z-index: 7;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    overflow: auto;
    background-color: rgb(0, 0, 0);
    background-color: rgba(0, 0, 0, 0.7);
  }

  .modal-content {
    position: relative;
    background-color: #fefefe;
    margin: 15% auto; /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 400px; /* Could be more or less, depending on screen size */
  }

  /* The Close Button */
  .modal .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
  }

  .bar-zoom {
    float: right;
    position: absolute;
    bottom: 10px;
    right: 10px;

    display: flex;
    flex-direction: row;
    gap: 10px;

    color: white;
    padding: 5px 10px;
    background: #555555;
    border-radius: 4px;
    border-right: 1px solid white;
    z-index: 5;
  }
`;
