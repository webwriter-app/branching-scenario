export const decisionPopUpToPage = {
  drawflow: {
    Home: {
      data: {
        "6": {
          id: 6,
          name: "Untitled Popup",
          data: {
            title: "Decision Popup",
          },
          class: "popup",
          html: '<div class="container"><div class="iconDiv"><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;currentColor&quot;%0A  class=&quot;icon icon-tabler icons-tabler-filled icon-tabler-squares&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M19 7a3 3 0 0 1 3 3v9a3 3 0 0 1 -3 3h-9a3 3 0 0 1 -3 -3v-9a3 3 0 0 1 3 -3z&quot; />%0A  <path d=&quot;M14 2a3 3 0 0 1 3 2.999l-7 .001a5 5 0 0 0 -5 5l-.001 7l-.175 -.005a3 3 0 0 1 -2.824 -2.995v-9a3 3 0 0 1 3 -3z&quot; />%0A</svg>" class="pageIcon"></sl-icon></div><div class="content"><input id="title" df-title=""><p class="input-label">Popup</p></div><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
          typenode: false,
          inputs: { input_1: { connections: [] } },
          outputs: {
            output_1: { connections: [{ node: "9", output: "input_1" }] },
            output_2: { connections: [{ node: "10", output: "input_1" }] },
          },
          pos_x: 155.5,
          pos_y: 109,
        },
        "9": {
          id: 9,
          name: "Untitled Page",
          data: {
            title: "Option A",
          },
          class: "page",
          html: '<div class="container"><div class="iconDiv"><sl-icon id="ww-c4dd4283-b47c-4fe0-85b9-098581d5b3c8" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;currentColor&quot;%0A  class=&quot;icon icon-tabler icons-tabler-filled icon-tabler-file&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005h5z&quot; />%0A  <path d=&quot;M19 7h-4l-.001 -4.001z&quot; />%0A</svg>" class="pageIcon"></sl-icon></div><div class="content"><input id="title" df-title=""><p class="input-label">Page</p></div><sl-icon id="ww-bb9b18c0-5b26-44b5-8bb4-a4642cf97e5c" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
          typenode: false,
          inputs: {
            input_1: { connections: [{ node: "6", input: "output_1" }] },
          },
          outputs: { output_1: { connections: [] } },
          pos_x: 672.5,
          pos_y: -2,
        },
        "10": {
          id: 10,
          name: "Untitled Page",
          data: {
            title: "Option B",
          },
          class: "page",
          html: '<div class="container"><div class="iconDiv"><sl-icon id="ww-006688da-d2b5-44d3-a74d-c637552497c5" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;currentColor&quot;%0A  class=&quot;icon icon-tabler icons-tabler-filled icon-tabler-file&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005h5z&quot; />%0A  <path d=&quot;M19 7h-4l-.001 -4.001z&quot; />%0A</svg>" class="pageIcon"></sl-icon></div><div class="content"><input id="title" df-title=""><p class="input-label">Page</p></div><sl-icon id="ww-fdfc9c45-6e32-4599-97dd-435e5d2e817f" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
          typenode: false,
          inputs: {
            input_1: { connections: [{ node: "6", input: "output_2" }] },
          },
          outputs: { output_1: { connections: [] } },
          pos_x: 688.5,
          pos_y: 237,
        },
      },
    },
  },
  containers: [
    {
      tagName: "WEBWRITER-GAMEBOOK-POPUP-CONTAINER",
      attributes: [
        { name: "class", value: "ww-v0.0.1 ww-widget ww-v0.0.4" },
        { name: "contenteditable", value: "" },
        { name: "style", value: "display: none;" },
        { name: "tabindex", value: "-1" },
        { name: "drawflownodeid", value: "6" },
        { name: "pagetitle", value: "Untitled Popup" },
        { name: "titlelabel", value: "Dialog" },
        { name: "branchesoff", value: "-1" },
      ],
      innerHTML:
        '<p><b>How will the reader answer this question?</b></p><webwriter-gamebook-popup-container id="ww-ee5825b5-3918-4db1-b7bb-3ca3cd7eecdb" class="ww-v0.0.1 ww-widget ww-v0.0.4" contenteditable="" style="display: none;" tabindex="-1" drawflownodeid="6" pagetitle="Untitled Popup" titlelabel="Dialog" branchesoff="-1"><webwriter-connection-button class="ww-v0.0.1 ww-widget ww-v0.0.4" contenteditable="" tabindex="-1" name="Option B" datatargetid="9" identifier="6-output_1-9-input_1" size="small" width="100" alignment="center" variant="default"></webwriter-connection-button></webwriter-gamebook-popup-container><webwriter-connection-button id="ww-7d81dc03-6b3f-461b-a8b1-ea322ccf4583" class="ww-widget ww-v0.0.4" tabindex="-1" name="Option A" datatargetid="9" identifier="6-output_1-9-input_1" size="small" width="50" alignment="center" variant="default" contenteditable=""></webwriter-connection-button><webwriter-connection-button class="ww-widget ww-v0.0.4" tabindex="-1" name="Option B" datatargetid="10" identifier="6-output_2-10-input_1" size="small" width="50" alignment="center" variant="default" contenteditable=""></webwriter-connection-button>',
    },
    {
      tagName: "WEBWRITER-GAMEBOOK-PAGE-CONTAINER",
      attributes: [
        { name: "class", value: "ww-widget ww-v0.0.4" },
        { name: "style", value: "display: none;" },
        { name: "tabindex", value: "-1" },
        { name: "drawflownodeid", value: "9" },
        { name: "pagetitle", value: "Option A" },
        { name: "originpage", value: "0" },
        { name: "branchesoff", value: "-1" },
        { name: "contenteditable", value: "" },
      ],
      innerHTML: '<p><br class="ProseMirror-trailingBreak"></p>',
    },
    {
      tagName: "WEBWRITER-GAMEBOOK-PAGE-CONTAINER",
      attributes: [
        { name: "class", value: "ww-widget ww-v0.0.4" },
        { name: "style", value: "display: none;" },
        { name: "tabindex", value: "-1" },
        { name: "drawflownodeid", value: "10" },
        { name: "pagetitle", value: "Option B" },
        { name: "originpage", value: "0" },
        { name: "branchesoff", value: "-1" },
        { name: "contenteditable", value: "" },
      ],
      innerHTML: '<p><br class="ProseMirror-trailingBreak"></p>',
    },
  ],
};
