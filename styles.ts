import { css } from "lit";

export default css`
  .widget {
    display: flex;
    flex-direction: column;
    width: 100%;
    border-radius: 8px;
    border: 1px solid;
    border-color: #e4e4e4;
  }

  .selected-content-area {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: 100%;
    padding: 20px;
    align-items: center; /* Center items vertically */
    gap: 10px;
    font-family: "Roboto", sans-serif;
    font-size: 18px;
    background-color: #fafafb;
    border-radius: 0px 0px 8px 8px;
  }
  .worksheet {
    background-color: white;
    height: 1000px;
    width: 90%;
    border: 1px solid;
    border-color: #e9e9e9;
    padding: 20px;
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
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 10px;
    padding-bottom: 10px;
    font-family: "Roboto", sans-serif;
    font-size: 20px;
    font-weight: bold;
  }

  .controls .first-item {
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center; /* Center items vertically */
    gap: 10px;
    margin-right: auto; // Push this item to the start
  }

  .border {
    border: 1px solid #cecece;
    border-radius: 4px;
    font-size: auto;
  }

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
    background-color: #ffffff;
    height: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start; /* Horizontally align at the start */
    padding: 15px;
    width: calc(100% - 30px); /* Adjust width to account for padding */
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

  #zoomInBtn,
  #zoomOutBtn {
    color: white;
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
    width: 280px;
    font-family: "Roboto", sans-serif;
    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;
  }

  .drawflow .drawflow-node:hover.sheet {
    border: 1.5px solid #4ea9ff;
  }

  .drawflow .drawflow-node.selected.sheet {
    background: #f4faff;
    border: 3px solid #4ea9ff;
    color: #215f98;
  }

  .drawflow-node.sheet .title-box {
    background: #f7f7f7;

    display: flex;
    align-items: center; /* Align items vertically */
    flex-direction: row; // This is the default, but it's good to be explicit
    justify-content: flex-start; // Aligns items to the start of the container
    gap: 5px; //Adjust the gap between items as needed

    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 15px;
    padding-right: 15px;

    font-weight: 600;
  }
  .drawflow-node.sheet .title-box #svg {
    width: 16px;
    height: 16px;
  }

  .drawflow .drawflow-node.sheet .title-box .title {
    margin: 10px;
    margin-left: 25px;
  }

  .drawflow .drawflow-node.selected.sheet .title-box {
    color: #22598c;
  }

  .drawflow-node.sheet .content {
    padding: 15px;
    color: #71717a;
    display: flex;
    flex-direction: column;
    justify-content: flex-start; /* Aligns items to the start of the container */
    gap: 0px;
  }

  .drawflow-node.sheet .content .input-label {
    font-size: 14px;
    color: #a1a1a1; /* gray tone */
    margin: 2px;
  }

  .drawflow-node.sheet .content #test-textarea {
    resize: none;
    width: 100%;
    text-align: left;
    padding: 0.5rem;
  }

  /* ------- */
  /* Origin */
  /* ------- */

  .drawflow .drawflow-node.origin {
    background: #ffffff;
    border: 1px solid #949494;
    padding: 0px;
    width: 280px;
    font-family: "Roboto", sans-serif;
    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;
  }

  .drawflow .drawflow-node:hover.origin {
    border: 1.5px solid #4ea9ff;
  }

  .drawflow .drawflow-node.selected.origin {
    background: #f4faff;
    border: 3px solid #4ea9ff;
    color: #215f98;
  }

  .drawflow-node.origin .title-box {
    background: #f7f7f7;

    display: flex;
    align-items: center; /* Align items vertically */
    flex-direction: row; // This is the default, but it's good to be explicit
    justify-content: flex-start; // Aligns items to the start of the container
    gap: 5px; //Adjust the gap between items as needed

    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 15px;
    padding-right: 15px;

    font-weight: 600;
  }
  .drawflow-node.origin .title-box #svg {
    width: 16px;
    height: 16px;
  }

  .drawflow .drawflow-node.origin .title-box .title {
    margin: 10px;
    margin-left: 25px;
  }

  .drawflow .drawflow-node.selected.origin .title-box {
    color: #22598c;
  }

  .drawflow-node.origin .content {
    padding: 15px;
    color: #71717a;
    display: flex;
    flex-direction: column;
    justify-content: flex-start; /* Aligns items to the start of the container */
    gap: 0px;
  }

  .drawflow-node.origin .content .input-label {
    font-size: 14px;
    color: #a1a1a1; /* gray tone */
    margin: 2px;
  }

  .drawflow-node.origin .content #test-textarea {
    resize: none;
    width: 100%;
    text-align: left;
    padding: 0.5rem;
  }

  .drawflow-node.origin .drawflow-delete {
    display: none;
  }

  .badge {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    gap: 8px;

    color: #0ca349;

    border: 1px solid #0ca349;
    border-radius: 12px;
    padding: 5px 10px;
    margin-left: auto; /* Push the badge to the end of the title box */
  }

  .badge .div-svg {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px; /* Add padding to hug the content */
  }
  .badge .div-svg svg {
    display: block;
    width: 10px;
    height: 10px;
    transform: translate(-30%, -30%);
    margin: 0px;
  }

  .badge p {
    text-align: center;
    margin: 0;
    font-size: 12px; /* Adjust font size as needed */
  }

  /* ------- */
  /* BRANCHING */
  /* ------- */

  .drawflow .drawflow-node.branch {
    background: #f6f0fd;
    border: 1px solid #ab54f7;
    padding: 0px;
    width: auto;
    color: black;
    text-align: center;
    font-family: "Roboto", sans-serif;
    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;
  }

  .drawflow-node.branch .title-box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start; /* Centers items horizontally */
    align-items: center; /* Centers items vertically */
    padding: 15px;
    width: auto;
  }

  .drawflow-node.branch .title-box #svg {
    width: 16px;
    height: 16px;
  }

  .drawflow .drawflow-node.branch .title-box .title {
    margin-left: 25px;
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

  .drawflow .drawflow-node .input:active,
  .drawflow .drawflow-node .output:active {
    background: red;
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

  /* .drawflow-delete {
    border: 2px solid #b94543;
    background: #ffe9e8;
    color: #b94543;
  } */

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
