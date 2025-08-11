import {type FlashCard} from './types'

const flashCards: FlashCard[] = [
  {
    id: '1',
    word: 'Serendipity',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400',
    meaning: 'The occurrence of finding pleasant things by chance',
    example: 'Finding that coffee shop was pure serendipity - it became my favorite place to work.',
    category: 'Advanced Vocabulary',
    createdAt: new Date('2024-01-01'),
    reviewCount: 0,
    difficulty: 'hard',
  },
  {
    id: '2',
    word: 'Ephemeral',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    meaning: 'Lasting for a very short time',
    example: 'The beauty of cherry blossoms is ephemeral, lasting only a few weeks each spring.',
    category: 'Advanced Vocabulary',
    createdAt: new Date('2024-01-02'),
    reviewCount: 0,
    difficulty: 'medium',
  },
  {
    id: '3',
    word: 'Resilient',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    meaning: 'Able to recover quickly from difficult conditions',
    example: 'Despite many setbacks, she remained resilient and achieved her goals.',
    category: 'Personal Development',
    createdAt: new Date('2024-01-03'),
    reviewCount: 0,
    difficulty: 'easy',
  },
]

export const flashCardsDB = {
  async getAll(): Promise<FlashCard[]> {
    return [...flashCards].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },

  async getById(id: string): Promise<FlashCard | undefined> {
    return flashCards.find(card => card.id === id) || null
  },

  async create(data: Omit<FlashCard, 'id' | 'createdAt' | 'reviewCount'>): Promise<FlashCard> {
    const newCard: FlashCard = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      reviewCount: 0,
    }
    flashCards.push(newCard)
    return newCard
  },

  async update(id: string, data: Partial<FlashCard>): Promise<FlashCard | undefined> {
    const index = flashCards.findIndex(card => card.id === id)
    if (index === -1) {
      return null
    }

    flashCards[index] = {
      ...flashCards[index],
      ...data,
      id: flashCards[index].id,
      createdAt: flashCards[index].createdAt,
    }
    return flashCards[index]
  },

  async delete(id: string): Promise<boolean> {
    const index = flashCards.findIndex(card => card.id === id)
    if (index === -1) {
      return false
    }

    flashCards.splice(index, 1)
    return true
  },

  async incrementReviewCount(id: string): Promise<FlashCard | undefined> {
    const card = flashCards.find(c => c.id === id)
    if (!card) {
      return null
    }

    card.reviewCount++
    card.lastReviewed = new Date()
    return card
  },
}
