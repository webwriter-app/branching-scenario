import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, state } from "lit/decorators.js";
import { msg, localized } from "@lit/localize";
import { PageNodeDetailView } from "../page-node-detail-view/page-node-detail-view";
import { BranchNodeDetailView } from "../branch-node-detail-view/branch-node-detail-view";
import { provide, consume, createContext } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "../../utils/gamebook-editor-state-context";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlIcon, SlDivider, SlButton } from "@shoelace-style/shoelace";

//Import Styles
import styles from "./node-detail-view.styles";
import { PopupNodeDetailView } from "../popup-node-detail-view/popup-node-detail-view";
import { ToggleTextInput } from "../toggle-text-input/toggle-text-input";
import { NodeConnectionList } from "../node-connection-list/node-connection-list";

//Tabler Icon Import
import fileUnknown from "@tabler/icons/outline/file-unknown.svg";

@localized()
export class NodeDetailsView extends LitElementWw {
  static get scopedElements() {
    return {
      "page-node-detail-view": PageNodeDetailView,
      "popup-node-detail-view": PopupNodeDetailView,
      "branch-node-detail-view": BranchNodeDetailView,
      "toggle-text-input": ToggleTextInput,
      "node-connection-list": NodeConnectionList,
      "sl-icon": SlIcon,
      "sl-divider": SlDivider,
      "sl-button": SlButton,
    };
  }

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  @state()
  private accessor containerNotFound = false;

  //import CSS
  static styles = [styles];

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("containerNotFound", this.handleContainerNotFound);
    this.addEventListener("containerFound", this.handleContainerFound);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("containerNotFound", this.handleContainerNotFound);
    this.removeEventListener("containerFound", this.handleContainerFound);
  }

  private handleContainerNotFound = () => {
    console.log("Container not found event received");
    this.containerNotFound = true;
  };

  private handleContainerFound = () => {
    console.log("Container found event received");
    this.containerNotFound = false;
  };

  render() {
    console.log(this.containerNotFound, this.editorStore.selectedNode);
    if (this.containerNotFound && this.editorStore.selectedNode.id !== -1) {
      return this.renderNodeNotFound();
    }

    return html`
      ${this.editorStore.selectedNode.id !== -1
        ? html` <div class="selected-node">
            ${this.editorStore.selectedNode.class == "page" ||
            this.editorStore.selectedNode.class == "origin"
              ? html`
                  <page-node-detail-view>
                    <slot></slot>
                  </page-node-detail-view>
                `
              : this.editorStore.selectedNode.class == "branch"
              ? html` <branch-node-detail-view>
                  <slot></slot>
                </branch-node-detail-view>`
              : this.editorStore.selectedNode.class == "popup"
              ? html`
                  <popup-node-detail-view>
                    <slot></slot>
                  </popup-node-detail-view>
                `
              : null}
          </div>`
        : html`
            <div class="no-node-selected">
              <p>${msg("Click on a node to view its content")}</p>
              <slot></slot>
            </div>
          `}
    `;
  }

  private renderNodeNotFound() {
    return html`<div class="no-node-selected node-not-found">
      <sl-icon src=${fileUnknown}></sl-icon>
      <p>
        ${msg("The content of this node cannot be found.")}<br />
        ${msg(
          "If reloading does not solve this issue, try recreating the node."
        )}
      </p>
      <sl-button variant="default" @click=${this.handleRecreateNode}>
        ${msg("Recreate node")}
      </sl-button>
      <slot></slot>
    </div>`;
  }

  private handleRecreateNode() {
    const event = new CustomEvent("recreateContainer", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  /*


  */
  private renameNode(text: String) {
    // this.nodeEditor.editor.updateNodeDataFromId(
    //   this.editorStore.selectedNode.id,
    //   {
    //     ...this.editorStore.selectedNode.data,
    //     title: text,
    //   }
    // );
    // this.changeInEditorCallback(
    //   { ...this.nodeEditor.editor.drawflow },
    //   "nodeRenamed",
    //   this.editorStore.selectedNode
    // );
  }
}
