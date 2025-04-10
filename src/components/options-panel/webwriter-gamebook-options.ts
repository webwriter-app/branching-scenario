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
import infoSquareFilled from "@tabler/icons/outline/info-square.svg";
import infoSquareRounded from "@tabler/icons/filled/info-square-rounded.svg";

import {
  editorState,
  GamebookEditorState,
} from "../../utils/gamebook-editor-state-context";

//Drawflow Imports
import Drawflow, { DrawflowNode } from "drawflow";

import { msg, localized } from "@lit/localize";

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
  SlTooltip,
} from "@shoelace-style/shoelace";

@localized()
export class WebWriterGamebookOptions extends LitElementWw {
  static get styles() {
    return css`
      .author-only {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        gap: 10px;
        width: 100%;
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
      "sl-tooltip": SlTooltip,
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
              style="width: 100%"
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

        <sl-tooltip hoist placement="right-end">
          <div slot="content">
            ${msg(html`
              Use the <strong>search bar</strong> to find nodes by
              <strong>title</strong>, <strong>type</strong>, and
              <strong>content</strong>. <br /><br />
              <em>Tip:</em> Clicking the search bar will display a
              <strong>list of all nodes</strong>. Click on any node in the list
              to <strong>select it in the node editor</strong>.
            `)}
          </div>
          <sl-dropdown>
            <sl-input
              slot="trigger"
              id="searchInput"
              placeholder=${msg("Search Nodes...")}
              clearable
              @sl-input=${this._handleNodeSearch}
              @keydown=${this._handleInputKeydown}
              .value=${this.editorStore.searchTerm}
            >
              <sl-icon src=${search} slot="prefix"></sl-icon>
            </sl-input>

            <sl-menu hoist>
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
        </sl-tooltip>

        <sl-button-group>
          <sl-button
            style="width: 100%"
            id="copyNodeBtn"
            @click=${() =>
              this.editorStore.setCopiedNode(this.editorStore.selectedNode)}
            ?disabled=${this.editorStore.selectedNode.id === -1}
          >
            ${msg("Copy")}
          </sl-button>

          <sl-button
            style="width: 100%"
            @click=${() =>
              this.dispatchEvent(
                new CustomEvent("pasteNode", {
                  bubbles: true,
                  composed: true,
                })
              )}
            ?disabled=${this.editorStore.copiedNode.id === -1}
          >
            ${msg("Paste")}
          </sl-button>

          <sl-button
            variant="default"
            @click=${() => this.deleteSelectedNode()}
            ?disabled=${this.editorStore.selectedNode.id === -1 ||
            this.editorStore.selectedNode.class == "origin"
              ? true
              : false}
          >
            <sl-icon slot="prefix" src=${trash}></sl-icon>
          </sl-button>
        </sl-button-group>

        ${this.editorStore.selectedNode.id != -1
          ? html`
              <div class="header">
                ${this.editorStore.selectedNode.class == "page"
                  ? html`
                      <sl-icon src=${file}></sl-icon>
                      <p>${msg("Page")}</p>
                    `
                  : this.editorStore.selectedNode.class == "origin"
                  ? html`
                      <sl-icon src=${file}></sl-icon>
                      <p>${msg("Start Page")}</p>
                    `
                  : this.editorStore.selectedNode.class == "popup"
                  ? html`
                      <sl-icon src=${squares}></sl-icon>
                      <p>${msg("Popup")}</p>
                    `
                  : this.editorStore.selectedNode.class == "branch"
                  ? html`
                      <sl-icon src=${arrowsSplit2}></sl-icon>
                      <p>${msg("Branch")}</p>
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
                      ${msg("Set as Start Page")}
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
                      ${msg(
                        "Create rules to guide how your gamebook progresses. The first rule that applies will be used."
                      )}
                    </p>
                    <p>
                      <sl-icon
                        src="${packages}"
                        style="vertical-align: middle; margin: 1px;"
                      ></sl-icon>
                      ${msg("Requires")}
                      <a
                        href="https://webwriter.app/packages/@webwriter/quiz/"
                        target="https://webwriter.app/packages/@webwriter/quiz/"
                      >
                        WebWriter Quiz Package </a
                      >.
                    </p>
                  `
                : null}
              ${this.editorStore.selectedNode.class == "popup"
                ? html`
                    <sl-switch
                      style="padding-left: 5px;"
                      ?checked=${this.editorStore.selectedContainer
                        .preventClosing}
                      @sl-input=${(event) =>
                        this.handleSwitchPreventClosing(event)}
                    >
                      ${msg("Prevent Closing")}
                    </sl-switch>
                    <sl-switch
                      style="padding-left: 5px;"
                      ?checked=${this.editorStore.selectedContainer.noHeader
                        ? false
                        : true}
                      @sl-input=${(event) => this.handleSwitchNoHeader(event)}
                    >
                      ${msg("Header")}
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
