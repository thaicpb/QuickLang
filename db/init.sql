-- Folders table
CREATE TABLE IF NOT EXISTS folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    image_url TEXT,
    meaning TEXT NOT NULL,
    example TEXT NOT NULL,
    category VARCHAR(100),
    language VARCHAR(50) DEFAULT 'english',
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    folder_id INTEGER REFERENCES folders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    review_count INTEGER DEFAULT 0
);
