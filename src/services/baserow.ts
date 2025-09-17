
"use server"

import { z } from 'zod';

const CreateUserSchema = z.object({
    email: z.string().email(),
    username: z.string(),
    theme: z.string(),
    photoURL: z.string(),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

const UpdateUserThemeSchema = z.object({
    email: z.string().email(),
    theme: z.string(),
});

type UpdateUserThemeInput = z.infer<typeof UpdateUserThemeSchema>;

const UpdateUserPhotoSchema = z.object({
    email: z.string().email(),
    photoURL: z.string(),
});
type UpdateUserPhotoInput = z.infer<typeof UpdateUserPhotoSchema>;

const UpdateUserUsernameSchema = z.object({
    email: z.string().email(),
    username: z.string(),
});
type UpdateUserUsernameInput = z.infer<typeof UpdateUserUsernameSchema>;


const apiEndpoint = process.env.BASEROW_API_ENDPOINT || 'https://api.baserow.io';
const dbToken = process.env.BASEROW_DB_TOKEN;
const tableId = process.env.BASEROW_USER_TABLE_ID;

function areBaserowCredsConfigured() {
    if (!apiEndpoint || !dbToken || !tableId || dbToken.startsWith("YOUR")) {
        console.warn("Baserow environment variables are not configured. Skipping Baserow operation. Please update your .env file.");
        return false;
    }
    return true;
}

export async function notifyLogin(email: string) {
    const n8nLoginWebhookUrl = process.env.N8N_LOGIN_WEBHOOK_URL;
    if (!n8nLoginWebhookUrl || n8nLoginWebhookUrl.startsWith("YOUR")) {
        console.log("n8n login webhook URL not configured. Skipping notification.");
        return;
    }

    try {
        const url = new URL(n8nLoginWebhookUrl);
        url.searchParams.append('email', email);
        // We don't need to await this, we can fire and forget.
        fetch(url.toString(), { method: 'GET' });
        console.log(`Sent login notification for ${email}`);
    } catch (webhookError) {
        console.error("Failed to send data to n8n login webhook:", webhookError);
    }
}

export async function createUserInBaserow(userData: CreateUserInput) {
    if (!areBaserowCredsConfigured()) {
        return { success: true, message: "Skipped Baserow user creation (dev mode)." };
    }

    const { email, username, theme, photoURL } = userData;

    try {
        const response = await fetch(`${apiEndpoint}/api/database/rows/table/${tableId}/?user_field_names=true`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${dbToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "Email": email,
                "Username": username,
                "Theme": theme,
                "Photo URL": photoURL,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to create user in Baserow: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Baserow API Error:", error);
        let message = 'An unknown error occurred.';
        if (error instanceof Error) {
            message = error.message;
        }
        return { success: false, error: message };
    }
}

export async function updateUserThemeInBaserow(userData: UpdateUserThemeInput) {
    if (!areBaserowCredsConfigured()) {
        return { success: true, message: "Skipped Baserow theme update (dev mode)." };
    }

    const { email, theme } = userData;

    try {
        const rowId = await getRowIdByEmail(email);
        if (!rowId) {
             throw new Error(`User with email ${email} not found in Baserow.`);
        }

        const patchResponse = await fetch(`${apiEndpoint}/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${dbToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "Theme": theme }),
        });

        if (!patchResponse.ok) {
            const errorData = await patchResponse.json();
            throw new Error(`Failed to update theme in Baserow: ${JSON.stringify(errorData)}`);
        }

        const data = await patchResponse.json();
        return { success: true, data };
    } catch (error) {
        console.error("Baserow API Error:", error);
        let message = 'An unknown error occurred.';
        if (error instanceof Error) {
            message = error.message;
        }
        return { success: false, error: message };
    }
}


export async function updateUserPhotoInBaserow(userData: UpdateUserPhotoInput) {
    if (!areBaserowCredsConfigured()) {
        return { success: false, error: "Baserow is not configured." };
    }

    const { email, photoURL } = userData;
    
    try {
        const rowId = await getRowIdByEmail(email);
        if (!rowId) {
            throw new Error(`User with email ${email} not found in Baserow.`);
        }

        const patchResponse = await fetch(`${apiEndpoint}/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${dbToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "Photo URL": photoURL }),
        });

        if (!patchResponse.ok) {
            const errorData = await patchResponse.json();
            throw new Error(`Failed to update photo in Baserow: ${JSON.stringify(errorData)}`);
        }
        
        const data = await patchResponse.json();
        return { success: true, data };

    } catch (error) {
        console.error("Baserow API Error in updateUserPhotoInBaserow:", error);
        let message = 'An unknown error occurred during photo update.';
        if (error instanceof Error) {
            message = error.message;
        }
        return { success: false, error: message };
    }
}

export async function updateUserUsernameInBaserow(userData: UpdateUserUsernameInput) {
    if (!areBaserowCredsConfigured()) {
        return { success: true, message: "Skipped Baserow username update (dev mode)." };
    }

    const { email, username } = userData;

    try {
        const rowId = await getRowIdByEmail(email);
        if (!rowId) {
             throw new Error(`User with email ${email} not found in Baserow.`);
        }

        const patchResponse = await fetch(`${apiEndpoint}/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${dbToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "Username": username }),
        });

        if (!patchResponse.ok) {
            const errorData = await patchResponse.json();
            throw new Error(`Failed to update username in Baserow: ${JSON.stringify(errorData)}`);
        }

        const data = await patchResponse.json();
        return { success: true, data };
    } catch (error) {
        console.error("Baserow API Error:", error);
        let message = 'An unknown error occurred.';
        if (error instanceof Error) {
            message = error.message;
        }
        return { success: false, error: message };
    }
}



async function getRowIdByEmail(email: string): Promise<number | null> {
     if (!areBaserowCredsConfigured()) {
        console.log("Skipped getRowIdByEmail (dev mode).");
        return null;
    }
    const getRowUrl = new URL(`${apiEndpoint}/api/database/rows/table/${tableId}/`);
    getRowUrl.searchParams.append('user_field_names', 'true');
    getRowUrl.searchParams.append('filter__Email__equal', email);

    const getResponse = await fetch(getRowUrl.toString(), {
        method: 'GET',
        headers: { 'Authorization': `Token ${dbToken}` },
    });

    if (!getResponse.ok) {
        throw new Error(`Failed to find user in Baserow. Status: ${getResponse.status}`);
    }
    const { results } = await getResponse.json();
    return results.length > 0 ? results[0].id : null;
}


export async function getUserFromBaserow(email: string): Promise<any | null> {
    if (!areBaserowCredsConfigured()) {
        console.log("Skipped getUserFromBaserow (dev mode).");
        return null;
    }
    try {
        const rowId = await getRowIdByEmail(email);
        if (!rowId) return null;

        const response = await fetch(`${apiEndpoint}/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`, {
             method: 'GET',
             headers: { 'Authorization': `Token ${dbToken}` },
        });

        if (!response.ok) {
             throw new Error(`Failed to fetch user data from Baserow. Status: ${response.status}`);
        }
        return await response.json();

    } catch(error) {
        console.error("Baserow API Error:", error);
        return null;
    }
}
