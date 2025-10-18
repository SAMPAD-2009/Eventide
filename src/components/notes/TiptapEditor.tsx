
"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useState } from 'react'
import type { Note } from '@/lib/types'
import { EditorToolbar } from './EditorToolbar'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'

interface TiptapEditorProps {
  note: Note
  onSave: (title: string, content: string) => Promise<void>
  isSaving: boolean
}

export function TiptapEditor({ note, onSave, isSaving }: TiptapEditorProps) {
  const [title, setTitle] = useState(note.title)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        code: false, // We're using toggleCode() for inline code
        codeBlock: {},
      }),
      Placeholder.configure({
        placeholder: 'Start writing your note here...',
      }),
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
    ],
    content: note.content || '',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none h-full',
      },
    },
    onUpdate: ({ editor }) => {
      // Logic for double space to remove marks can be added here if needed
    },
  })

  useEffect(() => {
    if (editor) {
      // Add keyboard shortcut for clearing marks
      editor.addKeyboardShortcut('Mod-Shift-x', () => editor.chain().focus().unsetAllMarks().run());
    }
  }, [editor])

  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content || '')
    }
    setTitle(note.title)
  }, [note, editor])

  const handleSave = () => {
    if (editor) {
      onSave(title, editor.getHTML())
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 border-b p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="w-full bg-transparent text-2xl font-bold focus:outline-none"
        />
      </div>

      <EditorToolbar editor={editor} onSave={handleSave} isSaving={isSaving} />
      
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}
