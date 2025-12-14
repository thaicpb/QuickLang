import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const folders = await prisma.folder.findMany({
      include: {
        _count: { select: { flashcards: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    
    const mapped = folders.map(folder => ({
      ...folder,
      flashcardCount: folder._count.flashcards,
      flashcard_count: undefined,
      _count: undefined,
    }));
    
    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to fetch folders:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách thư mục' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Tên thư mục là bắt buộc' },
        { status: 400 }
      );
    }

    const result = await prisma.folder.create({
      data: {
        name,
        description: description || null,
        color: color || '#6366f1',
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create folder:', error);
    return NextResponse.json(
      { error: 'Không thể tạo thư mục' },
      { status: 500 }
    );
  }
}
