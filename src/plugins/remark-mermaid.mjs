/**
 * Convert ```mermaid fences into <pre class="mermaid"> so Shiki skips them
 * and the client can render with Mermaid.js.
 *
 * Uses hName/hProperties so remark-rehype emits a real element without raw HTML
 * (which Sätteri / sanitizers would drop).
 */
export default function remarkMermaid() {
  return (tree) => {
    const visit = (node, index, parent) => {
      if (node.type === 'code' && node.lang === 'mermaid' && parent && typeof index === 'number') {
        parent.children[index] = {
          type: 'paragraph',
          data: {
            hName: 'pre',
            hProperties: {
              className: ['mermaid'],
            },
          },
          children: [{ type: 'text', value: node.value }],
        };
        return;
      }

      if (Array.isArray(node.children)) {
        for (let i = 0; i < node.children.length; i++) {
          visit(node.children[i], i, node);
        }
      }
    };

    visit(tree, undefined, undefined);
  };
}
