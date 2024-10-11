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

import customDrawflowStyles from "./drawflow.styles";
import styles from "./node-editor.styles";

import { NodeEditorToolbar } from "./toolbar/node-editor-toolbar";
import { NodeEditorHelpMenu } from "./help-menu/node-editor-help-menu";

const NO_CONNECTION_SELECTED = "output_id-input_id-output_class-input_class";

const GRID_SIZE = 40;

import {
  editorState,
  GamebookEditorState,
} from "../../utils/gamebook-editor-state-context";

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
      "node-editor-toolbar": NodeEditorToolbar,
      "node-editor-help-menu": NodeEditorHelpMenu,
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

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

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

    if (this.editorStore.editorZoom == -1) {
      this.editor.zoom = this.backgroundScale;
    } else {
      this.editor.zoom = this.editorStore.editorZoom;
      this.onZoom(this.editorStore.editorZoom, 0.2, this.editor.zoom_max);
    }

    this.editor.start();
    this.editor.zoom_refresh();

    if (
      this.editorStore.editorPosition.x != undefined &&
      this.editorStore.editorPosition.y != undefined
    ) {
      this.editor.canvas_x = this.editorStore.editorPosition.x;
      this.editor.canvas_y = this.editorStore.editorPosition.y;

      const drawflowContainer =
        this.drawflowEditorDiv.querySelector(".drawflow");

      if (drawflowContainer) {
        drawflowContainer.style.transform = `translate(${this.editor.canvas_x}px, ${this.editor.canvas_y}px) scale(${this.editor.zoom})`;
      }
    }

    this._registerEditorEventHandlers();

    if (this.editorStore.editorContent == null) {
      this.addPageNode("First Page", true);
    } else {
      let editorContent = this.addHTMLToNodes(this.editorStore.editorContent);
      this.editor.import(editorContent);
      if (this.editorStore.selectedNode.id !== -1) {
        this.programaticallySelectNode(
          this.editorStore.selectedNode.id.toString()
        );
      }
      this.dispatchEvent(
        new CustomEvent("editorInitialized", {
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  protected updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has("editorStore")) {
      //TODO: support undo/redo
      // let editorContent = this.addHTMLToNodes(this.editorStore.editorContent);
      // this.editor.import(editorContent);
      // if (this.editorStore.selectedNode.id !== -1) {
      //   this.programaticallySelectNode(
      //     this.editorStore.selectedNode.id.toString()
      //   );
      // }
    }
  }

  /*

  */
  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot?.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.shadowRoot?.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.shadowRoot?.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.shadowRoot?.addEventListener(
      "mouseleave",
      this.onMouseLeave.bind(this)
    );
  }

  /*

  */
  disconnectedCallback() {
    this.shadowRoot?.removeEventListener(
      "mousemove",
      this.onMouseMove.bind(this)
    );
    this.shadowRoot?.removeEventListener(
      "mousedown",
      this.onMouseDown.bind(this)
    );
    this.shadowRoot?.removeEventListener("mouseup", this.onMouseUp.bind(this));
    this.shadowRoot?.removeEventListener(
      "mouseleave",
      this.onMouseLeave.bind(this)
    );
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
        <node-editor-toolbar
          @addPageNode=${(e: CustomEvent) => {
            this.addPageNode(e.detail.title, e.detail.isOrigin);
          }}
          @addPopUpNode=${(e: CustomEvent) => {
            this.addPopUpNode(e.detail.title);
          }}
          @addBranchNode=${(e: CustomEvent) => {
            this.addBranchNode(e.detail.title);
          }}
          @addTemplate=${(e: CustomEvent) =>
            this.addTemplate(e.detail.template)}
          @clearDialog=${() =>
            (this.shadowRoot.getElementById("dialog") as SlDialog).show()}
        >
        </node-editor-toolbar>

        <div id="drawflowEditorDiv" style=${styleMap(gridStyles)}></div>

        <div class="zoomControls">
          <sl-icon-button
            id="jumpToOriginBtn"
            src=${mapPin}
            style="font-size: 18px;"
            @click=${() => {
              const nodes = this.editorStore.editorContent.drawflow.Home.data;
              const originNode = Object.values(nodes).find(
                (node: any) => node.class === "origin"
              );
              this.moveToNode(originNode as DrawflowNode);
            }}
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

        <node-editor-help-menu></node-editor-help-menu>
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
      <sl-dialog label="Delete node" class="dialog" id="delete_node_dialog">
        You are about to delete the node
        "${this.editorStore.selectedNode.data.title}". Do you want to proceed?
        <sl-button
          slot="footer"
          variant="primary"
          outline
          @click=${() =>
            (
              this.shadowRoot.getElementById("delete_node_dialog") as SlDialog
            ).hide()}
          >Abort</sl-button
        >
        <sl-button
          slot="footer"
          variant="danger"
          outline
          @click=${() => this.deleteSelectedNode()}
          >Delete</sl-button
        >
      </sl-dialog>
    `;
  }

  /*

  */
  private onMouseDown(event: MouseEvent) {
    if (
      (event.target as HTMLElement).classList.contains("drawflow") ||
      (event.target as HTMLElement).id === "drawflowEditorDiv"
    ) {
      this.backgroundIsDragging = true;
      this.backgroundLastX = event.clientX;
      this.backgroundLastY = event.clientY;
    }
  }

  /*

  */
  public onMouseMove(event: MouseEvent) {
    if (
      this.backgroundIsDragging &&
      this.editor.node_selected === null &&
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
    if (this.backgroundIsDragging) {
      this.backgroundIsDragging = false;

      this.editorStore.setEditorPosition(
        this.editor.canvas_x,
        this.editor.canvas_y
      );
    }
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
  private addHTMLToNodes(editorContent) {
    let copy = editorContent;
    if (copy) {
      Object.values(copy.drawflow.Home.data).forEach((node) => {
        if ((node as DrawflowNode).class === "page") {
          (node as DrawflowNode).html = this.createPageNodeHTML(false);
        } else if ((node as DrawflowNode).class === "origin") {
          (node as DrawflowNode).html = this.createPageNodeHTML(true);
        } else if ((node as DrawflowNode).class === "popup") {
          (node as DrawflowNode).html = this.createPopupNodeHTML();
        } else if ((node as DrawflowNode).class === "branch") {
          (node as DrawflowNode).html = this.createBranchNodeHTML();
        }
      });
    }

    return copy;
  }

  /*


  */
  private _clearEditor() {
    const dialog = this.shadowRoot.getElementById("dialog") as SlDialog;
    dialog.hide();

    this.editor.clear();

    this.editorStore.setEditorContent(this.editor.drawflow);

    this.dispatchEvent(
      new CustomEvent("editorCleared", {
        bubbles: true,
        composed: true,
      })
    );

    this.addPageNode("First Page", true);
  }

  /*
  
  */
  public moveToNode(node: DrawflowNode) {
    const { zoom, canvas_x, canvas_y } = this.editor;
    const { id, pos_x, pos_y } = node;

    const nodeDiv = Array.from(this.nodeDivs as NodeListOf<HTMLElement>).find(
      (div) => parseInt(div.id.split("-")[1], 10).toString() === id.toString()
    );

    const nodeWidth = nodeDiv.offsetWidth;
    const nodeHeight = nodeDiv.offsetHeight;

    const drawflowContainer = this.drawflowEditorDiv.querySelector(".drawflow");
    const rect = this.drawflowEditorDiv.getBoundingClientRect();

    if (drawflowContainer) {
      // Add the transition class for smooth animation
      drawflowContainer.classList.add("smooth-transition");
      this.drawflowEditorDiv.classList.add("smooth-background-transition");
      // Calculate the center of the origin node
      const nodeCenterX = pos_x + nodeWidth / 2;
      const nodeCenterY = pos_y + nodeHeight / 2;

      // Calculate the position of the editor and the node
      const nodePosX =
        nodeCenterX * zoom + canvas_x + (rect.width - rect.width * zoom) / 2;
      const nodePosY =
        nodeCenterY * zoom + canvas_y + (rect.height - rect.height * zoom) / 2;

      // Calculate the translation required to center the node
      this.editor.canvas_x -= nodePosX - rect.width / 2;
      this.editor.canvas_y -= nodePosY - rect.height / 2;

      drawflowContainer.style.transform = `translate(${this.editor.canvas_x}px, ${this.editor.canvas_y}px) scale(${zoom})`;

      this.backgroundLastX = this.backgroundTranslateX;
      this.backgroundLastY = this.backgroundTranslateY;
      this.backgroundTranslateX -= nodePosX - rect.width / 2;
      this.backgroundTranslateY -= nodePosY - rect.height / 2;
      this.requestUpdate();

      // // // Optionally, remove the transition class after the animation is done
      setTimeout(() => {
        drawflowContainer.classList.remove("smooth-transition");
        this.drawflowEditorDiv.classList.remove("smooth-background-transition");
      }, 350); // Adjust the timeout duration to match your animation duration

      this.editorStore.setEditorPosition(
        this.editor.canvas_x,
        this.editor.canvas_y
      );
    }
  }

  /*


  */
  public pasteNode() {
    const copiedNode = this.editorStore.copiedNode;

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
      this.dispatchEvent(
        new CustomEvent("nodeSelected", {
          detail: { nodeId: id },
          bubbles: true,
          composed: true,
        })
      );
    });

    // Event listener for node unselected
    this.editor.on("nodeUnselected", (boolean) => {
      this.dispatchEvent(
        new CustomEvent("nodeUnselected", {
          bubbles: true,
          composed: true,
        })
      );
    });

    //Event listerner for creation of a node
    this.editor.on("nodeCreated", (id) => {
      this.editorStore.setEditorContent(this.editor.drawflow);
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
      this.editorStore.setEditorContent(this.editor.drawflow);
    });

    //Event listener for when a node got moved
    this.editor.on("nodeMoved", (id) => {
      this.editorStore.setEditorContent(this.editor.drawflow);
    });

    //
    //
    //Event listener for when a connection creation started via drag and drop
    this.editor.on("connectionStart", ({ output_id, output_class }) => {
      this.programaticallySelectNode(output_id);
      this.dispatchEvent(
        new CustomEvent("nodeSelected", {
          detail: { nodeId: output_id },
          bubbles: true,
          composed: true,
        })
      );

      this.connectionStarted = true;

      this.shadowRoot
        .querySelector('svg[class="connection"]')
        ?.querySelector("path")
        ?.setAttribute("highlighted", "true");
    });

    //
    //
    this.editor.on("connectionCancel", () => {
      this.connectionStarted = false;
    });

    //Event listener for when a connection is selected
    this.editor.on(
      "connectionSelected",
      ({ output_id, input_id, output_class, input_class }) => {
        const outputNode = this.editor.getNodeFromId(output_id);
        const inputNode = this.editor.getNodeFromId(input_id);
        this.selectedConnection = `${output_id}-${input_id}-${output_class}-${input_class}`;

        this.dispatchEvent(
          new CustomEvent("nodeSelected", {
            detail: { nodeId: output_id },
            bubbles: true,
            composed: true,
          })
        );

        this._highlightConnection(
          output_id,
          input_id,
          output_class,
          input_class
        );

        this.dispatchEvent(
          new CustomEvent("connectionSelected", {
            detail: {
              outputNode: outputNode,
              inputNode: inputNode,
              outputClass: output_class,
              inputClass: input_class,
            },
            bubbles: true,
            composed: true,
          })
        );
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

      const outputNode = this.editor.getNodeFromId(
        parsedConnection.outputNodeId
      );
      const inputNode = this.editor.getNodeFromId(parsedConnection.inputNodeId);

      this.selectedConnection = NO_CONNECTION_SELECTED;

      this.dispatchEvent(
        new CustomEvent("connectionUnselected", {
          detail: {
            outputNode: outputNode,
            inputNode: inputNode,
            outputClass: parsedConnection.outputClass,
            inputClass: parsedConnection.inputClass,
          },
          bubbles: true,
          composed: true,
        })
      );

      this.dispatchEvent(
        new CustomEvent("nodeUnselected", {
          bubbles: true,
          composed: true,
        })
      );
    });

    //Event for created connections done e.g. via drag and drop
    this.editor.on(
      "connectionCreated",
      ({ output_id, input_id, output_class, input_class }) => {
        this.connectionStarted = false;
        const outputNode = this.editor.getNodeFromId(output_id);
        const inputNode = this.editor.getNodeFromId(input_id);

        this.editorStore.setEditorContent(this.editor.drawflow);
        this.editorStore.setSelectedNode(this.editor.getNodeFromId(output_id));

        this.shadowRoot
          .querySelector(
            `svg.connection.node_in_node-${input_id}.node_out_node-${output_id}.${output_class}.${input_class}`
          )
          ?.querySelector("path")
          ?.removeAttribute("highlighted");

        const removeConnection = () =>
          this.editor.removeSingleConnection(
            outputNode.id,
            inputNode.id,
            output_class,
            input_class
          );

        const triggerEvent = (eventName) =>
          this.dispatchEvent(
            new CustomEvent(eventName, {
              detail: {
                outputNode,
                inputNode,
                outputClass: output_class,
                inputClass: input_class,
              },
              bubbles: true,
              composed: true,
            })
          );

        // Branch node checks
        if (inputNode.class === "branch") {
          if (inputNode.inputs["input_1"]?.connections?.length > 1) {
            console.error("The branch node is already connected");
            removeConnection();
          } else if (outputNode.class === "branch") {
            console.error("Connecting branch nodes is not allowed.");
            removeConnection();
          } else {
            triggerEvent("nodeConnectedToBranchNode");
          }
        }
        // Output node is a branch
        else if (outputNode.class === "branch") {
          if (
            inputNode.id ===
            Number(outputNode.inputs["input_1"]?.connections[0]?.node)
          ) {
            console.error("Self loops are not allowed.");
            removeConnection();
          } else {
            triggerEvent("branchNodeConnected");
          }
        }
        // General case
        else {
          triggerEvent("nodesConnected");
        }
      }
    );

    this.editor.on(
      "connectionRemoved",
      ({ output_id, input_id, output_class, input_class }) => {
        const outputNode = this.editor.getNodeFromId(output_id);
        const inputNode = this.editor.getNodeFromId(input_id);
        const isBranchInput = inputNode.class === "branch";
        const isBranchOutput = outputNode.class === "branch";

        this.editorStore.setEditorContent(this.editor.drawflow);

        if (this.selectedConnection !== NO_CONNECTION_SELECTED) {
          const { outputNodeId, inputNodeId, outputClass, inputClass } =
            this.parseConnectionIdentifier(this.selectedConnection);
          this._unhighlightConnection(
            outputNodeId,
            inputNodeId,
            outputClass,
            inputClass
          );
          this.selectedConnection = NO_CONNECTION_SELECTED;
        }
        if (isBranchOutput) {
          this.dispatchEvent(
            new CustomEvent("branchNodeConnectionRemoved", {
              detail: { outputNode: outputNode, outputClass: output_class },
              bubbles: true,
              composed: true,
            })
          );
        }
        //
        else {
          const eventDetail = {
            outputNode: outputNode,
            outputClass: output_class,
            inputNode: inputNode,
            inputClass: input_class,
          };
          this.dispatchEvent(
            new CustomEvent("connectionRemoved", {
              detail: eventDetail,
              bubbles: true,
              composed: true,
            })
          );
        }

        this.editorStore.setSelectedNode(this.editor.getNodeFromId(output_id));
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

      this.editorStore.setEditorZoom(zoom_level);
      this.editorStore.setEditorPosition(
        this.editor.canvas_x,
        this.editor.canvas_y
      );
    });
  }

  /*


  */
  public addPageNode(title: string, isOrigin: boolean) {
    const nodeData = {
      title: title,
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
    };

    const nodeHTML = this.createBranchNodeHTML();

    const editorDivCenterPos = this.getCenterOfEditorDiv();

    this.editor.addNode(
      title,
      1,
      0,
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
    nameLabel.textContent = "Branch"; // Set the text content of the label
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
          .setAttribute(`highlighted`, "true");
      }
    });

    this.shadowRoot
      .querySelector(
        `svg[class="connection node_in_node-${inputNodeId} node_out_node-${outputNodeId} ${outputClass} ${inputClass}"]`
      )
      ?.querySelector("path")
      ?.setAttribute(`highlighted`, "true");
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
          ?.removeAttribute("highlighted");
      }
    });

    this.shadowRoot
      .querySelector(
        `svg[class="connection node_in_node-${inputNodeId} node_out_node-${outputNodeId} ${outputClass} ${inputClass}"]`
      )
      ?.querySelector("path")
      ?.removeAttribute("highlighted");
  }

  /*

  */
  public _highlightNode(nodeId) {
    const selector = `div#node-${nodeId}.drawflow-node`;
    this.shadowRoot
      .querySelector(selector)
      ?.setAttribute("highlighted", "true");
  }

  /*
  
    */
  public _unhighlightNode(nodeId) {
    const selector = `div#node-${nodeId}.drawflow-node`;
    this.shadowRoot.querySelector(selector)?.removeAttribute("highlighted");
  }

  /*

  */
  public _highlightOutput(outputNodeId, outputClass) {
    [["output", outputNodeId, outputClass]].forEach(([type, nodeId, cls]) => {
      this.shadowRoot
        ?.getElementById(`node-${nodeId}`)
        ?.querySelector(`.${type}.${cls}`)
        ?.setAttribute("highlighted", "true");
    });
  }

  /*

  */
  public _unhighlightOutput(outputNodeId, outputClass) {
    [["output", outputNodeId, outputClass]].forEach(([type, nodeId, cls]) => {
      this.shadowRoot
        ?.getElementById(`node-${nodeId}`)
        ?.querySelector(`.${type}.${cls}`)
        ?.removeAttribute("highlighted");
    });
  }

  public unhighlightAllOutputs() {
    Array.from(this.nodeDivs as NodeListOf<HTMLElement>).forEach((nodeDiv) => {
      const outputs = nodeDiv.querySelectorAll(".output");
      outputs.forEach((output) => {
        output.removeAttribute("highlighted");
      });
    });
  }

  /*


  */
  private addTemplate(template) {
    var currentNodes = this.editor.export();
    let currentNodesWithHTML = this.addHTMLToNodes(currentNodes);

    // Create a deep copy of the nodeTemplates
    let nodeTemplatesCopy = JSON.parse(JSON.stringify(template));
    // Assuming you have the following from the drawflow editor:
    const rect = this.drawflowEditorDiv.getBoundingClientRect();
    const zoom = this.editor.zoom;
    const centerX = rect.width / 2 - this.editor.canvas_x / zoom - 317 / 2;
    const centerY = rect.height / 2 - this.editor.canvas_y / zoom - 105 / 2;
    // Move nodes to the center of the canvas
    this.moveNodesToCenter(nodeTemplatesCopy, centerX, centerY);

    nodeTemplatesCopy = this.addHTMLToNodes(nodeTemplatesCopy);
    const mergedData = this.mergeTemplate(
      currentNodesWithHTML,
      nodeTemplatesCopy
    );
    //

    this.editor.import(mergedData.currentNodes);

    this.editorStore.setEditorContent(this.editor.drawflow);

    this.dispatchEvent(
      new CustomEvent("nodeGroupImported", {
        detail: { templateContainers: mergedData.templateContainers },
        bubbles: true,
        composed: true,
      })
    );
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
  private mergeTemplate(currentNodes, nodeTemplates) {
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

      const incomingContainerIdAttr = container.attributes.find(
        (attr) => attr.name === "incomingcontainerid"
      );
      if (incomingContainerIdAttr) {
        const oldId = Number(incomingContainerIdAttr.value);
        incomingContainerIdAttr.value = indexMap[oldId].toString();
      }

      const rulesAttr = container.attributes.find(
        (attr) => attr.name === "rules"
      );

      if (rulesAttr) {
        const rules = JSON.parse(rulesAttr.value);
        rules.forEach((rule) => {
          const oldId = Number(rule.target);
          rule.target = indexMap[oldId].toString();
        });
        rulesAttr.value = JSON.stringify(rules);
      }

      const elseRuleAttr = container.attributes.find(
        (attr) => attr.name === "elserule"
      );

      if (elseRuleAttr) {
        const elseRule = JSON.parse(elseRuleAttr.value);
        const oldId = Number(elseRule.target);
        elseRule.target = indexMap[oldId].toString();
        elseRuleAttr.value = JSON.stringify(elseRule);
      }

      // Update the datatargetid and identifier in the innerHTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(container.innerHTML, "text/html");
      const buttons = doc.querySelectorAll(
        "webwriter-gamebook-button, webwriter-gamebook-branch-button"
      );

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
            const newIdentifier = `${newX}-${identifierParts[1]}-${newY}-input_1`;
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
        matchNodeIds = [...matchNodeIds, node.id];
      }
    });

    return matchNodeIds;
  }

  /*

  */
  public highlightSearchedNodes(nodeIds: Array<Number>) {
    // Loop through all nodes in drawflow
    const nodes = this.editor.drawflow.drawflow.Home.data;

    Object.values(nodes).forEach((node) => {
      if (nodeIds.includes(node.id)) {
        this.shadowRoot
          ?.getElementById(`node-${(node as DrawflowNode).id}`)
          .setAttribute("searched", "true");
      } else {
        this.shadowRoot
          ?.getElementById(`node-${(node as DrawflowNode).id}`)
          .removeAttribute("searched");
      }
    });
  }

  /*
  
  
  */
  public removeSearchHighlightFromAllNodes() {
    // Loop through all nodes in drawflow
    const nodes = this.editor.drawflow.drawflow.Home.data;

    Object.values(nodes).forEach((node) => {
      this.shadowRoot
        ?.getElementById(`node-${(node as DrawflowNode).id}`)
        .removeAttribute("searched");
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

    this.requestUpdate();
  }

  /*


  */
  private deleteSelectedNode() {
    this.editor.removeNodeId(`node-${this.editorStore.selectedNode.id}`);
    (this.shadowRoot.getElementById("delete_node_dialog") as SlDialog).hide();
  }

  /*


  */
  public programaticallySelectNode(id) {
    this.nodeDivs.forEach((nodeDiv) => {
      (nodeDiv as HTMLElement).classList.remove("selected");
    });

    let nodeDiv = Array.from(this.nodeDivs as NodeListOf<HTMLElement>).find(
      (nodeDiv) => {
        return (
          parseInt(nodeDiv.id.split("-")[1], 10).toString() === id.toString()
        );
      }
    );

    nodeDiv.classList.add("selected");

    this.editor.node_selected = nodeDiv;
  }

  /*


  */
  public programaticallyUnselectConnection() {
    if (this.selectedConnection !== NO_CONNECTION_SELECTED) {
      const parsedConnection = this.parseConnectionIdentifier(
        this.selectedConnection
      );

      const deleteButton = this.shadowRoot.querySelector(".drawflow-delete");
      deleteButton.remove();

      this.editor.connection_selected = null;
      this.editor.ele_selected = null;
    }
  }
}
