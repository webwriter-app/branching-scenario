import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";
import { provide, consume, createContext } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "../gamebook-editor-state-lit-context";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlOption,
  SlSelect,
  SlButton,
  SlTextarea,
  SlDivider,
  SlDropdown,
  SlMenu,
  SlMenuItem,
  SlIconButton,
  SlInput,
  SlIcon,
  SlDialog,
  SlInputEvent,
} from "@shoelace-style/shoelace";

import { WebWriterConnectionButton } from "../gamebook-components/webwriter-connection-button";
import { ToggleableInput } from "../ui-components/toggleable-input";
import { NodeConnectionList } from "../ui-components/node-connection-list";
import { QuickConnectNode } from "../ui-components/quick-connect-node";

import squares from "@tabler/icons/filled/squares.svg";

//Tabler Icon Import
import X from "@tabler/icons/outline/x.svg";

//CSS
import styles from "../../css/popup-node-details-css";

@customElement("popup-node-details")
export class PopupNodeDetails extends LitElementWw {
  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-textarea": SlTextarea,
      "sl-divider": SlDivider,
      "sl-icon-button": SlIconButton,
      "sl-dropdown": SlDropdown,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
      "sl-select": SlSelect,
      "sl-option": SlOption,
      "sl-input": SlInput,
      "sl-icon": SlIcon,
      "sl-dialog": SlDialog,
      "webwriter-connection-button": WebWriterConnectionButton,
      "toggleable-input": ToggleableInput,
      "node-connection-list": NodeConnectionList,
      "quick-connect-node": QuickConnectNode,
    };
  }

  //import CSS
  static styles = [styles];

  //access nodes in the internal component DOM.
  @query(".nodeSelect")
  accessor nodeSelect;
  @query("#textAreaHTML")
  accessor textAreaHTML;

  @property({ type: Object }) accessor nodeEditor;

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  protected firstUpdated(_changedProperties: PropertyValues): void {}

  /*


  */
  render() {
    return html` <div class="title-bar">
        <div class="div-icon-popup">
          <sl-icon src=${squares}></sl-icon>
        </div>
        <div class="div-title">
          <toggleable-input
            .text=${this.editorStore.selectedNode.data.title}
            .saveChanges=${(string) => this.renameNode(string)}
          ></toggleable-input>
          <p class="subtitle">Popup</p>
        </div>
        <div class="inputOutputControls">
          <node-connection-list
            input
            .nodeEditor=${this.nodeEditor}
            .selectedNode=${this.editorStore.selectedNode}
          ></node-connection-list>
          <sl-divider vertical style="height: 100%;"></sl-divider>
          <node-connection-list
            output
            .nodeEditor=${this.nodeEditor}
            .selectedNode=${this.editorStore.selectedNode}
          ></node-connection-list>
        </div>
      </div>

      <div class="popup-node-details">
        <div class="preview">
          <div class="page">
            <div class="overlay">
              <div class="dialog">
                <div
                  class="header"
                  style=${this.editorStore.selectedContainer?.noHeader
                    ? "display: none"
                    : "display: flex"}
                >
                  <sl-input
                    value=${this.editorStore.selectedContainer?.titleLabel}
                    @sl-input=${(event) => this.handleDialogTitleChange(event)}
                  ></sl-input>
                  <sl-icon-button
                    src=${X}
                    style=${this.editorStore.selectedContainer?.preventClosing
                      ? "display: none"
                      : "display: flex"}
                  ></sl-icon-button>
                </div>
                <slot></slot>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  /*


  */
  private handleDialogTitleChange(event: Event) {
    const value = ((event as SlInputEvent).target as SlInput).value;
    this.editorStore.selectedContainer.titleLabel = value;
    this.editorStore.setSelectedContainer(this.editorStore.selectedContainer);
  }

  /*


  */
  private renameNode(text: String) {
    const event = new CustomEvent("renameSelectedNode", {
      detail: { newTitle: text },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}
