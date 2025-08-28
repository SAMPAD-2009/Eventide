
"use server"

import { z } from 'zod';

const CreateUserSchema = z.object({
    email: z.string().email(),
    theme: z.string(),
    photoURL: z.string().url(),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

const UpdateUserThemeSchema = z.object({
    email: z.string().email(),
    theme: z.string(),
});

type UpdateUserThemeInput = z.infer<typeof UpdateUserThemeSchema>;

const apiEndpoint = process.env.BASEROW_API_ENDPOINT || 'https://api.baserow.io';
const dbToken = process.env.BASEROW_DB_TOKEN;
const tableId = process.env.BASEROW_USER_TABLE_ID;

function areBaserowCredsConfigured() {
    if (!apiEndpoint || !dbToken || !tableId || dbToken.startsWith("YOUR_") || tableId.startsWith("YOUR_")) {
        console.warn("Baserow environment variables are not configured. Skipping Baserow operation. Please update your .env file.");
        return false;
    }
    return true;
}

export async function createUserInBaserow(userData: CreateUserInput) {
    if (!areBaserowCredsConfigured()) {
        return { success: true, message: "Skipped Baserow user creation (dev mode)." };
    }

    const { email, theme, photoURL } = userData;

    try {
        const response = await fetch(`${apiEndpoint}/api/database/rows/table/${tableId}/?user_field_names=true`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${dbToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "Email": email,
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
        // 1. Find the row ID for the given email
        const getRowUrl = new URL(`${apiEndpoint}/api/database/rows/table/${tableId}/`);
        getRowUrl.searchParams.append('user_field_names', 'true');
        getRowUrl.searchParams.append('filters', `{"filter_type":"AND","filters":[{"type":"equal","field":"Email","value":"${email}"}]}`);
        
        const getResponse = await fetch(getRowUrl.toString(), {
            method: 'GET',
            headers: { 'Authorization': `Token ${dbToken}` },
        });

        if (!getResponse.ok) {
            throw new Error(`Failed to find user in Baserow. Status: ${getResponse.status}`);
        }

        const { results } = await getResponse.json();
        if (results.length === 0) {
            throw new Error(`User with email ${email} not found in Baserow.`);
        }
        const rowId = results[0].id;

        // 2. Update the row with the new theme
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
