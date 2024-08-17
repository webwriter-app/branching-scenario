import { html, css, LitElement } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

import arrowsMove from "@tabler/icons/outline/arrows-move.svg";
import questionMark from "@tabler/icons/outline/question-mark.svg";

import { SlIcon, SlIconButton } from "@shoelace-style/shoelace";

//Import Styles
import styles from "../../css/help-editor-controls-css";

@customElement("drawflow-help-popup-controls")
export class DrawflowHelpPopUpControls extends LitElementWw {
  //import CSS
  static styles = [styles];

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-icon": SlIcon,
      "sl-icon-button": SlIconButton,
    };
  }

  @state() showWindow = false;

  render() {
    return html` ${this.showWindow
      ? html`
    <div class="help">
      <div class="close-icon" @click="${this.toggleWindow}">x</div>
      <div class="column">
        <div class="help-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 256 256"
          >
            <path
              fill="currentColor"
              d="M144 16h-32a64.07 64.07 0 0 0-64 64v96a64.07 64.07 0 0 0 64 64h32a64.07 64.07 0 0 0 64-64V80a64.07 64.07 0 0 0-64-64m48 64v24h-64V32h16a48.05 48.05 0 0 1 48 48m-48 144h-32a48.05 48.05 0 0 1-48-48v-56h128v56a48.05 48.05 0 0 1-48 48"
            />
          </svg>
        </div>  

        <div class="help-item">
          <div class="icon-plus">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 256 256"
            >
              <path
                fill="currentColor"
                d="M144 16h-32a64.07 64.07 0 0 0-64 64v96a64.07 64.07 0 0 0 64 64h32a64.07 64.07 0 0 0 64-64V80a64.07 64.07 0 0 0-64-64m48 64v24h-64V32h16a48.05 48.05 0 0 1 48 48m-48 144h-32a48.05 48.05 0 0 1-48-48v-56h128v56a48.05 48.05 0 0 1-48 48"
              />
            </svg>
            <p>+</p>
            <sl-icon src=${arrowsMove}></sl-icon>
          </div>
        </div>

        <div class="help-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 256 256"
          >
            <path
              fill="currentColor"
              d="M144 16h-32a64.07 64.07 0 0 0-64 64v96a64.07 64.07 0 0 0 64 64h32a64.07 64.07 0 0 0 64-64V80a64.07 64.07 0 0 0-64-64m-32 16h16v72H64V80a48.05 48.05 0 0 1 48-48m32 192h-32a48.05 48.05 0 0 1-48-48v-56h128v56a48.05 48.05 0 0 1-48 48"
            />
          </svg>
        </div>

        <div class="help-item">
          <div class="icon-plus">
            <p class="key-icon">CTRL</p>
            <p>+</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 256 256"
            >
              <path
                fill="currentColor"
                d="M144 16h-32a64.07 64.07 0 0 0-64 64v96a64.07 64.07 0 0 0 64 64h32a64.07 64.07 0 0 0 64-64V80a64.07 64.07 0 0 0-64-64m48 160a48.05 48.05 0 0 1-48 48h-32a48.05 48.05 0 0 1-48-48V80a48.05 48.05 0 0 1 48-48h32a48.05 48.05 0 0 1 48 48Zm-56-92.69v89.38l10.34-10.35a8 8 0 0 1 11.32 11.32l-24 24a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L120 172.69V83.31l-10.34 10.35a8 8 0 0 1-11.32-11.32l24-24a8 8 0 0 1 11.32 0l24 24a8 8 0 0 1-11.32 11.32Z"
              />
            </svg>
          </div>
        </div>
        </div>

        <div class="column">
            <div class="help-item"><p class="label">Select</p></div>

            <div class="help-item"><p class="label">Drag Connection</p></div>
            <div class="help-item"><p class="label">Delete</p></div>
            <div class="help-item"><p class="label">Zoom In/Out</p></div>
        </div>
      </div>
    </div>`
      : html` <div class="helpIconButton">
          <sl-icon-button
            class="helpIcon"
            src=${questionMark}
            @click="${this.toggleWindow}"
          ></sl-icon-button>
        </div>`}`;
  }

  toggleWindow() {
    this.showWindow = !this.showWindow;
  }
}
