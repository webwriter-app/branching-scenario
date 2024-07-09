export const gamebookExamples = {
  gamebookExamples: [
    {
      exampleName: "quiz-example",
      drawflow: {
        drawflow: {
          Home: {
            data: {
              "3": {
                id: 3,
                name: "First Page",
                data: {
                  title: "Cover Page",
                  content: "<p>Testing Slots HTML Editing</p>",
                },
                class: "origin",
                html: '<div class="container"><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-file&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M14 3v4a1 1 0 0 0 1 1h4&quot; />%0A  <path d=&quot;M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z&quot; />%0A</svg>" class="pageIcon"></sl-icon><div class="content"><div class="badge"><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;currentColor&quot;%0A  class=&quot;icon icon-tabler icons-tabler-filled icon-tabler-circle-arrow-right&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 2l.324 .005a10 10 0 1 1 -.648 0l.324 -.005zm.613 5.21a1 1 0 0 0 -1.32 1.497l2.291 2.293h-5.584l-.117 .007a1 1 0 0 0 .117 1.993h5.584l-2.291 2.293l-.083 .094a1 1 0 0 0 1.497 1.32l4 -4l.073 -.082l.064 -.089l.062 -.113l.044 -.11l.03 -.112l.017 -.126l.003 -.075l-.007 -.118l-.029 -.148l-.035 -.105l-.054 -.113l-.071 -.111a1.008 1.008 0 0 0 -.097 -.112l-4 -4z&quot; />%0A</svg>"></sl-icon><p>Start Page</p></div><input type="text" id="test-textarea" placeholder="Enter name" df-title=""></div><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
                typenode: false,
                inputs: {},
                outputs: {
                  output_1: {
                    connections: [{ node: "4", output: "input_1" }],
                  },
                },
                pos_x: -137,
                pos_y: 36.42857142857143,
              },
              "4": {
                id: 4,
                name: "Untitled Page",
                data: {
                  title: "Garden Page",
                  content: "<p>Testing Slots HTML Editing</p>",
                },
                class: "page",
                html: '<div class="container"><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-file&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M14 3v4a1 1 0 0 0 1 1h4&quot; />%0A  <path d=&quot;M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z&quot; />%0A</svg>" class="pageIcon"></sl-icon><div class="content"><p class="input-label">Page</p><input type="text" id="test-textarea" placeholder="Enter name" df-title=""></div><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
                typenode: false,
                inputs: {
                  input_1: {
                    connections: [{ node: "3", input: "output_1" }],
                  },
                  input_2: {
                    connections: [{ node: "7", input: "output_1" }],
                  },
                },
                outputs: {
                  output_1: {
                    connections: [{ node: "5", output: "input_1" }],
                  },
                },
                pos_x: 238,
                pos_y: 146,
              },
              "5": {
                id: 5,
                name: "Question Branch",
                data: {
                  title: "Question Branch",
                  question:
                    "What is the name of the garden surrounding the Eiffel Tower?",
                  answers: [
                    {
                      id: 0,
                      text: "Jardin du Luxembourg",
                      targetPageId: "7",
                      targetPageInputClass: "undefined",
                      isCorrect: null,
                    },
                    {
                      id: 1,
                      text: "Jardins du Trocadéro",
                      targetPageId: "7",
                      targetPageInputClass: "undefined",
                      isCorrect: null,
                    },
                    {
                      id: 2,
                      text: "Champ de Mars",
                      targetPageId: "6",
                      targetPageInputClass: "undefined",
                      isCorrect: null,
                    },
                    {
                      id: 3,
                      text: "Jardin des Tuileries",
                      targetPageId: "7",
                      targetPageInputClass: "undefined",
                      isCorrect: null,
                    },
                  ],
                },
                class: "question-branch",
                html: '<div class="container"><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-help-square-rounded&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z&quot; />%0A  <path d=&quot;M12 16v.01&quot; />%0A  <path d=&quot;M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483&quot; />%0A</svg>" style="font-size: 48px;"></sl-icon><div class="content"><p>Question</p><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="dotsIcon"></sl-icon></div></div>',
                typenode: false,
                inputs: {
                  input_1: {
                    connections: [{ node: "4", input: "output_1" }],
                  },
                },
                outputs: {
                  output_1: {
                    connections: [{ node: "7", output: "input_1" }],
                  },
                  output_2: {
                    connections: [{ node: "7", output: "input_2" }],
                  },
                  output_3: {
                    connections: [{ node: "6", output: "input_1" }],
                  },
                  output_4: {
                    connections: [{ node: "7", output: "input_3" }],
                  },
                },
                pos_x: 614,
                pos_y: 93,
              },
              "6": {
                id: 6,
                name: "Untitled Page",
                data: {
                  title: "Correct Garden Answer",
                  content: "<p>Testing Slots HTML Editing</p>",
                },
                class: "page",
                html: '<div class="container"><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-file&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M14 3v4a1 1 0 0 0 1 1h4&quot; />%0A  <path d=&quot;M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z&quot; />%0A</svg>" class="pageIcon"></sl-icon><div class="content"><p class="input-label">Page</p><input type="text" id="test-textarea" placeholder="Enter name" df-title=""></div><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
                typenode: false,
                inputs: {
                  input_1: {
                    connections: [{ node: "5", input: "output_3" }],
                  },
                },
                outputs: {},
                pos_x: 852,
                pos_y: -8,
              },
              "7": {
                id: 7,
                name: "Untitled Page",
                data: {
                  title: "Wrong Garden Answer",
                  content: "<p>Testing Slots HTML Editing</p>",
                },
                class: "page",
                html: '<div class="container"><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-file&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M14 3v4a1 1 0 0 0 1 1h4&quot; />%0A  <path d=&quot;M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z&quot; />%0A</svg>" class="pageIcon"></sl-icon><div class="content"><p class="input-label">Page</p><input type="text" id="test-textarea" placeholder="Enter name" df-title=""></div><sl-icon src="data:image/svg+xml,<svg%0A  xmlns=&quot;http://www.w3.org/2000/svg&quot;%0A  width=&quot;24&quot;%0A  height=&quot;24&quot;%0A  viewBox=&quot;0 0 24 24&quot;%0A  fill=&quot;none&quot;%0A  stroke=&quot;currentColor&quot;%0A  stroke-width=&quot;2&quot;%0A  stroke-linecap=&quot;round&quot;%0A  stroke-linejoin=&quot;round&quot;%0A  class=&quot;icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical&quot;%0A>%0A  <path stroke=&quot;none&quot; d=&quot;M0 0h24v24H0z&quot; fill=&quot;none&quot;/>%0A  <path d=&quot;M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A  <path d=&quot;M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0&quot; />%0A</svg>" class="threeDots"></sl-icon></div>',
                typenode: false,
                inputs: {
                  input_1: {
                    connections: [{ node: "5", input: "output_1" }],
                  },
                  input_2: {
                    connections: [{ node: "5", input: "output_2" }],
                  },
                  input_3: {
                    connections: [{ node: "5", input: "output_4" }],
                  },
                },
                outputs: {
                  output_1: {
                    connections: [{ node: "4", output: "input_2" }],
                  },
                },
                pos_x: 844,
                pos_y: 196,
              },
            },
          },
        },
      },
      containers: [
        {
          tagName: "PAGE-CONTAINER",
          attributes: [
            { name: "class", value: "ww-widget ww-v0.0.1" },
            { name: "style", value: "display: none;" },
            { name: "drawflownodeid", value: "3" },
            { name: "pagetitle", value: "Cover Page" },
            { name: "originpage", value: "1" },
            { name: "contenteditable", value: "" },
          ],
          innerHTML:
            '<h1 data-placeholder="Heading">Take the Eiffel Tower Quiz!</h1><picture><img src="blob:tauri://localhost/02d49da2-f13b-4c4a-9173-7d3b9e215173" contenteditable="false"></picture><link-button class="ww-widget ww-v0.0.1" name="Start Quiz" datatargetid="4" identifier="3-output_1-4-input_1" contenteditable=""></link-button><p><br class="ProseMirror-trailingBreak"></p>',
        },
        {
          tagName: "PAGE-CONTAINER",
          attributes: [
            { name: "class", value: "ww-widget ww-v0.0.1" },
            { name: "style", value: "display: none;" },
            { name: "drawflownodeid", value: "4" },
            { name: "pagetitle", value: "Garden Page" },
            { name: "originpage", value: "0" },
            { name: "contenteditable", value: "" },
          ],
          innerHTML:
            '<h1 data-placeholder="Heading">The Garden surrounding the Eiffel Tower</h1><picture><img src="blob:tauri://localhost/babc487a-3a68-413f-b6dc-ce650ffecfbf" contenteditable="false"></picture><p>This picture shows the garden surrounding the Eiffel Tower.</p> <link-button class="ww-widget ww-v0.0.1" name="Continue" datatargetid="5" identifier="4-output_1-5-input_1" contenteditable=""></link-button> <p><br class="ProseMirror-trailingBreak"></p>',
        },
        {
          tagName: "QUIZ-CONTAINER",
          attributes: [
            { name: "class", value: "ww-widget ww-v0.0.1" },
            { name: "style", value: "position: unset; display: none;" },
            { name: "drawflownodeid", value: "5" },
            {
              name: "quiz",
              value:
                '{"title":"Question Branch","question":"What is the name of the garden surrounding the Eiffel Tower?","answers":[{"id":0,"text":"Jardin du Luxembourg","targetPageId":"7","targetPageInputClass":"undefined","isCorrect":null},{"id":1,"text":"Jardins du Trocadéro","targetPageId":"7","targetPageInputClass":"undefined","isCorrect":null},{"id":2,"text":"Champ de Mars","targetPageId":"6","targetPageInputClass":"undefined","isCorrect":null},{"id":3,"text":"Jardin des Tuileries","targetPageId":"7","targetPageInputClass":"undefined","isCorrect":null}]}',
            },
            { name: "contenteditable", value: "" },
          ],
          innerHTML: "",
        },
        {
          tagName: "PAGE-CONTAINER",
          attributes: [
            { name: "class", value: "ww-widget ww-v0.0.1" },
            { name: "style", value: "display: none;" },
            { name: "drawflownodeid", value: "6" },
            { name: "pagetitle", value: "Correct Garden Answer" },
            { name: "originpage", value: "0" },
            { name: "contenteditable", value: "" },
          ],
          innerHTML:
            '<h1 data-placeholder="Heading">Hurray! You are right :)</h1><h1 data-placeholder="Heading">👍🏻</h1>',
        },
        {
          tagName: "PAGE-CONTAINER",
          attributes: [
            { name: "class", value: "ww-widget ww-v0.0.1" },
            { name: "style", value: "display: none;" },
            { name: "drawflownodeid", value: "7" },
            { name: "pagetitle", value: "Wrong Garden Answer" },
            { name: "originpage", value: "0" },
            { name: "contenteditable", value: "" },
          ],
          innerHTML:
            '<h1 data-placeholder="Heading">Oh no! This answer is wrong :(&nbsp;</h1><p>❌</p><p><br class="ProseMirror-trailingBreak"></p><p><br class="ProseMirror-trailingBreak"></p><p><br class="ProseMirror-trailingBreak"></p><link-button class="ww-widget ww-v0.0.1" name="Restart" datatargetid="4" identifier="7-output_2-4-input_3" contenteditable=""></link-button><p><br class="ProseMirror-trailingBreak"></p>',
        },
      ],
    },
  ],
};
