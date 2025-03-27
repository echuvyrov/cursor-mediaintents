import OpenAI from 'openai';
import { error } from '@sveltejs/kit';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
            encoding_format: "float"
        });

        return response.data[0].embedding;
    } catch (e) {
        console.error('Error generating embedding:', e);
        throw error(500, 'Failed to generate embedding');
    }
} 