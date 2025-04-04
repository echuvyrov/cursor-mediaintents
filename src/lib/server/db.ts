import pool from './db-config';
import { generateEmbedding } from './openai-service';

export interface MediaIntent {
    id: string;
    intent: string;
    title: string;
    mediaType: 'Photo' | 'Video';
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
            'SELECT id, intent, title, media_type as "mediaType", "order", media_url as "mediaUrl", created_at as "createdAt", updated_at as "updatedAt", intent_embedding as "intentEmbedding" FROM media_intents ORDER BY "order"'
        );
        return result.rows;
    },
    
    getById: async (id: string) => {
        const result = await pool.query(
            'SELECT id, intent, title, media_type as "mediaType", "order", media_url as "mediaUrl", created_at as "createdAt", updated_at as "updatedAt", intent_embedding as "intentEmbedding" FROM media_intents WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    },
    
    create: async (intent: Omit<MediaIntent, 'id' | 'createdAt' | 'updatedAt' | 'intentEmbedding'>) => {
        console.log('Creating intent with data:', intent);
        // Generate embedding for the intent text
        const embedding = await generateEmbedding(intent.intent);
        const formattedEmbedding = formatEmbeddingForPg(embedding);
        console.log('Generated embedding:', formattedEmbedding);
        
        const result = await pool.query(
            'INSERT INTO media_intents (intent, title, media_type, "order", media_url, intent_embedding) VALUES ($1, $2, $3, $4, $5, $6::vector) RETURNING id, intent, title, media_type as "mediaType", "order", media_url as "mediaUrl", created_at as "createdAt", updated_at as "updatedAt", intent_embedding as "intentEmbedding"',
            [intent.intent, intent.title, intent.mediaType, intent.order, intent.mediaUrl, formattedEmbedding]
        );
        console.log('Create result:', result.rows[0]);
        return result.rows[0];
    },
    
    update: async (id: string, updates: Partial<Omit<MediaIntent, 'id' | 'createdAt' | 'updatedAt'>>) => {
        // First get the current intent to ensure we have all fields
        const currentIntent = await db.getById(id);
        if (!currentIntent) {
            return null;
        }

        console.log('currentIntent ', currentIntent);
        // Merge current values with updates, excluding system fields
        const mergedUpdates = {
            intent: currentIntent.intent,
            title: currentIntent.title,
            mediaType: currentIntent.mediaType,
            order: currentIntent.order,
            mediaUrl: currentIntent.mediaUrl,
            ...updates
        };

        // If intent is being updated, generate new embedding
        let embedding;
        if (updates.intent) {
            embedding = await generateEmbedding(updates.intent);
        }
        
        // Filter out undefined values and create the update query
        const updateFields = Object.entries(mergedUpdates)
            .filter(([_, value]) => value !== undefined)
            .reduce((acc, [key, value], index) => {
                const column = key === 'mediaUrl' ? 'media_url' : 
                             key === 'mediaType' ? 'media_type' : key;
                acc.setClause.push(`${column} = $${index + 2}`);
                acc.values.push(value);
                return acc;
            }, { setClause: [] as string[], values: [] as any[] });

        // Add embedding if it was generated
        if (embedding) {
            updateFields.setClause.push('intent_embedding = $' + (updateFields.values.length + 2) + '::vector');
            updateFields.values.push(formatEmbeddingForPg(embedding));
        }
        
        const result = await pool.query(
            `UPDATE media_intents SET ${updateFields.setClause.join(', ')} WHERE id = $1 RETURNING id, intent, title, media_type as "mediaType", "order", media_url as "mediaUrl", created_at as "createdAt", updated_at as "updatedAt", intent_embedding as "intentEmbedding"`,
            [id, ...updateFields.values]
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
            `SELECT id, intent, title, media_type as "mediaType", "order", media_url as "mediaUrl", 
                    created_at as "createdAt", updated_at as "updatedAt",
                    1 - (intent_embedding <=> $1::vector) as similarity
             FROM media_intents 
             WHERE intent_embedding IS NOT NULL
             AND 1 - (intent_embedding <=> $1::vector) >= $3
             ORDER BY "order", intent_embedding <=> $1::vector
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