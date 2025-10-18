
"use client";

import { useNotes } from '@/context/NoteContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Note, Notebook } from '@/lib/types';
import { NoteSidebar } from '@/components/notes/NoteSidebar';
import { NoteBreadcrumbs } from '@/components/notes/NoteBreadcrumbs';
import { MarkdownEditor } from '@/components/notes/MarkdownEditor';
import { Skeleton } from '@/components/ui/skeleton';

export default function NoteEditorPage() {
  const { notebookId, noteId } = useParams();
  const { getNotebookById, getNoteById, isLoading, updateNote } = useNotes();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const foundNotebook = getNotebookById(notebookId as string);
      const foundNote = getNoteById(noteId as string);
      
      if (!foundNotebook || !foundNote) {
        // Redirect if notebook or note not found
        router.push('/notes');
      } else {
        setNotebook(foundNotebook);
        setNote(foundNote);
      }
    }
  }, [isLoading, notebookId, noteId, getNotebookById, getNoteById, router]);

  const handleSave = async (title: string, content: string) => {
    if (!note) return;
    setIsSaving(true);
    await updateNote(note.note_id, { title, content });
    setIsSaving(false);
  };

  const renderSkeleton = () => (
    <div className="flex h-[calc(100vh-4rem)]">
      <Skeleton className="w-72 hidden md:block border-r" />
      <div className="flex-1 flex flex-col">
        <header className="p-4 border-b">
          <Skeleton className="h-6 w-1/2" />
        </header>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  );

  if (isLoading || !note || !notebook) {
    return renderSkeleton();
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <NoteSidebar
        currentNotebookId={notebook.notebook_id}
        currentNoteId={note.note_id}
      />
      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b">
          <NoteBreadcrumbs
            notebook={notebook}
            note={note}
          />
        </header>
        <MarkdownEditor
          note={note}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </main>
    </div>
  );
}
