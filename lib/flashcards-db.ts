import { Prisma } from '@prisma/client';
import { FlashCard } from './types';
import prisma from './prisma';

export const flashCardsDB = {
  getAll: async (): Promise<FlashCard[]> => {
    return prisma.flashCard.findMany({
      orderBy: { createdAt: 'asc' },
    });
  },

  getById: async (id: number | string): Promise<FlashCard | null> => {
    return prisma.flashCard.findUnique({
      where: { id: Number(id) },
    });
  },

  create: async (data: Omit<FlashCard, 'id' | 'createdAt' | 'reviewCount'>): Promise<FlashCard> => {
    return prisma.flashCard.create({
      data: {
        word: data.word,
        pronunciation: data.pronunciation || null,
        imageUrl: data.imageUrl || null,
        meaning: data.meaning,
        example: data.example,
        category: data.category || null,
        folderId: data.folderId || 1,
        difficulty: data.difficulty,
        reviewCount: 0,
      },
    });
  },

  update: async (id: number | string, data: Partial<FlashCard>): Promise<FlashCard | null> => {
    const existing = await flashCardsDB.getById(id);
    if (!existing) return null;
    
    return prisma.flashCard.update({
      where: { id: Number(id) },
      data: {
        word: data.word ?? existing.word,
        pronunciation: data.pronunciation ?? existing.pronunciation ?? null,
        imageUrl: data.imageUrl ?? existing.imageUrl ?? null,
        meaning: data.meaning ?? existing.meaning,
        example: data.example ?? existing.example,
        category: data.category ?? existing.category ?? null,
        folderId: data.folderId ?? existing.folderId ?? 1,
        difficulty: (data.difficulty as FlashCard['difficulty']) ?? existing.difficulty,
      },
    });
  },

  delete: async (id: number | string): Promise<boolean> => {
    try {
      await prisma.flashCard.delete({
        where: { id: Number(id) },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return false;
      }
      throw error;
    }
  },

  incrementReviewCount: async (id: number | string): Promise<FlashCard | null> => {
    try {
      return await prisma.flashCard.update({
        where: { id: Number(id) },
        data: {
          reviewCount: { increment: 1 },
          lastReviewed: new Date(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }
      throw error;
    }
  }
};
