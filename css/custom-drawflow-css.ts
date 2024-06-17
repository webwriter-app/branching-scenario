import { css } from "lit";

export default css`
  /* ------- */
  /* Editor */
  /* ------- */

  #drawflowEditorDiv {
    display: block;
    position: relative;
    width: 100%;
    height: 300px;
    background-color: #fafafb;
    background-image: radial-gradient(circle, #dedede, 1px, transparent 1px);
    background-size: 25px 25px;
    background-position: 0 0, 12.5px 12.5px;
    border-bottom: 1px solid #e4e4e4; /* You can adjust the thickness and color as needed */
    user-select: none; /* Standard syntax */
    -webkit-user-select: none; /* Safari/Chrome */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
  }

  /* ------- */
  /* Page Node */
  /* ------- */

  .drawflow .drawflow-node.page {
    background: #ffffff;
    border: 1px solid #cecece;

    font-family: "Roboto", sans-serif;

    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;

    padding: 0px;

    align-items: center;

    box-sizing: border-box;

    width: 330px;
  }

  .drawflow .drawflow-node.page .container {
    display: flex;
    flex-direction: row;
    justify-content: center;

    padding-left: 15px;
    padding-top: 15px;
    padding-bottom: 15px;
    padding-right: 20px;

    gap: 10px;
    box-sizing: border-box;
  }

  .drawflow .drawflow-node.page .container .div-page-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;

    width: 60px;
    height: 60px;
    aspect-ratio: 1;

    border-radius: 8px;
    border: 1px solid #e4e4e4;

    font-size: 0px;
  }

  .drawflow .drawflow-node.page .container .page-svg {
    display: block;
    fill: black;
    aspect-ratio: 1; /* Ensure the svg is square */
    width: 30px;
    height: 30px;
    pointer-events: none;
  }

  .drawflow .drawflow-node.page .container .div-threedots-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    font-size: 0px;
    padding: 10px;
    margin-left: auto;
  }

  .drawflow .drawflow-node.page .container .threedots-svg {
    display: block;
    fill: #7c7c7c;
    aspect-ratio: 1; /* Ensure the svg is square */
    width: 25px;
    height: 25px;
    pointer-events: none;
  }

  .drawflow-node.page .content {
    color: #71717a;
    display: flex;
    width: 150px;
    flex-direction: column;
    justify-content: flex-start; /* Aligns items to the start of the container */
    gap: 0px;
    height: 60px;
  }

  .drawflow-node.page .content .input-label {
    font-size: 14px;
    color: #a1a1a1; /* gray tone */
    margin: 2px;
  }

  .drawflow-node.page .content #test-textarea {
    resize: none;
    width: 100%;
    text-align: left;
    padding: 0.5rem;
  }

  .drawflow .drawflow-node:hover.page {
    border: 1.5px solid #4ea9ff;
  }

  .drawflow .drawflow-node.selected.page {
    background: #f4faff;
    border: 3px solid #4ea9ff;
    color: #215f98;
  }

  /* ------- */
  /* Origin */
  /* ------- */

  .drawflow .drawflow-node.origin {
    background: #ffffff;
    border: 1px solid #cecece;

    font-family: "Roboto", sans-serif;

    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;

    padding: 0px;

    align-items: center;

    box-sizing: border-box;

    width: 330px;
  }

  .drawflow .drawflow-node.origin .container {
    display: flex;
    flex-direction: row;
    justify-content: center;

    padding-left: 15px;
    padding-top: 15px;
    padding-bottom: 15px;
    padding-right: 20px;

    gap: 10px;
    box-sizing: border-box;
  }

  .drawflow .drawflow-node.origin .container .div-page-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;

    width: 60px;
    height: 60px;
    aspect-ratio: 1;

    border-radius: 8px;
    border: 1px solid #e4e4e4;

    font-size: 0px;
  }

  .drawflow .drawflow-node.origin .container .page-svg {
    display: block;
    fill: black;
    aspect-ratio: 1; /* Ensure the svg is square */
    width: 30px;
    height: 30px;
    pointer-events: none;
  }

  .drawflow .drawflow-node.origin .container .div-threedots-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    font-size: 0px;
    padding: 10px;
    margin-left: auto;
  }

  .drawflow .drawflow-node.origin .container .threedots-svg {
    display: block;
    fill: #7c7c7c;
    aspect-ratio: 1; /* Ensure the svg is square */
    width: 25px;
    height: 25px;
    pointer-events: none;
  }

  .drawflow-node.origin .content {
    color: #71717a;
    display: flex;

    flex-direction: column;
    justify-content: flex-start; /* Aligns items to the start of the container */
    gap: 5px;
    width: 150px;
    height: 60px;
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

  .drawflow-node.origin .badge {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: left;

    color: #0ca349;

    box-sizing: border-box;
    border: 1px solid #0ca349;
    border-radius: 12px;

    padding: 3px 3px;

    height: 25px;
    width: 100px;
  }

  .drawflow-node.origin .badge .arrow-svg {
    display: block;
    fill: #0ca349;
    aspect-ratio: 1; /* Ensure the svg is square */
    width: 16px;
    height: 16px;
    pointer-events: none;
  }

  .drawflow-node.origin .badge p {
    font-size: 14px;
    margin-left: 20px;
  }

  .drawflow .drawflow-node:hover.origin {
    border: 1.5px solid #4ea9ff;
    box-sizing: border-box;
  }

  .drawflow .drawflow-node.selected.origin {
    background: #f4faff;
    border: 3px solid #4ea9ff;
    color: #215f98;
  }

  .drawflow-node.origin .drawflow-delete {
    display: none;
  }

  /* ------- */
  /* BRANCHING */
  /* ------- */

  .drawflow .drawflow-node.quiz-branch {
    background: #f3e9ff;
    border: 1px solid #949494;
    padding: 0px;
    width: auto;
    color: black;
    text-align: center;
    font-family: "Roboto", sans-serif;
    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;
    font-weight: 600;
  }

  .drawflow .drawflow-node.quiz-branch:hover {
    border: 1px solid #c798ff;
  }

  .drawflow .drawflow-node.quiz-branch.selected {
    border: 1px solid #c798ff;
    color: #c798ff;
  }

  .drawflow-node.quiz-branch .title-box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start; /* Centers items horizontally */
    align-items: center; /* Centers items vertically */
    padding: 15px;
    width: auto;
  }

  .drawflow-node.quiz-branch .title-box #svg {
    width: 16px;
    height: 16px;
  }

  .drawflow .drawflow-node.quiz-branch .title-box .title {
    margin-left: 25px;
  }

  /* ---- */
  /* NODE INPUT AND OUTPUTS */
  /* ---- */

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
`;
