
"use client"

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { generateAvatar } from '@/lib/utils';
import { Loader2, Save } from 'lucide-react';

const passwordFormSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function ProfilePage() {
    const { user, updateUserProfile, updateUserUsername, updateUserPassword, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [newUsername, setNewUsername] = useState('');
    const [newPhoto, setNewPhoto] = useState<File | null>(null);
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
    const [isSavingPhoto, setIsSavingPhoto] = useState(false);
    const [isSavingUsername, setIsSavingUsername] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

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

    const handlePasswordUpdate = async (data: PasswordFormValues) => {
        setIsSavingPassword(true);
        const success = await updateUserPassword(data.password);
        if (success) {
            toast({ title: "Password Updated", description: "Your password has been changed successfully." });
            passwordForm.reset();
        }
        setIsSavingPassword(false);
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
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <Card>
            <CardHeader>
                <CardTitle>{user.displayName ?? 'Profile Details'}</CardTitle>
                <CardDescription>View and update your profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-6">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32">
                        <AvatarImage src={previewPhoto ?? user.photoURL ?? undefined} alt={user.email ?? ''}/>
                        <AvatarFallback className="text-4xl">{generateAvatar(user.email ?? '')}</AvatarFallback>
                    </Avatar>
                     <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Input 
                            id="picture" 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden"
                        />
                        <Button variant="outline" onClick={triggerFileSelect} className="w-full sm:w-auto">Choose File</Button>
                        <Button onClick={handlePhotoUpdate} disabled={!newPhoto || isSavingPhoto} className="w-full sm:w-auto">
                           {isSavingPhoto ? <Loader2 className="animate-spin" /> : <Save />}
                           Save Photo
                        </Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                      <Button onClick={handleUsernameUpdate} disabled={newUsername === user.displayName || isSavingUsername} className="w-full sm:w-auto">
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

        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password here. It's recommended to use a strong, unique password.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-6">
                        <FormField
                            control={passwordForm.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSavingPassword}>
                            {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Change Password
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
