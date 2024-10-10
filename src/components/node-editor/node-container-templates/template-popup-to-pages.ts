export const templatePopUpToPages = {
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
      tagName: "webwriter-gamebook-popup",
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
        '<p><b>How will the reader answer this question?</b></p><webwriter-gamebook-popup id="ww-ee5825b5-3918-4db1-b7bb-3ca3cd7eecdb" class="ww-v0.0.1 ww-widget ww-v0.0.4" contenteditable="" style="display: none;" tabindex="-1" drawflownodeid="6" pagetitle="Untitled Popup" titlelabel="Dialog" branchesoff="-1"><webwriter-gamebook-button class="ww-v0.0.1 ww-widget ww-v0.0.4" contenteditable="" tabindex="-1" name="Option B" datatargetid="9" identifier="6-output_1-9-input_1" size="small" width="100" alignment="center" variant="default"></webwriter-gamebook-button></webwriter-gamebook-popup><webwriter-gamebook-button id="ww-7d81dc03-6b3f-461b-a8b1-ea322ccf4583" class="ww-widget ww-v0.0.4" tabindex="-1" name="Option A" datatargetid="9" identifier="6-output_1-9-input_1" size="small" width="50" alignment="center" variant="default" contenteditable=""></webwriter-gamebook-button><webwriter-gamebook-button class="ww-widget ww-v0.0.4" tabindex="-1" name="Option B" datatargetid="10" identifier="6-output_2-10-input_1" size="small" width="50" alignment="center" variant="default" contenteditable=""></webwriter-gamebook-button>',
    },
    {
      tagName: "webwriter-gamebook-page",
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
      tagName: "webwriter-gamebook-page",
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
