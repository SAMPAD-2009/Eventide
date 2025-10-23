
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Collaboration, Invitation, CollaborationMember, Event, Todo, Note, Notebook, MemberRole } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Mail, ArrowLeft, PlusCircle, Trash2, MoreHorizontal, UserCog, VenetianMask, Edit, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateAvatar } from '@/lib/utils';
import { useEvents } from '@/context/EventContext';
import { EventList } from '@/components/EventList';
import { EventForm } from '@/components/EventForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTodos } from '@/context/TodoContext';
import { TaskList } from '@/components/todo/TaskList';
import { AddTodoForm } from '@/components/todo/AddTodoForm';
import { useNotes } from '@/context/NoteContext';
import Link from 'next/link';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

export default function CollabDetailsPage() {
    const { collabId } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const supabase = createClient();

    // Local state for this page
    const [collaboration, setCollaboration] = useState<Collaboration | null>(null);
    const [members, setMembers] = useState<CollaborationMember[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newInviteEmail, setNewInviteEmail] = useState("");
    const [newInviteRole, setNewInviteRole] = useState<MemberRole>("editor");
    const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);
    const [newCollabName, setNewCollabName] = useState("");


    // Global state from contexts
    const { events, isLoading: eventsLoading, addEvent, updateEvent, deleteEvent } = useEvents();
    const { todos, projects, isLoading: todosLoading, addProject: addTodoProject, addTodo: addTodoFromContext, updateTodo, deleteTodo } = useTodos();
    const { notes, notebooks, isLoading: notesLoading, addNote, addNotebook, getNotesByNotebook, deleteNote } = useNotes();

    // Memoized filters for data specific to this collab
    const collabEvents = useMemo(() => events.filter(e => e.collab_id === collabId), [events, collabId]);
    const collabTodos = useMemo(() => todos.filter(t => t.collab_id === collabId), [todos, collabId]);
    const collabNotebooks = useMemo(() => notebooks.filter(n => n.collab_id === collabId), [notebooks, collabId]);
    const collabProjects = useMemo(() => projects.filter(p => p.collab_id === collabId), [projects, collabId]);

    const isOwner = useMemo(() => collaboration?.owner_email === user?.email, [collaboration, user]);
    const currentUserMemberInfo = useMemo(() => members.find(m => m.user_email === user?.email), [members, user]);
    const isAdmin = useMemo(() => isOwner || currentUserMemberInfo?.role === 'admin', [isOwner, currentUserMemberInfo]);
    const canEdit = useMemo(() => isAdmin || currentUserMemberInfo?.role === 'editor', [isAdmin, currentUserMemberInfo]);
    
    // UI state
    const [isEventFormOpen, setEventFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    
    const [isTodoFormOpen, setTodoFormOpen] = useState(false);
    const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

    const [isNoteFormOpen, setNoteFormOpen] = useState(false);
    const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchCollabData = async () => {
            if (!user || !collabId) return;
            setIsLoading(true);

            // Fetch collaboration details
            const { data: collabData, error: collabError } = await supabase
                .from('collaborations')
                .select('*')
                .eq('collab_id', collabId)
                .single();

            if (collabError || !collabData) {
                toast({ variant: 'destructive', title: 'Error', description: "Could not fetch collaboration details." });
                router.push('/collab');
                return;
            }
            setCollaboration(collabData);
            setNewCollabName(collabData.name);

            // Fetch members
            const { data: membersData, error: membersError } = await supabase
                .from('collaboration_members')
                .select('*')
                .eq('collab_id', collabId);
            if (membersError) console.error("Error fetching members:", membersError);
            else setMembers(membersData);
            
            // Fetch invites
            const { data: invitesData, error: invitesError } = await supabase
                .from('invitations')
                .select('*')
                .eq('collab_id', collabId)
                .eq('status', 'pending');
            if (invitesError) console.error("Error fetching invites:", invitesError);
            else setInvitations(invitesData);

            setIsLoading(false);
        };

        fetchCollabData();
    }, [collabId, user, supabase, router]);
    
    const handleInvite = async () => {
        if (!newInviteEmail.trim() || !user?.email || !collabId) return;
        try {
            const { error } = await supabase.from('invitations').insert({
                collab_id: collabId as string,
                inviter_email: user.email,
                invitee_email: newInviteEmail,
                role: newInviteRole,
            });
            if (error) throw error;
            toast({ title: 'Success', description: `Invitation sent to ${newInviteEmail}.` });
            setNewInviteEmail("");
            // Refetch invites
            const { data: invitesData } = await supabase.from('invitations').select('*').eq('collab_id', collabId as string).eq('status', 'pending');
            if (invitesData) setInvitations(invitesData);

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };
    
    const handleAddEvent = (data: Omit<Event, 'event_id' | 'user_email'>) => {
        addEvent({ ...data, collab_id: collabId as string });
        setEventFormOpen(false);
    };

    const handleUpdateEvent = (data: Omit<Event, 'event_id' | 'user_email'>) => {
        if (!editingEvent) return;
        updateEvent(editingEvent.event_id, { ...data, collab_id: collabId as string });
        setEventFormOpen(false);
        setEditingEvent(null);
    };
    
    const handleEditEventClick = (event: Event) => {
        setEditingEvent(event);
        setEventFormOpen(true);
    }
    
    const handleCreateNote = async (notebookId: string) => {
      const newNote = await addNote({
        notebook_id: notebookId,
        title: 'Untitled Note',
        content: '',
        collab_id: collabId as string
      });
      if (newNote) {
        router.push(`/notes/${notebookId}/${newNote.note_id}`);
      }
    };

    const handleRemoveMember = async (memberEmail: string) => {
        try {
            const { error } = await supabase
                .from('collaboration_members')
                .delete()
                .eq('collab_id', collabId)
                .eq('user_email', memberEmail);
            if (error) throw error;
            setMembers(members.filter(m => m.user_email !== memberEmail));
            toast({ title: 'Member removed' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };
    
    const handleRoleChange = async (memberEmail: string, newRole: MemberRole) => {
        try {
            const { error } = await supabase
                .from('collaboration_members')
                .update({ role: newRole })
                .eq('collab_id', collabId)
                .eq('user_email', memberEmail);
            if (error) throw error;
            setMembers(members.map(m => m.user_email === memberEmail ? { ...m, role: newRole } : m));
            toast({ title: 'Permissions updated' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };
    
    const handleRenameCollab = async () => {
        if (!newCollabName.trim() || newCollabName === collaboration?.name) {
            setRenameDialogOpen(false);
            return;
        }
        try {
            const response = await fetch(`/api/collaborations/${collabId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCollabName }),
            });
            const updatedCollab = await response.json();
            if (!response.ok) {
                throw new Error(updatedCollab.error || "Failed to rename collaboration.");
            }
            setCollaboration(updatedCollab);
            toast({ title: 'Success', description: `Space renamed to "${newCollabName}".` });
            setRenameDialogOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };


    if (isLoading) {
        return <div className="p-8"><Skeleton className="w-full h-96" /></div>;
    }
    
    if (!collaboration) {
        return <div className="p-8 text-center">Collaboration not found.</div>;
    }

    return (
        <div className="w-full mx-auto p-4 md:p-8">
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4'>
                <Button asChild variant="outline" className="self-start">
                    <Link href="/collab">
                        <ArrowLeft className="mr-2" />
                        <span className='hidden sm:inline'>Back to All Spaces</span>
                        <span className='sm:hidden'>Back</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-2 self-start sm:self-center">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{collaboration.name}</h1>
                    {isAdmin && (
                        <Dialog open={isRenameDialogOpen} onOpenChange={setRenameDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Edit className="h-5 w-5 text-muted-foreground"/>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Rename Space</DialogTitle>
                                    <DialogDescription>
                                        Enter a new name for your collaboration space.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Label htmlFor="name">Space Name</Label>
                                    <Input
                                        id="name"
                                        value={newCollabName}
                                        onChange={(e) => setNewCollabName(e.target.value)}
                                        placeholder="e.g., Q4 Project Team"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleRenameCollab}>Save</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
            
            <p className="text-muted-foreground mb-8">Owned by {collaboration.owner_email}</p>

            <Tabs defaultValue="events" className="w-full">
                <div className='overflow-x-auto pb-2'>
                    <TabsList className="grid w-full grid-cols-4 min-w-[400px]">
                        <TabsTrigger value="events">Events</TabsTrigger>
                        <TabsTrigger value="todos">Todos</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                    </TabsList>
                </div>
                
                <TabsContent value="events" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <CardTitle>Shared Events</CardTitle>
                                {canEdit && (
                                <Dialog open={isEventFormOpen} onOpenChange={setEventFormOpen}>
                                    <DialogTrigger asChild>
                                        <Button onClick={() => setEditingEvent(null)} className="w-full sm:w-auto">
                                            <PlusCircle className="mr-2" /> 
                                            <span className='sm:hidden'>New Event</span>
                                            <span className='hidden sm:inline'>Add Event</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-3xl">
                                        <DialogHeader>
                                            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add a Shared Event'}</DialogTitle>
                                        </DialogHeader>
                                        <EventForm 
                                            event={editingEvent}
                                            onEventCreated={handleAddEvent}
                                            onEventUpdated={handleUpdateEvent}
                                        />
                                    </DialogContent>
                                </Dialog>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <EventList 
                                events={collabEvents}
                                onEditEvent={handleEditEventClick}
                                emptyStateMessage="No shared events in this space yet."
                                isReadOnly={!canEdit}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="todos" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shared Todos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {canEdit && (
                                <AddTodoForm 
                                    projectId={collabProjects.find(p => p.name === 'Collabed')?.project_id || 'Collabed'}
                                    collabId={collabId as string}
                                />
                            )}
                            <div className="mt-4">
                                <TaskList 
                                    todos={collabTodos.filter(t => !t.completed)} 
                                    editingTodoId={editingTodoId}
                                    onSetEditing={setEditingTodoId}
                                    isReadOnly={!canEdit}
                                />
                            </div>
                             {collabTodos.filter(t => t.completed).length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-2">Completed</h3>
                                    <TaskList 
                                        todos={collabTodos.filter(t => t.completed)} 
                                        editingTodoId={editingTodoId}
                                        onSetEditing={setEditingTodoId}
                                        isReadOnly={!canEdit}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="notes" className="mt-6">
                     <Card>
                        <CardHeader>
                           <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                             <CardTitle>Shared Notes</CardTitle>
                             {canEdit && (
                             <Button onClick={async () => {
                                let notebook = collabNotebooks.find(n => n.name === 'Collabed');
                                if (!notebook) {
                                  const newNotebook = await addNotebook({ name: 'Collabed', collab_id: collabId as string });
                                  if(newNotebook) notebook = newNotebook;
                                }
                                if(notebook) handleCreateNote(notebook.notebook_id);
                             }} className="w-full sm:w-auto">
                                <PlusCircle className="mr-2" /> New Note
                             </Button>
                             )}
                           </div>
                        </CardHeader>
                        <CardContent>
                            {collabNotebooks.length === 0 && <p className="text-muted-foreground">No notebooks. A 'Collabed' notebook will be created for your first note.</p>}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {collabNotebooks.map(notebook => (
                                <div key={notebook.notebook_id}>
                                    <h3 className="font-semibold mb-2 text-lg">{notebook.name}</h3>
                                    <div className="space-y-2">
                                        {getNotesByNotebook(notebook.notebook_id).map(note => (
                                            <Card key={note.note_id} className="group flex flex-col h-full">
                                                <Link href={`/notes/${notebook.notebook_id}/${note.note_id}`} className="flex-grow">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-base truncate">{note.title}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">{stripHtml(note.content)}</p>
                                                    </CardContent>
                                                </Link>
                                                <CardFooter className="flex justify-between items-center">
                                                     <p className="text-xs text-muted-foreground">Updated {format(new Date(note.updated_at), 'MMM d')}</p>
                                                    {canEdit && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This action cannot be undone. This will permanently delete the note &quot;{note.title}&quot;.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteNote(note.note_id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    )}
                                                </CardFooter>
                                            </Card>
                                        ))}
                                        {getNotesByNotebook(notebook.notebook_id).length === 0 && <p className="text-xs text-muted-foreground">No notes in this notebook.</p>}
                                    </div>
                                </div>
                            ))}
                            </div>
                        </CardContent>
                     </Card>
                </TabsContent>
                
                <TabsContent value="members" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Users/>Members</CardTitle>
                                <CardDescription>Users who have access to this space.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {members.map(member => (
                                    <div key={member.user_email} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://ui-avatars.com/api/?name=${member.user_email}&background=random`} />
                                                <AvatarFallback>{generateAvatar(member.user_email)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.user_email}</p>
                                                <p className="text-xs capitalize text-muted-foreground">{member.user_email === collaboration.owner_email ? 'Owner' : member.role}</p>
                                            </div>
                                        </div>
                                         {isAdmin && member.user_email !== user?.email && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {isOwner && (
                                                        <DropdownMenuItem onSelect={() => handleRoleChange(member.user_email, 'admin')} disabled={member.role === 'admin'}>
                                                            <ShieldCheck className="mr-2" /> Make Admin
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onSelect={() => handleRoleChange(member.user_email, 'editor')} disabled={member.role === 'editor'}>
                                                        <UserCog className="mr-2" /> Make Editor
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleRoleChange(member.user_email, 'viewer')} disabled={member.role === 'viewer'}>
                                                        <VenetianMask className="mr-2" /> Make Viewer
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                                <Trash2 className="mr-2" /> Remove Member
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Remove {member.user_email}?</AlertDialogTitle>
                                                                <AlertDialogDescription>They will lose access to this collaboration space and all its content. This action cannot be undone.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleRemoveMember(member.user_email)} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                         )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Mail />Invite New Members</CardTitle>
                                <CardDescription>Send an invitation to collaborate.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isAdmin && (
                                <>
                                <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                                    <div className="flex-grow">
                                        <label htmlFor="invite-email" className="text-sm font-medium">Email</label>
                                        <Input
                                            id="invite-email"
                                            type="email"
                                            placeholder="user@example.com"
                                            value={newInviteEmail}
                                            onChange={(e) => setNewInviteEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className='w-full sm:w-auto'>
                                        <label htmlFor="invite-role" className="text-sm font-medium">Role</label>
                                         <Select value={newInviteRole} onValueChange={(value: MemberRole) => setNewInviteRole(value)}>
                                            <SelectTrigger id="invite-role" className="w-full sm:w-[120px]">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {isOwner && <SelectItem value="admin">Admin</SelectItem>}
                                                <SelectItem value="editor">Editor</SelectItem>
                                                <SelectItem value="viewer">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleInvite} className="w-full sm:w-auto">Send</Button>
                                </div>
                                
                                <h3 className="font-semibold text-sm pt-4">Pending Invitations</h3>
                                <div className="space-y-2">
                                    {invitations.length > 0 ? invitations.map(invite => (
                                        <div key={invite.invite_id} className="flex items-center justify-between text-sm">
                                            <div>
                                                <p>{invite.invitee_email}</p>
                                                <p className="text-xs capitalize text-muted-foreground">{invite.role}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={async () => {
                                                await supabase.from('invitations').delete().eq('invite_id', invite.invite_id);
                                                setInvitations(invs => invs.filter(i => i.invite_id !== invite.invite_id));
                                            }}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                            </Button>
                                        </div>
                                    )) : <p className="text-sm text-muted-foreground">No pending invitations.</p>}
                                </div>
                                </>
                                )}
                                {!isAdmin && <p className="text-sm text-muted-foreground">Only the owner or an admin can invite new members.</p>}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
