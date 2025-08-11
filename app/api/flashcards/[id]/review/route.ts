import {NextResponse} from 'next/server'
import {flashCardsDB} from '@/lib/flashcards-db'

export async function POST(
  request: Request,
  {params}: {params: {id: string}},
) {
  try {
    const card = await flashCardsDB.incrementReviewCount(params.id)

    if (!card) {
      return NextResponse.json(
        {error: 'Flashcard not found'},
        {status: 404},
      )
    }

    return NextResponse.json(card)
  } catch {
    return NextResponse.json(
      {error: 'Failed to update review count'},
      {status: 500},
    )
  }
}
