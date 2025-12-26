import { NextResponse } from 'next/server';
import { flashCardsDB } from '@/lib/flashcards-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folder_id');
    
    let flashCards = await flashCardsDB.getAll();
    
    // Filter by folder if provided
    if (folderId) {
      const folderIdNum = parseInt(folderId);
      flashCards = flashCards.filter(card => card.folderId === folderIdNum);
    }
    
    // Create CSV header
    const csvHeader = 'word,pronunciation,meaning,example,image_url,category,difficulty';
    
    // Convert flashcards to CSV rows
    const csvRows = flashCards.map(card => {
      // Escape CSV values (handle commas, quotes, newlines)
      const escapeCSV = (value: string | null | undefined) => {
        if (!value) return '';
        const stringValue = String(value);
        // If value contains comma, quote, or newline, wrap in quotes and escape inner quotes
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };
      
      return [
        escapeCSV(card.word),
        escapeCSV(card.pronunciation),
        escapeCSV(card.meaning),
        escapeCSV(card.example),
        escapeCSV(card.imageUrl),
        escapeCSV(card.category),
        escapeCSV(card.difficulty)
      ].join(',');
    });
    
    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join('\n');
    
    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    
    // Generate filename
    const folderSuffix = folderId ? `_folder_${folderId}` : '_all';
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `flashcards${folderSuffix}_${timestamp}.csv`;
    
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    return new NextResponse(csvContent, { headers });
    
  } catch (error) {
    console.error('Export CSV error:', error);
    return NextResponse.json(
      { error: 'Failed to export flashcards' },
      { status: 500 }
    );
  }
}