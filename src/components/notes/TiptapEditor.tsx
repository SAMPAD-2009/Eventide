
"use client"

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Note } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'

interface TiptapEditorProps {
  note: Note
  onSave: (title: string, content: string) => Promise<void>
  isSaving: boolean
}

export function TiptapEditor({ note, onSave, isSaving }: TiptapEditorProps) {
  const [title, setTitle] = useState(note.title)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your note here...',
      }),
    ],
    content: note.content || '',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
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

      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex gap-1 rounded-md border bg-background p-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('strike')}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
           <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 1 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
           <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
        </div>
      </BubbleMenu>

      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      <div className="flex flex-shrink-0 items-center justify-end border-t p-2">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Note
        </Button>
      </div>
    </div>
  )
}
