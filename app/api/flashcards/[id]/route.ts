import {NextResponse} from 'next/server'
import {flashCardsDB} from '@/lib/flashcards-db'

export async function GET(
  request: Request,
  {params}: {params: {id: string}},
) {
  try {
    const card = await flashCardsDB.getById(params.id)

    if (!card) {
      return NextResponse.json(
        {error: 'Flashcard not found'},
        {status: 404},
      )
    }

    return NextResponse.json(card)
  } catch {
    return NextResponse.json(
      {error: 'Failed to fetch flashcard'},
      {status: 500},
    )
  }
}

export async function PUT(
  request: Request,
  {params}: {params: {id: string}},
) {
  try {
    const body = await request.json()
    const updatedCard = await flashCardsDB.update(params.id, body)

    if (!updatedCard) {
      return NextResponse.json(
        {error: 'Flashcard not found'},
        {status: 404},
      )
    }

    return NextResponse.json(updatedCard)
  } catch {
    return NextResponse.json(
      {error: 'Failed to update flashcard'},
      {status: 500},
    )
  }
}

export async function DELETE(
  request: Request,
  {params}: {params: {id: string}},
) {
  try {
    const deleted = await flashCardsDB.delete(params.id)

    if (!deleted) {
      return NextResponse.json(
        {error: 'Flashcard not found'},
        {status: 404},
      )
    }

    return NextResponse.json({success: true})
  } catch {
    return NextResponse.json(
      {error: 'Failed to delete flashcard'},
      {status: 500},
    )
  }
}
