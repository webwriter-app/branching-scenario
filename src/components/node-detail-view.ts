import { LitElementWw } from "@webwriter/lit";
import { widgetMsg } from "@webwriter/lit/localize";
import { html } from "lit";
import { property, state } from "lit/decorators.js";
import { PageNodeDetailView } from "./page-node-detail-view";
import { BranchNodeDetailView } from "./branch-node-detail-view";
import { consume } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "./gamebook-editor-state-context";

import "@shoelace-style/shoelace/dist/themes/light.css";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";

import styles from "./node-detail-view.styles";
import { PopupNodeDetailView } from "./popup-node-detail-view";
import { ToggleTextInput } from "./toggle-text-input";
import { NodeConnectionList } from "./node-connection-list";

import fileUnknown from "@tabler/icons/outline/file-unknown.svg";

export class NodeDetailsView extends LitElementWw {
  protected readonly messages = { msg: widgetMsg(this) };
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

  static styles = [styles];

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  @state()
  private accessor containerNotFound = false;

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
    this.containerNotFound = true;
  };

  private handleContainerFound = () => {
    this.containerNotFound = false;
  };

  render() {
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
              <p>${this.messages.msg("Click on a node to view its content")}</p>
              <slot></slot>
            </div>
          `}
    `;
  }

  private renderNodeNotFound() {
    return html`<div class="no-node-selected node-not-found">
      <sl-icon src=${fileUnknown}></sl-icon>
      <p>
        ${this.messages.msg("The content of this node cannot be found.")}<br />
        ${this.messages.msg(
          "If reloading does not solve this issue, try recreating the node."
        )}
      </p>
      <sl-button variant="default" @click=${this.handleRecreateNode}>
        ${this.messages.msg("Recreate node")}
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
}
