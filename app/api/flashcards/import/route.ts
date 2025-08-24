import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { flashCardsDB } from '@/lib/flashcards-db';
import { FlashCard } from '@/lib/types';

interface CSVRow {
  word: string;
  meaning: string;
  example: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  folder_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const defaultFolderId = formData.get('folderId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Chưa cung cấp tập tin' },
        { status: 400 }
      );
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Tập tin phải là tập tin CSV' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const results = Papa.parse<CSVRow>(text, {
      header: true,
      skipEmptyLines: true,
      trimHeaders: true,
      transform: (value) => value.trim()
    });

    if (results.errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Lỗi phân tích tập tin CSV', 
          details: results.errors.map(err => err.message) 
        },
        { status: 400 }
      );
    }

    const validRows: CSVRow[] = [];
    const errors: string[] = [];

    // Validate each row
    results.data.forEach((row, index) => {
      const lineNumber = index + 2; // +2 because index starts at 0 and we have header row

      if (!row.word || !row.meaning || !row.example) {
        errors.push(`Dòng ${lineNumber}: Thiếu các trường bắt buộc (từ vựng, nghĩa, ví dụ)`);
        return;
      }

      // Validate difficulty if provided
      if (row.difficulty && !['easy', 'medium', 'hard'].includes(row.difficulty)) {
        errors.push(`Dòng ${lineNumber}: Mức độ khó không hợp lệ. Phải là 'dễ', 'trung bình', hoặc 'khó'`);
        return;
      }

      validRows.push(row);
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Xác thực thất bại', 
          details: errors 
        },
        { status: 400 }
      );
    }

    if (validRows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy dòng dữ liệu hợp lệ trong CSV' },
        { status: 400 }
      );
    }

    // Import flashcards
    const imported: FlashCard[] = [];
    const importErrors: string[] = [];

    for (const [index, row] of validRows.entries()) {
      try {
        const flashcardData = {
          word: row.word,
          meaning: row.meaning,
          example: row.example,
          category: row.category || null,
          difficulty: row.difficulty || 'medium' as const,
          folderId: row.folder_id ? parseInt(row.folder_id) : (defaultFolderId ? parseInt(defaultFolderId) : 3)
        };

        const flashcard = await flashCardsDB.create(flashcardData);
        imported.push(flashcard);
      } catch (error) {
        const lineNumber = index + 2;
        importErrors.push(`Dòng ${lineNumber}: Không thể tạo thẻ ghi nhớ - ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      total: validRows.length,
      errors: importErrors.length > 0 ? importErrors : undefined,
      flashcards: imported
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Không thể nhập tập tin CSV' },
      { status: 500 }
    );
  }
}