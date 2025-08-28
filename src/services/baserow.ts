
"use server"

import { z } from 'zod';

const CreateUserSchema = z.object({
    email: z.string().email(),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;


export async function createUserInBaserow(userData: CreateUserInput) {
    const { email } = userData;

    const apiEndpoint = process.env.BASEROW_API_ENDPOINT;
    const dbToken = process.env.BASEROW_DB_TOKEN;
    const tableId = process.env.BASEROW_USER_TABLE_ID;

    if (!apiEndpoint || !dbToken || !tableId || dbToken.startsWith("YOUR_") || tableId.startsWith("YOUR_")) {
        console.warn("Baserow environment variables are not configured. Skipping user creation in Baserow. Please update your .env file.");
        return { success: true, message: "Skipped Baserow user creation (dev mode)." };
    }

    try {
        const response = await fetch(`${apiEndpoint}/api/database/rows/table/${tableId}/?user_field_names=true`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${dbToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "Email": email,
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
