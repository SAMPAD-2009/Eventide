
"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Mail, Check, X, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Collaboration, InvitationWithCollab } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

function CollabSkeleton() {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-36" />
                    <Skeleton className="h-36" />
                </div>
            </div>
            <div>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="space-y-4">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                </div>
            </div>
        </div>
    )
}

export default function CollabPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
    const [invitations, setInvitations] = useState<InvitationWithCollab[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [newCollabName, setNewCollabName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isHandlingInvite, setIsHandlingInvite] = useState<string | null>(null);
    const supabase = createClient();

    const fetchData = useCallback(async () => {
        if (!user?.email || !supabase) return;
        setIsLoading(true);
        try {
            // Fetch collaboration IDs
            const { data: memberData, error: memberError } = await supabase
                .from('collaboration_members')
                .select('collab_id')
                .eq('user_email', user.email);
            
            if (memberError) throw new Error("Failed to fetch collaboration memberships.");
            
            const collabIds = memberData.map(m => m.collab_id);

            let collabsData: Collaboration[] = [];
            if (collabIds.length > 0) {
                 const { data, error: collabsError } = await supabase
                    .from('collaborations')
                    .select('*')
                    .in('collab_id', collabIds);
                if (collabsError) throw new Error("Failed to fetch collaboration spaces.");
                collabsData = data;
            }
            
            const invitesRes = await fetch(`/api/invitations?user_email=${encodeURIComponent(user.email)}`);
            if (!invitesRes.ok) throw new Error("Failed to fetch invitations.");
            const invitesData = await invitesRes.json();

            setCollaborations(collabsData);
            setInvitations(invitesData.filter((inv: InvitationWithCollab) => inv.status === 'pending'));

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [user?.email, toast, supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateCollab = async () => {
        if (!newCollabName.trim() || !user?.email) return;
        setIsCreating(true);
        try {
            const response = await fetch('/api/collaborations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCollabName, owner_email: user.email }),
            });
            if (!response.ok) throw new Error("Failed to create collaboration space.");
            
            toast({ title: 'Success', description: 'New collaboration space created!' });
            setNewCollabName("");
            setCreateDialogOpen(false);
            await fetchData(); // Refresh data
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsCreating(false);
        }
    };
    
    const handleInviteResponse = async (invite_id: string, status: 'accepted' | 'declined') => {
        setIsHandlingInvite(invite_id);
        try {
            const response = await fetch(`/api/invitations/${invite_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) throw new Error(`Failed to ${status === 'accepted' ? 'accept' : 'decline'} invitation.`);
            
            toast({ title: 'Success', description: `Invitation ${status}.` });
            await fetchData(); // Refresh data
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsHandlingInvite(null);
        }
    }


    return (
        <div className="w-full mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Collaboration</h1>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2" /> New Space
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a new collaboration space</DialogTitle>
                                <DialogDescription>
                                    Give your new space a name. You can invite members after it's created.
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
                                <Button variant="ghost" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateCollab} disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 animate-spin" />}
                                    Create
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                
                {isLoading ? <CollabSkeleton /> : (
                <div className="space-y-12">
                    {/* My Collaboration Spaces */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Users /> My Spaces</h2>
                        {collaborations.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {collaborations.map(collab => (
                                    <Link key={collab.collab_id} href={`/collab/${collab.collab_id}`}>
                                        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                                            <CardHeader>
                                                <CardTitle>{collab.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription>
                                                    {collab.owner_email === user?.email ? "You are the owner" : "You are a member"}
                                                </CardDescription>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Card className="flex items-center justify-center h-36 border-dashed">
                                <CardContent className="p-6 text-center">
                                    <p className="text-muted-foreground">You haven't joined or created any spaces yet.</p>
                                </CardContent>
                            </Card>
                        )}
                    </section>
                    
                    {/* My Invitations */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Mail /> My Invitations</h2>
                        {invitations.length > 0 ? (
                            <div className="space-y-4">
                                {invitations.map(invite => (
                                    <Card key={invite.invite_id}>
                                        <CardHeader className="flex flex-row justify-between items-start pb-2">
                                            <div>
                                                <CardTitle className="text-lg">{invite.collaborations.name}</CardTitle>
                                                <CardDescription>Invited by: {invite.inviter_email}</CardDescription>
                                            </div>
                                            <Badge variant="secondary">{invite.status}</Badge>
                                        </CardHeader>
                                        <CardFooter className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleInviteResponse(invite.invite_id, 'declined')} disabled={isHandlingInvite === invite.invite_id}>
                                                {isHandlingInvite === invite.invite_id ? <Loader2 className="animate-spin"/> : <X />}
                                                Decline
                                            </Button>
                                            <Button size="sm" onClick={() => handleInviteResponse(invite.invite_id, 'accepted')} disabled={isHandlingInvite === invite.invite_id}>
                                                {isHandlingInvite === invite.invite_id ? <Loader2 className="animate-spin"/> : <Check />}
                                                Accept
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                             <Card className="flex items-center justify-center h-36 border-dashed">
                                <CardContent className="p-6 text-center">
                                    <p className="text-muted-foreground">No pending invitations.</p>
                                </CardContent>
                            </Card>
                        )}
                    </section>
                </div>
                )}
            </div>
        </div>
    );
}
