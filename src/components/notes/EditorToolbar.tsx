
"use client"

import { type Editor } from '@tiptap/react'
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Save,
  Loader2,
  Palette,
  Highlighter,
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

type Props = {
  editor: Editor | null
  onSave: () => void;
  isSaving: boolean;
}

export function EditorToolbar({ editor, onSave, isSaving }: Props) {
  if (!editor) {
    return null
  }

  return (
    <div className="flex w-full items-center gap-1 border-b bg-background p-2 flex-wrap">
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
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="h-8 mx-1" />
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
      <Separator orientation="vertical" className="h-8 mx-1" />
       <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('code')}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-4 w-4" />
      </Toggle>
       <Separator orientation="vertical" className="h-8 mx-1" />
        <div className="flex items-center gap-1">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <input
                type="color"
                onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
                value={editor.getAttributes('textStyle').color || '#000000'}
                className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                aria-label="Set text color"
                title="Set text color"
            />
        </div>
        <div className="flex items-center gap-1">
             <Highlighter className="h-4 w-4 text-muted-foreground" />
            <input
                type="color"
                onInput={(event) => editor.chain().focus().toggleHighlight({ color: (event.target as HTMLInputElement).value }).run()}
                value={editor.getAttributes('highlight').color || '#ffffff'}
                className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                aria-label="Set highlight color"
                title="Set highlight color"
            />
        </div>

      <div className="flex-grow" />
      <Button onClick={onSave} disabled={isSaving} size="sm">
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save
      </Button>
    </div>
  )
}
