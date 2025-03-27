import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ params }) => {
    try {
        const intent = await db.getById(params.id);
        if (!intent) {
            return new Response('Not found', { status: 404 });
        }
        return json(intent);
    } catch (error) {
        console.error('Error fetching intent:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const data = await request.json();
        const updatedIntent = await db.update(params.id, data);
        if (!updatedIntent) {
            return new Response('Not found', { status: 404 });
        }
        return json(updatedIntent);
    } catch (error) {
        console.error('Error updating intent:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ params }) => {
    try {
        const success = await db.delete(params.id);
        if (!success) {
            return new Response('Not found', { status: 404 });
        }
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting intent:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}; 