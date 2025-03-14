import { css } from "lit";

export default css`
  :host {
    /* height: 100%; */
  }

  :host * {
    box-sizing: border-box;
  }

  .page-node-detail-view {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    min-height: min-content;
    height: 100%;

    background-color: #fbfbfb;
    padding: 10px;
  }

  .preview {
    display: flex;
    flex-direction: column;

    align-items: center;

    width: 100%;
    min-height: min-content;
    height: 100%;

    background: #fbfbfb;

    box-sizing: border-box;
  }

  .page {
    background-color: white;
    box-sizing: border-box;
    border: 1px solid #d4d4d8;
    width: 100%;
    height: auto;
    min-height: min-content;
    color: black;

    /* box-shadow: 0 2px 20px 2px #d0d0d0; */
  }

  .gamebookTitle {
    font-weight: 600;
    background-color: #f7f7f7;
    box-sizing: border-box;

    padding-top: 10px;
    padding-left: 10px;
    padding-bottom: 10px;

    height: auto;

    display: flex;
    align-items: center; /* Vertically center */
    justify-content: flex-start; /* Horizontally align at the start */

    width: 100%;
  }

  .pageTitle {
    font-size: 14px;

    background-color: #f7f7f7;

    height: auto;
    display: flex;
    align-items: center; /* Vertically center */
    justify-content: flex-start; /* Horizontally align at the start */
    box-sizing: border-box;

    width: 100%; /* Adjust width to account for padding */
    padding-left: 10px;
    padding-bottom: 10px;
  }

  .title-bar {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-items: center;
    gap: 15px;

    width: 100%;
    height: 150px;
    padding: 20px;

    background-color: white;

    box-sizing: border-box;
  }

  .div-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    height: 65px; /* Remove the fixed height */
    aspect-ratio: 1;
    background-color: #3077ba;
  }

  .div-icon sl-icon {
    width: 42px;
    height: 42px;
    color: white;
  }

  .div-title {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .title {
    font-size: 16px;
    font-weight: bold;
    color: #3077ba;
    margin: 0px;
  }

  .subtitle {
    font-size: 12px;
    color: gray;
    margin: 0px;
    padding: 0px;
  }

  .number {
    font-size: 14px;
    color: black;
    margin: 0px;
  }

  .last-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: auto;
  }

  .control-node {
    display: flex;
    flex-direction: column;
    height: 120px;
    justify-content: left;
    align-items: left;
  }

  .horizontal {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #d4d4d8;
  }

  .icon-button {
    margin: 0;
  }

  .horizontalStack {
    display: flex;
    flex-direction: column;
    height: 80px;
    width: 150px;
    overflow-y: auto;
    padding-right: 10px;
  }

  .horizontalStack::-webkit-scrollbar {
    width: 6px; /* Width of the vertical scrollbar */
  }

  .horizontalStack::-webkit-scrollbar-thumb {
    background-color: darkgrey; /* Color of the scrollbar thumb */
    border-radius: 10px; /* Roundness of the scrollbar thumb */
  }

  .horizontalStack::-webkit-scrollbar-track {
    background: none; /* Color of the scrollbar track */
  }

  .horizontalStack p {
    padding: 0px;
    margin: 0px;
    font-size: 12px;
  }

  .title-bar {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-items: center;

    box-sizing: border-box;
    width: 100%;
    height: 150px;

    gap: 15px;
    padding: 15px;

    background-color: white;
    border-bottom: 1px solid #d4d4d8;
    /* 
    border-top-left-radius: 8px;
    border-top-right-radius: 8px; */
  }

  .inputOutputControls {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-items: center;
  }

  node-connection-list {
    height: 100%; /* Adjust as needed */
    flex: 1; /* This makes the node-connection-list elements take up remaining space evenly */
  }

  .div-title {
    display: flex;
    flex-direction: column;
  }

  .subtitle {
    font-size: 12px;
    color: gray;
    margin: 0px;
    padding: 0px;
  }

  .div-icon-popup {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    height: 65px; /* Remove the fixed height */
    aspect-ratio: 1;
    background-color: #9762b4;
  }

  .div-icon-page {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    height: 65px; /* Remove the fixed height */
    aspect-ratio: 1;
    background-color: #3077ba;
  }

  .div-icon-branch {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    height: 65px; /* Remove the fixed height */
    aspect-ratio: 1;
    background-color: #05ae9e;
  }

  .div-icon-popup sl-icon,
  .div-icon-page sl-icon,
  .div-icon-branch sl-icon {
    width: 42px;
    height: 42px;
    color: white;
  }
`;
