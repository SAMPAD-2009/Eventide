
"use server"

import { z } from 'zod';

const CreateUserSchema = z.object({
    email: z.string().email(),
    username: z.string(),
    theme: z.string(),
    photoURL: z.string().url(),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

const UpdateUserThemeSchema = z.object({
    email: z.string().email(),
    theme: z.string(),
});

type UpdateUserThemeInput = z.infer<typeof UpdateUserThemeSchema>;

const UpdateUserPhotoSchema = z.object({
    email: z.string().email(),
    photoData: z.any(),
});
type UpdateUserPhotoInput = z.infer<typeof UpdateUserPhotoSchema>;


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

export async function uploadFileToBaserow(file: File) {
    if (!areBaserowCredsConfigured()) {
        return { success: false, error: "Baserow is not configured." };
    }

    try {
        // Step 1: Get an upload URL from Baserow.
        // We only send the file name in the query param and the auth token.
        const getUrlResponse = await fetch(`${apiEndpoint}/api/user-files/upload-file/?name=${encodeURIComponent(file.name)}`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${dbToken}`,
            },
        });

        if (!getUrlResponse.ok) {
            const errorData = await getUrlResponse.json();
            console.error("Baserow get URL error data:", errorData);
            throw new Error(`Failed to get Baserow upload URL. Status: ${getUrlResponse.status}`);
        }
        
        const { url, ...uploadData } = await getUrlResponse.json();

        // Step 2: Upload the actual file to the URL provided
        const uploadResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
            },
            body: file,
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.text();
            console.error("Baserow upload error data:", errorData);
            throw new Error(`Failed to upload file to Baserow. Status: ${uploadResponse.status}`);
        }

        return { success: true, data: uploadData };
    } catch (error) {
        console.error("Baserow API Error in uploadFileToBaserow:", error);
        let message = 'An unknown error occurred during file upload.';
        if (error instanceof Error) {
            message = error.message;
        }
        return { success: false, error: message };
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
                "Photo URL": [{ url: photoURL }],
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

    const { email, photoData } = userData;
    
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
            body: JSON.stringify({ "Photo URL": [photoData] }),
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
