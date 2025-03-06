import { html, css, LitElement, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, state } from "lit/decorators.js";
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlIcon } from "@shoelace-style/shoelace";
import gripHorizontal from "@tabler/icons/outline/grip-horizontal.svg";

const DIVIDER_HEIGHT = 30;

@customElement("vertical-resize-view")
export class VerticalResizeView extends LitElementWw {
  @property({ type: Number, attribute: true, reflect: true })
  accessor minHeight = 175;
  @property({ type: Number, attribute: true, reflect: true })
  accessor maxHeight = 1000;

  @state() accessor isDragging = false;
  @state() accessor initialY = 0;
  @state() accessor startHeight = 400;

  // Registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-icon": SlIcon,
    };
  }

  /*


  */
  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        height: auto;
      }
      .container {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      .content {
        width: 100%;
        height: var(--content-height, 100%);
        overflow: auto;
      }
      .divider {
        height: ${DIVIDER_HEIGHT}px;
        cursor: row-resize;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-top: 1px solid #e4e4e7;
        background-color: #ffffff;
      }
      .icon {
        color: #52525b;
      }
      .dragging {
        color: #0084c7;
      }
    `;
  }

  /*


  */
  protected firstUpdated(_changedProperties: PropertyValues) {
    this.style.setProperty("--content-height", `${this.startHeight}px`);
  }

  /*


  */
  private onMouseDown(event: MouseEvent) {
    event.preventDefault(); // Prevent default drag behavior

    this.isDragging = true;
    this.initialY = event.clientY;
    this.startHeight = this.clientHeight;

    this.addEventListener("mousemove", this.onMouseMove);
    this.addEventListener("mouseup", this.onMouseUp);
    this.addEventListener("mouseleave", this.onMouseUp);
  }

  /*


  */
  private onMouseUp() {
    console.log("test");
    this.isDragging = false;
    this.removeEventListener("mousemove", this.onMouseMove);
    this.removeEventListener("mouseup", this.onMouseUp);
    this.removeEventListener("mouseleave", this.onMouseUp);
  }

  /*


  */
  private onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const deltaY = event.clientY - this.initialY;

    let newHeight = this.startHeight + deltaY;
    newHeight = Math.max(this.minHeight, Math.min(newHeight, this.maxHeight));
    this.style.setProperty("--content-height", `${newHeight}px`);
  }

  /*


  */
  render() {
    return html`
      <div class="container">
        <div class="content"><slot></slot></div>
        <div class="divider" @mousedown=${this.onMouseDown}>
          <sl-icon
            src=${gripHorizontal}
            class="${this.isDragging ? "dragging" : "icon"}"
          ></sl-icon>
        </div>
      </div>
    `;
  }
}
