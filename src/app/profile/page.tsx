
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
    const { user, updateUserProfile, updateUserUsername, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [newUsername, setNewUsername] = useState('');
    const [newPhoto, setNewPhoto] = useState<File | null>(null);
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
    const [isSavingPhoto, setIsSavingPhoto] = useState(false);
    const [isSavingUsername, setIsSavingUsername] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login');
        }
        if (user?.displayName) {
            setNewUsername(user.displayName);
        }
    }, [user, isAuthLoading, router]);

    const resizeImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 300;
                    const MAX_HEIGHT = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        return reject(new Error('Failed to get canvas context'));
                    }
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const newFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
                            });
                            resolve(newFile);
                        } else {
                            reject(new Error('Canvas to Blob conversion failed'));
                        }
                    }, file.type, 0.8); // 80% quality
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressedFile = await resizeImage(file);
                setNewPhoto(compressedFile);
                
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewPhoto(reader.result as string);
                };
                reader.readAsDataURL(compressedFile);

            } catch (error) {
                console.error("Failed to resize image:", error);
                toast({
                    variant: "destructive",
                    title: "Image Processing Failed",
                    description: "Could not process the selected image. Please try another one."
                });
            }
        }
    };

    const handlePhotoUpdate = async () => {
        if (!newPhoto) return;
        setIsSavingPhoto(true);
        const success = await updateUserProfile(newPhoto);
        if (success) {
            toast({ title: "Profile Updated", description: "Your profile picture has been changed." });
            setNewPhoto(null);
            setPreviewPhoto(null);
        }
        setIsSavingPhoto(false);
    };

    const handleUsernameUpdate = async () => {
        if (!newUsername || newUsername === user?.displayName) return;
        setIsSavingUsername(true);
        const success = await updateUserUsername(newUsername);
        if (success) {
            toast({ title: "Profile Updated", description: "Your username has been changed." });
        }
        setIsSavingUsername(false);
    }

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
                        <Button onClick={handlePhotoUpdate} disabled={!newPhoto || isSavingPhoto}>
                           {isSavingPhoto ? <Loader2 className="animate-spin" /> : <Save />}
                           Save Photo
                        </Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="flex items-center gap-4">
                      <Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                      <Button onClick={handleUsernameUpdate} disabled={newUsername === user.displayName || isSavingUsername}>
                          {isSavingUsername ? <Loader2 className="animate-spin" /> : <Save />}
                          Save Username
                      </Button>
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
