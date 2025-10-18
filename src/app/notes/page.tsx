
"use client";

import { useState, useMemo } from 'react';
import { useNotes } from '@/context/NoteContext';
import { NoteSidebar } from '@/components/notes/NoteSidebar';
import { MarkdownEditor } from '@/components/notes/MarkdownEditor';
import { Skeleton } from '@/components/ui/skeleton';
import { NoteWelcome } from '@/components/notes/NoteWelcome';
import { useAuth } from '@/context/AuthContext';

export default function NotesPage() {
  const { notes, isLoading, addNote, getNoteById } = useNotes();
  const { user } = useAuth();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const selectedNote = useMemo(() => {
    if (!selectedNoteId) return null;
    return getNoteById(selectedNoteId);
  }, [selectedNoteId, getNoteById]);

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
  };
  
  const handleCreateNew = async () => {
    if (user) {
        const newNote = await addNote({
            title: 'Untitled Note',
            content: ''
        });
        if (newNote) {
            setSelectedNoteId(newNote.note_id);
        }
    }
  };
  
  // When a note is deleted, deselect it
  if (selectedNoteId && !selectedNote && !isLoading) {
      setSelectedNoteId(null);
  }

  if (isLoading && !user) {
    return (
        <div className="flex h-[calc(100vh-4rem)]">
            <Skeleton className="w-80 hidden md:block border-r" />
            <div className="flex-1 p-8">
                <Skeleton className="h-12 w-1/2 mb-8" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <NoteSidebar 
        selectedNoteId={selectedNoteId}
        onSelectNote={handleSelectNote}
        onCreateNew={handleCreateNew}
      />
      <main className="flex-1 overflow-hidden">
        {selectedNote ? (
            <MarkdownEditor note={selectedNote} />
        ) : (
            <NoteWelcome onCreateNew={handleCreateNew} />
        )}
      </main>
    </div>
  );
}
