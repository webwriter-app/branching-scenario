import { html, css, PropertyValues } from "lit";
import { consume } from "@lit/context";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, query, queryAll } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

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
} from "@shoelace-style/shoelace";

//@tabler icons
import file from "@tabler/icons/filled/file.svg";
import circleArrowRight from "@tabler/icons/filled/circle-arrow-right.svg";
import dotsVertical from "@tabler/icons/outline/dots-vertical.svg";
import zoomIn from "@tabler/icons/outline/zoom-in.svg";
import zoomOut from "@tabler/icons/outline/zoom-out.svg";
import squares from "@tabler/icons/filled/squares.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";

import mapPin from "@tabler/icons/outline/map-pin.svg";

//Drawflow Imports
import Drawflow, { DrawflowNode } from "drawflow";
import { style } from "drawflow/dist/drawflow.style.js";

import customDrawflowStyles from "../../css/custom-drawflow-css";
import styles from "../../css/node-editor-css";

import { NodeEditorControlsBar } from "./node-editor-control-bar";
import { DrawflowHelpPopUpControls } from "./node-editor-help-popup-controls";
import { decisionPopUpWithFeedback } from "../node-templates/decision-popup-with-feedback";

const NO_CONNECTION_SELECTED = "output_id-input_id-output_class-input_class";

const GRID_SIZE = 40;

import { gamebookStore, GamebookStore } from "../context-test";

@customElement("node-editor")
export class NodeEditor extends LitElementWw {
  //registering custom elements used in the Web component
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-textarea": SlTextarea,
      "sl-divider": SlDivider,
      "sl-dialog": SlDialog,
      "sl-icon": SlIcon,
      "sl-icon-button": SlIconButton,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
      "sl-dropdown": SlDropdown,
      "sl-menu-label": SlMenuLabel,
      "node-editor-controls-bar": NodeEditorControlsBar,
      "drawflow-help-popup-controls": DrawflowHelpPopUpControls,
    };
  }

  // Import CSS
  static styles = [
    style,
    styles,
    customDrawflowStyles,
    css`
      #drawflowEditorDiv {
        background-image: radial-gradient(
          circle,
          #dedede,
          1px,
          transparent 1px
        );
        background-size: ${GRID_SIZE}px ${GRID_SIZE}px;
        background-color: #fbfbfb;
        overflow: hidden;
        cursor: grab;
      }
      #drawflowEditorDiv:active {
        cursor: grabbing;
      }
    `,
  ];

  //internal reactive state, not part of the component's API
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editor: Drawflow;

  @property({ type: String }) accessor editorZoomString = "";
  @property({ type: String }) accessor selectedConnection =
    NO_CONNECTION_SELECTED;
  @property({ type: Boolean, attribute: true }) accessor connectionStarted =
    false;
  @property({ type: Boolean }) accessor backgroundIsDragging = false;
  @property({ type: Number }) accessor backgroundLastX = 0;
  @property({ type: Number }) accessor backgroundLastY = 0;
  @property({ type: Number }) accessor backgroundTranslateX = 0;
  @property({ type: Number }) accessor backgroundTranslateY = 0;
  @property({ type: Number }) accessor backgroundScale = 0.45;
  @property({ type: Number }) accessor backgroundMinScale = 0.5;
  @property({ type: Number }) accessor backgroundMaxScale = 2;
  @property({ type: Number }) accessor backgroundScaleFactor = 1.05;
  @property({ type: Boolean }) accessor nodePasted = false;

  @query("#drawflowEditorDiv") accessor drawflowEditorDiv;
  @queryAll('div[id*="node-"]') accessor nodeDivs;

  @consume({ context: gamebookStore, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor providedStore = new GamebookStore("Default");

  //access nodes in the internal component DOM.
  @property({ attribute: false }) accessor changeInEditorCallback = (
    drawflow: Object,
    updateType: String,
    node?: DrawflowNode,
    removedNodeId?: String,
    inputNode?: DrawflowNode,
    outputNode?: DrawflowNode,
    inputClass?: String,
    outputClass?: String,
    outputHadConnections?: Boolean,
    importedGamebookContainers?: Array<Object>,
    zoom?: Number,
    translate?: { x: number; y: number },
    changeOrigin?: { oldId: number; newId: number }
  ) => {};

  @property({ attribute: false }) accessor markUsedOutputs = () => {};

  /*

  */
  protected firstUpdated(_changedProperties: any): void {
    this.editor = new Drawflow(this.drawflowEditorDiv);

    this.editor.reroute = false;
    this.editor.reroute_fix_curvature = false;
    //max scale
    this.editor.zoom_max = 0.8;
    //min scale
    this.editor.zoom_min = 0.25;
    //scale factor
    this.editor.zoom_value = 0.05;

    if (this.providedStore.editorZoom == -1) {
      console.log(this.providedStore.editorZoom);
      this.editor.zoom = this.backgroundScale;
    } else {
      console.log(this.providedStore.editorZoom);
      this.editor.zoom = this.providedStore.editorZoom;
      this.onZoom(this.providedStore.editorZoom, 0.2, this.editor.zoom_max);
    }

    this.editor.start();
    this.editor.zoom_refresh();

    if (
      this.providedStore.editorPosition.x != undefined &&
      this.providedStore.editorPosition.y != undefined
    ) {
      this.editor.canvas_x = this.providedStore.editorPosition.x;
      this.editor.canvas_y = this.providedStore.editorPosition.y;

      const drawflowContainer =
        this.drawflowEditorDiv.querySelector(".drawflow");

      if (drawflowContainer) {
        drawflowContainer.style.transform = `translate(${this.editor.canvas_x}px, ${this.editor.canvas_y}px) scale(${this.editor.zoom})`;
      }
    }

    this._registerEditorEventHandlers();

    if (this.providedStore.editorContent == null) {
      this.addPageNode("First Page", true);
    } else {
      this.editor.import(this.providedStore.editorContent);
    }

    this.markUsedOutputs();
  }

  /*

  */
  protected updated(_changedProperties: PropertyValues): void {
    if (this.providedStore.selectedNode.id === -1) {
      this.nodeDivs.forEach((nodeDiv) => {
        nodeDiv.classList.remove("selected");
      });
      this.editor.node_selected = null;
    }
    //
    else {
      this.nodeDivs.forEach((nodeDiv) => {
        const id = parseInt(nodeDiv.id.split("-")[1], 10);
        if (id === this.providedStore.selectedNode.id) {
          nodeDiv.classList.add("selected");
          this.editor.node_selected = nodeDiv;
        } else {
          nodeDiv.classList.remove("selected");
        }
      });
    }
  }

  /*

  */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("mousemove", this.onMouseMove);
    this.addEventListener("mousedown", this.onMouseDown);
    this.addEventListener("mouseup", this.onMouseUp);
    this.addEventListener("mouseleave", this.onMouseLeave);
  }

  /*

  */
  disconnectedCallback() {
    this.removeEventListener("mousemove", this.onMouseMove);
    this.removeEventListener("mousedown", this.onMouseDown);
    this.removeEventListener("mouseup", this.onMouseUp);
    this.removeEventListener("mouseleave", this.onMouseLeave);
    super.disconnectedCallback();
  }

  /*

  */
  render() {
    const gridStyles = {
      backgroundPosition: `${this.backgroundTranslateX}px ${this.backgroundTranslateY}px`,
      backgroundSize: `${GRID_SIZE * this.backgroundScale}px ${
        GRID_SIZE * this.backgroundScale
      }px`,
    };

    return html`
      <div id="nodeEditor">
        <node-editor-controls-bar
          @addPageNode=${(e: CustomEvent) => {
            this.addPageNode(e.detail.title, e.detail.isOrigin);
          }}
          @addPopUpNode=${(e: CustomEvent) => {
            this.addPopUpNode(e.detail.title);
          }}
          @addBranchNode=${(e: CustomEvent) => {
            this.addBranchNode(e.detail.title);
          }}
        >
        </node-editor-controls-bar>

        <div id="drawflowEditorDiv" style=${styleMap(gridStyles)}></div>
        <div class="zoomControls">
          <sl-icon-button
            id="jumpToOriginBtn"
            src=${mapPin}
            style="font-size: 18px;"
            @click=${() => this.jumpToOrigin()}
          >
          </sl-icon-button>
          <sl-divider vertical style="height: 20px; margin: 2px;"></sl-divider>

          <sl-icon-button
            id="zoomInBtn"
            src=${zoomIn}
            style="font-size: 18px;"
            @click=${() => this.editor.zoom_in()}
          >
          </sl-icon-button>
          <sl-icon-button
            id="zoomOutBtn"
            src=${zoomOut}
            style="font-size: 18px;"
            @click=${() => this.editor.zoom_out()}
          >
          </sl-icon-button>
        </div>
        <div class="zoomValue">
          <p>${this.editorZoomString}</p>
        </div>
        <drawflow-help-popup-controls></drawflow-help-popup-controls>
      </div>
      <!-- Dialog for clearing editor-->
      <sl-dialog label="Clear graph" class="dialog" id="dialog">
        Do you want to clear the graph? All your progress will be lost.
        <sl-button
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
      </sl-dialog>
    `;
  }

  /*

  */
  private onMouseDown(event: MouseEvent) {
    // Check if node is not selected
    this.backgroundIsDragging = true;
    this.backgroundLastX = event.clientX;
    this.backgroundLastY = event.clientY;
  }

  /*

  */
  public onMouseMove(event: MouseEvent) {
    if (
      this.backgroundIsDragging &&
      this.providedStore.selectedNode.id == -1 &&
      !this.connectionStarted
    ) {
      // Check if node is not selected
      const dx = event.clientX - this.backgroundLastX;
      const dy = event.clientY - this.backgroundLastY;
      this.backgroundTranslateX += dx;
      this.backgroundTranslateY += dy;
      this.backgroundLastX = event.clientX;
      this.backgroundLastY = event.clientY;
      this.requestUpdate();
    }
  }

  /*

  */
  private onMouseUp() {
    this.backgroundIsDragging = false;

    this.providedStore.setEditorPosition(
      this.editor.canvas_x,
      this.editor.canvas_y
    );
  }

  /*

  */
  private onMouseLeave() {
    if (this.backgroundIsDragging) {
      this.backgroundIsDragging = false;

      // If dragging is in progress, stop the dragging action
      this.editor.drag_point = false;
      this.editor.drag = false;

      // Find the Drawflow container (replace with the correct selector if needed)
      const editorElement = this.drawflowEditorDiv.querySelector(".drawflow"); // Adjust the selector to target the correct element

      if (editorElement) {
        // Create and dispatch a fake mouseup event
        const fakeMouseUpEvent = new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          view: window,
        });

        editorElement.dispatchEvent(fakeMouseUpEvent);

        // Get the computed style of the element to extract the transform property
        const computedStyle = window.getComputedStyle(editorElement);
        const transform = computedStyle.transform;

        if (transform && transform !== "none") {
          // Parse the transform matrix values
          const matrixValues = transform.match(/matrix\((.+)\)/);

          if (matrixValues && matrixValues[1]) {
            const values = matrixValues[1].split(", ").map(parseFloat);

            // The translateX and translateY values are in the 4th and 5th positions in the matrix (index 4 and 5)
            const translateX = values[4];
            const translateY = values[5];

            this.editor.canvas_x = translateX;
            this.editor.canvas_y = translateY;

            editorElement.style.transform = `translate(${this.editor.canvas_x}px, ${this.editor.canvas_y}px) scale(${this.editor.zoom})`;
          }
        } else {
          console.log("No transform applied.");
        }
      }
    }
  }

  /*

  */
  public onZoom(zoom_value: number, min_zoom: number, max_zoom: number) {
    const rect =
      this.shadowRoot!.querySelector(
        "#drawflowEditorDiv"
      )!.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate the new scale from zoom_value
    const prevScale = this.backgroundScale;
    this.backgroundScale = zoom_value; // Assuming zoom_value directly represents the new scale

    // Limit the scale within minScale and maxScale
    this.backgroundScale = Math.min(
      Math.max(min_zoom, this.backgroundScale),
      max_zoom
    );

    // Calculate the scale ratio
    const scaleRatio = this.backgroundScale / prevScale;

    // Update translateX and translateY to center the zoom
    this.backgroundTranslateX =
      centerX - (centerX - this.backgroundTranslateX) * scaleRatio;
    this.backgroundTranslateY =
      centerY - (centerY - this.backgroundTranslateY) * scaleRatio;

    // Request an update to apply the changes
    this.requestUpdate();
  }

  /*


  */
  private _clearEditor() {
    const dialog = this.shadowRoot.getElementById("dialog") as SlDialog;
    dialog.hide();

    this.editor.clear();

    this.changeInEditorCallback({ ...this.editor.drawflow }, "editorCleared");
    this.addPageNode("First Page", true);
  }

  /*
  
  */
  private jumpToOrigin() {
    const nodes = this.editor.drawflow.drawflow.Home.data;

    // Find the node with class 'origin'
    const originNode = Object.values(nodes).find(
      (node: any) => node.class === "origin"
    );

    if (!originNode) {
      console.error("No node with class 'origin' found.");
      return;
    }

    const { zoom, canvas_x, canvas_y } = this.editor;
    const { pos_x, pos_y } = originNode;

    //TODO: make adaptive to dynamic width and height
    const nodeWidth = 320;
    const nodeHeight = 109;

    const drawflowContainer = this.drawflowEditorDiv.querySelector(".drawflow");
    const rect = this.drawflowEditorDiv.getBoundingClientRect();

    if (drawflowContainer) {
      // Add the transition class for smooth animation
      drawflowContainer.classList.add("smooth-transition");
      this.drawflowEditorDiv.classList.add("smooth-background-transition");
      // Calculate the center of the origin node
      const originCenterX = pos_x + nodeWidth / 2;
      const originCenterY = pos_y + nodeHeight / 2;

      // Calculate the position of the editor and the node
      const nodePosX =
        originCenterX * zoom + canvas_x + (rect.width - rect.width * zoom) / 2;
      const nodePosY =
        originCenterY * zoom +
        canvas_y +
        (rect.height - rect.height * zoom) / 2;

      // Calculate the translation required to center the node
      this.editor.canvas_x -= nodePosX - rect.width / 2;
      this.editor.canvas_y -= nodePosY - rect.height / 2;

      drawflowContainer.style.transform = `translate(${this.editor.canvas_x}px, ${this.editor.canvas_y}px) scale(${zoom})`;

      this.backgroundLastX = this.backgroundTranslateX;
      this.backgroundLastY = this.backgroundTranslateY;
      this.backgroundTranslateX -= nodePosX - rect.width / 2;
      this.backgroundTranslateY -= nodePosY - rect.height / 2;
      this.requestUpdate();

      // // Optionally, remove the transition class after the animation is done
      setTimeout(() => {
        drawflowContainer.classList.remove("smooth-transition");
        this.drawflowEditorDiv.classList.remove("smooth-background-transition");
      }, 350); // Adjust the timeout duration to match your animation duration

      // console.log("here");
      // console.log({ x: this.editor.canvas_x, y: this.editor.canvas_y });

      this.providedStore.setEditorPosition(
        this.editor.canvas_x,
        this.editor.canvas_y
      );
    }
  }

  /*


  */
  public pasteNode() {
    const copiedNode = this.providedStore.copiedNode;

    if (copiedNode.id !== -1) {
      this.nodePasted = true;
      const titleCopy = `${copiedNode.data.title} copy`;

      switch (copiedNode.class) {
        case "page":
        case "origin":
          this.addPageNode(titleCopy, false);
          break;
        case "popup":
          this.addPopUpNode(titleCopy);
          break;
        case "branch":
          this.addBranchNode(titleCopy);
          break;
      }
    }
  }

  /*


  */
  private _registerEditorEventHandlers() {
    // Event listener for node click
    this.editor.on("nodeSelected", (id) => {
      this.providedStore.setSelectedNode(this.editor.getNodeFromId(id));
    });

    // Event listener for node unselected
    this.editor.on("nodeUnselected", (boolean) => {
      this.providedStore.setSelectedNode();
    });

    //Event listerner for creation of a node
    this.editor.on("nodeCreated", (id) => {
      let createdNode = this.editor.getNodeFromId(id);
      if (this.nodePasted == false) {
        this.dispatchEvent(
          new CustomEvent("nodeCreated", {
            detail: { node: createdNode },
            bubbles: true,
            composed: true,
          })
        );
      } else {
        this.nodePasted = false;
        this.dispatchEvent(
          new CustomEvent("nodePasted", {
            detail: { node: createdNode },
            bubbles: true,
            composed: true,
          })
        );
      }
    });

    //Event listener for deletion of a node
    this.editor.on("nodeRemoved", (id) => {
      this.dispatchEvent(
        new CustomEvent("nodeRemoved", {
          detail: { id: id },
          bubbles: true,
          composed: true,
        })
      );
    });

    //Event listener for when a node got moved
    this.editor.on("nodeMoved", (id) => {
      const nodes = this.editor.drawflow.drawflow.Home.data;

      Object.values(nodes).forEach((node) => {
        if (node.id == id) {
          //console.log(node.pos_x, node.pos_y);
        }
      });

      let movedNode = this.editor.getNodeFromId(id);

      this.changeInEditorCallback(
        { ...this.editor.drawflow },
        "nodeMoved",
        movedNode
      );
    });

    //Event listener for when a connection creation started via drag and drop
    this.editor.on("connectionStart", ({ output_id, output_class }) => {
      //this.updateSelectedNodeCallback(output_id);
      this.connectionStarted = true;

      this.shadowRoot
        .querySelector('svg[class="connection"]')
        ?.querySelector("path")
        ?.classList.add("highlighted");
    });

    this.editor.on("connectionCancel", () => {
      this.connectionStarted = false;
    });

    //Event listener for when a connection is selected
    //TODO: active and hover takes the highlight away
    this.editor.on(
      "connectionSelected",
      ({ output_id, input_id, output_class, input_class }) => {
        this.selectedConnection = `${output_id}-${input_id}-${output_class}-${input_class}`;
        this._highlightConnection(
          output_id,
          input_id,
          output_class,
          input_class
        );
        //this.updateSelectedNodeCallback(output_id);
      }
    );

    //event listener for when a connection is unselected
    this.editor.on("connectionUnselected", (boolean) => {
      const parsedConnection = this.parseConnectionIdentifier(
        this.selectedConnection
      );
      this._unhighlightConnection(
        parsedConnection.outputNodeId,
        parsedConnection.inputNodeId,
        parsedConnection.outputClass,
        parsedConnection.inputClass
      );
      this.selectedConnection = NO_CONNECTION_SELECTED;
    });

    //Event for created connections done e.g. via drag and drop
    this.editor.on(
      "connectionCreated",
      ({ output_id, input_id, output_class, input_class }) => {
        this.connectionStarted = false;
        //console.log("we got here");
        //this.updateSelectedNodeCallback(this.selectedNode.id);
        const outputNode = this.editor.getNodeFromId(output_id);
        const inputNode = this.editor.getNodeFromId(input_id);

        this.shadowRoot
          .querySelector(
            `svg[class="connection node_in_node-${input_id} node_out_node-${output_id} ${output_class} ${input_class}"]`
          )
          ?.querySelector("path")
          ?.classList.remove("highlighted");

        this.changeInEditorCallback(
          { ...this.editor.drawflow },
          "connectionCreated",
          null,
          null,
          inputNode,
          outputNode,
          input_class,
          output_class
        );
      }
    );

    //Event listener for when a connection is removed, e.g. by click in editor
    this.editor.on(
      "connectionRemoved",
      ({ output_id, input_id, output_class, input_class }) => {
        //console.log("this nodeeditor callback");
        //this.updateSelectedNodeCallback(this.selectedNode.id);

        if (this.selectedConnection != NO_CONNECTION_SELECTED) {
          const parsedConnection = this.parseConnectionIdentifier(
            this.selectedConnection
          );
          this._unhighlightConnection(
            parsedConnection.outputNodeId,
            parsedConnection.inputNodeId,
            parsedConnection.outputClass,
            parsedConnection.inputClass
          );
          this.selectedConnection = NO_CONNECTION_SELECTED;
        }

        const outputNode = this.editor.getNodeFromId(output_id);
        const inputNode = this.editor.getNodeFromId(input_id);

        this.changeInEditorCallback(
          { ...this.editor.drawflow },
          "connectionRemoved",
          null,
          null,
          inputNode,
          outputNode,
          input_class,
          output_class
        );
      }
    );

    //event listener for when the user zoomed into the editor
    this.editor.on("zoom", (zoom_level) => {
      //NOTE: Usually this.editor.zoom_min should have been supplied here, however drawflow has an error in which the minimum gets undercut.
      //This results in faulty calculation for zooming into the background, so we hardcode it here.
      //Issue report drawflow: https://github.com/jerosoler/Drawflow/issues/883#issuecomment-2238986045
      this.onZoom(zoom_level, 0.2, this.editor.zoom_max);

      //Attention: Due to floating errors in the drawflow framework, we hardcoded the actual zoom_min of 0.1.
      //Although it is set to 0.2 in the firstUpdated() method, values of 0.1 are produced
      const range = this.editor.zoom_max - 0.2;
      const percentage = (((zoom_level - 0.2) / range) * 100).toFixed(0);

      this.editorZoomString = percentage + "%";

      const zoomValue = this.shadowRoot.querySelector(
        ".zoomValue"
      ) as HTMLElement;
      if (zoomValue) {
        zoomValue.classList.remove("fade-in-out");
        // Trigger reflow to restart the animation
        void zoomValue.offsetWidth;
        zoomValue.classList.add("fade-in-out");
      }

      this.providedStore.setEditorZoom(zoom_level);
      this.providedStore.setEditorPosition(
        this.editor.canvas_x,
        this.editor.canvas_y
      );
    });

    this.editor.on("click", (event) => {
      //This event fires before the selection has changed in the editor.
      // if (this.selectedNode.class == "branch") {
      //   const hitTarget = event.composedPath()[0] as HTMLElement;
      //   const isInsideBranchNode =
      //     this.editor.node_selected.contains(hitTarget) ||
      //     this.editor.node_selected === hitTarget;
      //   if (!hitTarget.classList.contains("output") && !isInsideBranchNode) {
      //     this.elseRuleIsSet = this.checkIfElseRuleTargetIsSet();
      //   }
      // } else {
      //   this.elseRuleIsSet = true;
      // }
    });

    //this.editor.on("translate", ({ x, y }) => {});
  }

  /*


  */
  public addPageNode(title: string, isOrigin: boolean) {
    const nodeData = {
      title: title,
      content: `<p>Testing Slots HTML Editing</p>`,
    };

    const nodeHTML = this.createPageNodeHTML(isOrigin);

    const editorDivCenterPos = this.getCenterOfEditorDiv();

    this.editor.addNode(
      title,
      1,
      1,
      editorDivCenterPos.centerX - 320 / 2,
      editorDivCenterPos.centerY - 109 / 2,
      isOrigin ? "origin" : "page",
      nodeData,
      nodeHTML,
      false
    );
  }

  /*


  */
  public addPopUpNode(title: string) {
    const nodeData = {
      title: title,
      content: `<p>Testing Slots HTML Editing</p>`,
    };

    const nodeHTML = this.createPopupNodeHTML();

    const editorDivCenterPos = this.getCenterOfEditorDiv();

    this.editor.addNode(
      title,
      1,
      1,
      editorDivCenterPos.centerX - 320 / 2,
      editorDivCenterPos.centerY - 109 / 2,
      "popup",
      nodeData,
      nodeHTML,
      false
    );
  }

  /*


  */
  public addBranchNode(title: string) {
    const nodeData = {
      title: title,
      content: `<p>Testing Slots HTML Editing</p>`,
    };

    const nodeHTML = this.createBranchNodeHTML();

    const editorDivCenterPos = this.getCenterOfEditorDiv();

    this.editor.addNode(
      title,
      1,
      1,
      editorDivCenterPos.centerX - 320 / 2,
      editorDivCenterPos.centerY - 109 / 2,
      "branch",
      nodeData,
      nodeHTML,
      false
    );
  }

  /*


  */
  private getCenterOfEditorDiv() {
    //get current center of drawflow div
    const rect = this.drawflowEditorDiv.getBoundingClientRect();
    const zoom = this.editor.zoom;

    //center of canvas - translation of canvas / zoom - node dimension center
    const centerX = rect.width / 2 - this.editor.canvas_x / zoom;
    const centerY = rect.height / 2 - this.editor.canvas_y / zoom;

    return { centerX, centerY };
  }

  /*


  */
  public createPageNodeHTML(isOrigin: boolean) {
    // Create the container div and its child elements
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("container");

    // Create the page icon
    const iconDiv = document.createElement("div");
    iconDiv.classList.add("iconDiv");
    const icon = document.createElement("sl-icon") as SlIcon;
    icon.setAttribute("src", file);
    icon.classList.add("pageIcon");
    iconDiv.appendChild(icon);
    containerDiv.appendChild(iconDiv);

    // Create the content div with input
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");
    const input = document.createElement("input");
    input.id = "title";
    input.setAttribute("df-title", ""); // Adding df-title attribute
    contentDiv.appendChild(input);

    // Add origin badge or input label
    const nameLabel = document.createElement("p");
    if (isOrigin) {
      const badge = document.createElement("div");
      badge.classList.add("badge");

      const arrowIcon = document.createElement("sl-icon") as SlIcon;
      arrowIcon.setAttribute("src", circleArrowRight);
      badge.appendChild(arrowIcon);

      nameLabel.textContent = "Start Page";
      badge.appendChild(nameLabel);
      contentDiv.appendChild(badge);
    } else {
      nameLabel.classList.add("input-label");
      nameLabel.textContent = "Page"; // Set the text content of the label
      contentDiv.appendChild(nameLabel);
    }

    containerDiv.appendChild(contentDiv);

    // Add three dots icon
    const threeDotsIcon = document.createElement("sl-icon") as SlIcon;
    threeDotsIcon.setAttribute("src", dotsVertical);
    threeDotsIcon.classList.add("threeDots");
    containerDiv.appendChild(threeDotsIcon);

    const containerHtml = containerDiv.outerHTML;
    return containerHtml;
  }

  /*


  */
  public createPopupNodeHTML() {
    // Create the container div
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("container");

    // Create page sl-icon
    const iconDiv = document.createElement("div");
    iconDiv.classList.add("iconDiv");
    const icon = document.createElement("sl-icon") as SlIcon;
    icon.setAttribute("src", squares);
    icon.classList.add("pageIcon");

    iconDiv.appendChild(icon);
    containerDiv.appendChild(iconDiv);

    //
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");

    const input = document.createElement("input");
    input.id = "title";
    input.setAttribute("df-title", ""); // Adding df-title attribute
    contentDiv.appendChild(input);

    //Add label to the input for the nodes name
    const nameLabel = document.createElement("p");
    nameLabel.classList.add("input-label");
    nameLabel.textContent = "Popup"; // Set the text content of the label
    contentDiv.appendChild(nameLabel);

    containerDiv.appendChild(contentDiv);

    // Add three dots iccon
    const threeDotsIcon = document.createElement("sl-icon") as SlIcon;
    threeDotsIcon.setAttribute("src", dotsVertical);
    threeDotsIcon.classList.add("threeDots");
    containerDiv.appendChild(threeDotsIcon);

    const containerHtml = containerDiv.outerHTML;
    return containerHtml;
  }

  /*


  */
  public createBranchNodeHTML() {
    // Create the container div
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("container");

    // Create page sl-icon
    const iconDiv = document.createElement("div");
    iconDiv.classList.add("iconDiv");
    const icon = document.createElement("sl-icon") as SlIcon;
    icon.setAttribute("src", arrowsSplit2);
    icon.classList.add("pageIcon");

    iconDiv.appendChild(icon);
    containerDiv.appendChild(iconDiv);

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");

    const input = document.createElement("input");
    input.id = "title";
    input.setAttribute("df-title", ""); // Adding df-title attribute
    contentDiv.appendChild(input);

    //Add label to the input for the nodes name
    const nameLabel = document.createElement("p");
    nameLabel.classList.add("input-label");
    nameLabel.textContent = "Smart Branch"; // Set the text content of the label
    contentDiv.appendChild(nameLabel);

    containerDiv.appendChild(contentDiv);

    // Add three dots iccon
    const threeDotsIcon = document.createElement("sl-icon") as SlIcon;
    threeDotsIcon.setAttribute("src", dotsVertical);
    threeDotsIcon.classList.add("threeDots");
    containerDiv.appendChild(threeDotsIcon);

    const containerHtml = containerDiv.outerHTML;
    return containerHtml;
  }

  /*
TODO: highlighting branch buttons
  */
  public highlightConnectionAndNode(
    outputNodeId,
    inputNodeId,
    outputClass,
    inputClass,
    highlightNodeId
  ) {
    this._highlightConnection(
      outputNodeId,
      inputNodeId,
      outputClass,
      inputClass
    );

    this._highlightNode(highlightNodeId);
    this.changeInEditorCallback(
      { ...this.editor.drawflow },
      "connectionHighlighted",
      null,
      null,
      this.editor.getNodeFromId(inputNodeId),
      this.editor.getNodeFromId(outputNodeId),
      inputClass,
      outputClass
    );
  }

  /*

  */
  public unhighlightConnectionAndNode(
    outputNodeId,
    inputNodeId,
    outputClass,
    inputClass,
    highlightNodeId
  ) {
    this._unhighlightConnection(
      outputNodeId,
      inputNodeId,
      outputClass,
      inputClass
    );
    this._unhighlightNode(highlightNodeId);

    this.changeInEditorCallback(
      { ...this.editor.drawflow },
      "connectionUnhighlighted",
      null,
      null,
      this.editor.getNodeFromId(inputNodeId),
      this.editor.getNodeFromId(outputNodeId),
      inputClass,
      outputClass
    );
  }

  /*

  */
  public _highlightConnection(
    outputNodeId,
    inputNodeId,
    outputClass,
    inputClass
  ) {
    const inputNodeClass = this.editor.getNodeFromId(inputNodeId).class;

    [
      ["output", outputNodeId, outputClass],
      ["input", inputNodeId, inputClass],
    ].forEach(([type, nodeId, cls]) => {
      const nodeDiv = this.shadowRoot?.getElementById(`node-${nodeId}`);
      if (nodeDiv) {
        nodeDiv
          .querySelector(`.${type}.${cls}`)
          .classList.add(`${inputNodeClass}-highlighted`);
      }
    });

    this.shadowRoot
      .querySelector(
        `svg[class="connection node_in_node-${inputNodeId} node_out_node-${outputNodeId} ${outputClass} ${inputClass}"]`
      )
      ?.querySelector("path")
      ?.classList.add(`${inputNodeClass}-highlighted`);
  }

  /*

  */
  public _unhighlightConnection(
    outputNodeId,
    inputNodeId,
    outputClass,
    inputClass
  ) {
    const inputNodeClass = this.editor.getNodeFromId(inputNodeId).class;

    [
      ["output", outputNodeId, outputClass],
      ["input", inputNodeId, inputClass],
    ].forEach(([type, nodeId, cls]) => {
      const nodeDiv = this.shadowRoot?.getElementById(`node-${nodeId}`);
      if (nodeDiv) {
        nodeDiv
          .querySelector(`.${type}.${cls}`)
          .classList.remove(`${inputNodeClass}-highlighted`);
      }
    });

    this.shadowRoot
      .querySelector(
        `svg[class="connection node_in_node-${inputNodeId} node_out_node-${outputNodeId} ${outputClass} ${inputClass}"]`
      )
      ?.querySelector("path")
      ?.classList.remove(`${inputNodeClass}-highlighted`);
  }

  /*

  */
  public _highlightNode(nodeId) {
    const selector = `div#node-${nodeId}.drawflow-node`;
    this.shadowRoot.querySelector(selector)?.classList.add("highlighted");
  }

  /*

  */
  public _unhighlightNode(nodeId) {
    const selector = `div#node-${nodeId}.drawflow-node`;
    this.shadowRoot.querySelector(selector)?.classList.remove("highlighted");
  }

  /*

  */
  public _highlightOutput(outputNodeId, outputClass) {
    [["output", outputNodeId, outputClass]].forEach(([type, nodeId, cls]) => {
      this.shadowRoot
        ?.getElementById(`node-${nodeId}`)
        ?.querySelector(`.${type}.${cls}`)
        ?.classList.add("highlighted");
    });
  }

  /*

  */
  public _unhighlightOutput(outputNodeId, outputClass) {
    [["output", outputNodeId, outputClass]].forEach(([type, nodeId, cls]) => {
      this.shadowRoot
        ?.getElementById(`node-${nodeId}`)
        ?.querySelector(`.${type}.${cls}`)
        ?.classList.remove("highlighted");
    });
  }

  /*


  */
  private addDecisionPopUpTemplate() {
    //console.log(JSON.stringify(exportdata));
    var currentNodes = this.editor.export();
    // Create a deep copy of the nodeTemplates
    const nodeTemplatesCopy = JSON.parse(
      JSON.stringify(decisionPopUpWithFeedback)
    );
    // Assuming you have the following from the drawflow editor:
    const rect = this.drawflowEditorDiv.getBoundingClientRect();
    const zoom = this.editor.zoom;
    const centerX = rect.width / 2 - this.editor.canvas_x / zoom - 317 / 2;
    const centerY = rect.height / 2 - this.editor.canvas_y / zoom - 105 / 2;
    // Move nodes to the center of the canvas
    this.moveNodesToCenter(nodeTemplatesCopy, centerX, centerY);
    const mergedData = this.mergeTemplate(currentNodes, nodeTemplatesCopy);
    //

    this.editor.import(mergedData.currentNodes);

    //console.log(mergedData.templateContainers);
    this.changeInEditorCallback(
      { ...this.editor.drawflow },
      "templateImported",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      mergedData.templateContainers
    );

    //this.updateSelectedNodeCallback(this.selectedNode.id);
  }

  /*


  */
  private getCenterOfBoundingBox(data) {
    const nodes = Object.values(data);

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    nodes.forEach((node) => {
      const { pos_x, pos_y } = node as DrawflowNode;

      if (pos_x < minX) minX = pos_x;
      if (pos_x > maxX) maxX = pos_x;

      if (pos_y < minY) minY = pos_y;
      if (pos_y > maxY) maxY = pos_y;
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return { centerX, centerY };
  }

  /*


  */
  private moveNodesToCenter(nodeTemplate, targetCenterX, targetCenterY) {
    const data = nodeTemplate.drawflow.Home.data;
    // Step 1: Get the current center of the bounding box
    const { centerX: currentCenterX, centerY: currentCenterY } =
      this.getCenterOfBoundingBox(nodeTemplate.drawflow.Home.data);

    // Step 2: Calculate the translation required to move the nodes to the target center
    const deltaX = targetCenterX - currentCenterX;
    const deltaY = targetCenterY - currentCenterY;

    // Step 3: Update each node's position
    Object.values(data).forEach((node) => {
      (node as DrawflowNode).pos_x += deltaX;
      (node as DrawflowNode).pos_y += deltaY;
    });
  }

  /*


  */
  private mergeTemplate(currentNodes, nodeTemplates) {
    //
    const currentData = currentNodes.drawflow.Home.data;
    const templateData = nodeTemplates.drawflow.Home.data;
    const currentMaxIndex = Math.max(...Object.keys(currentData).map(Number));
    let newIndex = currentMaxIndex + 1;
    const indexMap = Object.fromEntries(
      Object.keys(templateData).map((key) => [Number(key), newIndex++])
    );
    for (const [key, node] of Object.entries(templateData)) {
      const newId = indexMap[Number(key)];
      (node as DrawflowNode).id = newId;
      for (const connections of Object.values(
        (node as DrawflowNode).inputs
      ).concat(Object.values((node as DrawflowNode).outputs))) {
        for (const connection of connections.connections) {
          connection.node =
            indexMap[connection.node]?.toString() || connection.node;
        }
      }
      currentData[newId] = { ...(node as DrawflowNode) };
    }
    // Update the containers with the new indexMap values
    const templateContainers = nodeTemplates.containers;
    for (const container of templateContainers) {
      // Update the drawflownodeid attribute
      const drawflowNodeIdAttr = container.attributes.find(
        (attr) => attr.name === "drawflownodeid"
      );
      if (drawflowNodeIdAttr) {
        const oldId = Number(drawflowNodeIdAttr.value);
        drawflowNodeIdAttr.value = indexMap[oldId].toString();
      }
      // Update the datatargetid and identifier in the innerHTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(container.innerHTML, "text/html");
      const buttons = doc.querySelectorAll("webwriter-connection-button");
      buttons.forEach((button) => {
        // Update datatargetid
        const dataTargetId = button.getAttribute("datatargetid");
        if (dataTargetId) {
          const oldTargetId = Number(dataTargetId);
          button.setAttribute("datatargetid", indexMap[oldTargetId].toString());
        }
        // Update identifier
        const identifier = button.getAttribute("identifier");
        if (identifier) {
          const identifierParts = identifier.split("-");
          if (identifierParts.length === 4) {
            const x = Number(identifierParts[0]);
            const y = Number(identifierParts[2]);
            const newX = indexMap[x];
            const newY = indexMap[y];
            const newIdentifier = `${newX}-output_1-${newY}-input_1`;
            button.setAttribute("identifier", newIdentifier);
          }
        }
      });
      // Update the container's innerHTML with the modified content
      container.innerHTML = doc.body.innerHTML;
    }
    return { currentNodes, templateContainers };
  }

  /*

  */
  private parseConnectionIdentifier(identifier) {
    const parts = identifier.split("-");
    const parsed = {
      outputNodeId: parseInt(parts[0]),
      inputNodeId: parseInt(parts[1]),
      outputClass: parts[2],
      inputClass: parts[3],
    };

    return parsed;
  }

  /*

  */
  public searchNodes(value: String) {
    let matchNodeIds = [];
    // Loop through all nodes in drawflow
    const nodes = this.editor.drawflow.drawflow.Home.data;

    Object.values(nodes).forEach((node) => {
      if (
        node.data.title.toLowerCase().includes(value.toLowerCase()) ||
        node.class.toLowerCase().includes(value.toLowerCase())
      ) {
        // console.log(node.data.title, "includes", value);
        matchNodeIds = [...matchNodeIds, node.id];
      }
    });

    return matchNodeIds;
  }

  /*

  */
  public highlightSearchedNodes(nodeIds: Array<Number>) {
    //console.log("we in here");
    // Loop through all nodes in drawflow
    const nodes = this.editor.drawflow.drawflow.Home.data;

    Object.values(nodes).forEach((node) => {
      if (nodeIds.includes(node.id)) {
        this.shadowRoot
          ?.getElementById(`node-${(node as DrawflowNode).id}`)
          .classList.add("searched");
      } else {
        this.shadowRoot
          ?.getElementById(`node-${(node as DrawflowNode).id}`)
          .classList.remove("searched");
      }
    });
  }

  /*
  
  
  */
  public removeSearchHighlightFromAllNodes() {
    //console.log("we in here");
    // Loop through all nodes in drawflow
    const nodes = this.editor.drawflow.drawflow.Home.data;

    Object.values(nodes).forEach((node) => {
      this.shadowRoot
        ?.getElementById(`node-${(node as DrawflowNode).id}`)
        .classList.remove("searched");
    });
  }

  /*
  
  
  */
  public makeNodeOrigin(nodeId: number) {
    let originNodeId = -1;

    Object.values(this.editor.drawflow.drawflow.Home.data).forEach((node) => {
      if (node.class == "origin") {
        const originNodeDiv = this.shadowRoot?.getElementById(
          `node-${node.id}`
        );

        originNodeId = node.id;
        const badgeElement = originNodeDiv.querySelector(".badge");
        badgeElement.remove();

        const originNodeContentDiv = originNodeDiv.querySelector(".content");
        const nameLabel = document.createElement("p");
        nameLabel.classList.add("input-label");
        nameLabel.textContent = "Page"; // Set the text content of the label
        originNodeContentDiv.appendChild(nameLabel);

        originNodeDiv.classList.remove("origin");
        originNodeDiv.classList.add("page");

        node.html = originNodeDiv.querySelector(".container").outerHTML;
        node.class = "page";
      }

      if (node.id == nodeId) {
        const nodeDiv = this.shadowRoot?.getElementById(`node-${nodeId}`);

        if (nodeDiv) {
          // Find the element with the class "input-label"
          const inputLabelElement = nodeDiv.querySelector(".input-label");

          // If the element exists, remove it from the DOM
          if (inputLabelElement) {
            inputLabelElement.remove();

            const contentDiv = nodeDiv.querySelector(".content");

            const badge = document.createElement("div");
            badge.classList.add("badge");

            const arrowIcon = document.createElement("sl-icon") as SlIcon;
            arrowIcon.setAttribute("src", circleArrowRight);
            badge.appendChild(arrowIcon);

            const nameLabel = document.createElement("p");
            nameLabel.textContent = "Start Page";
            badge.appendChild(nameLabel);

            contentDiv.appendChild(badge);

            nodeDiv.classList.remove("page");
            nodeDiv.classList.add("origin");
          }
        }

        node.html = nodeDiv.querySelector(".container").outerHTML;
        node.class = "origin";
      }
    });

    this.changeInEditorCallback(
      { ...this.editor.drawflow },
      "changeOrigin",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      { oldId: originNodeId, newId: nodeId }
    );

    this.requestUpdate();
  }
}
