import { html, css, LitElement } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, query } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

const GRID_SIZE = 40;

@customElement("drawflow-background")
export class DrawflowBackground extends LitElementWw {
  // Import CSS
  static styles = css`
    .grid-container {
      width: 100%;
      height: 450px;
      background-image: radial-gradient(circle, #dedede, 1px, transparent 1px);
      background-size: ${GRID_SIZE}px ${GRID_SIZE}px;
      background-color: transparent;
      position: absolute;
      cursor: grab;
    }
    .grid-container:active {
      cursor: grabbing;
    }
  `;

  @query(".grid-container")
  gridContainer!: HTMLElement;

  @property({ type: Boolean }) isDragging = false;
  @property({ type: Boolean }) nodeSelected = false; // Add this property
  @property({ type: Number }) lastX = 0;
  @property({ type: Number }) lastY = 0;
  @property({ type: Number }) translateX = 0;
  @property({ type: Number }) translateY = 0;
  @property({ type: Number }) scale = 0.45;
  @property({ type: Number }) minScale = 0.5;
  @property({ type: Number }) maxScale = 2;
  @property({ type: Number }) scaleFactor = 1.05;

  render() {
    const gridStyles = {
      backgroundPosition: `${this.translateX}px ${this.translateY}px`,
      backgroundSize: `${GRID_SIZE * this.scale}px ${GRID_SIZE * this.scale}px`,
    };

    return html`
      <div class="grid-container" style=${styleMap(gridStyles)}></div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("mousemove", this.onMouseMove);
    this.addEventListener("mousedown", this.onMouseDown);
    this.addEventListener("mouseup", this.onMouseUp);

    this.addEventListener("mouseleave", this.onMouseLeave);
  }

  disconnectedCallback() {
    this.removeEventListener("mousemove", this.onMouseMove);
    this.removeEventListener("mousedown", this.onMouseDown);
    this.removeEventListener("mouseup", this.onMouseUp);
    this.removeEventListener("mouseleave", this.onMouseLeave);
    super.disconnectedCallback();
  }

  private onMouseDown(event: MouseEvent) {
    if (!this.nodeSelected) {
      // Check if node is not selected
      this.isDragging = true;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    }
  }

  public onMouseMove(event: MouseEvent) {
    if (this.isDragging && !this.nodeSelected) {
      // Check if node is not selected
      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;
      this.translateX += dx;
      this.translateY += dy;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      this.requestUpdate();
    }
  }

  private onMouseUp() {
    this.isDragging = false;
  }

  private onMouseLeave() {
    //this.isDragging = false;
  }

  public onZoom(zoom_value: number, min_zoom: number, max_zoom: number) {
    const rect =
      this.shadowRoot!.querySelector(
        ".grid-container"
      )!.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate the new scale from zoom_value
    const prevScale = this.scale;
    this.scale = zoom_value; // Assuming zoom_value directly represents the new scale

    // Limit the scale within minScale and maxScale
    this.scale = Math.min(Math.max(min_zoom, this.scale), max_zoom);

    // Calculate the scale ratio
    const scaleRatio = this.scale / prevScale;

    // Update translateX and translateY to center the zoom
    this.translateX = centerX - (centerX - this.translateX) * scaleRatio;
    this.translateY = centerY - (centerY - this.translateY) * scaleRatio;

    // Request an update to apply the changes
    this.requestUpdate();
  }
}
