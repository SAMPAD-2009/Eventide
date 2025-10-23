
"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useState, lazy, Suspense } from 'react'
import type { Note } from '@/lib/types'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import { FontSize } from '@/lib/tiptap/FontSize'
import TextAlign from '@tiptap/extension-text-align'
import Heading from '@tiptap/extension-heading'
import { Skeleton } from '../ui/skeleton'

const EditorToolbar = lazy(() => import('./EditorToolbar').then(module => ({ default: module.EditorToolbar })));

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
        heading: false, // Disable default heading to use the custom one below
        codeBlock: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your note here...',
      }),
      Color,
      TextStyle,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: note.content || '',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none h-full',
      },
    },
    addKeyboardShortcuts: {
        'Mod-Shift-x': () => editor.chain().focus().unsetAllMarks().run(),
    },
  })

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

      <Suspense fallback={<Skeleton className="h-12 w-full border-b" />}>
        <EditorToolbar editor={editor} onSave={handleSave} isSaving={isSaving} />
      </Suspense>
      
      <div className="flex-1 overflow-y-auto relative">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}
