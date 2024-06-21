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

import { Gamebook, Page, Answer } from "./gamebook-model";

//Import Styles
import styles from "../css/gamebook-preview-css";
import { PageContainer } from "./page-container";

import { LinkButton } from "./link-button";

//Define Component
//TODO: Fix Gamebook Errors. Check other modules for proper updating. I commented out a lot for restructure!
@customElement("gamebook-preview")
export class GamebookPreview extends LitElementWw {
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
      "link-button": LinkButton,
    };
  }

  //import CSS
  static styles = [styles];

  @query(".pageTitle") pageTitle;
  @query(".page") page;

  @state() currentPage: Page = {
    drawflowNodeId: -1,
    title: "undefined",
    links: [],
  };
  @property({ type: Object, attribute: false })
  gamebook: Gamebook = new Gamebook();

  @queryAssignedElements({ flatten: true, selector: "page-container" })
  pageContainers;

  protected firstUpdated(_changedProperties: any): void {
    // Attach event listeners to all buttons
    this.currentPage = this.gamebook.startGamebook();

    const pageContainer = this.pageContainers.find(
      (pageContainer) =>
        pageContainer.getAttribute("drawflowNodeId") ==
        this.currentPage.drawflowNodeId
    );

    pageContainer.linkButtons.forEach((button) => {
      const targetId = parseInt(button.getAttribute("dataTargetId"), 10);
      button.addEventListener("click", () => this._navigateToPage(targetId));
    });

    this.pageContainers.forEach((pageContainer) => {
      if (
        (pageContainer as PageContainer).drawflowNodeId ==
        this.currentPage.drawflowNodeId
      ) {
        (pageContainer as PageContainer).show();
      } else {
        (pageContainer as PageContainer).hide();
      }
    });
  }

  render() {
    return html`<div class="preview">
      <div class="gamebook">
        <div class="gamebookTitle">${this.gamebook.title}</div>
        <div class="pageTitle">${this.currentPage.title}</div>
        <div class="page">
          <slot></slot>
        </div>
      </div>
    </div> `;
  }

  //TODO: this seems to be laggy. consider saving the pagecontainer content directly into gamebook structure or drawflownode structure.
  //This would also fix the editability issue. However, I would then need to rebuild the webwriter preview view as well
  private _navigateToPage(targetPageId: number) {
    //console.log(this.currentPage);

    this.gamebook.navigateWithLink(targetPageId);

    this.currentPage =
      this.gamebook.pages[
        this.gamebook.getPageIndex(this.gamebook.currentPageId)
      ][1];

    //console.log(this.currentPage);

    this.pageContainers.forEach((pageContainer) => {
      if (
        (pageContainer as PageContainer).drawflowNodeId ==
        this.currentPage.drawflowNodeId
      ) {
        (pageContainer as PageContainer).show();
      } else {
        (pageContainer as PageContainer).hide();
      }
    });

    const pageContainer = this.pageContainers.find(
      (pageContainer) =>
        pageContainer.getAttribute("drawflowNodeId") ==
        this.currentPage.drawflowNodeId
    );

    pageContainer.linkButtons.forEach((button) => {
      const targetId = parseInt(button.getAttribute("dataTargetId"), 10);
      button.addEventListener("click", () => this._navigateToPage(targetId));
    });
  }
}
