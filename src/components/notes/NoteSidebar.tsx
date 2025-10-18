
"use client";

import { useNotes } from "@/context/NoteContext";
import { cn } from "@/lib/utils";
import { FilePlus, Notebook, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from 'date-fns';

interface NoteSidebarProps {
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNew: () => void;
}

export function NoteSidebar({ selectedNoteId, onSelectNote, onCreateNew }: NoteSidebarProps) {
  const { notes, deleteNote, isLoading } = useNotes();

  const SidebarSkeleton = () => (
      <div className="space-y-2 p-2">
          {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
          ))}
      </div>
  )

  return (
      <aside className="w-full md:w-80 flex-shrink-0 border-r bg-background/50 p-2 md:p-4">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight hidden md:block">Notes</h2>
            <Button variant="ghost" size="icon" onClick={onCreateNew} className="md:-mr-2">
                <FilePlus className="h-5 w-5" />
            </Button>
        </div>
        
        {isLoading ? <SidebarSkeleton /> : (
            <div className="space-y-1">
            {notes.map(note => (
                <div key={note.note_id} className="flex items-center group rounded-md hover:bg-muted">
                    <Button
                        variant={selectedNoteId === note.note_id ? "secondary" : "ghost"}
                        className="w-full justify-start h-auto py-2"
                        onClick={() => onSelectNote(note.note_id)}
                    >
                        <div className="flex-1 text-left">
                           <p className="font-semibold truncate">{note.title || 'Untitled Note'}</p>
                           <p className="text-xs text-muted-foreground">
                               {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                           </p>
                        </div>
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 flex-shrink-0">
                                <Trash2 className="h-4 w-4 text-destructive/70" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete &quot;{note.title}&quot;?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e) => { e.stopPropagation(); deleteNote(note.note_id); }}
                                    className="bg-red-600 text-destructive-foreground hover:bg-red-700"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ))}
             {notes.length === 0 && (
                <div 
                    className="text-center text-muted-foreground p-8 cursor-pointer hover:bg-muted rounded-lg"
                    onClick={onCreateNew}
                >
                    <Notebook className="mx-auto h-12 w-12" />
                    <p className="mt-4">No notes yet.</p>
                    <p>Click to create one!</p>
                </div>
            )}
            </div>
        )}
      </aside>
  );
}
