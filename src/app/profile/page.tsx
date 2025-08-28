
"use client"

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateAvatar } from '@/lib/utils';
import { Loader2, Upload } from 'lucide-react';


export default function ProfilePage() {
    const { user, updateUserProfile, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [newPhoto, setNewPhoto] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login');
        }
    }, [user, isAuthLoading, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewPhoto(e.target.files[0]);
        }
    };

    const handleProfileUpdate = async () => {
        if (!newPhoto) return;
        setIsUploading(true);
        const success = await updateUserProfile(newPhoto);
        if (success) {
            toast({ title: "Profile Updated", description: "Your profile picture has been changed." });
        }
        setNewPhoto(null);
        setIsUploading(false);
    };

    if (isAuthLoading || !user) {
        return (
             <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        )
    }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Your Profile</h1>
        <Card>
            <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>View and update your profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={user.photoURL} alt={user.email}/>
                        <AvatarFallback className="text-4xl">{generateAvatar(user.email)}</AvatarFallback>
                    </Avatar>
                     <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="picture">Update Profile Picture</Label>
                        <div className="flex gap-2">
                             <Input id="picture" type="file" onChange={handleFileChange} accept="image/*" className="cursor-pointer"/>
                             <Button onClick={handleProfileUpdate} disabled={!newPhoto || isUploading}>
                                {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                            </Button>
                        </div>
                    </div>
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
