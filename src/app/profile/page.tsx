
"use client"

import { useAuth } from '@/context/AuthContext';
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
import { generateAvatar, resizeImage } from '@/lib/utils';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import { ProfilePageSkeleton } from '@/components/ProfilePageSkeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const passwordFormSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const emailFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;


export default function ProfilePage() {
    const { user, updateUserProfile, updateUserUsername, updateUserPassword, updateUserEmail, deleteUserAccount, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const [newUsername, setNewUsername] = useState('');
    const [newPhoto, setNewPhoto] = useState<File | null>(null);
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
    const [isSavingPhoto, setIsSavingPhoto] = useState(false);
    const [isSavingUsername, setIsSavingUsername] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [isSavingEmail, setIsSavingEmail] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const emailForm = useForm<EmailFormValues>({
        resolver: zodResolver(emailFormSchema),
        defaultValues: {
            email: "",
        },
    });

    useEffect(() => {
        if (user) {
            setNewUsername(user.displayName ?? '');
            emailForm.setValue('email', user.email ?? '');
        }
    }, [user, emailForm]);

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
            // Toast is handled in the context now
            setNewPhoto(null);
            setPreviewPhoto(null);
        }
        setIsSavingPhoto(false);
    };

    const handleUsernameUpdate = async () => {
        if (!newUsername || newUsername === user?.displayName) return;
        setIsSavingUsername(true);
        await updateUserUsername(newUsername);
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

    const handleEmailUpdate = async (data: EmailFormValues) => {
        if (data.email === user?.email) {
            toast({ variant: 'destructive', title: "No Change", description: "The new email is the same as your current email." });
            return;
        }
        setIsSavingEmail(true);
        await updateUserEmail(data.email);
        setIsSavingEmail(false);
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        await deleteUserAccount();
        // The AuthProvider will handle redirecting the user upon successful deletion.
        setIsDeleting(false);
    }


    const triggerFileSelect = () => fileInputRef.current?.click();

    if (isAuthLoading || !user) {
        return <ProfilePageSkeleton />;
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
                <CardTitle>Change Email</CardTitle>
                <CardDescription>Update your login email. You will need to re-verify your email after changing it.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(handleEmailUpdate)} className="space-y-6">
                        <FormField
                            control={emailForm.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Email</FormLabel>
                                <FormControl>
                                <Input type="email" placeholder="you@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSavingEmail}>
                            {isSavingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save New Email
                        </Button>
                    </form>
                </Form>
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

         <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle />
              Danger Zone
            </CardTitle>
            <CardDescription>
              These actions are permanent and cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove all of your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {isDeleting ? <Loader2 className="animate-spin" /> : "Yes, delete my account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
