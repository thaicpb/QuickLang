import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const folderId = params.id;
    
    const result = await pool.query(
      'SELECT * FROM folders WHERE id = $1',
      [folderId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Thư mục không tìm thấy' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
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
  { params }: { params: { id: string } }
) {
  try {
    const folderId = params.id;
    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Tên thư mục là bắt buộc' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'UPDATE folders SET name = $1, description = $2, color = $3 WHERE id = $4 RETURNING *',
      [name, description, color, folderId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Thư mục không tìm thấy' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
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
  { params }: { params: { id: string } }
) {
  try {
    const folderId = params.id;
    
    // Check if folder has flashcards
    const flashcardsCheck = await pool.query(
      'SELECT COUNT(*) FROM flashcards WHERE folder_id = $1',
      [folderId]
    );
    
    if (parseInt(flashcardsCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa thư mục có chứa thẻ ghi nhớ. Vui lòng di chuyển hoặc xóa thẻ ghi nhớ trước.' },
        { status: 400 }
      );
    }
    
    const result = await pool.query(
      'DELETE FROM folders WHERE id = $1 RETURNING *',
      [folderId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Thư mục không tìm thấy' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Xóa thư mục thành công' });
  } catch (error) {
    console.error('Failed to delete folder:', error);
    return NextResponse.json(
      { error: 'Không thể xóa thư mục' },
      { status: 500 }
    );
  }
}