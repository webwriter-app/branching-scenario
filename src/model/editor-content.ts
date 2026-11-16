import type { DiagramNode } from "./diagram";

/** A node as the document stores it. Older documents also hold the markup and name the editor once drew it with. */
export type StoredNode = DiagramNode & { name?: string; html?: string };

/** The graph of the node editor, as saved in the document. */
export interface EditorContent {
  drawflow: {
    Home: { data: Record<string, StoredNode> };
  };
}

/** A container element as a template describes it. */
export interface ContainerTemplate {
  tagName: string;
  attributes: Array<{ name: string; value: string }>;
  innerHTML: string;
}

/** A group of nodes with their containers that the toolbar can insert. */
export interface NodeTemplate extends EditorContent {
  containers: ContainerTemplate[];
}
