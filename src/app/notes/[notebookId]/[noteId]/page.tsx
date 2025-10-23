
"use client";

import { useNotes } from '@/context/NoteContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, lazy, Suspense } from 'react';
import { Note, Notebook } from '@/lib/types';
import { NoteBreadcrumbs } from '@/components/notes/NoteBreadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';

const TiptapEditor = lazy(() => import('@/components/notes/TiptapEditor').then(module => ({ default: module.TiptapEditor })));

function EditorSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 border-b p-4">
        <Skeleton className="h-8 w-1/2" />
      </div>
      <div className="p-2 border-b">
         <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex-1 p-4">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  )
}

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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <header className="p-4 border-b">
        <Skeleton className="h-6 w-1/2" />
      </header>
      <div className="flex-1 p-4">
        <EditorSkeleton />
      </div>
    </div>
  );

  if (isLoading || !note || !notebook) {
    return renderSkeleton();
  }

  // Hide sidebar for collaborated notes
  if (notebook.collab_id) {
     return (
        <main className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
            <Suspense fallback={<EditorSkeleton />}>
              <TiptapEditor
                note={note}
                onSave={handleSave}
                isSaving={isSaving}
              />
            </Suspense>
        </main>
     )
  }

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
        <header className="p-4 border-b">
        <NoteBreadcrumbs
            notebook={notebook}
            note={note}
        />
        </header>
        <Suspense fallback={<EditorSkeleton />}>
            <TiptapEditor
              note={note}
              onSave={handleSave}
              isSaving={isSaving}
            />
        </Suspense>
    </main>
  );
}
