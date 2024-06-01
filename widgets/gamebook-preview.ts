import { html, css, LitElement, unsafeCSS } from "lit";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  queryAll,
  state,
} from "lit/decorators.js";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import SlDropdown from "@shoelace-style/shoelace/dist/components/dropdown/dropdown.component.js";
import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.component.js";
import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.component.js";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js";
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js";

import { Gamebook, Page, Answer } from "./gamebook-model";

//Import Styles
import styles from "../css/gamebook-preview-css";

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
    };
  }

  //import CSS
  static styles = [styles];

  @queryAll(".link") linkButtons;
  @query(".pageTitle") pageTitle;
  @query(".page") page;

  @state() currentPage: Page = null;
  @property({ type: Object, attribute: false })
  gamebook: Gamebook = new Gamebook();

  protected firstUpdated(_changedProperties: any): void {
    // Attach event listeners to all buttons
    // this.currentPage = this.gamebook.startGamebook();

    this.linkButtons.forEach((button) => {
      const targetId = parseInt(button.getAttribute("data-target-id"), 10);
      button.addEventListener("click", () =>
        this._navigateToPageGamebook(targetId)
      );
    });
  }

  render() {
    return html`<div class="preview">
      <div class="gamebook">
        <div class="gamebookTitle">${this.gamebook.title}</div>
        <div class="pageTitle">${this.currentPage.title}</div>
        <div class="page">${unsafeHTML(this.currentPage.content)}</div>
      </div>
    </div> `;
  }

  private _navigateToPageGamebook(targetPageId: number) {
    this.gamebook.navigateWithLink(targetPageId);

    this.currentPage =
      this.gamebook.pages[
        this.gamebook.getPageIndex(this.gamebook.currentPageId)
      ][1];
  }
}
