
"use client";

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Note } from '@/lib/types';

interface MarkdownEditorProps {
  note: Note;
  onSave: (title: string, content: string) => Promise<void>;
  isSaving: boolean;
}

export function MarkdownEditor({ note, onSave, isSaving }: MarkdownEditorProps) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');

  useEffect(() => {
    setTitle(note.title || '');
    setContent(note.content || '');
  }, [note]);

  const handleSave = () => {
    onSave(title, content);
  };

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-px bg-border overflow-hidden">
      {/* Editor */}
      <div className="flex flex-col bg-background">
        <div className="p-4 border-b">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="text-xl font-bold border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your note in Markdown..."
          className="flex-1 resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 text-base"
        />
        <div className="p-4 border-t flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            Save
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col bg-background h-full overflow-y-auto">
         <div className="p-4 border-b">
            <h1 className="text-xl font-bold">{title || 'Untitled Note'}</h1>
        </div>
        <article className="prose dark:prose-invert flex-1 p-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
