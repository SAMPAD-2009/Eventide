
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNotes } from '@/context/NoteContext';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { debounce } from 'lodash';
import { Skeleton } from '../ui/skeleton';
import { Note } from '@/lib/types';
import { Separator } from '../ui/separator';

interface MarkdownEditorProps {
    note: Note;
}

export function MarkdownEditor({ note }: MarkdownEditorProps) {
    const { updateNote, isLoading: isContextLoading } = useNotes();
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTitle(note.title);
        setContent(note.content);
    }, [note]);

    const debouncedUpdate = useCallback(debounce((updatedNote: Partial<Note>) => {
        setIsSaving(true);
        updateNote(note.note_id, updatedNote).finally(() => {
            // Add a small delay to prevent flickering
            setTimeout(() => setIsSaving(false), 500);
        });
    }, 1000), [note.note_id, updateNote]);

    useEffect(() => {
        if (title !== note.title || content !== note.content) {
            debouncedUpdate({ title, content });
        }
        return () => {
            debouncedUpdate.cancel();
        };
    }, [title, content, note.title, note.content, debouncedUpdate]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    if (!note) {
        return <Skeleton className="w-full h-full" />;
    }

    return (
        <div className="flex flex-col h-full">
             <div className="p-4 border-b">
                 <Input 
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Note Title"
                    className="text-2xl font-bold border-none focus-visible:ring-0 shadow-none p-0 h-auto"
                 />
                 <p className="text-xs text-muted-foreground mt-1">
                    {isSaving ? 'Saving...' : 'Saved'}
                 </p>
             </div>
            <div className="grid md:grid-cols-2 flex-1 h-[calc(100%-80px)]">
                <div className="flex flex-col h-full">
                    <Textarea 
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Start writing your note in Markdown..."
                        className="w-full h-full p-4 border-0 rounded-none resize-none focus-visible:ring-0"
                    />
                </div>
                <Separator orientation="vertical" className="hidden md:block" />
                <div className="prose dark:prose-invert h-full overflow-y-auto p-4 hidden md:block">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
