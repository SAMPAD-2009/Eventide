
import React, { useState, useEffect } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { InlineMath } from 'react-katex';

const KatexComponent = (props: any) => {
  const [isEditing, setIsEditing] = useState(true);
  const [tex, setTex] = useState(props.node.attrs.tex || '');

  useEffect(() => {
    // Start editing when the node is first created
    setIsEditing(true);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTex(event.target.value);
    props.updateAttributes({
      tex: event.target.value,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsEditing(false);
      event.preventDefault();
    }
  };

  if (isEditing) {
    return (
      <NodeViewWrapper className="inline-block">
        <span className="katex-editor p-1 bg-muted rounded-md">
          <input
            type="text"
            value={tex}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsEditing(false)}
            placeholder="Enter LaTeX..."
            autoFocus
            className="bg-transparent focus:outline-none"
          />
        </span>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="inline-block" onClick={() => setIsEditing(true)}>
      <span className="p-1 cursor-pointer">
        <InlineMath math={tex || '\\text{empty}'} />
      </span>
    </NodeViewWrapper>
  );
};

export const KatexNode = Node.create({
  name: 'katex-component',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      tex: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'katex-component',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['katex-component', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(KatexComponent);
  },
});
