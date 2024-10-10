export const templatePopupToPopup = {
  drawflow: {
    Home: {
      data: {
        "2": {
          id: 2,
          name: "Untitled Popup",
          data: {
            title: "Decision Popup",
          },
          class: "popup",
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
          },
          class: "popup",
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
          },
          class: "popup",
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
      tagName: "webwriter-gamebook-popup",
      attributes: [
        { name: "class", value: "ww-widget ww-v0.0.1" },
        { name: "style", value: "display: none;" },
        { name: "drawflownodeid", value: "2" },
        { name: "pagetitle", value: "Untitled Popup" },
        { name: "contenteditable", value: "" },
      ],
      innerHTML:
        '<p><b>How will the reader answer this question?</b></p><webwriter-gamebook-button class="ww-widget ww-v0.0.1" name="Option A" datatargetid="3" identifier="2-output_1-3-input_1" contenteditable="" size="small" width="100" alignment="center" variant="default"></webwriter-gamebook-button><webwriter-gamebook-button class="ww-widget ww-v0.0.1" name="Option B" datatargetid="4" identifier="2-output_2-4-input_1" contenteditable="" size="small" width="100" alignment="center" variant="default"></webwriter-gamebook-button>',
    },
    {
      tagName: "webwriter-gamebook-popup",
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
      tagName: "webwriter-gamebook-popup",
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
