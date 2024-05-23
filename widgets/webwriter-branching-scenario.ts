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
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js";
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js";

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
import Plus from "bootstrap-icons/icons/plus.svg";
import Dash from "bootstrap-icons/icons/dash.svg";
import PlayFill from "bootstrap-icons/icons/arrow-right-circle-fill.svg";

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
  @property({ type: Number }) createdNodeId = null;

  //Nodes for referencing: (Id, Name)
  @property({ type: Array }) selectedNode: [number, string] = [null, null];
  @property({ type: Array }) nodesInEditor: [number, string][] = [];

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
      "sl-select": SlSelect,
      "sl-option": SlOption,
    };
  }

  static styles = [style, styles];

  protected firstUpdated(_changedProperties: any): void {
    //initialize the Editor
    const container = this.shadowRoot?.getElementById("drawflow");
    this.editor = new Drawflow(container);
    this.editor.reroute = true;
    this.editor.reroute_fix_curvature = true;
    this.editor.zoom = 0.75;
    this.editor.start();
    this.editor.zoom_refresh();

    //Register Event Handlers for editor
    this.editor.on("nodeDataChanged", (id) => {
      const updatedNode = this.editor.getNodeFromId(id);

      //This just assumes that the name changed
      let index = -1;
      for (let i = 0; i < this.nodesInEditor.length; i++) {
        if (this.nodesInEditor[i][0] == id) {
          index = i;
          break;
        }
      }

      this.nodesInEditor = [
        ...this.nodesInEditor.slice(0, index),
        [id, updatedNode.data.name],
        ...this.nodesInEditor.slice(index + 1),
      ];

      this.selectedNode = [this.selectedNode[0], updatedNode.data.name];
    });

    // Event listener for node click
    this.editor.on("nodeSelected", (id) => {
      const node = this.editor.getNodeFromId(id);
      this.nodeSelected = true;
      this.selectedNode = [node.id, node.data.name];
    });

    // Event listener for connection click
    this.editor.on(
      "connectionSelected",
      (output_id, input_id, output_class, input_class) => {
        console.log("connection selected");
      }
    );

    // Event listener for node unselected
    this.editor.on("nodeUnselected", (boolean) => {
      const textAreaHTML = this.shadowRoot?.getElementById(
        "textAreaHTML"
      ) as SlTextarea;
      textAreaHTML.value = "";
      this.nodeSelected = false;
      this.selectedNode = [null, null];
    });

    //Event listerner for creation of a node
    this.editor.on("nodeCreated", (id) => {
      this.createdNodeId = id;
      let createdNodeName = this.editor.getNodeFromId(id).data.name;
      this.nodesInEditor = [
        ...this.nodesInEditor,
        [this.createdNodeId, createdNodeName],
      ];
      console.log(this.nodesInEditor);
    });

    //Event listener for deletion of a node
    this.editor.on("nodeRemoved", (id) => {
      this.nodesInEditor = this.nodesInEditor.filter((item) => item[0] != id);
      console.log(this.nodesInEditor);
    });

    this.editor.on("translate", ({ x, y }) => {
      //let movedNode = this.editor.getNodeFromId(id);
      //console.log(movedNode.pos_x, movedNode.pos_y);
    });

    //Create Origin
    this._addOriginToGraph();
  }

  //React to changes in lit properties
  updated(changedProperties) {
    if (changedProperties.has("nodeSelected") && this.nodeSelected) {
      //When a node is selected the HTML tree changes.
      //This code is necessary to dynamically set the content of the appearing components

      //Update the textArea content
      const textAreaHTML = this.shadowRoot?.getElementById(
        "textAreaHTML"
      ) as SlTextarea;
      if (textAreaHTML) {
        const node = this.editor.getNodeFromId(this.selectedNode[0]);
        textAreaHTML.value = node.data.html;
      }

      //Initially fills the NodeSelect with options
      const nodeSelect = this.shadowRoot?.getElementById(
        "nodeSelect"
      ) as SlSelect;
      if (nodeSelect) {
        while (nodeSelect.firstChild) {
          nodeSelect.removeChild(nodeSelect.firstChild);
        }

        this.nodesInEditor.forEach((node) => {
          if (node[0] != this.selectedNode[0]) {
            nodeSelect.innerHTML += `<sl-option value=${node[0].toString()}>${
              node[1]
            }</sl-option>`;
          }
        });
      }
    }

    //Reacts to changes such as node names
    if (changedProperties.has("nodesInEditor")) {
      const nodeSelect = this.shadowRoot?.getElementById(
        "nodeSelect"
      ) as SlSelect;
      if (nodeSelect) {
        while (nodeSelect.firstChild) {
          nodeSelect.removeChild(nodeSelect.firstChild);
        }
        this.nodesInEditor.forEach((node) => {
          if (node[0] != this.selectedNode[0]) {
            nodeSelect.innerHTML += `<sl-option value=${node[0].toString()}>${
              node[1]
            }</sl-option>`;
          }
        });
      }
    }

    //reset the node select once selectedNode changes
    if (changedProperties.has("selectedNode")) {
      const nodeSelect = this.shadowRoot?.getElementById(
        "nodeSelect"
      ) as SlSelect;
      if (nodeSelect) {
        nodeSelect.value = "";
      }
    }
  }

  render() {
    return html` <div class="widget">
        <div class="controls">
          <div class="first-item">
            <sl-button id="previewBtn">Preview</sl-button>
          </div>
          <sl-icon-button
            id="addSheetBtn"
            src=${FileEarmarkPlus}
            class="border"
            @click=${() => this._addSheetNode("Untitled Sheet")}
          ></sl-icon-button>
          <sl-divider vertical style="height: 30px;"></sl-divider>
          <sl-button
            id="clearBtn"
            @click=${() =>
              (this.shadowRoot.getElementById("dialog") as SlDialog).show()}
            >Clear</sl-button
          >
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
                <div class="controls">
                  <sl-icon-button
                    src=${Plus}
                    @click=${this._addInputToSelectedNode}
                  >
                  </sl-icon-button>
                  <sl-icon-button
                    src=${Dash}
                    @click=${this._deleteInputOfSelectedNode}
                  >
                  </sl-icon-button>
                  <sl-divider vertical style="height: 30px;"></sl-divider>
                  <sl-icon-button
                    src=${Plus}
                    @click=${this._addOutputToSelectedNode}
                  >
                  </sl-icon-button>
                  <sl-icon-button
                    src=${Dash}
                    @click=${this._deleteOutputOfSelectedNode}
                  >
                  </sl-icon-button>
                  <sl-divider vertical style="height: 30px;"></sl-divider>
                  <sl-select id="nodeSelect"> </sl-select>
                  <sl-button @click=${() => this._connectSelectedNodes()}
                    >Add Link</sl-button
                  >
                  <sl-divider vertical style="height: 30px;"></sl-divider>
                  <sl-dropdown>
                    <sl-button slot="trigger">Add Branch</sl-button>
                    <sl-menu>
                      <sl-menu-item>Quiz Branch</sl-menu-item>
                      <sl-menu-item>Reactive Branch</sl-menu-item>
                    </sl-menu>
                  </sl-dropdown>
                  <sl-divider vertical style="height: 30px;"></sl-divider>
                  <sl-icon-button
                    src=${Floppy}
                    id="saveChangesBtn"
                    @click=${this._saveChangesToNodeData}
                  ></sl-icon-button>
                </div>
                <p>Selected Worksheet: ${this.selectedNode[1]}</p>
                <!-- <div class="worksheet">test</div> -->
                <sl-textarea
                  id="textAreaHTML"
                  resize="none"
                  placeholder="No node selected"
                  size="large"
                ></sl-textarea>
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
          <svg id="svg">${FileEarmark}</svg>
          <p class="title">Worksheet</p>
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

  private _addLinkNodeToEditor(type, posx, posy) {
    const data = {
      name: type,
    };

    //this.editor.addNode(name, inputs, outputs, posx, posy, class, data, html);
    this.editor.addNode(
      type,
      1,
      1,
      posx,
      posy,
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

    this.nodesInEditor = [];
    this.selectedNode = [null, null];
    this.nodeSelected = false;

    //Create Origin
    this._addOriginToGraph();
  }

  private _saveChangesToNodeData() {
    const textAreaHTML = this.shadowRoot?.getElementById(
      "textAreaHTML"
    ) as SlTextarea;
    const newHTML = textAreaHTML.value;
    this.editor.updateNodeDataFromId(this.selectedNode[0], {
      name: this.selectedNode[1],
      html: newHTML,
    });
  }

  private _addInputToSelectedNode() {
    this.editor.addNodeInput(this.selectedNode[0]);
  }

  private _addOutputToSelectedNode() {
    this.editor.addNodeOutput(this.selectedNode[0]);
  }

  private _deleteInputOfSelectedNode() {
    const node = this.editor.getNodeFromId(this.selectedNode[0]);
    const noOfInputs = Object.keys(node.inputs).length;
    if (noOfInputs != 0) {
      this.editor.removeNodeInput(this.selectedNode[0], `input_${noOfInputs}`);
    }
  }

  private _deleteOutputOfSelectedNode() {
    const node = this.editor.getNodeFromId(this.selectedNode[0]);
    const noOfOutputs = Object.keys(node.outputs).length;
    if (noOfOutputs != 0) {
      this.editor.removeNodeOutput(
        this.selectedNode[0],
        `output_${noOfOutputs}`
      );
    }
  }

  private _connectSelectedNodes() {
    const nodeSelect = this.shadowRoot?.getElementById(
      "nodeSelect"
    ) as SlSelect;

    const nodeToBeConnectedId = nodeSelect.value;

    let nodeToBeConnectedIdAsNumber;

    if (Array.isArray(nodeToBeConnectedId)) {
      // If it's an array, convert each element to a number
      nodeToBeConnectedIdAsNumber = nodeToBeConnectedId.map((id) => Number(id));
    } else {
      // If it's a single string, convert it directly to a number
      nodeToBeConnectedIdAsNumber = Number(nodeToBeConnectedId);
    }

    this.editor.addNodeInput(nodeToBeConnectedIdAsNumber);
    const inputs = this.editor.getNodeFromId(
      nodeToBeConnectedIdAsNumber
    ).inputs;
    const inputKeys = Object.keys(inputs);
    const lastInputKey = inputKeys[inputKeys.length - 1];

    this._addOutputToSelectedNode();
    const outputs = this.editor.getNodeFromId(this.selectedNode[0]).outputs;
    const outputKeys = Object.keys(outputs);
    const lastOutputKey = outputKeys[outputKeys.length - 1];

    this.editor.addConnection(
      this.selectedNode[0],
      nodeToBeConnectedIdAsNumber,
      lastOutputKey,
      lastInputKey
    );

    //TODO: Think about gamebook structure on development side (ask chatgpt)
    //TODO: does a gamebook have an always continue button? does one define a flow?
    //TODO: subchapters?? like swithcing between screens but then proceeding? i mean wtf
    //TODO: does it have a start screen? an end screen?
    //TOOD: do links really need to do this node stuff?
    //TODO: back button?
    //TODO: check time plan
    //TODO: selected area should only be available for nodes of type sheet
    //TODO: how to let the area be webwriter editable?
    //TODO: write this decision making down... work visually with node inputs? have a link component?
    //TODO: add preview Mode and stuff
  }

  private _addOriginToGraph() {
    const data = {
      name: "First Worksheet",
      html: `<div><p>Testing HTML Editing</p></div>`,
    };

    this.editor.addNode(
      "First Worksheet",
      0,
      0,
      0,
      0,
      "origin",
      data,
      `
      <div>
        <div class="title-box">
          <svg id="svg">${FileEarmark}</svg>
          <p class="title">Worksheet</p>
          <div class="badge">
            <div class="div-svg">
               <svg>${PlayFill}</svg>
            </div>
            <p>Start Page</p>
          </div>
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
}

customElements.define(
  "webwriter-branching-scenario",
  WebWriterBranchingScenario
);
