import { css } from "lit";

export default css`
  ww-scene {
    position: absolute;
    inset: 0;
    background-color: #fbfbfb;
    --ww-scene-grid-color: #cfcfcf;
    --ww-scene-grid-size: 1.5;
    cursor: grab;
  }

  ww-scene:active {
    cursor: grabbing;
  }

  /* Nodes */

  ww-node {
    --kind: #3077ba;
    --tint: #f4faff;
    display: block;
    min-width: 320px;
    min-height: 90px;
    background: #ffffff;
    border: 1.5px solid #cecece;
    border-radius: 12px;
    box-shadow: 0 2px 20px 2px #d0d0d0;
    color: #71717a;
    cursor: default;
  }

  ww-node.popup {
    --kind: #9762b4;
    --tint: #fbf4fe;
  }

  ww-node.branch {
    --kind: #05ae9e;
    --tint: #f4fffe;
  }

  ww-node:hover {
    border-color: var(--kind);
    box-shadow: 0 4px 30px 4px #c0c0c0;
  }

  ww-node[highlighted] {
    border-color: var(--kind);
    box-shadow: 0 0 0 1.5px var(--kind), 0 4px 60px 6px #b0b0b0;
  }

  ww-node[selected] {
    outline: none;
    background: var(--tint);
    border-color: var(--kind);
    box-shadow: 0 0 0 2.5px var(--kind), 0 4px 60px 7px #b0b0b0;
  }

  ww-node[searched] {
    outline: 3px solid yellow !important;
    background-color: #ffffe6;
  }

  ww-node:focus-visible {
    outline: 2px solid var(--kind);
    outline-offset: 3px;
  }

  .container {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .iconDiv {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--kind);
    border-radius: 8px;
    min-width: 65px;
    min-height: 65px;
  }

  .pageIcon {
    font-size: 48px;
    color: white;
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 150px;
    height: 60px;
    gap: 3px;
  }

  .title {
    font-size: 20px;
    color: #3f3f46;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .input-label {
    font-size: 16px;
    color: #a1a1a1;
    padding: 0;
    margin: 0;
  }

  .threeDots {
    font-size: 28px;
  }

  .badge {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
    height: 25px;
    color: #50b478;
  }

  .badge p {
    margin: 0;
    font-size: 16px;
  }

  /* Ports */

  .port {
    position: absolute;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 1px solid #cdcdcd;
    border-radius: 50%;
    background: white;
  }

  .port::before {
    content: "";
    position: absolute;
    box-sizing: border-box;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .port.input {
    left: -10px;
    top: 50%;
    margin-top: -10px;
  }

  .port.input::before {
    border: 2px solid #cdcdcd;
  }

  .port.input[highlighted]::before,
  .port.input[data-ww-port-candidate]::before {
    border-color: #4ea9ff;
  }

  .port.input[data-ww-port-over]::before {
    background: #4ea9ff;
  }

  .outputs {
    position: absolute;
    right: -10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .port.output {
    position: relative;
    background: white;
    cursor: crosshair;
  }

  .port.output::before {
    background: #dddddd;
  }

  .port.output:hover::before,
  .port.output:active::before,
  .port.output[highlighted]::before {
    background: #4ea9ff;
  }

  .port.output[in-use] {
    cursor: default;
  }

  .port.output[in-use]::before {
    background: #a3a3a3;
  }

  .port.output[has-error] {
    cursor: default;
  }

  .port.output[has-error]::before {
    border: 1px solid #ff2323;
    background: #ff7474;
  }

  .port.output[target-disabled] {
    cursor: default;
  }

  .port.output[target-disabled]::before {
    background-image: repeating-linear-gradient(45deg, #f1f1f1, #f1f1f1 2px, #c9c9c9 2px, #c9c9c9 4px);
  }

  /* Connections */

  ww-path {
    stroke: #d7d7d7;
    stroke-width: 2px;
  }

  ww-path:state(hover) {
    stroke: #4ea9ff;
  }

  ww-path.highlighted {
    stroke: #4ea9ff;
    stroke-width: 3px;
  }

  ww-path[selected] {
    stroke: #2d99ff;
    stroke-width: 3px;
  }
`;
