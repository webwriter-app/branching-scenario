export const nodeTemplates = {
  drawflow: {
    Home: {
      data: {
        "2": {
          id: 2,
          name: "Untitled Popup",
          data: {
            title: "Decision Popup",
            content: "<p>Testing Slots HTML Editing</p>",
          },
          class: "popup",
          html: '<div class="container"><div class="iconDiv"><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;currentColor&quot;%0A  class=&quot;icon icon-tabler icons-tabler-filled icon-tabler-squares&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M19 7a3 3 0 0 1 3 3v9a3 3 0 0 1 -3 3h-9a3 3 0 0 1 -3 -3v-9a3 3 0 0 1 3 -3z&quot; />%0A  <path d=&quot;M14 2a3 3 0 0 1 3 2.999l-7 .001a5 5 0 0 0 -5 5l-.001 7l-.175 -.005a3 3 0 0 1 -2.824 -2.995v-9a3 3 0 0 1 3 -3z&quot; />%0A</svg>" class="pageIcon"></sl-icon></div><div class="content"><input id="title" df-title=""><p class="input-label">Popup</p></div><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
          typenode: false,
          inputs: { input_1: { connections: [] } },
          outputs: {
            output_1: { connections: [{ node: "3", output: "input_1" }] },
            output_2: { connections: [{ node: "4", output: "input_1" }] },
          },
          pos_x: 320,
          pos_y: 104,
        },
        "3": {
          id: 3,
          name: "Untitled Popup",
          data: {
            title: "Correct Popup",
            content: "<p>Testing Slots HTML Editing</p>",
          },
          class: "popup",
          html: '<div class="container"><div class="iconDiv"><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;currentColor&quot;%0A  class=&quot;icon icon-tabler icons-tabler-filled icon-tabler-squares&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M19 7a3 3 0 0 1 3 3v9a3 3 0 0 1 -3 3h-9a3 3 0 0 1 -3 -3v-9a3 3 0 0 1 3 -3z&quot; />%0A  <path d=&quot;M14 2a3 3 0 0 1 3 2.999l-7 .001a5 5 0 0 0 -5 5l-.001 7l-.175 -.005a3 3 0 0 1 -2.824 -2.995v-9a3 3 0 0 1 3 -3z&quot; />%0A</svg>" class="pageIcon"></sl-icon></div><div class="content"><input id="title" df-title=""><p class="input-label">Popup</p></div><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
          typenode: false,
          inputs: {
            input_1: { connections: [{ node: "2", input: "output_1" }] },
          },
          outputs: {},
          pos_x: 872,
          pos_y: -28,
        },
        "4": {
          id: 4,
          name: "Untitled Popup",
          data: {
            title: "Wrong Popup",
            content: "<p>Testing Slots HTML Editing</p>",
          },
          class: "popup",
          html: '<div class="container"><div class="iconDiv"><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;currentColor&quot;%0A  class=&quot;icon icon-tabler icons-tabler-filled icon-tabler-squares&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M19 7a3 3 0 0 1 3 3v9a3 3 0 0 1 -3 3h-9a3 3 0 0 1 -3 -3v-9a3 3 0 0 1 3 -3z&quot; />%0A  <path d=&quot;M14 2a3 3 0 0 1 3 2.999l-7 .001a5 5 0 0 0 -5 5l-.001 7l-.175 -.005a3 3 0 0 1 -2.824 -2.995v-9a3 3 0 0 1 3 -3z&quot; />%0A</svg>" class="pageIcon"></sl-icon></div><div class="content"><input id="title" df-title=""><p class="input-label">Popup</p></div><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
          typenode: false,
          inputs: {
            input_1: { connections: [{ node: "2", input: "output_2" }] },
          },
          outputs: {},
          pos_x: 861,
          pos_y: 232,
        },
      },
    },
  },
  containers: [
    {
      tagName: "WEBWRITER-GAMEBOOK-POPUP-CONTAINER",
      attributes: [
        { name: "class", value: "ww-widget ww-v0.0.1" },
        { name: "style", value: "display: none;" },
        { name: "drawflownodeid", value: "2" },
        { name: "pagetitle", value: "Untitled Popup" },
        { name: "contenteditable", value: "" },
      ],
      innerHTML:
        '<p><b>How will the reader answer this question?</b></p><webwriter-connection-button class="ww-widget ww-v0.0.1" name="Option A" datatargetid="3" identifier="2-output_1-3-input_1" contenteditable="" size="small" width="100" alignment="center" variant="default"></webwriter-connection-button><webwriter-connection-button class="ww-widget ww-v0.0.1" name="Option B" datatargetid="4" identifier="2-output_2-4-input_1" contenteditable="" size="small" width="100" alignment="center" variant="default"></webwriter-connection-button>',
    },
    {
      tagName: "WEBWRITER-GAMEBOOK-POPUP-CONTAINER",
      attributes: [
        { name: "class", value: "ww-widget ww-v0.0.1" },
        { name: "style", value: "display: none;" },
        { name: "drawflownodeid", value: "3" },
        { name: "pagetitle", value: "Untitled Popup" },
        { name: "contenteditable", value: "" },
      ],
      innerHTML:
        "<p><b>This is correct!</b></p><p>The answer you gave is correct. Please proceed with the gamebook.</p>",
    },
    {
      tagName: "WEBWRITER-GAMEBOOK-POPUP-CONTAINER",
      attributes: [
        { name: "class", value: "ww-widget ww-v0.0.1" },
        { name: "style", value: "display: none;" },
        { name: "drawflownodeid", value: "4" },
        { name: "pagetitle", value: "Untitled Popup" },
        { name: "contenteditable", value: "" },
      ],
      innerHTML:
        "<p><b>This is wrong!</b></p><p>Unfortunately, the answer you gave is wrong. Try again!</p>",
    },
  ],
};
