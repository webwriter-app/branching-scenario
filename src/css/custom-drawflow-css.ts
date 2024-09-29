import { css } from "lit";

export default css`
  /* ------- */
  /*  Base Layouting Nodes  */
  /* ------- */

  .smooth-transition {
    transition: transform 0.4s ease !important; /* Adjust duration and easing as needed */
  }

  .smooth-background-transition {
    transition: background-position 0.4s ease; /* Adjust duration and easing as needed */
  }

  /* .drawflow {
    border: 1.5px solid blue;
  } */

  .drawflow .drawflow-node.page,
  .drawflow .drawflow-node.origin,
  .drawflow .drawflow-node.popup {
    background: #ffffff;
    border: 1.5px solid #cecece;

    padding: 0px;
    align-items: center;

    box-sizing: border-box;

    border-radius: 12px;

    min-width: 320px;
    min-height: 90px;

    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;
  }

  .drawflow .drawflow-node.branch {
    background: #ffffff;
    border: 1.5px solid #cecece;

    padding: 0px;
    align-items: center;

    box-sizing: border-box;

    border-radius: 12px;

    min-width: 320px;
    min-height: 90px;

    -webkit-box-shadow: 0 2px 20px 2px #d0d0d0;
    box-shadow: 0 2px 20px 2px #d0d0d0;
  }

  .drawflow-node.page .container,
  .drawflow-node.origin .container,
  .drawflow-node.popup .container,
  .drawflow-node.branch .container {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
  }

  .drawflow-node.page .container .pageIcon,
  .drawflow-node.origin .container .pageIcon,
  .drawflow-node.popup .container .pageIcon,
  .drawflow-node.branch .container .pageIcon {
    font-size: 48px;
    color: white;
  }

  .drawflow-node.page .content,
  .drawflow-node.origin .content,
  .drawflow-node.popup .content,
  .drawflow-node.branch .content {
    color: #71717a;
    display: flex;

    flex-direction: column;
    justify-content: center;
    width: 150px;

    gap: 3px;
    height: 60px;
  }

  .drawflow-node.page .content .input-label,
  .drawflow-node.origin .content .input-label,
  .drawflow-node.popup .content .input-label,
  .drawflow-node.branch .content .input-label {
    font-size: 16px;
    color: #a1a1a1; /* gray tone */
    padding: 0px;
    margin: 0px;
  }

  .drawflow-node.page .content #title,
  .drawflow-node.origin .content #title,
  .drawflow-node.popup .content #title,
  .drawflow-node.branch .content #title {
    padding: 0px;
    margin: 0px;
    font-family: "Roboto", sans-serif;
    font-size: 20px;
    color: #3f3f46;
    pointer-events: none;
    text-align: left;
    border: none;
    background-color: transparent;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .drawflow-node.page .container .threeDots,
  .drawflow-node.origin .container .threeDots,
  .drawflow-node.popup .container .threeDots,
  .drawflow-node.branch .container .threeDots {
    font-size: 28px;
  }

  /* ------- */
  /* Specific Nodes icon Div  */
  /* ------- */

  .drawflow-node.branch .container .iconDiv {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #05ae9e;
    border-radius: 8px;
    min-width: 65px;
    min-height: 65px;
  }

  .drawflow-node.page .container .iconDiv,
  .drawflow-node.origin .container .iconDiv {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #3077ba;
    border-radius: 8px;
    min-width: 65px;
    min-height: 65px;
  }

  .drawflow-node.popup .container .iconDiv {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #9762b4;
    border-radius: 8px;
    min-width: 65px;
    min-height: 65px;
  }

  /* ------- */
  /* :hover nodes  */
  /* ------- */

  .drawflow .drawflow-node:hover.branch {
    border: 2px solid #05ae9e;
    -webkit-box-shadow: 0 4px 30px 4px #c0c0c0;
    box-shadow: 0 4px 30px 4px #c0c0c0;
  }

  .drawflow .drawflow-node:hover.page,
  .drawflow .drawflow-node:hover.origin {
    border: 2px solid #3077ba;
    -webkit-box-shadow: 0 4px 30px 4px #c0c0c0;
    box-shadow: 0 4px 30px 4px #c0c0c0;
  }

  .drawflow .drawflow-node:hover.popup {
    border: 2px solid #9762b4;
    -webkit-box-shadow: 0 4px 30px 4px #c0c0c0;
    box-shadow: 0 4px 30px 4px #c0c0c0;
  }

  /* ------- */
  /* highlighted nodes  */
  /* ------- */

  .drawflow-node.branch.highlighted {
    border: 3px solid #05ae9e;
    -webkit-box-shadow: 0 4px 60px 6px #b0b0b0;
    box-shadow: 0 4px 60px 6px #b0b0b0;
  }

  .drawflow-node.highlighted.page,
  .drawflow-node.highlighted.origin {
    border: 3px solid #3077ba;
    -webkit-box-shadow: 0 4px 60px 6px #b0b0b0;
    box-shadow: 0 4px 60px 6px #b0b0b0;
  }

  .drawflow-node.popup.highlighted {
    border: 3px solid #9762b4;
    -webkit-box-shadow: 0 4px 60px 6px #b0b0b0;
    box-shadow: 0 4px 60px 6px #b0b0b0;
  }

  /* ------- */
  /* searched nodes  */
  /* ------- */

  .drawflow-node.searched.branch,
  .drawflow-node.searched.page,
  .drawflow-node.searched.origin,
  .drawflow-node.searched.popup {
    outline: 3px solid yellow;
    background-color: #ffffe6;
  }

  .drawflow-node.selected.branch.searched,
  .drawflow-node.selected.page.searched,
  .drawflow-node.selected.origin.searched,
  .drawflow-node.selected.popup.searched {
    outline: 3px solid yellow !important;
  }

  .drawflow-node:hover.branch.searched,
  .drawflow-node:hover.page.searched,
  .drawflow-node:hover.origin.searched,
  .drawflow-node:hover.popup.searched {
    outline: 3px solid yellow !important;
  }

  /* ------- */
  /* selected nodes  */
  /* ------- */

  .drawflow .drawflow-node.selected.branch {
    background: #f4fffe;
    border: 4px solid #05ae9e;
    color: #058b7f;
    box-sizing: content-box;
    background-color: #f4fffe;
    -webkit-box-shadow: 0 4px 60px 7px #b0b0b0;
    box-shadow: 0 4px 60px 7px #b0b0b0;
  }

  .drawflow .drawflow-node.selected.page,
  .drawflow .drawflow-node.selected.origin {
    background: #f4faff;
    border: 4px solid #3077ba;
    color: #215f98;
    box-sizing: content-box;
    -webkit-box-shadow: 0 4px 60px 7px #b0b0b0;
    box-shadow: 0 4px 60px 7px #b0b0b0;
  }

  .drawflow .drawflow-node.selected.popup {
    background: #fbf4fe;
    border: 4px solid #9762b4;
    color: #9762b4;
    box-sizing: content-box;
    -webkit-box-shadow: 0 4px 60px 7px #b0b0b0;
    box-shadow: 0 4px 60px 7px #b0b0b0;
  }

  /* ------- */
  /* Origin Class Specifics  */
  /* ------- */

  .drawflow-node.origin .badge {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: left;
    gap: 5px;

    color: #50b478;

    box-sizing: border-box;
    padding: 3px 3px;

    height: 25px;
    width: auto;

    padding: 0px;
  }

  .drawflow-node.origin .badge p {
    margin: 0px;
    padding: 0px;
    font-size: 16px;
  }

  .drawflow-node.origin .drawflow-delete {
    display: none;
  }

  /* ---- */
  /*  INPUT AND OUTPUTS */
  /* ---- */

  .drawflow .drawflow-node .input,
  .drawflow .drawflow-node .output {
    height: 20px;
    width: 20px;
    border: 1px solid #cdcdcd;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .drawflow .drawflow-node .input *,
  .drawflow .drawflow-node .output * {
    pointer-events: none;
  }

  .drawflow .drawflow-node .output:hover {
    background: #4ea9ff;
  }

  .drawflow .drawflow-node .output:active {
    background: #4ea9ff;
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
    background: #ffca00;
  }

  .drawflow .drawflow-node .output.output-has-error {
    border: 1px solid #ff2323 !important;
    background-color: #ff7474 !important;
  }

  .drawflow .drawflow-node .output.target-disabled {
    pointer-events: none;
    background-image: repeating-linear-gradient(
      45deg,
      #f1f1f1,
      /* Lighter Gray */ #f1f1f1 5px,
      #c9c9c9 5px,
      /* Darker Gray for contrast */ #c9c9c9 10px
    ) !important;
  }

  /* ---- */
  /* INPUT OUTPUT HIGHLIGHTED */
  /* ---- */

  .drawflow .drawflow-node .output.highlighted,
  .drawflow .drawflow-node .input.highlighted {
    background: #4ea9ff;
    border: 1px solid #4ea9ff;
  }

  .drawflow .drawflow-node .output.page-highlighted,
  .drawflow .drawflow-node .input.page-highlighted,
  .drawflow .drawflow-node .output.origin-highlighted,
  .drawflow .drawflow-node .input.origin-highlighted {
    background: #3077ba;
    border: 1px solid #3077ba;
  }

  .drawflow .drawflow-node .output.branch-highlighted,
  .drawflow .drawflow-node .input.branch-highlighted {
    background: #05ae9e;
    border: 1px solid #05ae9e;
  }

  .drawflow .drawflow-node .output.popup-highlighted,
  .drawflow .drawflow-node .input.popup-highlighted {
    background: #9762b4;
    border: 1px solid #9762b4;
  }

  /* ---- */
  /* CONNECTIONS */
  /* ---- */

  .drawflow .connection .main-path {
    stroke: #d7d7d7;
    stroke-width: 2px;
  }

  .drawflow .connection .main-path:hover {
    stroke: #4ea9ff;
    stroke-width: 2px;
  }

  .drawflow .connection .main-path.selected {
    stroke: #2d99ff;
    stroke-width: 2px;
    -webkit-box-shadow: 0 4px 60px 7px #b0b0b0;
    box-shadow: 0 4px 60px 7px #b0b0b0;
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
  /* CONNECTIONS HIGHLIGHTED */
  /* ---- */

  .drawflow .connection .main-path.popup-highlighted {
    stroke: #9762b4;
    stroke-width: 3px;
  }

  .drawflow .connection .main-path.page-highlighted,
  .drawflow .connection .main-path.origin-highlighted {
    stroke: #3077ba;
    stroke-width: 3px;
  }

  .drawflow .connection .main-path.branch-highlighted,
  .drawflow .connection .main-path.branch-highlighted {
    stroke: #05ae9e;
    stroke-width: 3px;
  }

  .drawflow .connection .main-path.highlighted {
    stroke: #4ea9ff;
    stroke-width: 3px;
  }

  /* ---- */
  /* OTHERS */
  /* ---- */

  /* .drawflow-delete {
  border: 2px solid #b94543;
  background: #ffe9e8;
  color: #b94543;
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
`;
