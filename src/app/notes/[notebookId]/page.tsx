
"use client";

import { useNotes } from '@/context/NoteContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Note, Notebook } from '@/lib/types';
import { NoteSidebar } from '@/components/notes/NoteSidebar';
import { NoteBreadcrumbs } from '@/components/notes/NoteBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// A simple function to strip HTML for the preview
const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

export default function NotebookViewPage() {
  const { notebookId } = useParams();
  const { getNotebookById, getNotesByNotebook, addNote, deleteNote, isLoading } = useNotes();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const router = useRouter();

  const notesInNotebook = useMemo(() => {
    return getNotesByNotebook(notebookId as string);
  }, [notebookId, getNotesByNotebook]);

  useEffect(() => {
    if (!isLoading) {
      const foundNotebook = getNotebookById(notebookId as string);
      if (!foundNotebook) {
        router.push('/notes');
      } else {
        setNotebook(foundNotebook);
      }
    }
  }, [isLoading, notebookId, getNotebookById, router]);

  const handleCreateNote = async () => {
    if (!notebook) return;
    const newNote = await addNote({
      notebook_id: notebook.notebook_id,
      title: 'Untitled Note',
      content: ''
    });
    if (newNote) {
      router.push(`/notes/${notebook.notebook_id}/${newNote.note_id}`);
    }
  };
  
  const renderSkeleton = () => (
    <div className="flex h-[calc(100vh-4rem)]">
      <Skeleton className="w-72 hidden md:block border-r" />
      <div className="flex-1 p-8">
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-6 w-1/4 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  );

  if (isLoading || !notebook) {
    return renderSkeleton();
  }

  return (
    <ResizablePanelGroup
        direction="horizontal"
        className="h-[calc(100vh-4rem)] w-full rounded-none border-none"
      >
      <ResizablePanel defaultSize={25} minSize={15} collapsible={true} collapsedSize={4}>
        <NoteSidebar currentNotebookId={notebook.notebook_id} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-full">
          <header className="mb-8">
            <NoteBreadcrumbs notebook={notebook} />
            <div className="flex items-center justify-between mt-2">
              <h1 className="text-3xl font-bold tracking-tight">{notebook.name}</h1>
              <Button onClick={handleCreateNote}>
                <Plus className="mr-2" />
                New Note
              </Button>
            </div>
          </header>

          {notesInNotebook.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {notesInNotebook.map(note => (
                <Card key={note.note_id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="truncate">{note.title || 'Untitled Note'}</CardTitle>
                    <CardDescription>
                      Last updated: {format(new Date(note.updated_at), 'MMM d, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-3">
                      {stripHtml(note.content) || 'No content yet...'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the note &quot;{note.title}&quot;.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteNote(note.note_id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button asChild>
                      <Link href={`/notes/${notebook.notebook_id}/${note.note_id}`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h3 className="text-xl font-semibold text-muted-foreground">No Notes Yet</h3>
              <p className="text-muted-foreground mt-2">Click &quot;New Note&quot; to get started.</p>
            </div>
          )}
        </main>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
