-- Create the flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    image_url TEXT,
    meaning TEXT NOT NULL,
    example TEXT NOT NULL,
    category VARCHAR(100),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    review_count INTEGER DEFAULT 0
);

-- Insert sample data
INSERT INTO flashcards (word, image_url, meaning, example, category, difficulty, created_at, review_count) VALUES
    ('Serendipity', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400', 'The occurrence of finding pleasant things by chance', 'Finding that coffee shop was pure serendipity - it became my favorite place to work.', 'Advanced Vocabulary', 'hard', '2024-01-01', 0),
    ('Ephemeral', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400', 'Lasting for a very short time', 'The beauty of cherry blossoms is ephemeral, lasting only a few weeks each spring.', 'Advanced Vocabulary', 'medium', '2024-01-02', 0),
    ('Resilient', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Able to recover quickly from difficult conditions', 'Despite many setbacks, she remained resilient and achieved her goals.', 'Personal Development', 'easy', '2024-01-03', 0);