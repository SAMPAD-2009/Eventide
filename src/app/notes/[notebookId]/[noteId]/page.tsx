
"use client";

import { useNotes } from '@/context/NoteContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Note, Notebook } from '@/lib/types';
import { NoteSidebar } from '@/components/notes/NoteSidebar';
import { NoteBreadcrumbs } from '@/components/notes/NoteBreadcrumbs';
import { MarkdownEditor } from '@/components/notes/MarkdownEditor';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Toaster as SonnerToaster } from "sonner";


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
      <ResizablePanelGroup
        direction="horizontal"
        className="h-[calc(100vh-4rem)] w-full rounded-none border-none"
      >
        <ResizablePanel defaultSize={25} minSize={15} collapsible={true} collapsedSize={4}>
           <NoteSidebar
            currentNotebookId={notebook.notebook_id}
            currentNoteId={note.note_id}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
            <main className="flex-1 flex flex-col h-full">
                <header className="p-4 border-b">
                <NoteBreadcrumbs
                    notebook={notebook}
                    note={note}
                />
                </header>
                 <SonnerToaster />
                <MarkdownEditor
                  note={note}
                  onSave={handleSave}
                  isSaving={isSaving}
                />
            </main>
        </ResizablePanel>
    </ResizablePanelGroup>
  );
}
