import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

//Drawflow Imports
import { DrawflowNode } from "drawflow";

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
import { GamebookContainerManager } from "../gamebook-container-manager";

import squares from "@tabler/icons/filled/squares.svg";

//Tabler Icon Import
import X from "@tabler/icons/outline/x.svg";

//CSS
import styles from "../../css/popup-node-details-css";
import { WebWriterGamebookPopupContainer } from "../gamebook-components/webwriter-gamebook-popup-container";

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

  @property({ type: Boolean }) accessor isNodeSelected = false;

  //public properties are part of the component's public API
  @property({ type: Object, attribute: false })
  accessor selectedNode: DrawflowNode;

  @property({ type: Function }) accessor _hoverConnection = (string) => {};
  @property({ type: Function }) accessor _unhoverConnection = (string) => {};

  @property({ attribute: false }) accessor changeInEditorCallback = (
    drawflow,
    updateType,
    node?,
    removedNodeId?,
    inputNode?,
    outputNode?,
    inputClass?,
    outputClass?,
    outputHadConnections?
  ) => {};

  @queryAssignedElements({
    flatten: true,
  })
  accessor slotElements;

  @property({ type: Object, attribute: false })
  accessor popupContainer: WebWriterGamebookPopupContainer;

  protected firstUpdated(_changedProperties: PropertyValues): void {
    const gamebookContainerManager = this
      .slotElements[0] as GamebookContainerManager;

    this.popupContainer =
      gamebookContainerManager._getContainerByDrawflowNodeId(
        this.selectedNode.id.toString()
      );
  }

  /*


  */
  render() {
    return html` <div class="title-bar">
        <div class="div-icon-popup">
          <sl-icon src=${squares}></sl-icon>
        </div>
        <div class="div-title">
          <toggleable-input
            .text=${this.selectedNode.data.title}
            .saveChanges=${(string) => this.renameNode(string)}
          ></toggleable-input>
          <p class="subtitle">Popup</p>
        </div>
        <div class="inputOutputControls">
          <node-connection-list
            input
            .nodeEditor=${this.nodeEditor}
            .selectedNode=${this.selectedNode}
            .changeInEditorCallback=${(
              drawflow,
              updateType,
              node,
              removedNodeId,
              inputNode,
              outputNode,
              inputClass,
              outputClass,
              outputHadConnections
            ) => {
              this.changeInEditorCallback(
                drawflow,
                updateType,
                node,
                removedNodeId,
                inputNode,
                outputNode,
                inputClass,
                outputClass,
                outputHadConnections
              );
            }}
          ></node-connection-list>
          <sl-divider vertical style="height: 100%;"></sl-divider>
          <node-connection-list
            output
            .nodeEditor=${this.nodeEditor}
            .selectedNode=${this.selectedNode}
            .changeInEditorCallback=${(
              drawflow,
              updateType,
              node,
              removedNodeId,
              inputNode,
              outputNode,
              inputClass,
              outputClass,
              outputHadConnections
            ) => {
              this.changeInEditorCallback(
                drawflow,
                updateType,
                node,
                removedNodeId,
                inputNode,
                outputNode,
                inputClass,
                outputClass,
                outputHadConnections
              );
            }}
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
                  style=${this.popupContainer?.noHeader
                    ? "display: none"
                    : "display: flex"}
                >
                  <sl-input
                    value=${this.popupContainer?.titleLabel}
                    @sl-input=${(event) => this.handleDialogTitleChange(event)}
                  ></sl-input>
                  <sl-icon-button
                    src=${X}
                    style=${this.popupContainer?.preventClosing
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
    this.popupContainer.titleLabel = value;
  }

  /*


  */
  private renameNode(text: String) {
    this.nodeEditor.editor.updateNodeDataFromId(this.selectedNode.id, {
      ...this.selectedNode.data,
      title: text,
    });

    this.changeInEditorCallback(
      { ...this.nodeEditor.editor.drawflow },
      "nodeRenamed",
      this.selectedNode
    );
  }
}
