import { html, css, LitElement, unsafeCSS } from "lit";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  queryAll,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlOption,
  SlSelect,
  SlButton,
  SlTextarea,
  SlDivider,
  SlDropdown,
  SlMenu,
  SlMenuItem,
  SlIconButton,
} from "@shoelace-style/shoelace";

//Import Styles
import styles from "../css/gamebook-preview-css";

import { WebWriterConnectionButton } from "./gamebook-components/webwriter-connection-button";
import { WebWriterGamebookPageContainer } from "./gamebook-components/webwriter-gamebook-page-container";
import { WebWriterGamebookPopupContainer } from "./gamebook-components/webwriter-gamebook-popup-container";

@customElement("webwriter-gamebook")
export class WebWriterGamebook extends LitElementWw {
  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-textarea": SlTextarea,
      "sl-divider": SlDivider,
      "sl-icon-button": SlIconButton,
      "sl-dropdown": SlDropdown,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
      "sl-select": SlSelect,
      "sl-option": SlOption,
      "webwriter-connection-button": WebWriterConnectionButton,
    };
  }

  //import CSS
  static styles = [styles];

  @state() currentPageId?: Number;

  @property({ type: String }) gamebookTitle;
  @property({ type: String }) pageTitle;

  @queryAssignedElements({
    flatten: true,
    selector:
      "webwriter-gamebook-page-container, webwriter-gamebook-popup-container, quiz-container",
  })
  gamebookContainers;

  /*


   */
  protected firstUpdated(_changedProperties: any): void {
    const slot = this.shadowRoot.querySelector("slot");
    if (slot) {
      slot.addEventListener("slotchange", () => this._handleSlotChange());
    }
  }

  /*


   */
  _handleSlotChange() {
    this.currentPageId = this._resetGamebookToOrigin();
    this._initializeConnectionButtons(this.currentPageId);
  }

  /*


  */
  render() {
    return html`
      <div class="gamebook">
        <div class="gamebookTitle">${this.gamebookTitle}</div>
        <div class="pageTitle">${this.pageTitle}</div>
        <div class="page">
          <slot></slot>
        </div>
      </div>
    `;
  }

  /*

  */
  private _navigateTo(targetId: number) {
    //
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == targetId) {
        if (container instanceof WebWriterGamebookPageContainer) {
          this._navigateToPage(targetId);
          this._initializeConnectionButtons(targetId);
        }
        //
        else if (container instanceof WebWriterGamebookPopupContainer) {
          this._showPopupContainerDialog(targetId);
          this._initializeConnectionButtons(targetId);
        }

        // Add more conditions as needed
      }
    });
  }

  /*


  */
  private _navigateToPage(pageId: number) {
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == pageId) {
        container.show();
        this.pageTitle = container.pageTitle;
      } else {
        if (container instanceof WebWriterGamebookPopupContainer) {
          container.hideDialog();
        }
        //
        else {
          container.hide();
        }
      }
    });

    this.currentPageId = pageId;
  }

  /*


  */
  private _showPopupContainerDialog(containerId: number) {
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == containerId) {
        (container as WebWriterGamebookPopupContainer).showDialog();
      } else if (container.drawflowNodeId != containerId) {
        if (container instanceof WebWriterGamebookPopupContainer) {
          container.hideDialog();
          container.hide();
        }
      }
    });
  }

  /*


  */
  private _resetGamebookToOrigin() {
    const originPageContainer = this.gamebookContainers.find(
      (container) => container.getAttribute("originPage") == 1
    );

    this.pageTitle = originPageContainer.pageTitle;

    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == originPageContainer.drawflowNodeId) {
        container.show();
      } else {
        container.hide();
      }
    });

    return originPageContainer.drawflowNodeId;
  }

  /*


  */
  private _initializeConnectionButtons(containerId: Number) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );

    //initialise the elements on the origin page
    container.connectionButtons.forEach((button) => {
      const targetId = parseInt(button.getAttribute("dataTargetId"), 10);
      button.addEventListener("click", () => this._navigateTo(targetId));
    });
  }

  /*


  */
  private _initializeQuizButtons(containerId: Number) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );

    //initialise the elements on the origin page
    container.answerButtons.forEach((button) => {
      const targetId = parseInt(button.getAttribute("pageTargetId"), 10);
      button.addEventListener("click", () => this._navigateTo(targetId));
    });
  }
}
