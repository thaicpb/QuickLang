import { NextResponse } from 'next/server';
import { flashCardsDB } from '@/lib/flashcards-db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const card = await flashCardsDB.getById(parseInt(params.id));
    
    if (!card) {
      return NextResponse.json(
        { error: 'Thẻ ghi nhớ không tìm thấy' },
        { status: 404 }
      );
    }

    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      { error: 'Không thể lấy thẻ ghi nhớ' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedCard = await flashCardsDB.update(parseInt(params.id), body);

    if (!updatedCard) {
      return NextResponse.json(
        { error: 'Thẻ ghi nhớ không tìm thấy' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCard);
  } catch (error) {
    return NextResponse.json(
      { error: 'Không thể cập nhật thẻ ghi nhớ' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await flashCardsDB.delete(parseInt(params.id));

    if (!deleted) {
      return NextResponse.json(
        { error: 'Thẻ ghi nhớ không tìm thấy' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Không thể xóa thẻ ghi nhớ' },
      { status: 500 }
    );
  }
}