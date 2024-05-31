import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  queryAll,
  state,
} from "lit/decorators.js";
import { Gamebook, Page, Answer } from "./gamebook";

//Import Styles
import styles from "./customStyles";

//Define Component
//TODO: Fix Gamebook Errors. Check other modules for proper updating. I commented out a lot for restructure!
@customElement("gamebook-preview")
export class GamebookPreview extends LitElementWw {
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

    this.currentPage = this.gamebook.startGamebook();
    this.pageTitle.innerHTML = this.currentPage.title;
    this.page.innerHTML = this.currentPage.content;

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
        <div id="pageTitle" class="pageTitle"></div>
        <div id="page" class="page"></div>
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
