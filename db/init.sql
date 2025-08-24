-- Create the flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    image_url TEXT,
    meaning TEXT NOT NULL,
    example TEXT NOT NULL,
    category VARCHAR(100),
    language VARCHAR(50) DEFAULT 'english',
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    review_count INTEGER DEFAULT 0
);

-- Insert sample data
INSERT INTO flashcards (word, image_url, meaning, example, category, difficulty, created_at, review_count) VALUES
    ('Xin chào', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400', 'Lời chào thân thiện khi gặp ai đó', 'Khi gặp bạn bè, tôi luôn nói "Xin chào" một cách vui vẻ.', 'Giao tiếp cơ bản', 'easy', '2024-01-01', 0),
    ('Cảm ơn', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400', 'Lời bày tỏ lòng biết ơn', 'Tôi nói "Cảm ơn" với người bán hàng sau khi mua đồ.', 'Giao tiếp cơ bản', 'easy', '2024-01-02', 0),
    ('Kiên trì', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Khả năng duy trì nỗ lực bền bỉ dù gặp khó khăn', 'Nhờ sự kiên trì không ngừng, cô ấy đã đạt được ước mơ của mình.', 'Phát triển bản thân', 'medium', '2024-01-03', 0);