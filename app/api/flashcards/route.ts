import { NextResponse } from 'next/server';
import { flashCardsDB } from '@/lib/flashcards-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folder_id');
    
    const flashCards = await flashCardsDB.getAll();
    
    // Filter by folder_id if specified
    const filteredCards = folderId 
      ? flashCards.filter(card => card.folderId === parseInt(folderId))
      : flashCards;
    
    return NextResponse.json(filteredCards);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { word, imageUrl, meaning, example, category, difficulty, folderId } = body;

    if (!word || !meaning || !example) {
      return NextResponse.json(
        { error: 'Word, meaning, and example are required' },
        { status: 400 }
      );
    }

    const newCard = await flashCardsDB.create({
      word,
      imageUrl,
      meaning,
      example,
      category,
      difficulty: difficulty || 'medium',
      folderId: folderId || 3, // Default to General folder
      lastReviewed: undefined
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create flashcard' },
      { status: 500 }
    );
  }
}