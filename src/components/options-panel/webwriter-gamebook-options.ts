import { html, css, LitElement, PropertyValues } from "lit";
import { provide, consume, createContext } from "@lit/context";

import { LitElementWw } from "@webwriter/lit";
import { customElement, property, query } from "lit/decorators.js";

import search from "@tabler/icons/outline/search.svg";
import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import book from "@tabler/icons/outline/book.svg";
import packages from "@tabler/icons/outline/packages.svg";
import trash from "@tabler/icons/outline/trash.svg";
import circleArrowRight from "@tabler/icons/filled/circle-arrow-right.svg";

import infoSquareRounded from "@tabler/icons/filled/info-square-rounded.svg";

import {
  editorState,
  GamebookEditorState,
} from "../../utils/gamebook-editor-state-context";

//Drawflow Imports
import Drawflow, { DrawflowNode } from "drawflow";

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
  SlDropdown,
  SlMenu,
  SlMenuItem,
  SlMenuLabel,
} from "@shoelace-style/shoelace";

@customElement("webwriter-gamebook-options")
export class WebWriterGamebookOptions extends LitElementWw {
  static get styles() {
    return css`
      :host {
        padding-left: 10px;
      }
      .author-only {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        gap: 10px;
        width: 180px;
      }

      .author-only .header p {
        margin: 0px;
        font-weight: 500;
        font-size: 15px;
        box-sizing: border-box;
        color: #52525b;
      }

      .author-only .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-items: center;
        border-bottom: 2px solid #52525b;
        gap: 7px;
        padding-bottom: 10px;
      }

      .author-only .searchBar {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-items: center;
        width: 100%;
        height: 65px;
      }

      .author-only .searchBar * {
        width: 100%;
      }

      .author-only sl-icon {
        color: #52525b;
      }

      .author-only .horizontalStack {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
        width: 100%;
      }

      sl-button.square {
        width: 42px; /* Set this value to whatever size you want */
        height: 42px; /* Same value as width to ensure it's a square */
      }

      p {
        margin: 0px;
        font-weight: 400;
        font-size: 15px;
        box-sizing: border-box;
        color: #52525b;
      }
    `;
  }

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
      "sl-dropdown": SlDropdown,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
      "sl-menu-label": SlMenuLabel,
    };
  }

  @query("#searchInput") accessor searchInput;

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  render() {
    const options = (data) =>
      Object.keys(data)
        .filter(
          (key) =>
            this.editorStore.searchResults !== undefined
              ? this.editorStore.searchResults.includes(Number(key))
              : true // No filtering when searchResults is empty
        )
        .map(
          (key) => html`<sl-menu-item
              value="${data[key].id}"
              @click=${() => this.moveTo(data[key])}
              ><p>${data[key].data.title}</p>
              ${data[key].class === "page" || data[key].class === "origin"
                ? html` <sl-icon slot="prefix" src=${file}></sl-icon> `
                : data[key].class === "popup"
                ? html` <sl-icon slot="prefix" src=${squares}></sl-icon>`
                : data[key].class === "branch"
                ? html` <sl-icon slot="prefix" src=${arrowsSplit2}></sl-icon>`
                : null}
            </sl-menu-item>
            <sl-divider></sl-divider> `
        );

    return html`
      <div class="author-only">
        <div class="header">
          <sl-icon src=${book}></sl-icon>
          <p>Gamebook</p>
        </div>

        <sl-dropdown>
          <sl-input
            style="max-width: 180px"
            slot="trigger"
            id="searchInput"
            placeholder="Search..."
            clearable
            @sl-input=${this._handleNodeSearch}
            @keydown=${this._handleInputKeydown}
            .value=${this.editorStore.searchTerm}
          >
            <sl-icon src=${search} slot="prefix"></sl-icon>
          </sl-input>
          <sl-menu hoist style="width: 180px;">
            ${this.editorStore.searchResults
              ? html`
                  <sl-menu-label
                    >${this.editorStore.searchResults.length}
                    nodes</sl-menu-label
                  >
                  <sl-divider></sl-divider>
                `
              : null}
            ${options(this.editorStore.editorContent.drawflow.Home.data)}
          </sl-menu>
        </sl-dropdown>

        <sl-button-group label="Alignment">
          <sl-button
            id="copyNodeBtn"
            class="flex-item"
            @click=${() =>
              this.editorStore.setCopiedNode(this.editorStore.selectedNode)}
            ?disabled=${this.editorStore.selectedNode.id === -1}
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
            ?disabled=${this.editorStore.copiedNode.id === -1}
          >
            Paste
          </sl-button>

          <sl-button
            class="square"
            variant="default"
            id="deleteNodeBtn"
            @click=${() => this.deleteSelectedNode()}
            ?disabled=${this.editorStore.selectedNode.id === -1 ||
            this.editorStore.selectedNode.class == "origin"
              ? true
              : false}
          >
            <sl-icon src=${trash}></sl-icon>
          </sl-button>
        </sl-button-group>

        ${this.editorStore.selectedNode.id != -1
          ? html`
              <div class="header">
                ${this.editorStore.selectedNode.class == "page"
                  ? html`
                      <sl-icon src=${file}></sl-icon>
                      <p>Page</p>
                    `
                  : this.editorStore.selectedNode.class == "origin"
                  ? html`
                      <sl-icon src=${file}></sl-icon>
                      <p>Start Page</p>
                    `
                  : this.editorStore.selectedNode.class == "popup"
                  ? html`
                      <sl-icon src=${squares}></sl-icon>
                      <p>Popup</p>
                    `
                  : this.editorStore.selectedNode.class == "branch"
                  ? html`
                      <sl-icon src=${arrowsSplit2}></sl-icon>
                      <p>Branch</p>
                    `
                  : null}
              </div>

              ${this.editorStore.selectedNode.class == "page" ||
              this.editorStore.selectedNode.class == "origin"
                ? html`
                    <sl-button
                      id="makeNodeOriginBtn"
                      @click=${() => this.makeNodeOrigin()}
                      ?disabled=${this.editorStore.selectedNode.class ==
                      "origin"
                        ? true
                        : false}
                    >
                      <sl-icon src=${circleArrowRight} slot="prefix"></sl-icon>
                      Set as Start Page
                    </sl-button>
                  `
                : null}
              ${this.editorStore.selectedNode.class == "branch"
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
              ${this.editorStore.selectedNode.class == "popup"
                ? html`
                    <sl-switch
                      ?checked=${this.editorStore.selectedContainer
                        .preventClosing}
                      @sl-input=${(event) =>
                        this.handleSwitchPreventClosing(event)}
                    >
                      Prevent Closing
                    </sl-switch>
                    <sl-switch
                      ?checked=${this.editorStore.selectedContainer.noHeader
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

  */
  private _handleNodeSearch(event: Event) {
    const inputText = (event.target as SlInput).value;

    this.editorStore.setSearchTerm(inputText);

    this.dispatchEvent(
      new CustomEvent("nodeSearch", {
        bubbles: true,
        composed: true,
      })
    );

    this.requestUpdate();
  }

  /*

  */
  private makeNodeOrigin() {
    this.dispatchEvent(
      new CustomEvent("makeSelectedNodeOrigin", {
        detail: { newId: this.editorStore.selectedNode.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  /*

  */
  private handleSwitchPreventClosing(event: Event) {
    const value = (event.target as SlSwitch).checked;
    this.editorStore.selectedContainer.preventClosing = value;
    this.editorStore.setSelectedContainer(this.editorStore.selectedContainer);
    this.requestUpdate();
  }

  /*


  */
  private handleSwitchNoHeader(event: Event) {
    const value = (event.target as SlSwitch).checked;
    this.editorStore.selectedContainer.noHeader = !value;
    this.editorStore.setSelectedContainer(this.editorStore.selectedContainer);
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

  /*


  */
  private moveTo(node: DrawflowNode) {
    this.dispatchEvent(
      new CustomEvent("moveTo", {
        detail: { node: node },
        bubbles: true,
        composed: true,
      })
    );
  }

  /*


  */
  _handleInputKeydown(event) {
    if (event.key === " ") {
      // Prevent space from triggering any unwanted events (e.g., dropdown closing)
      event.stopPropagation();
    }
  }
}
