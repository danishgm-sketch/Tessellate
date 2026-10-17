import type { ProjectManifest, ProjectNode } from '@tessellate/schemas';
import { validProjectFixture } from '@tessellate/schemas';

function contentNode(id: string, text: string): ProjectNode {
  return {
    id,
    nodeType: 'element',
    semanticRole: 'content',
    props: { children: text },
    slots: {},
    children: [],
  };
}

/** Shared Workbench/export fixture for manifest-to-DOM semantic parity checks. */
export function createRendererParityNodes(): ProjectNode[] {
  return [
    {
      id: 'parity-resource-prop-children',
      nodeType: 'component',
      semanticRole: 'application-shell',
      resourceRef: {
        id: 'res_shell_canvas_workspace_shell',
        slug: 'canvas-workspace-shell',
        version: '1.0.0',
      },
      variant: 'expressive',
      props: { children: 'Content from resource props' },
      slots: {},
      children: [contentNode('parity-prop-nested-child', 'Content from nested manifest node')],
    },
    {
      id: 'parity-resource-slot-children',
      nodeType: 'component',
      semanticRole: 'application-shell',
      resourceRef: {
        id: 'res_shell_canvas_workspace_shell',
        slug: 'canvas-workspace-shell',
        version: '1.0.0',
      },
      variant: 'expressive',
      props: {},
      slots: { children: 'Content from declared resource slot' },
      children: [contentNode('parity-slot-nested-child', 'Content from nested manifest node')],
    },
    {
      id: 'parity-mobile-omit',
      nodeType: 'element',
      semanticRole: 'content',
      responsiveOverrides: { strategy: 'omit-nonessential' },
      props: { children: 'Content omitted on mobile' },
      slots: {},
      children: [],
    },
    {
      id: 'parity-mobile-stack',
      nodeType: 'element',
      semanticRole: 'container',
      responsiveOverrides: { strategy: 'stack' },
      props: {},
      slots: {},
      children: [
        contentNode('parity-stack-child-one', 'First stacked child'),
        contentNode('parity-stack-child-two', 'Second stacked child'),
      ],
    },
    {
      id: 'parity-mobile-collapse',
      nodeType: 'element',
      semanticRole: 'content',
      responsiveOverrides: { strategy: 'collapse' },
      props: { children: 'Content with a collapsed mobile presentation' },
      slots: {},
      children: [],
    },
  ];
}

export function createRendererParityProject(): ProjectManifest {
  const project = structuredClone(validProjectFixture);
  const sourceScreen = project.screens[0]!;
  project.id = 'renderer-parity-fixture';
  project.name = 'Renderer parity fixture';
  project.description = 'Shared fixture for Workbench and standalone export rendering checks.';
  project.locks = [];
  sourceScreen.rootNode = {
    id: sourceScreen.rootNode.id,
    nodeType: 'layout',
    semanticRole: 'container',
    props: {},
    slots: {},
    children: createRendererParityNodes(),
  };

  return project;
}

export function appendRendererParityNodes(project: ProjectManifest): ProjectManifest {
  const augmented = structuredClone(project);
  const firstScreen = augmented.screens[0];
  if (!firstScreen) throw new Error('Renderer parity fixture requires at least one screen.');

  firstScreen.rootNode.children.push(...createRendererParityNodes());
  return augmented;
}
