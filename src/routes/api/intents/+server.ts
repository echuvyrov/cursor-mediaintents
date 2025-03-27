import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async () => {
    try {
        const intents = await db.getAll();
        return json(intents);
    } catch (error) {
        console.error('Error fetching intents:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        const data = await request.json();
        const newIntent = await db.create(data);
        return json(newIntent);
    } catch (error) {
        console.error('Error creating intent:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}; 