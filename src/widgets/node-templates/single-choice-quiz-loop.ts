export const singleChoiceQuizLoop = {
  drawflow: {
    Home: {
      data: {
        "2": {
          id: 2,
          name: "Untitled Page",
          data: {
            title: "Untitled Page",
            content: "<p>Testing Slots HTML Editing</p>",
          },
          class: "page",
          html: '<div class="container"><div class="iconDiv"><sl-icon id="ww-b133f78c-bee7-4396-af3f-6c7276589209" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;currentColor&quot;%0A  class=&quot;icon icon-tabler icons-tabler-filled icon-tabler-file&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005h5z&quot; />%0A  <path d=&quot;M19 7h-4l-.001 -4.001z&quot; />%0A</svg>" class="pageIcon"></sl-icon></div><div class="content"><input id="title" df-title=""><p class="input-label">Page</p></div><sl-icon id="ww-52e706b0-b00a-46bc-ac43-331953b2f001" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
          typenode: false,
          inputs: {
            input_1: { connections: [{ node: "6", input: "output_1" }] },
          },
          outputs: {
            output_1: { connections: [{ node: "3", output: "input_1" }] },
          },
          pos_x: 28,
          pos_y: 155,
        },
        "3": {
          id: 3,
          name: "Untitled Branch",
          data: {
            title: "Untitled Branch",
            content: "<p>Testing Slots HTML Editing</p>",
          },
          class: "branch",
          html: '<div class="container"><div class="iconDiv"><sl-icon id="ww-29ff3126-36a3-494c-bf87-84ee8d905ed3" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-arrows-split-2&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M21 17h-5.397a5 5 0 0 1 -4.096 -2.133l-.514 -.734a5 5 0 0 0 -4.096 -2.133h-3.897&quot; />%0A  <path d=&quot;M21 7h-5.395a5 5 0 0 0 -4.098 2.135l-.51 .73a5 5 0 0 1 -4.097 2.135h-3.9&quot; />%0A  <path d=&quot;M18 10l3 -3l-3 -3&quot; />%0A  <path d=&quot;M18 20l3 -3l-3 -3&quot; />%0A</svg>" class="pageIcon"></sl-icon></div><div class="content"><input id="title" df-title=""><p class="input-label">Smart Branch</p></div><sl-icon id="ww-9ef2a4cb-864d-47be-9596-b3ac258572ad" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
          typenode: false,
          inputs: {
            input_1: { connections: [{ node: "2", input: "output_1" }] },
          },
          outputs: {
            output_1: { connections: [{ node: "5", output: "input_1" }] },
            output_2: { connections: [{ node: "6", output: "input_1" }] },
          },
          pos_x: 436.6666666666667,
          pos_y: 152,
        },
        "5": {
          id: 5,
          name: "Untitled Popup",
          data: {
            title: "Right Answer Popup",
            content: "<p>Testing Slots HTML Editing</p>",
          },
          class: "popup",
          html: '<div class="container"><div class="iconDiv"><sl-icon id="ww-0598a363-311a-450e-bf00-dffbb43254bd" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;currentColor&quot;%0A  class=&quot;icon icon-tabler icons-tabler-filled icon-tabler-squares&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M19 7a3 3 0 0 1 3 3v9a3 3 0 0 1 -3 3h-9a3 3 0 0 1 -3 -3v-9a3 3 0 0 1 3 -3z&quot; />%0A  <path d=&quot;M14 2a3 3 0 0 1 3 2.999l-7 .001a5 5 0 0 0 -5 5l-.001 7l-.175 -.005a3 3 0 0 1 -2.824 -2.995v-9a3 3 0 0 1 3 -3z&quot; />%0A</svg>" class="pageIcon"></sl-icon></div><div class="content"><input id="title" df-title=""><p class="input-label">Popup</p></div><sl-icon id="ww-1f420b95-bfa2-4bae-8778-60309c13581a" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
          typenode: false,
          inputs: {
            input_1: { connections: [{ node: "3", input: "output_1" }] },
          },
          outputs: {
            output_1: { connections: [{ node: "7", output: "input_1" }] },
          },
          pos_x: 1016,
          pos_y: 41,
        },
        "6": {
          id: 6,
          name: "Untitled Popup",
          data: {
            title: "Wrong Answer Popup",
            content: "<p>Testing Slots HTML Editing</p>",
          },
          class: "popup",
          html: '<div class="container"><div class="iconDiv"><sl-icon id="ww-b2ad8e56-c412-4eac-9279-569681c99c4c" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;currentColor&quot;%0A  class=&quot;icon icon-tabler icons-tabler-filled icon-tabler-squares&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M19 7a3 3 0 0 1 3 3v9a3 3 0 0 1 -3 3h-9a3 3 0 0 1 -3 -3v-9a3 3 0 0 1 3 -3z&quot; />%0A  <path d=&quot;M14 2a3 3 0 0 1 3 2.999l-7 .001a5 5 0 0 0 -5 5l-.001 7l-.175 -.005a3 3 0 0 1 -2.824 -2.995v-9a3 3 0 0 1 3 -3z&quot; />%0A</svg>" class="pageIcon"></sl-icon></div><div class="content"><input id="title" df-title=""><p class="input-label">Popup</p></div><sl-icon id="ww-a2bfd1aa-2733-4c12-bb1f-8a2f194f2506" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
          typenode: false,
          inputs: {
            input_1: { connections: [{ node: "3", input: "output_2" }] },
          },
          outputs: {
            output_1: { connections: [{ node: "2", output: "input_1" }] },
          },
          pos_x: 1018.6666666666666,
          pos_y: 271.6666666666667,
        },
        "7": {
          id: 7,
          name: "Untitled Page",
          data: {
            title: "Untitled Page",
            content: "<p>Testing Slots HTML Editing</p>",
          },
          class: "page",
          html: '<div class="container"><div class="iconDiv"><sl-icon id="ww-eedff1d9-f572-4c4e-9024-91a558f959b9" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;currentColor&quot;%0A  class=&quot;icon icon-tabler icons-tabler-filled icon-tabler-file&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005h5z&quot; />%0A  <path d=&quot;M19 7h-4l-.001 -4.001z&quot; />%0A</svg>" class="pageIcon"></sl-icon></div><div class="content"><input id="title" df-title=""><p class="input-label">Page</p></div><sl-icon id="ww-d0bae7f5-9552-43aa-a2e7-1501d7454cd2" src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
          typenode: false,
          inputs: {
            input_1: { connections: [{ node: "5", input: "output_1" }] },
          },
          outputs: { output_1: { connections: [] } },
          pos_x: 1491,
          pos_y: 12,
        },
      },
    },
  },
  containers: [
    {
      tagName: "WEBWRITER-GAMEBOOK-PAGE-CONTAINER",
      attributes: [
        { name: "id", value: "ww-4a2e906e-7974-4ba0-aae6-1afc2337aef6" },
        { name: "class", value: "ww-widget ww-v0.0.4" },
        { name: "style", value: "display: none;" },
        { name: "tabindex", value: "-1" },
        { name: "drawflownodeid", value: "2" },
        { name: "pagetitle", value: "Untitled Page" },
        { name: "originpage", value: "0" },
        { name: "branchesoff", value: "3" },
        { name: "contenteditable", value: "" },
      ],
      innerHTML:
        '<webwriter-quiz id="ww-c246dffc-d87a-4f36-a314-d49fe0adfbf0" class="ww-widget ww-v1.0.2" contenteditable=""><webwriter-task id="ww-2959750b-0180-4eaf-af4c-43afd35766ab" class="ww-widget ww-v1.0.2" counter="undefined" solution="data:application/octet-stream;base64,irEXJoX0ryNlx/n0LjeM7He4q2OvnzXcj/f9vK2mXPdm9A6ZD9y7rCP9dqXFt9uCBkFHrsM/4+QY5+k=" iv="data:application/octet-stream;base64,qAoVejoNq3VfbOdE" salt="data:application/octet-stream;base64,Rl1lTsy1GAdujo4P3ugNFg==" contenteditable=""><webwriter-task-prompt id="ww-dcefc851-f8dc-46f7-b1c7-630dbb20daed" class="ww-widget ww-v1.0.2" slot="prompt" contenteditable=""><p>What is Pythagoras\' theorem?</p></webwriter-task-prompt><webwriter-choice id="ww-3dba2833-9078-4448-9c54-7946e2f7aad9" class="ww-widget ww-v1.0.2" mode="single" contenteditable=""><webwriter-choice-item id="ww-1242a67d-2cef-4238-899e-468f9e5d7970" class="ww-widget ww-v1.0.2" layout="list" contenteditable=""><p>The sum of the angles in a triangle is 180 degrees.</p></webwriter-choice-item><webwriter-choice-item id="ww-d3e3b0e4-5251-44ba-8290-cb7d5ce03d4e" class="ww-widget ww-v1.0.2" layout="list" contenteditable=""><p>The area of a circle is πr².</p></webwriter-choice-item><webwriter-choice-item id="ww-59d867c6-8ad2-4eec-96cd-3bfa06cddc38" class="ww-widget ww-v1.0.2" layout="list" contenteditable=""><p>In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.</p></webwriter-choice-item><webwriter-choice-item id="ww-d0e6982f-1f1e-45db-92c2-8001a7f1127d" class="ww-widget ww-v1.0.2" layout="list" contenteditable=""><p>The circumference of a circle is 2πr.</p></webwriter-choice-item></webwriter-choice></webwriter-task></webwriter-quiz><webwriter-smart-branch-button id="ww-8d12d60e-0423-4a3b-a330-911c7d06dd03" class="ww-widget ww-v0.0.4" tabindex="-1" name="Continue" datatargetid="3" identifier="2-output_1-3-input_1" size="small" width="25" alignment="flex-end" variant="primary" contenteditable=""></webwriter-smart-branch-button>',
    },
    {
      tagName: "WEBWRITER-GAMEBOOK-BRANCH-CONTAINER",
      attributes: [
        { name: "id", value: "ww-5e12e116-b01c-45c0-84ce-96e9cd539174" },
        { name: "class", value: "ww-widget ww-v0.0.4" },
        { name: "style", value: "display: none;" },
        { name: "drawflownodeid", value: "3" },
        { name: "pagetitle", value: "Untitled Branch" },
        { name: "incomingcontainerid", value: "2" },
        {
          name: "rules",
          value:
            '[{"output_id":"output_1","elementId":"ww-c246dffc-d87a-4f36-a314-d49fe0adfbf0","quizTasks":"ww-2959750b-0180-4eaf-af4c-43afd35766ab","condition":"correct","match":"100","target":5,"isConditionEnabled":true,"isMatchEnabled":true,"isTargetEnabled":true}]',
        },
        { name: "contenteditable", value: "" },
        {
          name: "elserule",
          value:
            '{"output_id":"output_2","elementId":"","quizTasks":"","condition":"","match":"","target":6,"isConditionEnabled":false,"isMatchEnabled":false,"isTargetEnabled":false}',
        },
      ],
      innerHTML: "",
    },
    {
      tagName: "WEBWRITER-GAMEBOOK-POPUP-CONTAINER",
      attributes: [
        { name: "id", value: "ww-9c656066-e29e-47ec-8ccb-66268e30173e" },
        { name: "class", value: "ww-widget ww-v0.0.4" },
        { name: "style", value: "display: none;" },
        { name: "drawflownodeid", value: "5" },
        { name: "pagetitle", value: "Right Answer Popup" },
        { name: "contenteditable", value: "" },
        { name: "tabindex", value: "-1" },
        { name: "titlelabel", value: "Your answer is correct!" },
        { name: "branchesoff", value: "-1" },
        { name: "preventclosing", value: "" },
      ],
      innerHTML:
        '<p>Amazing! Good job.</p><webwriter-connection-button id="ww-45504c71-eb03-496a-b38c-78f54ef64206" class="ww-widget ww-v0.0.4" name="Continue" datatargetid="7" identifier="5-output_1-7-input_1" contenteditable="" size="small" width="27" alignment="flex-end" variant="success" tabindex="-1"></webwriter-connection-button>',
    },
    {
      tagName: "WEBWRITER-GAMEBOOK-POPUP-CONTAINER",
      attributes: [
        { name: "id", value: "ww-4c21478c-2510-477e-b811-2d20a9f9230a" },
        { name: "class", value: "ww-widget ww-v0.0.4" },
        { name: "style", value: "display: none;" },
        { name: "drawflownodeid", value: "6" },
        { name: "pagetitle", value: "Wrong Answer Popup" },
        { name: "contenteditable", value: "" },
        { name: "tabindex", value: "-1" },
        { name: "titlelabel", value: "Incorrect!" },
        { name: "branchesoff", value: "-1" },
        { name: "preventclosing", value: "" },
      ],
      innerHTML:
        '<p>Sorry, your answer is wrong. Better luck next time.</p><webwriter-connection-button id="ww-009ab5ff-1499-4143-b7cf-7de52d1111b4" class="ww-widget ww-v0.0.4" name="Try again!" datatargetid="2" identifier="6-output_1-2-input_1" contenteditable="" size="small" width="32" alignment="flex-end" variant="danger" tabindex="-1" pill=""></webwriter-connection-button>',
    },
    {
      tagName: "WEBWRITER-GAMEBOOK-PAGE-CONTAINER",
      attributes: [
        { name: "id", value: "ww-a7f50ec7-a713-474f-9fb7-94c074f78477" },
        { name: "class", value: "ww-widget ww-v0.0.4" },
        { name: "style", value: "display: none;" },
        { name: "drawflownodeid", value: "7" },
        { name: "pagetitle", value: "Untitled Page" },
        { name: "originpage", value: "0" },
        { name: "contenteditable", value: "" },
        { name: "tabindex", value: "-1" },
        { name: "branchesoff", value: "-1" },
      ],
      innerHTML: "<p>Ask more questions here!</p>",
    },
  ],
};
