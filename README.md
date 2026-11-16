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
| `msg` | - | - | - | ✗ |
| `editorState` | - | The state of the editor in a stringified JSON format | `new GamebookEditorState("")` | ✗ |
| `nodeEditor` | `NodeEditor` | The node editor component | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `configureScenario` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Editing config
| Name | Value |
| :--: | :---------: |
| `definingAsContext` | `true` |
| `content` | `(webwriter-gamebook-page \| webwriter-gamebook-popup \| webwriter-gamebook-branch)*` |

*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, custom CSS properties, or CSS parts.*


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