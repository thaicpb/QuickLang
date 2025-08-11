import pool from './db';

export async function initializeDatabase() {
  try {
    // Folders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(20) DEFAULT '#6366f1',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Flashcards table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id SERIAL PRIMARY KEY,
        word VARCHAR(255) NOT NULL,
        image_url TEXT,
        meaning TEXT NOT NULL,
        example TEXT NOT NULL,
        category VARCHAR(100),
        folder_id INTEGER REFERENCES folders(id),
        difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_reviewed TIMESTAMP WITH TIME ZONE,
        review_count INTEGER DEFAULT 0
      )
    `);

    // Migration: convert legacy varchar id to integer sequence-backed id
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'flashcards' AND column_name = 'id' AND data_type <> 'integer'
        ) THEN
          ALTER TABLE flashcards ALTER COLUMN id DROP DEFAULT;
          ALTER TABLE flashcards ALTER COLUMN id TYPE INTEGER USING id::integer;
          CREATE SEQUENCE IF NOT EXISTS flashcards_id_seq;
          SELECT setval('flashcards_id_seq', COALESCE((SELECT MAX(id) FROM flashcards), 0) + 1, false);
          ALTER TABLE flashcards ALTER COLUMN id SET DEFAULT nextval('flashcards_id_seq');
        END IF;
      END
      $$;
    `);

    // Add folder_id column if database already existed without it
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'flashcards' AND column_name = 'folder_id'
        ) THEN
          ALTER TABLE flashcards
          ADD COLUMN folder_id INTEGER REFERENCES folders(id);
        END IF;
      END
      $$;
    `);

    // Ensure at least one default folder
    const folderCountResult = await pool.query('SELECT COUNT(*) FROM folders');
    const folderCount = parseInt(folderCountResult.rows[0].count);

    if (folderCount === 0) {
      await pool.query(
        `INSERT INTO folders (name, description, color) VALUES 
          ('General', 'Thư mục mặc định', '#6366f1')
         RETURNING id`
      );
      console.log('Created default folder');
    }

    // Get default folder id for seeding flashcards
    const defaultFolderResult = await pool.query(
      'SELECT id FROM folders ORDER BY id ASC LIMIT 1'
    );
    const defaultFolderId = defaultFolderResult.rows[0]?.id || 1;

    const result = await pool.query('SELECT COUNT(*) FROM flashcards');
    const count = parseInt(result.rows[0].count);

    if (count === 0) {
      await pool.query(
        `
        INSERT INTO flashcards (word, image_url, meaning, example, category, folder_id, difficulty, created_at, review_count) VALUES
        ('Serendipity', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400', 'The occurrence of finding pleasant things by chance', 'Finding that coffee shop was pure serendipity - it became my favorite place to work.', 'Advanced Vocabulary', $1, 'hard', '2024-01-01', 0),
        ('Ephemeral', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400', 'Lasting for a very short time', 'The beauty of cherry blossoms is ephemeral, lasting only a few weeks each spring.', 'Advanced Vocabulary', $1, 'medium', '2024-01-02', 0),
        ('Resilient', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Able to recover quickly from difficult conditions', 'Despite many setbacks, she remained resilient and achieved her goals.', 'Personal Development', $1, 'easy', '2024-01-03', 0)
      `,
        [defaultFolderId]
      );
      console.log('Database initialized with sample data');
    }

    console.log('Database connection established and tables created');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
