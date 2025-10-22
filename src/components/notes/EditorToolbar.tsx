
"use client"

import { type Editor } from '@tiptap/react'
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Code,
  Save,
  Loader2,
  ChevronDown,
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
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
import { useEffect, useState, useCallback } from 'react'
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react'
import { useTheme } from '@/context/ThemeProvider'


type Props = {
  editor: Editor | null
  onSave: () => void;
  isSaving: boolean;
}

const HEADING_LEVELS = [
    { label: 'Normal', command: (editor: Editor) => editor.chain().focus().setParagraph().run(), isActive: (editor: Editor) => editor.isActive('paragraph')},
    { label: 'Heading 1', command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: (editor: Editor) => editor.isActive('heading', { level: 1 })},
    { label: 'Heading 2', command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (editor: Editor) => editor.isActive('heading', { level: 2 })},
    { label: 'Heading 3', command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (editor: Editor) => editor.isActive('heading', { level: 3 })},
]


export function EditorToolbar({ editor, onSave, isSaving }: Props) {
  const [currentFontSize, setCurrentFontSize] = useState('Regular');
  const [activeColor, setActiveColor] = useState('#000000');
  const [activeHighlight, setActiveHighlight] = useState('transparent');
  const [currentHeading, setCurrentHeading] = useState('Normal');
  const { theme } = useTheme();

  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => {
      const color = editor.getAttributes('textStyle').color || (theme === 'dark' ? '#FFFFFF' : '#000000');
      const highlight = editor.getAttributes('highlight').color || 'transparent';
      setActiveColor(color);
      setActiveHighlight(highlight);

      const activeHeading = HEADING_LEVELS.find(level => level.isActive(editor))?.label || 'Normal';
      setCurrentHeading(activeHeading);
    };

    editor.on('transaction', updateHandler);
    editor.on('selectionUpdate', updateHandler);

    // Initial check
    updateHandler();

    return () => {
      editor.off('transaction', updateHandler);
      editor.off('selectionUpdate', updateHandler);
    };
  }, [editor, theme]);



  if (!editor) {
    return null
  }

  const ColorIcon = ({ color, highlight }: { color: string; highlight: string }) => {
    const isHighlightTransparent = highlight === 'transparent' || highlight === 'rgba(0, 0, 0, 0)';
  
    return (
      <div className="flex items-center gap-1">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs"
          style={{
            backgroundColor: isHighlightTransparent ? 'hsl(var(--muted))' : highlight,
            border: isHighlightTransparent ? '1px solid hsl(var(--border))' : `1px solid ${highlight}`,
          }}
        >
          <span style={{ color: color }}>A</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </div>
    );
  };

  return (
    <div className="flex w-full items-center gap-1 border-b bg-background p-2 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="w-32 justify-between">
            {currentHeading}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {HEADING_LEVELS.map(level => (
            <DropdownMenuItem
              key={level.label}
              onClick={() => level.command(editor)}
              className={cn(level.isActive(editor) && 'bg-accent')}
            >
              {level.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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
        
        <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'left' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
        >
            <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'center' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
        >
            <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'right' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
        >
            <AlignRight className="h-4 w-4" />
        </Toggle>
        <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'justify' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
        >
            <AlignJustify className="h-4 w-4" />
        </Toggle>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
        </Button>

       <Separator orientation="vertical" className="h-8 mx-1" />
        
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                    <ColorIcon color={activeColor} highlight={activeHighlight} />
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
