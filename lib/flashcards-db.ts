import { FlashCard } from './types';
import pool from './db';
import { initializeDatabase } from './init-db';

let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

export const flashCardsDB = {
  getAll: async (): Promise<FlashCard[]> => {
    await ensureDbInitialized();
    const result = await pool.query(
      'SELECT * FROM flashcards ORDER BY created_at DESC'
    );
    return result.rows.map(row => ({
      id: row.id,
      word: row.word,
      imageUrl: row.image_url,
      meaning: row.meaning,
      example: row.example,
      category: row.category,
      difficulty: row.difficulty,
      createdAt: new Date(row.created_at),
      lastReviewed: row.last_reviewed ? new Date(row.last_reviewed) : undefined,
      reviewCount: row.review_count
    }));
  },

  getById: async (id: string): Promise<FlashCard | null> => {
    await ensureDbInitialized();
    const result = await pool.query(
      'SELECT * FROM flashcards WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      word: row.word,
      imageUrl: row.image_url,
      meaning: row.meaning,
      example: row.example,
      category: row.category,
      difficulty: row.difficulty,
      createdAt: new Date(row.created_at),
      lastReviewed: row.last_reviewed ? new Date(row.last_reviewed) : undefined,
      reviewCount: row.review_count
    };
  },

  create: async (data: Omit<FlashCard, 'id' | 'createdAt' | 'reviewCount'>): Promise<FlashCard> => {
    await ensureDbInitialized();
    const id = Date.now().toString();
    const createdAt = new Date();
    
    await pool.query(
      'INSERT INTO flashcards (id, word, image_url, meaning, example, category, difficulty, created_at, review_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [id, data.word, data.imageUrl || null, data.meaning, data.example, data.category || null, data.difficulty, createdAt, 0]
    );
    
    return {
      ...data,
      id,
      createdAt,
      reviewCount: 0
    };
  },

  update: async (id: string, data: Partial<FlashCard>): Promise<FlashCard | null> => {
    await ensureDbInitialized();
    const existing = await flashCardsDB.getById(id);
    if (!existing) return null;
    
    await pool.query(
      'UPDATE flashcards SET word = $2, image_url = $3, meaning = $4, example = $5, category = $6, difficulty = $7 WHERE id = $1',
      [id, data.word || existing.word, data.imageUrl || existing.imageUrl || null, data.meaning || existing.meaning, data.example || existing.example, data.category || existing.category || null, data.difficulty || existing.difficulty]
    );
    
    return await flashCardsDB.getById(id);
  },

  delete: async (id: string): Promise<boolean> => {
    await ensureDbInitialized();
    const result = await pool.query(
      'DELETE FROM flashcards WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  },

  incrementReviewCount: async (id: string): Promise<FlashCard | null> => {
    await ensureDbInitialized();
    const lastReviewed = new Date();
    const result = await pool.query(
      'UPDATE flashcards SET review_count = review_count + 1, last_reviewed = $2 WHERE id = $1 RETURNING *',
      [id, lastReviewed]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      word: row.word,
      imageUrl: row.image_url,
      meaning: row.meaning,
      example: row.example,
      category: row.category,
      difficulty: row.difficulty,
      createdAt: new Date(row.created_at),
      lastReviewed: new Date(row.last_reviewed),
      reviewCount: row.review_count
    };
  }
};