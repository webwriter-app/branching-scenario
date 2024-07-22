import { css } from "lit";

export default css`
  /* ------- */
  /* Page Node */
  /* ------- */

  .drawflow .drawflow-node.page,
  .drawflow .drawflow-node.origin {
    background: #ffffff;
    border: 1px solid #cecece;

    font-family: "Roboto", sans-serif;

    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;

    padding: 0px;

    align-items: center;

    box-sizing: border-box;

    min-width: 302px;
    min-height: 90px;
  }

  .drawflow-node.page .container,
  .drawflow-node.origin .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding-top: 15px;
    padding-bottom: 15px;
    padding-left: 20px;
    padding-right: 20px;

    gap: 20px;
    box-sizing: border-box;
  }

  .drawflow-node.page .container .threeDots,
  .drawflow-node.origin .container .threeDots {
    font-size: 24px;
  }

  .drawflow-node.page .container .pageIcon,
  .drawflow-node.origin .container .pageIcon {
    font-size: 48px;
  }

  .drawflow-node.page .content,
  .drawflow-node.origin .content {
    color: #71717a;
    display: flex;

    flex-direction: column;
    justify-content: flex-start;
    width: 150px;

    gap: 3px;
    height: 60px;
  }

  .drawflow-node.page .content .input-label,
  .drawflow-node.origin .content .input-label {
    font-size: 14px;
    color: #a1a1a1; /* gray tone */
    margin: 2px;
  }

  .drawflow-node.page .content #test-textarea,
  .drawflow-node.origin .content #test-textarea {
    resize: none;
    width: 100%;
    text-align: left;
    padding: 0.5rem;
  }

  .drawflow .drawflow-node:hover.page,
  .drawflow .drawflow-node:hover.origin {
    border: 1.5px solid #4ea9ff;
  }

  .drawflow .drawflow-node.selected.page,
  .drawflow .drawflow-node.selected.origin {
    background: #f4faff;
    border: 3px solid #4ea9ff;
    color: #215f98;
    box-sizing: content-box;
  }

  /* ------- */
  /* Origin */
  /* ------- */

  .drawflow-node.origin .badge {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: left;
    gap: 5px;

    color: #0ca349;

    box-sizing: border-box;
    padding: 3px 3px;

    height: 25px;
    width: auto;
  }

  .drawflow-node.origin .badge p {
    margin: 0px;
    font-size: 14px;
  }

  .drawflow-node.origin .drawflow-delete {
    display: none;
  }

  /* ------- */
  /* BRANCHING */
  /* ------- */

  .drawflow .drawflow-node.question-branch {
    background: #ffffff;
    border: 1px solid #cecece;

    font-family: "Roboto", sans-serif;

    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;

    padding: 0px;

    align-items: center;

    box-sizing: border-box;

    min-width: 110px;
    min-height: 110px;
  }

  .drawflow .drawflow-node.question-branch .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;

    box-sizing: border-box;

    padding: 10px;
  }

  .drawflow .drawflow-node.question-branch .content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .drawflow .drawflow-node.question-branch .dotsIcon {
    position: absolute;
    font-size: 24px;
    right: 10px;
  }

  .drawflow .drawflow-node.question-branch p {
    font-size: 14px;
    font-weight: 400;
    height: 100%;
    margin: 0px;
  }

  .drawflow .drawflow-node.question-branch:hover {
    border: 1.5px solid #c798ff;
  }

  .drawflow .drawflow-node.question-branch.selected {
    border: 3px solid #c798ff;
    color: #a152ff;
    background-color: #f7efff;
    box-sizing: content-box;
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
    border: 1px solid #cdcdcd;
  }

  .drawflow .drawflow-node .output:hover {
    background: #4ea9ff;
  }

  .drawflow .drawflow-node .output:active {
    background: #2d99ff;
  }

  .drawflow .drawflow-node .output {
    right: 10px;
  }

  .drawflow .drawflow-node .input {
    left: -10px;
    background: white;
  }

  .drawflow .drawflow-node .output.output-in-use {
    pointer-events: none;
    background: #eeeeee;
    border-color: #d7d7d7;
  }

  .drawflow .drawflow-node .input.input-in-use {
    background: #eeeeee;
    border-color: #d7d7d7;
  }

  .drawflow .drawflow-node .output.selected,
  .drawflow .drawflow-node .input.selected {
    background: #2d99ff;
  }

  /* ---- */
  /* CONNECTIONS */
  /* ---- */

  .drawflow .connection .main-path {
    stroke: #d7d7d7;
    stroke-width: 2px;
  }

  .drawflow .connection .main-path.creating {
    stroke: #4ea9ff;
    stroke-width: 2px;
  }

  .drawflow .connection .main-path:hover {
    stroke: #4ea9ff;
    stroke-width: 2px;
  }

  .drawflow .connection .main-path.selected {
    stroke: #2d99ff;
    stroke-width: 2px;
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
