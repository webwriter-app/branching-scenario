# Branching Scenario (`@webwriter/branching-scenario@2.0.0`)
[License: MIT](LICENSE) | Version: 2.0.0

Create adaptable learning experiences by authoring a gamebook, where you present the student with choices on how to continue.

## Snippets
[Snippets](https://webwriter.app/docs/snippets/snippets/) are examples and templates using the package's widgets.

| Name | Import Path |
| :--: | :---------: |
| Art Of Europe | `@webwriter/branching-scenario/snippets/art-of-europe.html` |



## `WebwriterBranchingScenario` (`<webwriter-branching-scenario>`)
This widget allows for the creation and editing of branching gamebooks. These are adaptable learning experiences, where you present the student with choices on how to continue.

Input: the node diagram works with mouse, touch (drag, long press for the context menu) and keyboard (arrow keys and Enter on nodes, Delete to remove); the dividers between editor and detail view are separators that drag and take the arrow keys. Readers choose with the buttons on a page.

Layout: designed for container widths of 300 px to 2100 px.

Conversions: the scenario exports as a JSON file (`.json`, lossless: title, graph and the markup of every page, popup and branch) and imports the same file; the import replaces the pages, popups and branches of the scenario after the whole file has been checked. It also exports a Twee 3 story (`.twee`, for Twine: one passage per node with its text and `[[label->passage]]` links, positions and the start passage; formatting, media, quizzes and branching rules are not carried) and, as a native conversion, a series of `section` elements (pages and popups with their text and a list of links for the choices; branches are left out).

Signals: `page` is the title of the page the reader is on (an empty string in edit mode) and `ended` is true when that page offers no choice. Another widget can show them with `effect="#id[page]"`.

Print: the current page is printed with its choices as outlined buttons; in edit mode a note is printed instead of the editor.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/branching-scenario/widgets/webwriter-branching-scenario.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/branching-scenario/widgets/webwriter-branching-scenario.js"></script>
<webwriter-branching-scenario></webwriter-branching-scenario>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/branching-scenario
```

```html
<link href="@webwriter/branching-scenario/widgets/webwriter-branching-scenario.css" rel="stylesheet">
<script type="module" src="@webwriter/branching-scenario/widgets/webwriter-branching-scenario.js"></script>
<webwriter-branching-scenario></webwriter-branching-scenario>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterBranchingScenario.actions` | `object` | - | `{ configureScenario: { label: (widget: { msg: MsgFn }) => widget.msg("Scenario options") }, }` | ✗ |
| `WebwriterBranchingScenario.convertFrom` | `object` | - | `{ ".json": "importJson" }` | ✗ |
| `WebwriterBranchingScenario.convertTo` | `object` | - | `{ ".json": "exportJson", ".twee": "exportTwee", section: "toSections" }` | ✗ |
| `msg` | - | - | - | ✗ |
| `editorState` | - | The state of the editor in a stringified JSON format | `new GamebookEditorState("")` | ✗ |
| `nodeEditor` | `NodeEditor` | The node editor component | - | ✗ |
| `signals` | `object` | What other widgets can read: the reader's current page and whether it has no choice left. | `{ page: computed(() => this.#page.get()), ended: computed(() => this.#ended.get()), }` | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `configureScenario` | - | -
| `exportJson` | Exports the scenario as JSON, including the markup of its pages. | -
| `exportTwee` | Exports the scenario as a Twee 3 story. | -
| `toSections` | Converts the pages and popups to `section` elements. | -
| `importJson` | Reads a scenario file. Nothing changes until the returned function runs. | `file: File`

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Custom CSS properties
| Name | Description |
| :--: | :---------: |
| --ww-text-color | Text color. |
| --ww-font-family | Font family. |
| --ww-theme-accent-1 | Page nodes in the editor and the focus ring of the dividers. |
| --ww-theme-accent-2 | Popup nodes in the editor. |
| --ww-theme-accent-3 | Branch nodes in the editor. |

*[Custom CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties) offer defined customization of the widget's style.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| gamebook | The reading view of the gamebook, with title and page. |
| title | The title of the gamebook. |
| page-title | The title of the current page. |
| page | The scrolling area that shows the current page. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |
| `definingAsContext` | `true` |
| `content` | `(webwriter-gamebook-page \| webwriter-gamebook-popup \| webwriter-gamebook-branch)*` |
| `importFormats` | `.json` |
| `exportFormats` | `.json,.twee` |

*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, or events.*


## `WebwriterGamebookBranch` (`<webwriter-gamebook-branch>`)
Represents the logic of a branch of a gamebook.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/branching-scenario/widgets/webwriter-gamebook-branch.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/branching-scenario/widgets/webwriter-gamebook-branch.js"></script>
<webwriter-gamebook-branch></webwriter-gamebook-branch>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/branching-scenario
```

```html
<link href="@webwriter/branching-scenario/widgets/webwriter-gamebook-branch.css" rel="stylesheet">
<script type="module" src="@webwriter/branching-scenario/widgets/webwriter-gamebook-branch.js"></script>
<webwriter-gamebook-branch></webwriter-gamebook-branch>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `drawflowNodeId` (`drawflowNodeId`) | `number` | Associated node id | - | ✓ |
| `incomingContainerId` (`incomingContainerId`) | `number` | Associated incoming container id | `-1` | ✓ |
| `rules` | `Rule[]` | Array of custom objects (rules) | `[]` | ✗ |
| `elseRule` | `Rule \| undefined` | The else rule (custom object) | - | ✗ |
| `pageTitle` (`pageTitle`) | `string` | The title of the page | - | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `clearRules` | Clears all rules from the rules array | -
| `addEmptyRule` | Adds an empty rule to the rules array | `node: DiagramNode`
| `deleteRule` | Deletes a rule from the rules array by its ID | `output_id: string`
| `updateAllRulesOutputIds` | Update all rules output IDs after deletion of an output | `deleted_output_id: string`
| `updateRuleOutputId` | Updates a rule's output ID by its index | `index: number`, `new_output_id: string`
| `updateRules` | Updates the entire rules array (deep clone) | `rules: Rule[]`
| `addEmptyElseRule` | Adds an empty else rule to the rules array | `node: DiagramNode`
| `removeElseRule` | Removes the else rule | -
| `_moveElseRuleToLastOutput` | Moves the else rule to be the last output | `node: DiagramNode`
| `_updateRuleElement` | Updates a rule's element ID by its index | `index: number`, `value: string`, `container: HTMLElement | undefined`
| `removeElementOfRules` | Removes references to a deleted element from all rules | `element_id: string`, `isQuiz: boolean`
| `_updateRuleTasks` | Updates the quiz tasks for a rule | `index: number`, `value: string`, `container: HTMLElement | undefined`
| `_updateRuleTarget` | Updates the target of a rule by output class | `output_class: string`, `input_id: string | number`
| `_updateRuleCondition` | Updates the condition for a rule | `index: number`, `value: string`, `container: HTMLElement | undefined`
| `_updateRuleMatch` | Updates the match value for a rule | `index: number`, `value: string`
| `hide` | - | -
| `show` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Events
| Name | Description |
| :--: | :---------: |
| markOutputs | - |
| deleteOutput | - |
| createConnection | - |
| deleteConnection | - |

*[Events](https://developer.mozilla.org/en-US/docs/Web/Events) are dispatched by the widget after certain triggers.*

## Editing config
| Name | Value |
| :--: | :---------: |
| `draggable` | `false` |
| `content` | `` |
| `uninsertable` | `true` |

*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, custom CSS properties, or CSS parts.*


## `WebwriterGamebookBranchButton` (`<webwriter-gamebook-branch-button>`)
Represents a button that is connected to a branch.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/branching-scenario/widgets/webwriter-gamebook-branch-button.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/branching-scenario/widgets/webwriter-gamebook-branch-button.js"></script>
<webwriter-gamebook-branch-button></webwriter-gamebook-branch-button>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/branching-scenario
```

```html
<link href="@webwriter/branching-scenario/widgets/webwriter-gamebook-branch-button.css" rel="stylesheet">
<script type="module" src="@webwriter/branching-scenario/widgets/webwriter-gamebook-branch-button.js"></script>
<webwriter-gamebook-branch-button></webwriter-gamebook-branch-button>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterGamebookBranchButton.options` | - | - | `buttonOptions` | ✗ |
| `msg` | - | - | - | ✗ |
| `dataTargetId` (`dataTargetId`) | `number` | The identifier of the target node | - | ✓ |
| `identifier` (`identifier`) | `string` | Identifier of the connection | - | ✓ |
| `name` (`name`) | `string` | Button text | `"Button"` | ✓ |
| `size` (`size`) | `string` | Button size: small, medium, large | `"small"` | ✓ |
| `pill` (`pill`) | `boolean` | Button pill style | `false` | ✓ |
| `outline` (`outline`) | `boolean` | Button outline style | `false` | ✓ |
| `width` (`width`) | `number` | Button width percentage | `50` | ✓ |
| `alignment` (`alignment`) | `string` | Button alignment: flex-start, center, flex-end | `"center"` | ✓ |
| `variant` (`variant`) | `string` | Button variant: default, text, primary, success, neutral, warning, danger | `"default"` | ✓ |
| `disabled` (`disabled`) | `boolean` | Disabled state | `false` | ✗ |
| `button` | `SlButton` | The Shoelace button element | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Editing config
| Name | Value |
| :--: | :---------: |
| `content` | `` |
| `uninsertable` | `true` |

*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public methods, slots, events, custom CSS properties, or CSS parts.*


## `WebwriterGamebookButton` (`<webwriter-gamebook-button>`)
Represents a button that branches to another part of the gamebook.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/branching-scenario/widgets/webwriter-gamebook-button.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/branching-scenario/widgets/webwriter-gamebook-button.js"></script>
<webwriter-gamebook-button></webwriter-gamebook-button>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/branching-scenario
```

```html
<link href="@webwriter/branching-scenario/widgets/webwriter-gamebook-button.css" rel="stylesheet">
<script type="module" src="@webwriter/branching-scenario/widgets/webwriter-gamebook-button.js"></script>
<webwriter-gamebook-button></webwriter-gamebook-button>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterGamebookButton.options` | - | - | `buttonOptions` | ✗ |
| `msg` | - | - | - | ✗ |
| `dataTargetId` (`dataTargetId`) | `number` | The identifier of the target node | - | ✓ |
| `identifier` (`identifier`) | `string` | The identifier of the connection | - | ✓ |
| `name` (`name`) | `string` | Button text | `"Button"` | ✓ |
| `size` (`size`) | `string` | Button size: small, medium, large | `"small"` | ✓ |
| `pill` (`pill`) | `boolean` | Button pill style | `false` | ✓ |
| `outline` (`outline`) | `boolean` | Button outline style | `false` | ✓ |
| `width` (`width`) | `number` | Button width percentage | `50` | ✓ |
| `alignment` (`alignment`) | `string` | Button alignment: flex-start, center, flex-end | `"center"` | ✓ |
| `variant` (`variant`) | `string` | Button variant: default, text, primary, success, neutral, warning, danger | `"default"` | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Editing config
| Name | Value |
| :--: | :---------: |
| `content` | `` |
| `uninsertable` | `true` |

*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public methods, slots, events, custom CSS properties, or CSS parts.*


## `WebwriterGamebookPage` (`<webwriter-gamebook-page>`)
Represents a page of the gamebook

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/branching-scenario/widgets/webwriter-gamebook-page.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/branching-scenario/widgets/webwriter-gamebook-page.js"></script>
<webwriter-gamebook-page></webwriter-gamebook-page>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/branching-scenario
```

```html
<link href="@webwriter/branching-scenario/widgets/webwriter-gamebook-page.css" rel="stylesheet">
<script type="module" src="@webwriter/branching-scenario/widgets/webwriter-gamebook-page.js"></script>
<webwriter-gamebook-page></webwriter-gamebook-page>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterGamebookPage.options` | `object` | - | `{ pageTitle: { type: String, label: (widget: { msg: MsgFn }) => widget.msg("Page title") }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `editorStore` (`editorStore`) | - | The state of the editor in a stringified JSON format | `new GamebookEditorState("Default")` | ✗ |
| `drawflowNodeId` (`drawflowNodeId`) | `number` | Associated node id | - | ✓ |
| `pageTitle` (`pageTitle`) | `string` | The title of the page | - | ✓ |
| `originPage` (`originPage`) | `number` | The origin page number | - | ✓ |
| `branchesOff` (`branchesOff`) | `number` | The id of the branch connected to the page | `-1` | ✓ |
| `buttons` | `Array<WebwriterGamebookButton \| WebwriterGamebookBranchButton>` | The gamebook buttons on the page | - | ✗ |
| `slotContent` | `Array<HTMLElement>` | The content inside the page | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `hide` | - | -
| `show` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Editing config
| Name | Value |
| :--: | :---------: |
| `draggable` | `false` |
| `definingForContent` | `true` |
| `content` | `(flow)*` |
| `uninsertable` | `true` |

*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, custom CSS properties, or CSS parts.*


## `WebwriterGamebookPopup` (`<webwriter-gamebook-popup>`)
Represents a popup dialog in the gamebook

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/branching-scenario/widgets/webwriter-gamebook-popup.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/branching-scenario/widgets/webwriter-gamebook-popup.js"></script>
<webwriter-gamebook-popup></webwriter-gamebook-popup>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/branching-scenario
```

```html
<link href="@webwriter/branching-scenario/widgets/webwriter-gamebook-popup.css" rel="stylesheet">
<script type="module" src="@webwriter/branching-scenario/widgets/webwriter-gamebook-popup.js"></script>
<webwriter-gamebook-popup></webwriter-gamebook-popup>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterGamebookPopup.options` | `object` | - | `{ pageTitle: { type: String, label: (widget: { msg: MsgFn }) => widget.msg("Page title") }, titleLabel: { type: String, label: (widget: { msg: MsgFn }) => widget.msg("Dialog title") }, noHeader: { type: Boolean, label: (widget: { msg: MsgFn }) => widget.msg("Hide dialog header") }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `drawflowNodeId` (`drawflowNodeId`) | `number` | associated node id | - | ✓ |
| `buttons` | `Array<WebwriterGamebookButton \| WebwriterGamebookBranchButton>` | The buttons in the popup | - | ✗ |
| `pageTitle` (`pageTitle`) | `string` | The title of the popup | - | ✓ |
| `slotContent` | `Array<HTMLElement>` | The content of the popup | - | ✗ |
| `dialog` | `SlDialog` | The Shoelace dialog element | - | ✗ |
| `titleLabel` (`titleLabel`) | `string` | The title label of the dialog | `"Dialog"` | ✓ |
| `noHeader` (`noHeader`) | `boolean` | Whether the header should be disabled | `false` | ✓ |
| `preventClosing` (`preventClosing`) | `boolean` | Whether closing the dialog should be prevented | `true` | ✓ |
| `branchesOff` (`branchesOff`) | `number` | The id of the branch connected to the page | `-1` | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `show` | - | -
| `hideDialog` | - | -
| `showDialog` | - | -
| `hide` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Editing config
| Name | Value |
| :--: | :---------: |
| `draggable` | `false` |
| `definingForContent` | `true` |
| `content` | `(flow)*` |
| `uninsertable` | `true` |

*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, custom CSS properties, or CSS parts.*


---
*Generated with @webwriter/build@1.14.0*