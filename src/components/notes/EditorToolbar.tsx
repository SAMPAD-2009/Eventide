
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
  ChevronDown,
  Smile,
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ColorPalette } from './ColorPalette'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react'
import { useTheme } from '@/context/ThemeProvider'

type Props = {
  editor: Editor | null
  onSave: () => void;
  isSaving: boolean;
}

const FONT_SIZES = [
  { label: 'Regular', value: '1rem' },
  { label: 'Large', value: '1.25rem' },
  { label: 'Extra Large', value: '1.5rem' },
  { label: 'Huge', value: '2rem' },
]

export function EditorToolbar({ editor, onSave, isSaving }: Props) {
  const [currentFontSize, setCurrentFontSize] = useState('Regular');
  const { theme } = useTheme();

  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => {
      const activeSize = FONT_SIZES.find(size => editor.isActive('textStyle', { fontSize: size.value }))?.label || 'Regular';
      setCurrentFontSize(activeSize);
    };

    editor.on('transaction', updateHandler);
    editor.on('selectionUpdate', updateHandler);

    // Initial check
    updateHandler();

    return () => {
      editor.off('transaction', updateHandler);
      editor.off('selectionUpdate', updateHandler);
    };
  }, [editor]);


  if (!editor) {
    return null
  }

  return (
    <div className="flex w-full items-center gap-1 border-b bg-background p-2 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="w-28 justify-between">
            {currentFontSize}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {FONT_SIZES.map(size => (
            <DropdownMenuItem
              key={size.value}
              onClick={() => editor.chain().focus().setFontSize(size.value).run()}
              className={cn(editor.isActive('textStyle', { fontSize: size.value }) && 'bg-accent')}
            >
              <span style={{ fontSize: size.value }}>{size.label}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => editor.chain().focus().unsetFontSize().run()}>
             Reset
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-8 mx-1" />

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
       <Toggle
        size="sm"
        pressed={editor.isActive('code')}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-4 w-4" />
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
       <Separator orientation="vertical" className="h-8 mx-1" />
        
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Palette />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
                <ColorPalette editor={editor} />
            </PopoverContent>
        </Popover>
      
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Smile />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none">
                <EmojiPicker
                  onEmojiClick={(emojiObject) => {
                      editor.chain().focus().insertContent(emojiObject.emoji).run()
                  }}
                  theme={theme === 'dark' ? EmojiTheme.DARK : EmojiTheme.LIGHT}
                />
            </PopoverContent>
        </Popover>


      <div className="flex-grow" />
      <Button onClick={onSave} disabled={isSaving} size="sm">
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save
      </Button>
    </div>
  )
}
