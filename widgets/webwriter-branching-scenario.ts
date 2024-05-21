import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, query, state } from "lit/decorators.js";

//Shoelace Imports
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import SlDropdown from "@shoelace-style/shoelace/dist/components/dropdown/dropdown.component.js";
import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.component.js";
import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.component.js";

import "@shoelace-style/shoelace/dist/themes/light.css";

//TODO: sl icons dont work
import FileEarmarkPlus from "bootstrap-icons/icons/file-earmark-plus.svg";
import FileEarmark from "bootstrap-icons/icons/file-earmark.svg";
import ZoomIn from "bootstrap-icons/icons/zoom-in.svg";
import ZoomOut from "bootstrap-icons/icons/zoom-out.svg";
import JournalPlus from "bootstrap-icons/icons/journal-plus.svg";
import Journal from "bootstrap-icons/icons/journal.svg";
import ArrowCounterClockWise from "bootstrap-icons/icons/arrow-counterclockwise.svg";
import ArrowClockWise from "bootstrap-icons/icons/arrow-clockwise.svg";
import Trash3 from "bootstrap-icons/icons/trash3.svg";
import Floppy from "bootstrap-icons/icons/floppy.svg";

//Drawflow Imports
import Drawflow from "drawflow";
import { style } from "drawflow/dist/drawflow.style.js";
//import styleDrawflow from "drawflow/dist/drawflow.min.css?raw";

import styles from "../styles";

@customElement("webwriter-branching-scenario")
export class WebWriterBranchingScenario extends LitElementWw {
  @query("#drawflow")
  drawflow;

  @state()
  editor?: Drawflow;

  @property({ type: Boolean }) nodeSelected = false;
  @property({ type: Number }) selectedNodeId = null;

  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-textarea": SlTextarea,
      "sl-divider": SlDivider,
      "sl-dialog": SlDialog,
      "sl-icon-button": SlIconButton,
      "sl-dropdown": SlDropdown,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
    };
  }

  static styles = [style, styles];

  protected firstUpdated(_changedProperties: any): void {
    const container = this.shadowRoot?.getElementById("drawflow");
    this.editor = new Drawflow(container);
    this.editor.reroute = true;
    this.editor.reroute_fix_curvature = true;

    this.editor.zoom = 0.75;

    this.editor.start();

    this.editor.zoom_refresh();

    //register editor event
    this.editor.on("nodeDataChanged", (id) => {
      console.log("nodeDataChanged");
      console.log(this.editor.getNodeFromId(id));
    });

    // Event listener for node click
    this.editor.on("nodeSelected", (id) => {
      const node = this.editor.getNodeFromId(id);
      this.nodeSelected = true;
      this.selectedNodeId = node.id;
      console.log("node selected");
    });

    // Event listener for node click
    this.editor.on(
      "connectionSelected",
      (output_id, input_id, output_class, input_class) => {
        console.log("connection selected");
      }
    );

    // Event listener for node click
    this.editor.on("nodeUnselected", (boolean) => {
      const textAreaHTML = this.shadowRoot?.getElementById(
        "textAreaHTML"
      ) as SlTextarea;
      textAreaHTML.value = "";
      this.nodeSelected = false;
      this.selectedNodeId = null;
    });
  }

  updated(changedProperties) {
    if (changedProperties.has("nodeSelected") && this.nodeSelected) {
      const textAreaHTML = this.shadowRoot?.getElementById(
        "textAreaHTML"
      ) as SlTextarea;
      if (textAreaHTML) {
        const node = this.editor.getNodeFromId(this.selectedNodeId);
        textAreaHTML.value = node.data.html;
      }
    }
  }

  render() {
    return html` <div class="widget">
        <div class="controls">
          <div class="first-item">
            <sl-icon-button
              id="addSheetBtn"
              src=${FileEarmarkPlus}
              class="border"
              @click=${() => this._addSheetNode("Untitled Sheet")}
            ></sl-icon-button>
            <sl-dropdown>
              <sl-button slot="trigger">Add Branch</sl-button>
              <sl-menu>
                <sl-menu-item @click=${() => this._addBranchNode("Branch")}
                  >Simple Branch</sl-menu-item
                >
                <sl-menu-item @click=${() => this._addBranchNode("Branch")}
                  >Quiz Branch</sl-menu-item
                >
                <sl-menu-item @click=${() => this._addBranchNode("Branch")}
                  >Reactive Branch</sl-menu-item
                >
              </sl-menu>
            </sl-dropdown>
          </div>
          <sl-icon-button src=${ArrowCounterClockWise} class="border">
          </sl-icon-button>
          <sl-icon-button src=${ArrowClockWise} class="border"></sl-icon-button>
          <sl-divider vertical style="height: 30px;"></sl-divider>
          <sl-icon-button
            id="clearBtn"
            src=${Trash3}
            class="border"
            @click=${() =>
              (this.shadowRoot.getElementById("dialog") as SlDialog).show()}
          ></sl-icon-button>
        </div>
        <div id="drawflow">
          <div class="bar-zoom">
            <sl-icon-button
              id="zoomInBtn"
              src=${ZoomIn}
              style="font-size: auto;"
              @click=${() => this.editor.zoom_in()}
            ></sl-icon-button>
            <sl-icon-button
              id="zoomOutBtn"
              src=${ZoomOut}
              style="font-size: auto;"
              @click=${() => this.editor.zoom_out()}
            ></sl-icon-button>
          </div>
        </div>

        <div id="selection" class="selected-content-area">
          ${this.nodeSelected
            ? html`
                Connected HTML
                <sl-textarea
                  id="textAreaHTML"
                  resize="none"
                  placeholder="No node selected"
                  size="large"
                ></sl-textarea>
                <sl-icon-button
                  src=${Floppy}
                  id="saveChangesBtn"
                  @click=${this._saveChangesToNodeData}
                ></sl-icon-button>
                <sl-button @click=${this._addInputToSelectedNode}>
                  Add Input
                </sl-button>
                <sl-button @click=${this._addOutputToSelectedNode}>
                  Add Output
                </sl-button>
              `
            : html`
                <!-- Content to display when the condition is false -->
                <p>Select a node to display its content</p>
              `}
        </div>
      </div>

      <sl-dialog label="Clear graph" class="dialog" id="dialog">
        Do you want to clear the graph? All your progress will be lost.
        <sl-button
          id="closeDialogBtn"
          slot="footer"
          variant="primary"
          outline
          @click=${() =>
            (this.shadowRoot.getElementById("dialog") as SlDialog).hide()}
          >Cancel</sl-button
        >
        <sl-button
          slot="footer"
          variant="danger"
          outline
          @click=${() => this._clearEditor()}
          >Clear</sl-button
        >
      </sl-dialog>`;
  }

  //TODO: make this.editor a state variable, change the html render to include @click event catcher, write the funciton outside firstRender, see if that fixes sl-bug in node
  private _addSheetNode(name) {
    const data = {
      name: name,
      html: `<div><p>Testing HTML Editing</p></div>`,
    };

    //const test = "<div><div class='title-box'><p>Worksheet</p></div><div class='content'><button>test</button><sl-textarea id='test' rows='1' resize='none' value='${name}' placeholder='Enter name' size='small' label='Name' df-name></sl-textarea></div></div>";

    //this.editor.addNode(name, inputs, outputs, posx, posy, class, data, html);
    this.editor.addNode(
      name,
      0,
      0,
      0,
      0,
      "sheet",
      data,
      `
      <div>
        <div class="title-box">
          <svg id="svg">
            ${FileEarmark}
          </svg>
          <p class= "title" >Worksheet</p>
        </div>
        <div class="content">
        <p class="input-label">Name</p>
          <input
            type="text"
            id="test-textarea"
            placeholder="Enter name"
            df-name
          ></input>
        </div>
      </div>`,
      false
    );
  }

  private _addBranchNode(type) {
    const data = {
      name: type,
    };

    //this.editor.addNode(name, inputs, outputs, posx, posy, class, data, html);
    this.editor.addNode(
      type,
      0,
      0,
      0,
      0,
      "branch",
      data,
      `
        <div class="title-box">
          <svg id="svg">
            ${Journal}
          </svg>
          <div class="title">${type}</div>
        </div>
      `,
      false
    );
  }

  private _clearEditor() {
    const dialog = this.shadowRoot.getElementById("dialog") as SlDialog;
    dialog.hide();
    this.editor.clear();
  }

  private _saveChangesToNodeData() {
    const textAreaHTML = this.shadowRoot?.getElementById(
      "textAreaHTML"
    ) as SlTextarea;
    const selectedNode = this.editor.getNodeFromId(this.selectedNodeId);
    const newHTML = textAreaHTML.value;
    this.editor.updateNodeDataFromId(this.selectedNodeId, {
      name: selectedNode.data.name,
      html: newHTML,
    });
  }

  private _addInputToSelectedNode() {
    this.editor.addNodeInput(this.selectedNodeId);
  }

  private _addOutputToSelectedNode() {
    this.editor.addNodeOutput(this.selectedNodeId);
  }
}

customElements.define(
  "webwriter-branching-scenario",
  WebWriterBranchingScenario
);
