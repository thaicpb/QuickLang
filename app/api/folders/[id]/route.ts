import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const folderId = Number(id);
    
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });
    
    if (!folder) {
      return NextResponse.json(
        { error: 'Thư mục không tìm thấy' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(folder);
  } catch (error) {
    console.error('Failed to fetch folder:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thư mục' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const folderId = Number(id);
    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Tên thư mục là bắt buộc' },
        { status: 400 }
      );
    }

    try {
      const result = await prisma.folder.update({
        where: { id: folderId },
        data: { name, description, color },
      });
      return NextResponse.json(result);
    } catch (error) {
      console.error('Folder update not found:', error);
      return NextResponse.json(
        { error: 'Thư mục không tìm thấy' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Failed to update folder:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật thư mục' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const folderId = Number(id);

    const existing = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Thư mục không tìm thấy' },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction([
      prisma.flashCard.deleteMany({ where: { folderId } }),
      prisma.folder.delete({ where: { id: folderId } }),
    ]);

    return NextResponse.json({ 
      message: 'Xóa thư mục và tất cả thẻ ghi nhớ thành công',
      deletedFolder: existing,
      deletedFlashcards: result[0].count,
    });
  } catch (error) {
    console.error('Failed to delete folder:', error);
    return NextResponse.json(
      { error: 'Không thể xóa thư mục' },
      { status: 500 }
    );
  }
}
