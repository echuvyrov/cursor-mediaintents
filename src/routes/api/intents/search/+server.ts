import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Or a specific domain
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key'
};
  
export const GET: RequestHandler = async ({ request, url }) => {
    try {

        const query = url.searchParams.get('q');
        const limit = parseInt(url.searchParams.get('limit') || '5');
        const threshold = parseFloat(url.searchParams.get('threshold') || '0.75');

        if (!query) {
            return new Response('Query parameter "q" is required', { status: 400, headers: corsHeaders });
        }

        const results = await db.findSimilarIntentsByText(query, limit, threshold);
        
        return new Response(JSON.stringify({
            query,
            results: results.map(r => ({
                ...r,
                similarity: parseFloat(r.similarity.toFixed(4))
            }))
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });
    } catch (error) {
        console.error('Error searching intents:', error);
        return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
    }
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { query, limit = 5, threshold = 0.75 } = body;

        if (!query) {
            return new Response('Body must include a "query" field', { status: 400, headers: corsHeaders });
        }

        const results = await db.findSimilarIntentsByText(query, limit, threshold);
        
        return new Response(JSON.stringify({
            query,
            results: results.map(r => ({
                ...r,
                similarity: parseFloat(r.similarity.toFixed(4))
            }))
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });
    } catch (error) {
        console.error('Error searching intents:', error);
        return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
    }
};
