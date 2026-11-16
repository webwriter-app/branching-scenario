import { LitElementWw } from "@webwriter/lit";
import { widgetMsg } from "@webwriter/lit/localize";
import { html } from "lit";
import { property, query } from "lit/decorators.js";

import { consume } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "./gamebook-editor-state-context";

import "@shoelace-style/shoelace/dist/themes/light.css";
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlDropdown from "@shoelace-style/shoelace/dist/components/dropdown/dropdown.component.js";
import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.component.js";
import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";

import type { WebwriterGamebookPopup } from "../widgets/webwriter-gamebook-popup";
import type { NodeEditor } from "./node-editor";
import { ToggleTextInput } from "./toggle-text-input";
import { NodeConnectionList } from "./node-connection-list";

import squares from "@tabler/icons/filled/squares.svg";

import X from "@tabler/icons/outline/x.svg";

import styles from "./popup-node-detail-view.styles";

export class PopupNodeDetailView extends LitElementWw {
  protected readonly messages = { msg: widgetMsg(this) };
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
      "toggle-text-input": ToggleTextInput,
      "node-connection-list": NodeConnectionList,
    };
  }

  static styles = [styles];

  //access nodes in the internal component DOM.
  @query(".nodeSelect")
  accessor nodeSelect: SlSelect;
  @query("#textAreaHTML")
  accessor textAreaHTML: SlTextarea;

  @property({ type: Object }) accessor nodeEditor: NodeEditor;

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  render() {
    const popup = this.editorStore.selectedContainer as WebwriterGamebookPopup | undefined;
    return html` <div class="title-bar">
        <div class="div-icon-popup">
          <sl-icon src=${squares}></sl-icon>
        </div>
        <div class="div-title">
          <toggle-text-input
            .text=${this.editorStore.selectedNode.data.title}
            .saveChanges=${(text: string) => this.renameNode(text)}
          ></toggle-text-input>
          <p class="subtitle">${this.messages.msg("Popup")}</p>
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

      <div class="popup-node-detail-view">
        <div class="preview">
          <div class="dialog">
            <div
              class="header"
              style=${popup?.noHeader
                ? "display: none"
                : "display: flex"}
            >
              <sl-input
                value=${popup?.titleLabel}
                @sl-input=${(event: Event) => this.handleDialogTitleChange(event)}
              ></sl-input>
              <sl-icon-button
                src=${X}
                style=${popup?.preventClosing
                  ? "display: none"
                  : "display: flex"}
              ></sl-icon-button>
            </div>
            <div class="page">
              <slot></slot>
            </div>
          </div>
        </div>
      </div>`;
  }

  private handleDialogTitleChange(event: Event) {
    const container = this.editorStore.selectedContainer as WebwriterGamebookPopup;
    container.titleLabel = (event.target as SlInput).value;
    this.editorStore.setSelectedContainer(container);
  }

  private renameNode(text: string) {
    const event = new CustomEvent("renameSelectedNode", {
      detail: { newTitle: text },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}
