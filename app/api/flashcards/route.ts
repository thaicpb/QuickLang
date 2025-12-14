import { NextResponse } from 'next/server';
import { flashCardsDB } from '@/lib/flashcards-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folder_id');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    // If limit is provided, use paginated response to avoid loading too many records
    if (limitParam !== null || offsetParam !== null) {
      const limit = Math.max(1, parseInt(limitParam || '30', 10));
      const offset = Math.max(0, parseInt(offsetParam || '0', 10));
      const { items, total, counts } = await flashCardsDB.getPaged({
        limit,
        offset,
        folderId: folderId ? parseInt(folderId) : undefined,
      });
      return NextResponse.json({ items, total, counts });
    }

    const flashCards = await flashCardsDB.getAll();
    const filteredCards = folderId
      ? flashCards.filter(card => card.folderId === parseInt(folderId))
      : flashCards;
    return NextResponse.json(filteredCards);
  } catch (error) {
    return NextResponse.json(
      { error: 'Không thể lấy danh sách thẻ ghi nhớ' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { word, pronunciation, imageUrl, meaning, example, category, difficulty, folderId } = body;

    if (!word || !meaning || !example) {
      return NextResponse.json(
        { error: 'Từ vựng, nghĩa và ví dụ là bắt buộc' },
        { status: 400 }
      );
    }

    const newCard = await flashCardsDB.create({
      word,
      pronunciation,
      imageUrl,
      meaning,
      example,
      category,
      difficulty: difficulty || 'medium',
      folderId: folderId || 1, // Default to General folder
      lastReviewed: undefined
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Không thể tạo thẻ ghi nhớ' },
      { status: 500 }
    );
  }
}
