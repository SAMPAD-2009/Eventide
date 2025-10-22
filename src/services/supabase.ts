
"use server"

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UserProfileSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
    theme: z.string(),
    photo_url: z.string().url(),
    landing_page: z.string().optional(),
});

type UserProfile = z.infer<typeof UserProfileSchema>;

export async function createUserProfile(profileData: Omit<UserProfile, 'landing_page'>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('user_profiles')
        .insert([{ ...profileData, landing_page: '/' }])
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

export async function updateUserLandingPage(email: string, landingPage: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('user_profiles')
        .update({ landing_page: landingPage })
        .eq('email', email);
    
    return { error };
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
    
    // 3. Update todos table
    const { error: todosError } = await supabase
        .from('todos')
        .update({ user_email: newEmail })
        .eq('user_email', oldEmail);
    if (todosError) {
        console.error("Error updating todos table:", todosError);
        return { error: `Failed to update todos: ${todosError.message}` };
    }

    // 4. Update projects table
    const { error: projectsError } = await supabase
        .from('projects')
        .update({ user_email: newEmail })
        .eq('user_email', oldEmail);
    if (projectsError) {
        console.error("Error updating projects table:", projectsError);
        return { error: `Failed to update projects: ${projectsError.message}` };
    }
    
    // 5. Update notes table
    const { error: notesError } = await supabase
        .from('notes')
        .update({ user_email: newEmail })
        .eq('user_email', oldEmail);
    
    if (notesError) {
        console.error("Error updating notes table:", notesError);
        return { error: `Failed to update notes: ${notesError.message}` };
    }

    // 6. Update notebooks table
    const { error: notebooksError } = await supabase
        .from('notebooks')
        .update({ user_email: newEmail })
        .eq('user_email', oldEmail);
    
    if (notebooksError) {
        console.error("Error updating notebooks table:", notebooksError);
        return { error: `Failed to update notebooks: ${notebooksError.message}` };
    }


    return { error: null };
}

export async function deleteUserData(email: string) {
    const supabase = createClient();

    // The order is important due to foreign key constraints
    
    // 1. Delete user's notes
    const { error: notesError } = await supabase
        .from('notes')
        .delete()
        .eq('user_email', email);
    if (notesError) {
        console.error("Error deleting user notes:", notesError);
        return { error: `Failed to delete notes: ${notesError.message}` };
    }

    // 2. Delete user's notebooks
    const { error: notebooksError } = await supabase
        .from('notebooks')
        .delete()
        .eq('user_email', email);
    if (notebooksError) {
        console.error("Error deleting user notebooks:", notebooksError);
        return { error: `Failed to delete notebooks: ${notebooksError.message}` };
    }
    
    // 3. Delete user's todos
    const { error: todosError } = await supabase
        .from('todos')
        .delete()
        .eq('user_email', email);
    if (todosError) {
        console.error("Error deleting user todos:", todosError);
        return { error: `Failed to delete todos: ${todosError.message}` };
    }

    // 4. Delete user's projects
    const { error: projectsError } = await supabase
        .from('projects')
        .delete()
        .eq('user_email', email);
    if (projectsError) {
        console.error("Error deleting user projects:", projectsError);
        return { error: `Failed to delete projects: ${projectsError.message}` };
    }

    // 5. Delete user's events
    const { error: eventsError } = await supabase
        .from('events')
        .delete()
        .eq('user_email', email);

    if (eventsError) {
        console.error("Error deleting user events:", eventsError);
        return { error: `Failed to delete events: ${eventsError.message}` };
    }

    // 6. Delete user's profile last
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
