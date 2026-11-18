import { LitElementWw } from "@webwriter/lit";
import { widgetMsg } from "@webwriter/lit/localize";
import { html, css } from "lit";
import { property, query, state } from "lit/decorators.js";

import "@shoelace-style/shoelace/dist/themes/light.css";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";

import gripHorizontal from "@tabler/icons/outline/grip-horizontal.svg";
import layoutNavBarCollapse from "@tabler/icons/outline/arrow-bar-to-up.svg";
import layoutBottomBarCollapse from "@tabler/icons/outline/arrow-bar-to-down.svg";

import { consume } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "./gamebook-editor-state-context";

const DIVIDER_HEIGHT = 30;

export class SplitView extends LitElementWw {
  static scopedElements = {
    "sl-input": SlInput,
    "sl-icon": SlIcon,
    "sl-button": SlButton,
  };

  static styles = css`
      :host {
        box-sizing: border-box;

        width: 100%;
      }

      :host * {
        box-sizing: border-box;
      }

      .splitPanel {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }

      .itemStart {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }

      .itemStart.collapsed,
      .itemStart.expanded {
        transition: height 0.3s ease; /* Smooth animation for collapse/expand */
      }

      .itemEnd {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: fit-content;
        flex-shrink: 0;
        box-sizing: border-box;
      }

      .divider {
        position: relative;
        cursor: row-resize;
        touch-action: none;
        display: flex;
        align-items: center;
        justify-content: center; /* Center the grip icon */
        height: ${DIVIDER_HEIGHT}px;
        flex-shrink: 0;
        box-sizing: border-box;
        border-top: 1px solid #e4e4e7;
        border-bottom: 1px solid #e4e4e7;
      }

      .collapse-button {
        position: absolute;
        right: 10px; /* Position the button on the right side */
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

      sl-button::part(base) {
        color: #52525b;
      }
`;

  protected readonly messages = { msg: widgetMsg(this) };

  @property({ type: Number, attribute: true, reflect: true })
  accessor minStart = 230;
  @property({ type: Number, attribute: true, reflect: true })
  accessor maxStart = 350;

  @state() accessor isDragging = false;
  @state() accessor dividerValue = 0;
  @state() accessor initialY = 0;
  @state() accessor startHeight = 0;
  @state() accessor previousHeight = 350;

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  @query(".itemStart") private accessor itemStart: HTMLElement;
  @query(".itemEnd") private accessor itemEnd: HTMLElement | null;
  @query(".splitPanel") private accessor splitPanel: HTMLElement;

  private readonly endResizeObserver = new ResizeObserver(() => this.adjustSplitPanelHeight());

  protected firstUpdated() {
    this.itemStart.style.height = `${this.editorStore.dividerPosition}px`;
    this.adjustSplitPanelHeight();
    this.observeEndSize();
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.observeEndSize();
  }

  disconnectedCallback() {
    this.endResizeObserver.disconnect();
    super.disconnectedCallback();
  }

  private observeEndSize() {
    if (this.isConnected) this.endResizeObserver.observe(this.itemEnd!);
  }

  private onPointerDown(event: PointerEvent) {
    if (this.editorStore.editorIsCollapsed) return; // Prevent dragging when collapsed
    if (event.button !== 0 || (event.target as Element).closest?.(".collapse-button")) return;

    this.isDragging = true;
    this.initialY = event.clientY;
    this.startHeight = this.itemStart.getBoundingClientRect().height;

    // Remove the transition during dragging to avoid animation
    this.itemStart.classList.remove("collapsed", "expanded");
    // Capture keeps the drag going outside the divider; a pointer that is already gone has nothing to capture.
    try { (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); } catch {}
  }

  private onPointerUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.commitHeight();
  }

  private onPointerMove(event: PointerEvent) {
    if (!this.isDragging) return;
    this.setStartHeight(this.startHeight + event.clientY - this.initialY);
  }

  /** The arrow keys move the divider, Home and End go to the limits. */
  private onDividerKeydown(event: KeyboardEvent) {
    if (this.editorStore.editorIsCollapsed) return;
    const step = event.shiftKey ? 40 : 10;
    const current = this.itemStart.getBoundingClientRect().height;
    const target =
      event.key === "ArrowUp" ? current - step
      : event.key === "ArrowDown" ? current + step
      : event.key === "Home" ? this.minStart
      : event.key === "End" ? this.maxStart
      : undefined;
    if (target === undefined) return;
    event.preventDefault();
    this.itemStart.classList.remove("collapsed", "expanded");
    this.setStartHeight(target);
    this.commitHeight();
  }

  /** Sets the height of the upper part within its bounds and sizes the panel to it. */
  private setStartHeight(height: number) {
    const newHeight = Math.max(this.minStart, Math.min(height, this.maxStart));
    this.itemStart.style.height = `${newHeight}px`;
    this.splitPanel.style.height = `${newHeight + this.itemEndHeight() + DIVIDER_HEIGHT}px`;
    this.dividerValue = Math.round(newHeight);
  }

  private commitHeight() {
    const itemStart = this.itemStart;
    this.editorStore.setDividerPosition(itemStart.style.height
      ? parseInt(itemStart.style.height)
      : this.startHeight);
  }

  private itemEndHeight() {
    return this.itemEnd?.getBoundingClientRect().height ?? 0;
  }

  private adjustSplitPanelHeight() {
    const splitPanel = this.splitPanel;
    const newTotalHeight =
      this.editorStore.dividerPosition + this.itemEndHeight() + DIVIDER_HEIGHT;
    splitPanel.style.height = `${newTotalHeight}px`;
  }

  private toggleCollapse() {
    const itemStart = this.itemStart;

    if (this.editorStore.editorIsCollapsed) {
      itemStart.classList.remove("collapsed");
      itemStart.classList.add("expanded");
      itemStart.style.height = `${this.previousHeight}px`;
      this.editorStore.setDividerPosition(this.previousHeight);
    }
    else {
      // Collapse the panel and save the current height
      this.previousHeight = this.editorStore.dividerPosition;
      itemStart.classList.remove("expanded");
      itemStart.classList.add("collapsed");
      itemStart.style.height = `0px`;
      this.editorStore.setDividerPosition(0);
    }

    // Update the collapsed state and button label
    this.editorStore.setEditorIsCollapsed(!this.editorStore.editorIsCollapsed);

    // Adjust the splitPanel height after collapse/expand
    this.adjustSplitPanelHeight();
  }

  render() {
    return html`
      <div class="splitPanel">
        <div class="itemStart"><slot name="start"></slot></div>
        <div class="divider"
          @pointerdown=${this.onPointerDown} @pointermove=${this.onPointerMove}
          @pointerup=${this.onPointerUp} @pointercancel=${this.onPointerUp}>
          <div
            class="grip ${this.isDragging ? "dragging" : "icon"}"
            role="separator"
            aria-orientation="horizontal"
            aria-label=${this.messages.msg("Resize")}
            aria-valuemin=${this.minStart}
            aria-valuemax=${this.maxStart}
            aria-valuenow=${this.dividerValue || this.editorStore.dividerPosition}
            tabindex=${this.editorStore.editorIsCollapsed ? -1 : 0}
            @keydown=${this.onDividerKeydown}
          ><sl-icon src=${gripHorizontal}></sl-icon></div>
          <sl-button
            class="collapse-button"
            @click=${this.toggleCollapse}
            size="small"
            variant="text"
          >
            ${this.editorStore.editorIsCollapsed
              ? this.messages.msg("Expand")
              : this.messages.msg("Collapse")}
            <sl-icon
              slot="suffix"
              src=${this.editorStore.editorIsCollapsed
                ? layoutBottomBarCollapse
                : layoutNavBarCollapse}
            ></sl-icon>
          </sl-button>
        </div>
        <div class="itemEnd"><slot name="end"></slot></div>
      </div>
    `;
  }
}
