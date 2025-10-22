
"use client";

import { useNotes } from '@/context/NoteContext';
import { cn } from '@/lib/utils';
import { ChevronRight, FileText, Notebook as NotebookIcon, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NoteSidebarProps {
  currentNotebookId?: string;
  currentNoteId?: string;
  collabId?: string | null;
}

export function NoteSidebar({ currentNotebookId, currentNoteId, collabId = null }: NoteSidebarProps) {
  const { notebooks: allNotebooks, getNotesByNotebook, addNotebook } = useNotes();
  const [openNotebooks, setOpenNotebooks] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    if (currentNotebookId) {
      initialState[currentNotebookId] = true;
    }
    return initialState;
  });

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');

  const notebooks = useMemo(() => {
    return allNotebooks.filter(nb => collabId ? nb.collab_id === collabId : !nb.collab_id)
  }, [allNotebooks, collabId]);

  const toggleNotebook = (notebookId: string) => {
    setOpenNotebooks(prev => ({ ...prev, [notebookId]: !prev[notebookId] }));
  };

  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim()) return;
    await addNotebook({ name: newNotebookName, collab_id: collabId });
    setNewNotebookName('');
    setCreateDialogOpen(false);
  };
  
  return (
    <aside className="w-full h-full flex-shrink-0 bg-background/50 p-2 flex flex-col">
      <div className="flex justify-between items-center mb-4 p-2">
        <h2 className="text-lg font-semibold">Notes</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon"><Plus /></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Notebook</DialogTitle>
              <DialogDescription>
                Give your new notebook a name to start adding notes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="name">Notebook Name</Label>
              <Input
                id="name"
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNotebook()}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleCreateNotebook}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <nav className="space-y-1 overflow-y-auto flex-1">
        {notebooks.map(notebook => (
          <Collapsible key={notebook.notebook_id} open={openNotebooks[notebook.notebook_id]} onOpenChange={() => toggleNotebook(notebook.notebook_id)}>
            <div className={cn("flex items-center rounded-md", currentNotebookId === notebook.notebook_id && !currentNoteId && "bg-secondary")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start pl-2 pr-1">
                  <ChevronRight className={cn("h-4 w-4 transition-transform", openNotebooks[notebook.notebook_id] && "rotate-90")} />
                  <NotebookIcon className="mx-2 h-4 w-4" />
                  <span className="truncate flex-1 text-left">{notebook.name}</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-1 pl-6 mt-1 border-l-2 ml-3">
              {getNotesByNotebook(notebook.notebook_id).map(note => (
                <Button
                  key={note.note_id}
                  variant={currentNoteId === note.note_id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={`/notes/${notebook.notebook_id}/${note.note_id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="truncate">{note.title || 'Untitled'}</span>
                  </Link>
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </nav>
    </aside>
  );
}
