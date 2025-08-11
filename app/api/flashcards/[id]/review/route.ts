import { NextResponse } from 'next/server';
import { flashCardsDB } from '@/lib/flashcards-db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const card = await flashCardsDB.incrementReviewCount(parseInt(params.id));
    
    if (!card) {
      return NextResponse.json(
        { error: 'Thẻ ghi nhớ không tìm thấy' },
        { status: 404 }
      );
    }

    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      { error: 'Không thể cập nhật số lần ôn tập' },
      { status: 500 }
    );
  }
}