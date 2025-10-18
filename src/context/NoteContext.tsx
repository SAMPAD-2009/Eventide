
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Note } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';

type NoteCreationData = Omit<Note, 'note_id' | 'user_email' | 'created_at' | 'updated_at'>;

interface NoteContextType {
  notes: Note[];
  addNote: (noteData: NoteCreationData) => Promise<Note | undefined>;
  updateNote: (noteId: string, noteData: Partial<NoteCreationData>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  getNoteById: (noteId: string) => Note | undefined;
  isLoading: boolean;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);

  const fetchNotes = useCallback(async (userEmail: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes?user_email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not fetch your notes: ${error.message}`,
      });
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user?.email) {
      fetchNotes(user.email);
    } else {
      setNotes([]);
      setIsLoading(false);
    }
  }, [user, fetchNotes]);

  const addNote = async (noteData: NoteCreationData) => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...noteData, user_email: user.email }),
      });
      if (!response.ok) throw new Error('Failed to create note');
      const newNote = await response.json();
      setNotes(prev => [newNote, ...prev]);
      toast({ title: "Note Created", description: `'${newNote.title}' has been added.` });
      return newNote;
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Error", description: e.message });
    } finally {
        setIsLoading(false);
    }
  };

  const updateNote = async (noteId: string, noteData: Partial<NoteCreationData>) => {
    const originalNotes = [...notes];
    setNotes(prev => prev.map(n => n.note_id === noteId ? { ...n, ...noteData, updated_at: new Date().toISOString() } as Note : n));

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });
      if (!response.ok) throw new Error('Failed to update note');
      const updatedNote = await response.json();
       setNotes(prev => prev.map(n => n.note_id === noteId ? updatedNote : n));
    } catch (e: any) {
      setNotes(originalNotes);
      toast({ variant: 'destructive', title: "Error", description: e.message });
    }
  };

  const deleteNote = async (noteId: string) => {
    const originalNotes = [...notes];
    setNotes(prev => prev.filter(n => n.note_id !== noteId));

    try {
      const response = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete note');
      toast({ title: "Note Deleted" });
    } catch (e: any) {
      setNotes(originalNotes);
      toast({ variant: 'destructive', title: "Error", description: e.message });
    }
  };
  
  const getNoteById = (noteId: string) => {
    return notes.find(n => n.note_id === noteId);
  }

  const contextValue = {
    notes,
    addNote,
    updateNote,
    deleteNote,
    getNoteById,
    isLoading,
  };

  return <NoteContext.Provider value={contextValue}>{children}</NoteContext.Provider>;
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};
