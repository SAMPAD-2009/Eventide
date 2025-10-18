
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import type { Note } from '@/lib/types';
import Editor from "novel";

interface MarkdownEditorProps {
  note: Note;
  onSave: (title: string, content: string) => Promise<void>;
  isSaving: boolean;
}

export function MarkdownEditor({ note, onSave, isSaving }: MarkdownEditorProps) {
  const [content, setContent] = useState(note.content || '');
  const [title, setTitle] = useState(note.title || ''); // Assuming title is part of the note object
  
  useEffect(() => {
    setContent(note.content || '');
    setTitle(note.title || 'Untitled Note');
  }, [note]);

  const handleSave = () => {
    onSave(title, content);
  };
  
  return (
    <div className="flex flex-col h-full bg-background relative">
        <div className="p-4 border-b">
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title"
                className="w-full text-xl font-bold border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            />
        </div>
        <div className="flex-1 overflow-y-auto">
          <Editor
              key={note.note_id} // Force re-mount when note changes
              defaultValue={content}
              onUpdate={(editor) => {
                  setContent(editor?.getHTML());
              }}
              disableLocalStorage={true}
              className="relative min-h-[500px] w-full max-w-screen-lg"
          />
        </div>
       <div className="p-2 border-t flex justify-end sticky bottom-0 bg-background z-10">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            Save Note
          </Button>
        </div>
    </div>
  );
}
