import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const query = url.searchParams.get('q');
        const limit = parseInt(url.searchParams.get('limit') || '5');
        const threshold = parseFloat(url.searchParams.get('threshold') || '0.75');

        if (!query) {
            return new Response('Query parameter "q" is required', { status: 400 });
        }

        const results = await db.findSimilarIntentsByText(query, limit, threshold);
        
        return json({
            query,
            results: results.map(r => ({
                ...r,
                similarity: parseFloat(r.similarity.toFixed(4)) // Format similarity to 4 decimal places
            }))
        });
    } catch (error) {
        console.error('Error searching intents:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { query, limit = 5, threshold = 0.75 } = body;

        if (!query) {
            return new Response('Body must include a "query" field', { status: 400 });
        }

        const results = await db.findSimilarIntentsByText(query, limit, threshold);
        
        return json({
            query,
            results: results.map(r => ({
                ...r,
                similarity: parseFloat(r.similarity.toFixed(4)) // Format similarity to 4 decimal places
            }))
        });
    } catch (error) {
        console.error('Error searching intents:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}; 