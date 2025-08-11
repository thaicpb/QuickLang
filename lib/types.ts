export type FlashCard = {
  id: string;
  word: string;
  imageUrl?: string;
  meaning: string;
  example: string;
  category?: string;
  createdAt: Date;
  lastReviewed?: Date;
  reviewCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type FlashCardFormData = {
  word: string;
  imageUrl?: string;
  meaning: string;
  example: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
