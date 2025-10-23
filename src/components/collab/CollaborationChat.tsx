
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateAvatar } from '@/lib/utils';
import type { CollaborationMessage, CollaborationMember } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

interface CollaborationChatProps {
    collabId: string;
    members: CollaborationMember[];
}

function ChatSkeleton() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 space-y-4 p-4">
                <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-3/4" />
                    </div>
                </div>
                 <div className="flex items-start gap-3 flex-row-reverse">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2 items-end flex flex-col">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-1/2" />
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-2/3" />
                    </div>
                </div>
            </div>
            <div className="p-4 border-t">
                 <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
}

export function CollaborationChat({ collabId, members }: CollaborationChatProps) {
    const { user } = useAuth();
    const supabase = createClient();
    const [messages, setMessages] = useState<CollaborationMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/collaborations/${collabId}/messages`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [collabId, toast]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const channel = supabase
            .channel(`collab-chat-${collabId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'collaboration_messages',
                    filter: `collab_id=eq.${collabId}`,
                },
                (payload) => {
                    setMessages((prevMessages) => [...prevMessages, payload.new as CollaborationMessage]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [collabId, supabase]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;
        
        setIsSending(true);
        try {
            const response = await fetch(`/api/collaborations/${collabId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage }),
            });
            if (!response.ok) throw new Error('Failed to send message');
            setNewMessage('');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSending(false);
        }
    };
    
    if (isLoading) {
        return <ChatSkeleton />;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-22rem)] md:h-[calc(100vh-20rem)] bg-card rounded-b-lg">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg) => {
                    const member = members.find(m => m.user_email === msg.user_email);
                    const isCurrentUser = msg.user_email === user?.email;
                    return (
                        <div key={msg.message_id} className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            <Avatar>
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${member?.user_email}&background=random`} />
                                <AvatarFallback>{generateAvatar(member?.user_email || '?')}</AvatarFallback>
                            </Avatar>
                            <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                <div className={`p-3 rounded-lg max-w-xs md:max-w-md break-words ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    {msg.content}
                                </div>
                                <span className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(msg.created_at), 'p')}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={isSending}
                    />
                    <Button type="submit" disabled={isSending || !newMessage.trim()}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
