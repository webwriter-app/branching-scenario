import { html } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";

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
  SlBadge,
} from "@shoelace-style/shoelace";

//@tabler icons
import plus from "@tabler/icons/outline/plus.svg";
import book from "@tabler/icons/outline/book.svg";
import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";
import directions from "@tabler/icons/outline/directions.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import helpOctagon from "@tabler/icons/outline/help-octagon.svg";
import packages from "@tabler/icons/outline/packages.svg";

import { decisionPopUpWithFeedback } from "../node-templates/decision-popup-with-feedback";
import { decisionPopUpToPage } from "../node-templates/decision-popup-to-page";
import { singleChoiceQuizLoop } from "../node-templates/single-choice-quiz-loop";

import { consume } from "@lit/context";
import { editorState, GamebookEditorState } from "../editor-state-context";

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
      "sl-badge": SlBadge,
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
            placeholder="Gamebook Title"
            @input="${this.textAreaInputChanged}"
            .value="${this.editorStore.title}"
          >
            <sl-icon slot="prefix" src=${book}></sl-icon>
          </sl-input>
        </div>

        <sl-dropdown placement="bottom-end" hoist>
          <sl-button slot="trigger">
            Add
            <sl-icon src=${plus} slot="prefix"></sl-icon>
          </sl-button>
          <sl-menu style="width: 280px;" hoist>
            <sl-menu-label>Nodes</sl-menu-label>
            <sl-menu-item
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent("addPageNode", {
                    detail: { title: "Untitled Page", isOrigin: false },
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
            >
              <sl-icon slot="prefix" src=${file}></sl-icon>
              Page
            </sl-menu-item>
            <sl-menu-item
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent("addPopUpNode", {
                    detail: { title: "Untitled Popup" },
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
            >
              <sl-icon slot="prefix" src=${squares}></sl-icon>
              Popup
            </sl-menu-item>
            <sl-menu-item
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent("addBranchNode", {
                    detail: { title: "Untitled Branch" },
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
            >
              <sl-icon slot="prefix" src=${arrowsSplit2}></sl-icon>
              Smart Branch
            </sl-menu-item>
            <sl-divider></sl-divider>
            <sl-menu-label>Blocks</sl-menu-label>
            <sl-menu-item
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent("addTemplate", {
                    detail: { template: decisionPopUpToPage },
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
            >
              <sl-icon slot="prefix" src=${directions}></sl-icon>
              Decision Popup to Page
            </sl-menu-item>

            <sl-menu-item
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent("addTemplate", {
                    detail: { template: decisionPopUpWithFeedback },
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
            >
              <sl-icon slot="prefix" src=${directions}></sl-icon>
              Decision Feedback
            </sl-menu-item>

            <sl-menu-item
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent("addTemplate", {
                    detail: { template: singleChoiceQuizLoop },
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
            >
              <sl-icon slot="prefix" src=${helpOctagon}></sl-icon>
              Quiz Loop
              <sl-badge variant="neutral" pill slot="suffix">
                <p style="margin: 0px; padding: 0px; padding-right: 5px;">
                  Requires Quiz
                </p>
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
          Clear
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
