
"use client";

import { useNotes } from '@/context/NoteContext';
import { useState } from 'react';
import { NoteSidebar } from '@/components/notes/NoteSidebar';
import { NoteBreadcrumbs } from '@/components/notes/NoteBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function NotesDashboardPage() {
  const { notebooks, addNotebook, deleteNotebook, isLoading } = useNotes();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');

  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim()) return;
    await addNotebook({ name: newNotebookName });
    setNewNotebookName('');
    setCreateDialogOpen(false);
  };

  const renderSkeleton = () => (
    <div className="flex h-[calc(100vh-4rem)]">
      <Skeleton className="w-72 hidden md:block border-r" />
      <div className="flex-1 p-8">
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-6 w-1/4 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-[calc(100vh-4rem)] w-full rounded-none border-none"
    >
      <ResizablePanel defaultSize={25} minSize={15} collapsible={true} collapsedSize={4}>
        <NoteSidebar />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-full">
          <header className="mb-8">
            <NoteBreadcrumbs />
            <div className="flex items-center justify-between mt-2">
              <h1 className="text-3xl font-bold tracking-tight">Notebooks Dashboard</h1>
              <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2" />
                    New Notebook
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Notebook</DialogTitle>
                    <DialogDescription>
                      Give your new notebook a name to start adding notes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input
                        id="name"
                        value={newNotebookName}
                        onChange={(e) => setNewNotebookName(e.target.value)}
                        className="col-span-3"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateNotebook()}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateNotebook}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {notebooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {notebooks.map(notebook => (
                <Card key={notebook.notebook_id}>
                  <CardHeader>
                    <CardTitle className="truncate">{notebook.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Contains notes and ideas.</CardDescription>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the notebook &quot;{notebook.name}&quot; and all notes inside it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteNotebook(notebook.notebook_id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button asChild size="sm">
                      <Link href={`/notes/${notebook.notebook_id}`}>
                        <Eye className="mr-2" /> View
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h3 className="text-xl font-semibold text-muted-foreground">No Notebooks Yet</h3>
              <p className="text-muted-foreground mt-2">Click &quot;New Notebook&quot; to get started.</p>
            </div>
          )}
        </main>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
