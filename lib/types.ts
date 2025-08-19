export interface FlashCard {
  id: number;
  word: string;
  imageUrl?: string;
  meaning: string;
  example: string;
  category?: string;
  folderId?: number;
  createdAt: Date;
  lastReviewed?: Date;
  reviewCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface FlashCardFormData {
  word: string;
  imageUrl?: string;
  meaning: string;
  example: string;
  category?: string;
  folderId?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Folder {
  id: number;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  flashcardCount?: number;
}