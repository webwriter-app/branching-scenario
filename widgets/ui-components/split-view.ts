import { html, css, LitElement, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, state } from "lit/decorators.js";

// Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlInput, SlIcon, SlIconButton } from "@shoelace-style/shoelace";

import gripHorizontal from "@tabler/icons/outline/grip-horizontal.svg";
import layoutNavBarCollapse from "@tabler/icons/outline/arrow-bar-to-up.svg";
import layoutBottomBarCollapse from "@tabler/icons/outline/arrow-bar-to-down.svg";

const DIVIDER_HEIGHT = 30;

@customElement("split-view")
export class SplitView extends LitElementWw {
  @property({ type: Number, attribute: true, reflect: true })
  dividerPosition = 350;
  @property({ type: Number, attribute: true, reflect: true })
  minStart = 230;
  @property({ type: Number, attribute: true, reflect: true })
  maxStart = 350;

  @state() isDragging = false;
  @state() initialY = 0;
  @state() startHeight = 0;
  @state() isCollapsed = false;
  @state() previousHeight = 350;

  // Registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-input": SlInput,
      "sl-icon": SlIcon,
      "sl-icon-button": SlIconButton,
    };
  }

  static get styles() {
    return css`
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
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.updateComplete.then(() => {
      const splitPanel = this.shadowRoot.querySelector(
        ".splitPanel"
      ) as HTMLElement;
      const itemStart = this.shadowRoot.querySelector(
        ".itemStart"
      ) as HTMLElement;
      // Set initial height of the start panel based on the dividerPosition
      itemStart.style.height = `${this.dividerPosition}px`;
      // Calculate and set the initial height of the splitPanel
      const initialSplitPanelHeight =
        this.dividerPosition + this.itemEndHeight() + DIVIDER_HEIGHT;
      splitPanel.style.height = `${initialSplitPanelHeight}px`;

      // Set up a ResizeObserver on the itemEnd to adjust the splitPanel's height when content changes
      const itemEnd = this.shadowRoot.querySelector(".itemEnd") as HTMLElement;
      const resizeObserver = new ResizeObserver(() => {
        this.adjustSplitPanelHeight();
      });
      resizeObserver.observe(itemEnd);
    });
  }

  private onMouseDown(event: MouseEvent) {
    if (this.isCollapsed) return; // Prevent dragging when collapsed

    this.isDragging = true;
    this.initialY = event.clientY;

    const itemStart = this.shadowRoot.querySelector(
      ".itemStart"
    ) as HTMLElement;
    this.startHeight = itemStart.getBoundingClientRect().height;

    // Remove the transition during dragging to avoid animation
    itemStart.classList.remove("collapsed", "expanded");

    // Add global listeners
    this.addEventListener("mousemove", this.onMouseMove);
    this.addEventListener("mouseup", this.onMouseUp);
  }

  private onMouseUp(_event: MouseEvent) {
    this.isDragging = false;

    // Remove global listeners
    this.removeEventListener("mousemove", this.onMouseMove);
    this.removeEventListener("mouseup", this.onMouseUp);
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const deltaY = event.clientY - this.initialY;
    let newHeight = this.startHeight + deltaY;

    // Ensure the height is within the min and max bounds
    newHeight = Math.max(this.minStart, Math.min(newHeight, this.maxStart));

    const itemStart = this.shadowRoot.querySelector(
      ".itemStart"
    ) as HTMLElement;
    const splitPanel = this.shadowRoot.querySelector(
      ".splitPanel"
    ) as HTMLElement;

    itemStart.style.height = `${newHeight}px`;

    // Adjust the height of the entire splitPanel accordingly
    const totalHeight = newHeight + this.itemEndHeight() + DIVIDER_HEIGHT;
    splitPanel.style.height = `${totalHeight}px`;

    // Update the dividerPosition property to reflect the new height
    this.dividerPosition = newHeight;
  }

  private itemEndHeight() {
    const itemEnd = this.shadowRoot.querySelector(".itemEnd") as HTMLElement;
    return itemEnd ? itemEnd.getBoundingClientRect().height : 0;
  }

  private adjustSplitPanelHeight() {
    const splitPanel = this.shadowRoot.querySelector(
      ".splitPanel"
    ) as HTMLElement;
    const newTotalHeight =
      this.dividerPosition + this.itemEndHeight() + DIVIDER_HEIGHT;
    splitPanel.style.height = `${newTotalHeight}px`;
  }

  private toggleCollapse() {
    const itemStart = this.shadowRoot.querySelector(
      ".itemStart"
    ) as HTMLElement;

    if (this.isCollapsed) {
      // Expand the panel to the previous height
      itemStart.classList.remove("collapsed");
      itemStart.classList.add("expanded");
      itemStart.style.height = `${this.previousHeight}px`;
      this.dividerPosition = this.previousHeight;
    } else {
      // Collapse the panel and save the current height
      this.previousHeight = this.dividerPosition;
      itemStart.classList.remove("expanded");
      itemStart.classList.add("collapsed");
      itemStart.style.height = `0px`;
      this.dividerPosition = 0;
    }

    // Update the collapsed state and button label
    this.isCollapsed = !this.isCollapsed;

    // Adjust the splitPanel height after collapse/expand
    this.adjustSplitPanelHeight();
  }

  render() {
    return html`
      <div class="splitPanel">
        <div class="itemStart"><slot name="start"></slot></div>
        <div class="divider" @mousedown=${this.onMouseDown}>
          <sl-icon src=${gripHorizontal}></sl-icon>
          <sl-icon-button
            class="collapse-button"
            @click=${this.toggleCollapse}
            src=${this.isCollapsed
              ? layoutBottomBarCollapse
              : layoutNavBarCollapse}
          >
          </sl-icon-button>
        </div>
        <div class="itemEnd"><slot name="end"></slot></div>
      </div>
    `;
  }
}
