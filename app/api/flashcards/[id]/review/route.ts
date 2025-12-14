import { NextResponse } from 'next/server';
import { flashCardsDB } from '@/lib/flashcards-db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const card = await flashCardsDB.incrementReviewCount(parseInt(id));
    
    if (!card) {
      return NextResponse.json(
        { error: 'Thẻ ghi nhớ không tìm thấy' },
        { status: 404 }
      );
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Không thể cập nhật số lần ôn tập' },
      { status: 500 }
    );
  }
}
