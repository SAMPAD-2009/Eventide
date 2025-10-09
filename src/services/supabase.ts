
"use server"

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UserProfileSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
    theme: z.string(),
    photo_url: z.string().url(),
});

type UserProfile = z.infer<typeof UserProfileSchema>;

export async function createUserProfile(profileData: UserProfile) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();
    
    return { data, error };
}

export async function getUserProfile(email: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (error && error.code !== 'PGRST116') { // Ignore 'exact one row' error for non-existent profiles
        console.error("Error fetching user profile:", error);
    }
    
    return data;
}

export async function updateUserTheme(email: string, theme: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('user_profiles')
        .update({ theme })
        .eq('email', email);
    
    return { data, error };
}

export async function updateUserProfilePhoto(email: string, photoURL: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('user_profiles')
        .update({ photo_url: photoURL })
        .eq('email', email);

    return { data, error };
}

export async function updateUserProfileUsername(email: string, username: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('user_profiles')
        .update({ username })
        .eq('email', email);

    return { data, error };
}
