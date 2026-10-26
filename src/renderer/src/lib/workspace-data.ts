export type TreeNode =
  | { type: 'folder'; name: string; children: TreeNode[] }
  | { type: 'file'; name: string }

export const fileTree: TreeNode[] = [
  {
    type: 'folder',
    name: 'docs',
    children: [
      { type: 'file', name: 'README.md' },
      { type: 'file', name: 'architecture.md' },
      { type: 'file', name: 'changelog.md' },
    ],
  },
  {
    type: 'folder',
    name: 'src',
    children: [
      {
        type: 'folder',
        name: 'components',
        children: [
          { type: 'file', name: 'app-shell.tsx' },
          { type: 'file', name: 'file-tree.tsx' },
          { type: 'file', name: 'outline.tsx' },
        ],
      },
      {
        type: 'folder',
        name: 'lib',
        children: [
          { type: 'file', name: 'utils.ts' },
          { type: 'file', name: 'config.ts' },
        ],
      },
      { type: 'file', name: 'index.ts' },
    ],
  },
  {
    type: 'folder',
    name: 'public',
    children: [{ type: 'file', name: 'favicon.svg' }],
  },
  { type: 'file', name: 'package.json' },
  { type: 'file', name: 'tsconfig.json' },
]

export type OutlineItem = { id: string; title: string; level: 1 | 2 | 3; line: number }

export const outline: OutlineItem[] = [
  { id: 'overview', title: 'Overview', level: 1, line: 1 },
  { id: 'getting-started', title: 'Getting Started', level: 2, line: 5 },
  { id: 'installation', title: 'Installation', level: 3, line: 8 },
  { id: 'configuration', title: 'Configuration', level: 3, line: 13 },
  { id: 'architecture', title: 'Architecture', level: 2, line: 19 },
  { id: 'panels', title: 'Panels', level: 3, line: 23 },
  { id: 'state', title: 'State Management', level: 3, line: 29 },
  { id: 'api-reference', title: 'API Reference', level: 2, line: 35 },
  { id: 'faq', title: 'FAQ', level: 2, line: 42 },
]

export const TOTAL_LINES = 60
