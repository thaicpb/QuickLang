import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'quicklang',
  user: 'postgres',
  password: 'quicklang123',
});

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT f.*, 
             COUNT(fc.id) as flashcard_count
      FROM folders f
      LEFT JOIN flashcards fc ON f.id = fc.folder_id
      GROUP BY f.id, f.name, f.description, f.color, f.created_at
      ORDER BY f.created_at ASC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
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
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO folders (name, description, color) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, color || '#6366f1']
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}