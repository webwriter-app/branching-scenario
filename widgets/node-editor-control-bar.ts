import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAll,
  queryAssignedElements,
} from "lit/decorators.js";

//Import Styles
import styles from "../css/branching-controls-css";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlButton,
  SlDialog,
  SlIconButton,
  SlDivider,
  SlTextarea,
  SlMenu,
  SlMenuItem,
  SlMenuLabel,
  SlDropdown,
  SlIcon,
  SlInput,
} from "@shoelace-style/shoelace";

//@tabler icons
import plus from "@tabler/icons/outline/plus.svg";
import schema from "@tabler/icons/outline/schema.svg";
import book from "@tabler/icons/outline/book.svg";
import questionMark from "@tabler/icons/outline/question-mark.svg";
import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";
import directions from "@tabler/icons/outline/directions.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";

@customElement("node-edtior-controls-bar")
export class NodeEditorControlsBar extends LitElementWw {
  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-textarea": SlTextarea,
      "sl-divider": SlDivider,
      "sl-dialog": SlDialog,
      "sl-icon": SlIcon,
      "sl-icon-button": SlIconButton,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
      "sl-dropdown": SlDropdown,
      "sl-menu-label": SlMenuLabel,
      "sl-input": SlInput,
    };
  }

  //import CSS
  static styles = [styles];

  @state() inPreviewMode = false;
  @property({ type: String })
  gamebookTitle = "";

  //
  @property({ type: Function }) handleGamebookTitle = (event: Event) => {};
  @property({ type: Function }) importExample = (number: number) => {};
  @property({ type: Function }) addPageNode = (
    title: string,
    isOrigin: boolean
  ) => {};
  @property({ type: Function }) addPopUpNode = (title: string) => {};
  @property({ type: Function }) addBranchNode = () => {};
  @property({ type: Function }) addQuestionNode = () => {};
  @property({ type: Function }) showDialog = () => {};

  protected render() {
    return html`
      <div class="controls">
        <div class="first-item">
          <sl-input
            id="gamebookTitle"
            rows="1"
            resize="none"
            placeholder="Gamebook Title"
            @input="${this.textAreaInputChanged}"
            .value="${this.gamebookTitle}"
            style=${this.inPreviewMode ? "display: none;" : "display: block;"}
          >
            <sl-icon slot="prefix" src=${book}></sl-icon>
          </sl-input>
        </div>

        <!-- <sl-dropdown
          style=${this.inPreviewMode ? "display: none;" : "display: block;"}
        >
          <sl-button slot="trigger">
            Import
            <sl-icon src=${schema} slot="prefix"></sl-icon>
          </sl-button>
          <sl-menu style="width: 180px;">
            <sl-menu-item @click=${() => console.log(this.importExample(0))}
              ><sl-icon slot="prefix" src=${questionMark}></sl-icon>
              Quiz Example
            </sl-menu-item>
          </sl-menu>
        </sl-dropdown>
        <sl-divider
          vertical
          style=${this.inPreviewMode
          ? "display: none;"
          : "display: block; height: 30px;"}
        ></sl-divider>-->
        <sl-dropdown
          style=${this.inPreviewMode ? "display: none;" : "display: block;"}
        >
          <sl-button slot="trigger">
            Add
            <sl-icon src=${plus} slot="prefix"></sl-icon>
          </sl-button>
          <sl-menu style="width: 200px;">
            <sl-menu-label>Blank</sl-menu-label>
            <sl-menu-item
              @click=${() => this.addPageNode("Untitled Page", false)}
              ><sl-icon slot="prefix" src=${file}></sl-icon>
              Page
            </sl-menu-item>
            <sl-menu-item @click=${() => this.addPopUpNode("Untitled Popup")}>
              <sl-icon slot="prefix" src=${squares}></sl-icon>
              Popup
            </sl-menu-item>
            <sl-menu-item @click=${() => this.addBranchNode()}>
              <sl-icon slot="prefix" src=${arrowsSplit2}></sl-icon>
              Smart Branch
            </sl-menu-item>
            <sl-divider></sl-divider>
            <sl-menu-label>Template</sl-menu-label>
            <sl-menu-item @click=${() => this.addQuestionNode()}>
              <sl-icon slot="prefix" src=${directions}></sl-icon>
              Decision Popup
            </sl-menu-item>
          </sl-menu>
        </sl-dropdown>
        <sl-divider
          vertical
          style=${this.inPreviewMode
            ? "display: none;"
            : "display: block; height: 30px;"}
        >
        </sl-divider>
        <sl-button
          style=${this.inPreviewMode ? "display: none;" : "display: block;"}
          @click=${() => this.showDialog()}
        >
          Clear
        </sl-button>
      </div>
    `;
  }

  /*


  */
  private textAreaInputChanged(event) {
    this.handleGamebookTitle(event);
  }
}
