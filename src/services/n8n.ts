
"use server";

import type { Event } from '@/lib/types';

export async function fetchEventsFromN8n(email: string): Promise<Event[]> {
    const webhookUrl = process.env.N8N_EVENTS_WEBHOOK_URL;
    if (!webhookUrl || webhookUrl.startsWith("YOUR")) {
        console.warn("n8n events webhook URL is not configured. Skipping event fetch.");
        return [];
    }

    try {
        const url = new URL(webhookUrl);
        url.searchParams.append('email', email);
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Explicitly disable caching to ensure the webhook is always triggered.
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to fetch events from n8n:", response.status, errorText);
            throw new Error(`Failed to fetch events from n8n. Status: ${response.status}`);
        }

        const events = await response.json();
        
        // It's good practice to ensure the response is an array.
        if (!Array.isArray(events)) {
            console.error("n8n webhook did not return an array of events.");
            return [];
        }

        return events as Event[];

    } catch (error) {
        console.error("Error calling n8n webhook:", error);
        return [];
    }
}
