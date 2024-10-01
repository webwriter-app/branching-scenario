import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { ContextConsumer } from "@lit/context";
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
import styles from "../../css/branching-controls-css";

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
  SlButtonGroup,
} from "@shoelace-style/shoelace";

//@tabler icons
import plus from "@tabler/icons/outline/plus.svg";
import book from "@tabler/icons/outline/book.svg";
import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";
import directions from "@tabler/icons/outline/directions.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";

import { provide, consume, createContext } from "@lit/context";
import { gamebookStore, GamebookStore } from "../context-test";

@customElement("node-edtior-controls-bar")
export class NodeEditorControlsBar extends LitElementWw {
  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-button-group": SlButtonGroup,
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

  @property({ type: Boolean, reflect: true }) accessor inPreviewMode = false;

  @property({ type: Function }) accessor importExample = (number: number) => {};
  @property({ type: Function }) accessor addPageNode = (
    title: string,
    isOrigin: boolean
  ) => {};
  @property({ type: Function }) accessor addPopUpNode = (title: string) => {};
  @property({ type: Function }) accessor addBranchNode = (title: string) => {};
  @property({ type: Function }) accessor addQuestionNode = () => {};
  @property({ type: Function }) accessor addDecisionPopUpTemplate = () => {};
  @property({ type: Function }) accessor showDialog = () => {};

  @property({ type: Object, attribute: true }) accessor selectedNode;

  @consume({ context: gamebookStore, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor providedStore = new GamebookStore("Default");

  render() {
    return html`
      <div class="controls">
        <div class="first-item">
          <sl-input
            id="gamebookTitle"
            rows="1"
            resize="none"
            placeholder="Gamebook Title"
            @input="${this.textAreaInputChanged}"
            .value="${this.providedStore.title}"
            style=${this.inPreviewMode ? "display: none;" : "display: block;"}
          >
            <sl-icon slot="prefix" src=${book}></sl-icon>
          </sl-input>
        </div>

        <sl-dropdown
          placement="bottom-end"
          style=${this.inPreviewMode ? "display: none;" : "display: block;"}
          hoist
        >
          <sl-button slot="trigger">
            Add
            <sl-icon src=${plus} slot="prefix"></sl-icon>
          </sl-button>
          <sl-menu style="width: 200px;" hoist>
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
            <sl-menu-item @click=${() => this.addBranchNode("Untitled Branch")}>
              <sl-icon slot="prefix" src=${arrowsSplit2}></sl-icon>
              Smart Branch
            </sl-menu-item>
            <sl-divider></sl-divider>
            <sl-menu-label>Template</sl-menu-label>
            <sl-menu-item @click=${() => this.addDecisionPopUpTemplate()}>
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
    this.providedStore.setTitle(event.target.value);
  }
}
