import { localizeElement, LocalizedElement } from "../../utils/localization";
import { html, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

//Import Styles
import styles from "./node-editor-toolbar.styles";

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
  SlBadge,
  SlTooltip,
} from "@shoelace-style/shoelace";

//@tabler icons
import plus from "@tabler/icons/outline/plus.svg";
import book from "@tabler/icons/outline/book.svg";
import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import helpOctagon from "@tabler/icons/outline/help-octagon.svg";
import packages from "@tabler/icons/outline/packages.svg";
import messageForward from "@tabler/icons/outline/message-forward.svg";
import fileArrowRight from "@tabler/icons/outline/file-arrow-right.svg";

import { templatePopupToPopup } from "../node-container-templates/template-popup-to-popup";
import { templatePopUpToPages } from "../node-container-templates/template-popup-to-pages";
import { templateQuizBranchToPages } from "../node-container-templates/template-quiz-branch-to-pages";

import { consume } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "../../utils/gamebook-editor-state-context";


export class NodeEditorToolbar extends LocalizedElement {
  protected readonly messages = localizeElement(this);
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
      "sl-badge": SlBadge,
      "sl-tooltip": SlTooltip,
    };
  }

  //import CSS
  static styles = [styles];

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  render() {
    return html`
      <div class="controls">
        <div class="first-item">
          <sl-input
            id="gamebookTitle"
            rows="1"
            resize="none"
            placeholder=${this.messages.msg("Untitled Gamebook")}
            @input="${this.textAreaInputChanged}"
            .value="${this.editorStore.title}"
          >
            <sl-icon slot="prefix" src=${book}></sl-icon>
          </sl-input>
        </div>

        <sl-dropdown placement="bottom-end" hoist>
          <sl-button slot="trigger">
            ${this.messages.msg("Add")}
            <sl-icon src=${plus} slot="prefix"></sl-icon>
          </sl-button>
          <sl-menu style="width: 200px;" hoist>
            <sl-menu-label>${this.messages.msg("Single Nodes")}</sl-menu-label>
            <sl-menu-item
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent("addPageNode", {
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
            >
              <sl-icon slot="prefix" src=${file}></sl-icon>
              ${this.messages.msg("Page")}
            </sl-menu-item>
            <sl-menu-item
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent("addPopUpNode", {
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
            >
              <sl-icon slot="prefix" src=${squares}></sl-icon>
              ${this.messages.msg("Popup")}
            </sl-menu-item>
            <sl-menu-item
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent("addBranchNode", {
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
            >
              <sl-icon slot="prefix" src=${arrowsSplit2}></sl-icon>
              ${this.messages.msg("Branch")}
            </sl-menu-item>
            <sl-divider></sl-divider>
            <sl-tooltip hoist placement="left-start">
              <div slot="content">
                ${this.messages.msg(html`
                  Inserts a predefined <strong>pattern</strong> of multiple
                  <strong>connected nodes</strong> into the node editor.<br /><br />
                  This allows you to quickly add a structured set of nodes
                  without manual placement.
                `)}
              </div>
              <sl-menu-label> ${this.messages.msg("Multiple Nodes")}</sl-menu-label>
            </sl-tooltip>

            <sl-menu-item
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent("addTemplate", {
                    detail: { template: templatePopUpToPages },
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
            >
              <sl-icon slot="prefix" src=${fileArrowRight}></sl-icon>
              ${this.messages.msg("Popup to Pages")}
            </sl-menu-item>

            <sl-menu-item
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent("addTemplate", {
                    detail: { template: templatePopupToPopup },
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
            >
              <sl-icon slot="prefix" src=${messageForward}></sl-icon>
              ${this.messages.msg("Popup to Popups")}
            </sl-menu-item>

            <sl-menu-item
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent("addTemplate", {
                    detail: { template: templateQuizBranchToPages },
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
            >
              <sl-icon slot="prefix" src=${helpOctagon}></sl-icon>
              ${this.messages.msg("Quiz to Branch to Pages")}
              <sl-badge variant="primary" pill slot="suffix">
                <sl-icon src=${packages}></sl-icon
              ></sl-badge>
            </sl-menu-item>
          </sl-menu>
        </sl-dropdown>
        <sl-divider vertical style="height: 30px"> </sl-divider>
        <sl-button
          @click=${() => {
            this.dispatchEvent(new CustomEvent("clearDialog"));
          }}
        >
          ${this.messages.msg("Clear")}
        </sl-button>
      </div>
    `;
  }

  /*


  */
  private textAreaInputChanged(event) {
    this.editorStore.setTitle(event.target.value);
  }
}
