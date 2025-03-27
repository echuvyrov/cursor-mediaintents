import pool from './db-config';
import { generateEmbedding } from './openai-service';

export interface MediaIntent {
    id: string;
    intent: string;
    order: number;
    mediaUrl: string;
    createdAt: Date;
    updatedAt: Date;
    intentEmbedding?: number[] | string;  // Can be either raw numbers or formatted string
}

// Helper function to format embedding array for PostgreSQL vector type
function formatEmbeddingForPg(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
}

export const db = {
    getAll: async () => {
        const result = await pool.query(
            'SELECT id, intent, "order", media_url as "mediaUrl", created_at as "createdAt", updated_at as "updatedAt", intent_embedding as "intentEmbedding" FROM media_intents ORDER BY "order"'
        );
        return result.rows;
    },
    
    getById: async (id: string) => {
        const result = await pool.query(
            'SELECT id, intent, "order", media_url as "mediaUrl", created_at as "createdAt", updated_at as "updatedAt", intent_embedding as "intentEmbedding" FROM media_intents WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    },
    
    create: async (intent: Omit<MediaIntent, 'id' | 'createdAt' | 'updatedAt' | 'intentEmbedding'>) => {
        // Generate embedding for the intent text
        const embedding = await generateEmbedding(intent.intent);
        const formattedEmbedding = formatEmbeddingForPg(embedding);
        
        const result = await pool.query(
            'INSERT INTO media_intents (intent, "order", media_url, intent_embedding) VALUES ($1, $2, $3, $4::vector) RETURNING id, intent, "order", media_url as "mediaUrl", created_at as "createdAt", updated_at as "updatedAt", intent_embedding as "intentEmbedding"',
            [intent.intent, intent.order, intent.mediaUrl, formattedEmbedding]
        );
        return result.rows[0];
    },
    
    update: async (id: string, updates: Partial<Omit<MediaIntent, 'id' | 'createdAt' | 'updatedAt'>>) => {
        // If intent is being updated, generate new embedding
        let embedding;
        let finalUpdates = { ...updates };
        if (updates.intent) {
            embedding = await generateEmbedding(updates.intent);
            finalUpdates = { 
                ...updates, 
                intentEmbedding: formatEmbeddingForPg(embedding)
            };
        }
        
        const setClause = Object.keys(finalUpdates)
            .map((key, index) => {
                const column = key === 'mediaUrl' ? 'media_url' : 
                             key === 'intentEmbedding' ? 'intent_embedding' : key;
                return `${column} = ${key === 'intentEmbedding' ? `$${index + 2}::vector` : `$${index + 2}`}`;
            })
            .join(', ');
        
        const values = Object.values(finalUpdates);
        
        const result = await pool.query(
            `UPDATE media_intents SET ${setClause} WHERE id = $1 RETURNING id, intent, "order", media_url as "mediaUrl", created_at as "createdAt", updated_at as "updatedAt", intent_embedding as "intentEmbedding"`,
            [id, ...values]
        );
        
        return result.rows[0] || null;
    },
    
    delete: async (id: string) => {
        const result = await pool.query(
            'DELETE FROM media_intents WHERE id = $1 RETURNING id',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    },

    findSimilarIntents: async (embedding: number[], limit: number = 5, similarityThreshold: number = 0.75) => {
        const formattedEmbedding = formatEmbeddingForPg(embedding);
        const result = await pool.query(
            `SELECT id, intent, "order", media_url as "mediaUrl", 
                    created_at as "createdAt", updated_at as "updatedAt",
                    1 - (intent_embedding <=> $1::vector) as similarity
             FROM media_intents 
             WHERE intent_embedding IS NOT NULL
             AND 1 - (intent_embedding <=> $1::vector) >= $3
             ORDER BY intent_embedding <=> $1::vector
             LIMIT $2`,
            [formattedEmbedding, limit, similarityThreshold]
        );
        return result.rows;
    },

    // New convenience method to find similar intents by text
    findSimilarIntentsByText: async (text: string, limit: number = 5, similarityThreshold: number = 0.75) => {
        const embedding = await generateEmbedding(text);
        return db.findSimilarIntents(embedding, limit, similarityThreshold);
    }
}; 