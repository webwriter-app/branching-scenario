import { LitElementWw } from "@webwriter/lit";
import { widgetMsg } from "@webwriter/lit/localize";
import { html } from "lit";
import { property } from "lit/decorators.js";

import styles from "./page-node-detail-view.styles";

import "@shoelace-style/shoelace/dist/themes/light.css";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";

import file from "@tabler/icons/filled/file.svg";

import { ToggleTextInput } from "./toggle-text-input";
import { NodeConnectionList } from "./node-connection-list";

import { consume } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "./gamebook-editor-state-context";

export class PageNodeDetailView extends LitElementWw {
  protected readonly messages = { msg: widgetMsg(this) };
  static get scopedElements() {
    return {
      "toggle-text-input": ToggleTextInput,
      "node-connection-list": NodeConnectionList,
      "sl-divider": SlDivider,
      "sl-icon": SlIcon,
    };
  }

  static styles = [styles];

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  render() {
    return html` <div class="title-bar">
        <div class="div-icon-page">
          <sl-icon src=${file}></sl-icon>
        </div>
        <div class="div-title">
          <toggle-text-input
            .text=${this.editorStore.selectedNode.data.title}
            .saveChanges=${(text: string) => this.renameNode(text)}
          ></toggle-text-input>
          <p class="subtitle">${this.messages.msg("Page")}</p>
        </div>
        <div class="inputOutputControls">
          <node-connection-list input></node-connection-list>
          <sl-divider vertical style="height: 100%;"></sl-divider>
          <node-connection-list output></node-connection-list>
        </div>
      </div>

      <div class="page-node-detail-view">
        <div class="preview">
          <div class="page">
            <slot></slot>
          </div>
        </div>
      </div>`;
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
