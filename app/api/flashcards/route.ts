import {NextResponse} from 'next/server'
import {flashCardsDB} from '@/lib/flashcards-db'

export async function GET() {
  try {
    const flashCards = await flashCardsDB.getAll()
    return NextResponse.json(flashCards)
  } catch {
    return NextResponse.json(
      {error: 'Failed to fetch flashcards'},
      {status: 500},
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {word, imageUrl, meaning, example, category, difficulty} = body

    if (!word || !meaning || !example) {
      return NextResponse.json(
        {error: 'Word, meaning, and example are required'},
        {status: 400},
      )
    }

    const newCard = await flashCardsDB.create({
      word,
      imageUrl,
      meaning,
      example,
      category,
      difficulty: difficulty || 'medium',
      lastReviewed: undefined,
    })

    return NextResponse.json(newCard, {status: 201})
  } catch {
    return NextResponse.json(
      {error: 'Failed to create flashcard'},
      {status: 500},
    )
  }
}
