import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, query } from "lit/decorators.js";

//Shoelace Imports
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import "@shoelace-style/shoelace/dist/themes/light.css";

//TODO: sl icons dont work
import FileEarmarkPlus from "bootstrap-icons/icons/file-earmark-plus.svg";
import ZoomIn from "bootstrap-icons/icons/zoom-in.svg";
import ZoomOut from "bootstrap-icons/icons/zoom-out.svg";
import JournalPlus from "bootstrap-icons/icons/journal-plus.svg";
import ArrowCounterClockWise from "bootstrap-icons/icons/arrow-counterclockwise.svg";
import ArrowClockWise from "bootstrap-icons/icons/arrow-clockwise.svg";
import Trash3 from "bootstrap-icons/icons/trash3.svg";
import Floppy from "bootstrap-icons/icons/floppy.svg";

//Drawflow Imports
import Drawflow from "drawflow";
import { style } from "drawflow/dist/drawflow.style.js";
//import styleDrawflow from "drawflow/dist/drawflow.min.css?raw";

import styles from "../styles";

let i_count_new_sheets = 0; // Global variable to count new sheets
let selected_node_id = null;

@customElement("webwriter-branching-scenario")
export class WebWriterBranchingScenario extends LitElementWw {
  //TODO: what does this exactly do?
  @query("#drawflow")
  drawflow;

  @property()
  editor?: Drawflow;

  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-textarea": SlTextarea,
      "sl-divider": SlDivider,
      "sl-dialog": SlDialog,
      "sl-icon-button": SlIconButton,
    };
  }

  // static scopedElements = {
  //   "sl-button": SlButton,
  //   "sl-textarea": SlTextarea,
  //   "sl-divider": SlDivider,
  //   "sl-dialog": SlDialog,
  //   "sl-icon-button": SlIconButton,
  // };

  static styles = [style, styles];

  protected firstUpdated(_changedProperties: any): void {
    const container = this.shadowRoot?.getElementById("drawflow");
    this.editor = new Drawflow(container);
    this.editor.reroute = true;
    this.editor.reroute_fix_curvature = true;

    this.editor.start();

    //register editor event
    this.editor.on("nodeDataChanged", (id) => {
      console.log("nodeDataChanged");
      console.log(this.editor.getNodeFromId(id));
    });

    // Event listener for node click
    this.editor.on("nodeSelected", (id) => {
      console.log("node selected");
      const node = this.editor.getNodeFromId(id);
      const textAreaHTML = this.shadowRoot?.getElementById(
        "textAreaHTML"
      ) as SlTextarea;
      textAreaHTML.value = node.data.html;
      selected_node_id = id;
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
      selected_node_id = null;
    });
  }

  render() {
    return html` <div class="widget">
        <div class="controls">
          <sl-icon-button
            id="addSheetBtn"
            src=${FileEarmarkPlus}
            @click=${() => this._addSheetNode("Untitled Sheet")}
          ></sl-icon-button>
          <sl-icon-button
            id="addBranchBtn"
            src=${JournalPlus}
            @click=${() => this._addBranchNode("Branch")}
          ></sl-icon-button>
          <sl-divider vertical style="height: 30px;"></sl-divider>
          <sl-icon-button src=${ArrowCounterClockWise}> </sl-icon-button>
          <sl-icon-button src=${ArrowClockWise}></sl-icon-button>
          <sl-divider vertical style="height: 30px;"></sl-divider>
          <sl-icon-button
            id="clearBtn"
            src=${Trash3}
            @click=${() =>
              (this.shadowRoot.getElementById("dialog") as SlDialog).show()}
          ></sl-icon-button>
        </div>
        <div id="drawflow">
          <div class="bar-zoom">
            <sl-icon-button
              id="zoomInBtn"
              src=${ZoomIn}
              @click=${() => this.editor.zoom_in()}
            ></sl-icon-button>
            <sl-icon-button
              id="zoomOutBtn"
              src=${ZoomOut}
              @click=${() => this.editor.zoom_out()}
            ></sl-icon-button>
          </div>
        </div>

        <div id="selection" class="selected-content-area">
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
          id="clearConfirmBtn"
          slot="footer"
          variant="danger"
          outline
          @click=${() => this._clearEditor}
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

    // Create a new div element and set its inner HTML

    //this.editor.addNode(name, inputs, outputs, posx, posy, class, data, html);
    this.editor.addNode(
      name,
      0,
      1,
      0,
      0,
      "sheet",
      data,
      ` <div>
        <div class="title-box">
          <p>Worksheet</p>
        </div>
        <div class="content">
          <button>test</button>
          <sl-textarea
            rows="1"
            resize="none"
            value="${name}"
            placeholder="Enter name"
            size="small"
            label="Name"
            df-name
          ></sl-textarea>
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
      1,
      2,
      0,
      0,
      "branch",
      data,
      `
        <div>
          <div class="title-box">${type}</div>
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
    const selectedNode = this.editor.getNodeFromId(selected_node_id);
    const newHTML = textAreaHTML.value;
    this.editor.updateNodeDataFromId(selected_node_id, {
      name: selectedNode.data.name,
      html: newHTML,
    });
  }
}

customElements.define(
  "webwriter-branching-scenario",
  WebWriterBranchingScenario
);
