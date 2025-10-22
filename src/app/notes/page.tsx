
"use client";

import { useNotes } from '@/context/NoteContext';
import { useState, useMemo } from 'react';
import { NoteSidebar } from '@/components/notes/NoteSidebar';
import { NoteBreadcrumbs } from '@/components/notes/NoteBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, Menu, Users } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function NotesDashboardPage() {
  const { notebooks, addNotebook, deleteNotebook, isLoading, getNotesByNotebook } = useNotes();
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
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="hidden md:block md:w-72 md:flex-shrink-0 border-r">
          <NoteSidebar />
      </div>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-full">
          <header className="mb-8">
            <div className="flex items-center gap-2 md:hidden mb-4">
              <Sheet>
                  <SheetTrigger asChild>
                      <Button variant="outline" size="icon"><Menu/></Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-72">
                      <NoteSidebar />
                  </SheetContent>
              </Sheet>
              <NoteBreadcrumbs />
            </div>
            <div className="flex items-center justify-between mt-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Notebooks</h1>
              <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2" />
                    <span className="hidden sm:inline">New Notebook</span>
                    <span className="sm:hidden">New</span>
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
              {notebooks.map(notebook => {
                const noteCount = getNotesByNotebook(notebook.notebook_id).length;
                const isCollab = !!notebook.collab_id;
                return (
                  <motion.div key={notebook.notebook_id} whileHover={{ y: -5, scale: 1.02 }} layout>
                    <Card className="relative">
                      {isCollab && (
                        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{notebook.collaborations?.name}</span>
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className={cn("truncate", isCollab && "pr-24")}>{notebook.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        {!isCollab && (
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" disabled={notebook.name === 'Default'} className="pl-[5px]">
                                  <Trash2 className="h-4 w-4" />
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
                        )}
                        <Button asChild size="sm">
                          <Link href={`/notes/${notebook.notebook_id}`}>
                            <Edit className="mr-2" /> View
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 gap-4 mt-8">
                <Image
                    src="/note-not-min.png"
                    alt="No notebooks found"
                    data-ai-hint="illustration empty state"
                    width={300}
                    height={300}
                    className="max-w-[200px] md:max-w-[300px] rounded-lg"
                />
                <h3 className="text-xl md:text-2xl font-semibold text-muted-foreground mt-4">No Notebooks Yet</h3>
                <p className="text-muted-foreground">Click &quot;New Notebook&quot; to get started.</p>
            </div>
          )}
        </main>
    </div>
  );
}
