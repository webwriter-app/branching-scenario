import { html, css, LitElement, PropertyValues } from "lit";
import { provide, consume, createContext } from "@lit/context";

import { LitElementWw } from "@webwriter/lit";
import { customElement, property, query } from "lit/decorators.js";

import styles from "../css/webwriter-branching-scenario-css";

import search from "@tabler/icons/outline/search.svg";
import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import book from "@tabler/icons/outline/book.svg";
import packages from "@tabler/icons/outline/packages.svg";
import trash from "@tabler/icons/outline/trash.svg";

import infoSquareRounded from "@tabler/icons/filled/info-square-rounded.svg";

import { gamebookStore, GamebookStore } from "./context-test";

// Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlInput,
  SlIcon,
  SlButton,
  SlSwitch,
  SlSelect,
  SlDivider,
  SlIconButton,
  SlButtonGroup,
} from "@shoelace-style/shoelace";

@customElement("webwriter-gamebook-options")
export class WebWriterGamebookOptions extends LitElementWw {
  static styles = [styles];

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-input": SlInput,
      "sl-icon": SlIcon,
      "sl-button": SlButton,
      "sl-button-group": SlButtonGroup,
      "sl-select": SlSelect,
      "sl-divider": SlDivider,
      "sl-icon-button": SlIconButton,
      "sl-switch": SlSwitch,
    };
  }

  @query("#searchInput") accessor searchInput;

  @consume({ context: gamebookStore, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor providedStore = new GamebookStore("Default");

  render() {
    return html`
      <div class="author-only">
        <div class="header">
          <sl-icon src=${book}></sl-icon>
          <p>Gamebook</p>
        </div>

        <sl-input
          id="searchInput"
          placeholder="Nodes, content, ..."
          clearable
          @sl-input=${this._handleNodeSearch}
          .value=${this.providedStore.searchTerm}
        >
          <sl-icon src=${search} slot="prefix"></sl-icon>
        </sl-input>

        <sl-button-group label="Alignment">
          <sl-button
            id="copyNodeBtn"
            class="flex-item"
            @click=${() =>
              this.providedStore.setCopiedNode(this.providedStore.selectedNode)}
            ?disabled=${this.providedStore.selectedNode.id === -1}
          >
            Copy
          </sl-button>

          <sl-button
            class="flex-item"
            @click=${() =>
              this.dispatchEvent(
                new CustomEvent("pasteNode", {
                  bubbles: true,
                  composed: true,
                })
              )}
            ?disabled=${this.providedStore.copiedNode.id === -1}
          >
            Paste
          </sl-button>

          <sl-button
            class="square"
            variant="default"
            id="deleteNodeBtn"
            @click=${() => this.deleteSelectedNode()}
            ?disabled=${this.providedStore.selectedNode.id === -1 ||
            this.providedStore.selectedNode.class == "origin"
              ? true
              : false}
          >
            <sl-icon src=${trash}></sl-icon>
          </sl-button>
        </sl-button-group>

        ${this.providedStore.selectedNode.id != -1
          ? html`
              <div class="header">
                ${this.providedStore.selectedNode.class == "page"
                  ? html`
                      <sl-icon src=${file}></sl-icon>
                      <p>Page</p>
                    `
                  : this.providedStore.selectedNode.class == "origin"
                  ? html`
                      <sl-icon src=${file}></sl-icon>
                      <p>Start Page</p>
                    `
                  : this.providedStore.selectedNode.class == "popup"
                  ? html`
                      <sl-icon src=${squares}></sl-icon>
                      <p>Popup</p>
                    `
                  : this.providedStore.selectedNode.class == "branch"
                  ? html`
                      <sl-icon src=${arrowsSplit2}></sl-icon>
                      <p>Smart Branch</p>
                    `
                  : null}
              </div>

              ${this.providedStore.selectedNode.class == "page" ||
              this.providedStore.selectedNode.class == "origin"
                ? html`
                    <sl-button
                      id="makeNodeOriginBtn"
                      @click=${() => this.makeNodeOrigin()}
                      ?disabled=${this.providedStore.selectedNode.class ==
                      "origin"
                        ? true
                        : false}
                    >
                      Set as Origin
                    </sl-button>
                  `
                : null}
              ${this.providedStore.selectedNode.class == "branch"
                ? html`
                    <p>
                      <sl-icon
                        src="${infoSquareRounded}"
                        style="vertical-align: middle; margin: 1px;"
                      ></sl-icon>
                      Create rules to guide how your gamebook progresses. The
                      first rule that applies will be used.
                    </p>
                    <p>
                      <sl-icon
                        src="${packages}"
                        style="vertical-align: middle; margin: 1px;"
                      ></sl-icon>
                      Requires
                      <a
                        href="https://webwriter.app/widgets/"
                        target="https://webwriter.app/widgets/"
                      >
                        WebWriter Quiz Widget </a
                      >.
                    </p>
                  `
                : null}
              ${this.providedStore.selectedNode.class == "popup"
                ? html`
                    <sl-switch
                      ?checked=${this.providedStore.selectedContainer
                        .preventClosing}
                      @sl-input=${(event) =>
                        this.handleSwitchPreventClosing(event)}
                    >
                      Prevent Closing
                    </sl-switch>
                    <sl-switch
                      ?checked=${this.providedStore.selectedContainer.noHeader
                        ? false
                        : true}
                      @sl-input=${(event) => this.handleSwitchNoHeader(event)}
                    >
                      Header
                    </sl-switch>
                  `
                : null}
            `
          : null}
      </div>
    `;
  }

  /*
TODO search
  */
  private _handleNodeSearch(event: Event) {
    const inputText = (event.target as SlInput).value;

    this.providedStore.setSearchTerm(inputText);

    this.dispatchEvent(
      new CustomEvent("nodeSearch", {
        bubbles: true,
        composed: true,
      })
    );
  }

  /*

  */
  private makeNodeOrigin() {
    this.dispatchEvent(
      new CustomEvent("makeSelectedNodeOrigin", {
        detail: { newId: this.providedStore.selectedNode.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  /*
TODO: does not update each other
  */
  private handleSwitchPreventClosing(event: Event) {
    const value = (event.target as SlSwitch).checked;
    this.providedStore.selectedContainer.preventClosing = value;
    this.providedStore.setSelectedContainer(
      this.providedStore.selectedContainer
    );
    this.requestUpdate();
  }

  /*


  */
  private handleSwitchNoHeader(event: Event) {
    const value = (event.target as SlSwitch).checked;
    this.providedStore.selectedContainer.noHeader = !value;
    this.providedStore.setSelectedContainer(
      this.providedStore.selectedContainer
    );
    this.requestUpdate();
  }

  /*


  */
  private deleteSelectedNode() {
    this.dispatchEvent(
      new CustomEvent("deleteSelectedNode", {
        bubbles: true,
        composed: true,
      })
    );
  }
}
