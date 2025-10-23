
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Notebook, Note } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';

type NotebookCreationData = Omit<Notebook, 'notebook_id' | 'user_email' | 'created_at'>;
type NoteCreationData = Omit<Note, 'note_id' | 'user_email' | 'created_at' | 'updated_at'>;

interface NoteContextType {
  notebooks: Notebook[];
  notes: Note[];
  isLoading: boolean;
  addNotebook: (data: NotebookCreationData) => Promise<Notebook | void>;
  deleteNotebook: (notebookId: string) => Promise<void>;
  getNotebookById: (notebookId: string) => Notebook | undefined;
  addNote: (data: NoteCreationData) => Promise<Note | void>;
  updateNote: (noteId: string, data: Partial<NoteCreationData>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  getNoteById: (noteId: string) => Note | undefined;
  getNotesByNotebook: (notebookId: string) => Note[];
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    if (user?.email && !hasLoaded) {
      setIsLoading(true);
      try {
        const [notebooksRes, notesRes] = await Promise.all([
          fetch(`/api/notebooks?user_email=${encodeURIComponent(user.email)}`),
          fetch(`/api/notes?user_email=${encodeURIComponent(user.email)}`),
        ]);

        if (!notebooksRes.ok || !notesRes.ok) {
          throw new Error('Failed to fetch notes data');
        }

        const notebooksData = await notebooksRes.json();
        const notesData = await notesRes.json();

        setNotebooks(notebooksData);
        setNotes(notesData);
        setHasLoaded(true);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Could not fetch your notebooks and notes: ${error.message}`,
        });
        setNotebooks([]);
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    } else if (!user) {
        setNotebooks([]);
        setNotes([]);
        setHasLoaded(false);
    }
  }, [toast, user, hasLoaded]);

  
  // Notebook functions
  const addNotebook = async (data: NotebookCreationData): Promise<Notebook | void> => {
    if (!user?.email) return;
    try {
      const response = await fetch('/api/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user_email: user.email }),
      });
      if (!response.ok) throw new Error('Failed to create notebook');
      const newNotebook = await response.json();
      setNotebooks(prev => [newNotebook, ...prev]);
      toast({ title: "Notebook Created", description: `'${newNotebook.name}' has been added.` });
      return newNotebook;
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Error", description: e.message });
    }
  };

  const deleteNotebook = async (notebookId: string) => {
    setNotebooks(prev => prev.filter(nb => nb.notebook_id !== notebookId));
    setNotes(prev => prev.filter(n => n.notebook_id !== notebookId));
    try {
      const response = await fetch(`/api/notebooks/${notebookId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete notebook');
      toast({ title: "Notebook Deleted" });
    } catch (e: any) {
       toast({ variant: 'destructive', title: "Error", description: e.message });
       if (user?.email) await fetchData(); // Refetch to restore state
    }
  };
  
  const getNotebookById = (notebookId: string) => notebooks.find(nb => nb.notebook_id === notebookId);

  // Note functions
  const addNote = async (data: NoteCreationData) => {
    if (!user?.email) return;
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user_email: user.email }),
      });
      if (!response.ok) throw new Error('Failed to create note');
      const newNote = await response.json();
      setNotes(prev => [newNote, ...prev]);
      toast({ title: "Note Created" });
      return newNote;
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Error", description: e.message });
    }
  };

  const updateNote = async (noteId: string, data: Partial<NoteCreationData>) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update note');
      const updatedNote = await response.json();
      setNotes(prev => prev.map(n => n.note_id === noteId ? updatedNote : n));
      toast({ title: "Note Saved" });
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Error Saving Note", description: e.message });
    }
  };

  const deleteNote = async (noteId: string) => {
    setNotes(prev => prev.filter(n => n.note_id !== noteId));
    try {
      const response = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete note');
      toast({ title: "Note Deleted" });
    } catch (e: any) {
       toast({ variant: 'destructive', title: "Error", description: e.message });
       if (user?.email) await fetchData();
    }
  };

  const getNoteById = (noteId: string) => notes.find(n => n.note_id === noteId);

  const getNotesByNotebook = (notebookId: string) => {
    return notes
      .filter(n => n.notebook_id === notebookId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  };

  const useWrappedNotes = () => {
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { notebooks, notes, isLoading, addNotebook, deleteNotebook, getNotebookById, addNote, updateNote, deleteNote, getNoteById, getNotesByNotebook };
  };


  const contextValue = {
    notebooks,
    notes,
    isLoading,
    addNotebook,
    deleteNotebook,
    getNotebookById,
    addNote,
    updateNote,
    deleteNote,
    getNoteById,
    getNotesByNotebook,
    useWrappedNotes,
  };

  return <NoteContext.Provider value={contextValue as any}>{children}</NoteContext.Provider>;
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return (context as any).useWrappedNotes();
};
