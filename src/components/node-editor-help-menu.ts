import { LitElementWw } from "@webwriter/lit";
import { widgetMsg } from "@webwriter/lit/localize";
import { html } from "lit";
import { state } from "lit/decorators.js";

import mouseLeft from "../assets/mouse-left-click.svg";
import mouseRight from "../assets/mouse-right-click.svg";
import arrowsMove from "@tabler/icons/outline/arrows-move.svg";
import questionMark from "@tabler/icons/outline/question-mark.svg";

import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import SlTooltip from "@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js";

import styles from "./node-editor-help-menu.styles";

export class NodeEditorHelpMenu extends LitElementWw {
  protected readonly messages = { msg: widgetMsg(this) };
  static styles = [styles];

  static get scopedElements() {
    return {
      "sl-icon": SlIcon,
      "sl-icon-button": SlIconButton,
      "sl-tooltip": SlTooltip,
    };
  }

  @state() accessor showWindow = false;

  render() {
    return html` ${this.showWindow
      ? html`
    <div class="help">
      <button class="close-icon" aria-label=${this.messages.msg("Close")} @click="${this.toggleWindow}">x</button>
      <div class="column">
        <div class="help-item">
          <sl-icon src=${mouseLeft}></sl-icon>
        </div>  

        <div class="help-item">
          <div class="icon-plus">
            <sl-icon src=${mouseLeft}></sl-icon>
            <p>+</p>
            <sl-icon src=${arrowsMove}></sl-icon>
          </div>
        </div>

        <div class="help-item">
          <sl-icon src=${mouseRight}></sl-icon>
        </div>
        </div>

        <div class="column">
            <div class="help-item"><p class="label">${this.messages.msg("Select")}</p></div>

            <div class="help-item"><p class="label"> ${this.messages.msg(
              "Drag Connection"
            )}</p></div>
            <div class="help-item"><p class="label">${this.messages.msg("Delete")}
              
            </p></div>
        </div>
      </div>
    </div>`
      : html` <div class="helpIconButton">
          <sl-tooltip content=${this.messages.msg("Shortcuts")} placement="top" skidding="16">
            <sl-icon-button
              class="helpIcon"
              src=${questionMark}
              label=${this.messages.msg("Shortcuts")}
              @click="${this.toggleWindow}"
            ></sl-icon-button>
          </sl-tooltip>
        </div>`}`;
  }

  toggleWindow() {
    this.showWindow = !this.showWindow;
  }
}
