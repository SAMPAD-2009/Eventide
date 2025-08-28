
"use client"

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateAvatar } from '@/lib/utils';
import { Loader2, Save } from 'lucide-react';


export default function ProfilePage() {
    const { user, updateUserProfile, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [newPhoto, setNewPhoto] = useState<File | null>(null);
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login');
        }
    }, [user, isAuthLoading, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = async () => {
        if (!newPhoto) return;
        setIsSaving(true);
        const success = await updateUserProfile(newPhoto);
        if (success) {
            toast({ title: "Profile Updated", description: "Your profile picture has been changed." });
            setNewPhoto(null);
            setPreviewPhoto(null);
        }
        setIsSaving(false);
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    if (isAuthLoading || !user) {
        return (
             <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        )
    }

  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Your Profile</h1>
        <Card>
            <CardHeader>
                <CardTitle>{user.displayName ?? 'Profile Details'}</CardTitle>
                <CardDescription>View and update your profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-6">
                    <Avatar className="h-32 w-32">
                        <AvatarImage src={previewPhoto ?? user.photoURL ?? undefined} alt={user.email ?? ''}/>
                        <AvatarFallback className="text-4xl">{generateAvatar(user.email ?? '')}</AvatarFallback>
                    </Avatar>
                     <div className="flex items-center gap-4">
                        <Input 
                            id="picture" 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden"
                        />
                        <Button variant="outline" onClick={triggerFileSelect}>Choose File</Button>
                        <Button onClick={handleProfileUpdate} disabled={!newPhoto || isSaving}>
                           {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                           Save
                        </Button>
                    </div>
                </div>
                 <div>
                    <Label>Username</Label>
                    <p className="text-sm text-muted-foreground">{user.displayName}</p>
                 </div>
                 <div>
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
