import { html, css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { property, state } from "lit/decorators.js";
import "@shoelace-style/shoelace/dist/themes/light.css";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import gripHorizontal from "@tabler/icons/outline/grip-horizontal.svg";
import { consume } from "@lit/context";
import { widgetMsg } from "@webwriter/lit/localize";
import { editorState, GamebookEditorState } from "./gamebook-editor-state-context";

const DIVIDER_HEIGHT = 30;

export class VerticalResizeView extends LitElementWw {
  static scopedElements = { "sl-icon": SlIcon };

  static styles = css`
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
        touch-action: none;
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
      .grip {
        display: flex;
        padding: 4px 24px;
        border-radius: 4px;
      }
      .grip:focus-visible {
        outline: 2px solid var(--ww-theme-accent-1, #0084c7);
      }
      .dragging {
        color: #0084c7;
      }
`;

  protected readonly messages = { msg: widgetMsg(this) };

  @property({ type: Number, attribute: true, reflect: true })
  accessor minHeight = 175;
  @property({ type: Number, attribute: true, reflect: true })
  accessor maxHeight = 1000;

  @state() accessor isDragging = false;
  @state() accessor initialY = 0;
  @state() accessor startHeight = 400;

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  protected firstUpdated() {
    this.startHeight = this.editorStore.detailViewHeight;
    this.style.setProperty("--content-height", `${this.startHeight}px`);
  }

  private onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    event.preventDefault();

    this.isDragging = true;
    this.initialY = event.clientY;
    this.startHeight = this.currentHeight();
    // Capture keeps the drag going outside the divider; a pointer that is already gone has nothing to capture.
    try { (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); } catch {}
  }

  private onPointerUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.editorStore.setDetailViewHeight(this.currentHeight());
  }

  private onPointerMove(event: PointerEvent) {
    if (!this.isDragging) return;
    this.setHeight(this.startHeight + event.clientY - this.initialY);
  }

  /** The arrow keys change the height, Home and End go to the limits. */
  private onKeydown(event: KeyboardEvent) {
    const step = event.shiftKey ? 100 : 20;
    const current = this.currentHeight();
    const target =
      event.key === "ArrowUp" ? current - step
      : event.key === "ArrowDown" ? current + step
      : event.key === "Home" ? this.minHeight
      : event.key === "End" ? this.maxHeight
      : undefined;
    if (target === undefined) return;
    event.preventDefault();
    this.setHeight(target);
    this.editorStore.setDetailViewHeight(this.currentHeight());
  }

  private currentHeight() {
    const value = this.style.getPropertyValue("--content-height");
    return value ? parseInt(value) : this.clientHeight || 400;
  }

  private setHeight(height: number) {
    this.style.setProperty("--content-height", `${Math.max(this.minHeight, Math.min(height, this.maxHeight))}px`);
  }

  render() {
    return html`
      <div class="container">
        <div class="content"><slot></slot></div>
        <div class="divider" @pointerdown=${this.onPointerDown} @pointermove=${this.onPointerMove}
          @pointerup=${this.onPointerUp} @pointercancel=${this.onPointerUp}>
          <div
            class="grip ${this.isDragging ? "dragging" : "icon"}"
            role="separator"
            aria-orientation="horizontal"
            aria-label=${this.messages.msg("Resize")}
            aria-valuemin=${this.minHeight}
            aria-valuemax=${this.maxHeight}
            aria-valuenow=${this.currentHeight()}
            tabindex="0"
            @keydown=${this.onKeydown}
          ><sl-icon src=${gripHorizontal}></sl-icon></div>
        </div>
      </div>
    `;
  }
}
