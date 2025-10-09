
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

export async function updateUserEmailInDb(oldEmail: string, newEmail: string) {
    const supabase = createClient();

    // 1. Update user_profiles table
    const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ email: newEmail })
        .eq('email', oldEmail);

    if (profileError) {
        console.error("Error updating user_profiles table:", profileError);
        return { error: `Failed to update profile: ${profileError.message}` };
    }
    
    // 2. Update events table
    const { error: eventsError } = await supabase
        .from('events')
        .update({ user_email: newEmail })
        .eq('user_email', oldEmail);

    if (eventsError) {
        console.error("Error updating events table:", eventsError);
        // Attempt to revert the profile email change
        await supabase.from('user_profiles').update({ email: oldEmail }).eq('email', newEmail);
        return { error: `Failed to update events: ${eventsError.message}. Profile change was reverted.` };
    }

    return { error: null };
}

export async function deleteUserData(email: string) {
    const supabase = createClient();

    // 1. Delete events
    const { error: eventsError } = await supabase
        .from('events')
        .delete()
        .eq('user_email', email);

    if (eventsError) {
        console.error("Error deleting user events:", eventsError);
        return { error: `Failed to delete events: ${eventsError.message}` };
    }

    // 2. Delete user profile
    const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('email', email);
    
    if (profileError) {
        console.error("Error deleting user profile:", profileError);
        return { error: `Failed to delete profile: ${profileError.message}` };
    }

    return { error: null };
}
