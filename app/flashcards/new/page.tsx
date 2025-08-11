import Link from 'next/link'
import FlashCardForm from '@/components/FlashCardForm'

export default function NewFlashCardPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <Link
            href='/flashcards'
            className='text-indigo-600 hover:text-indigo-500 mb-4 inline-block'
          >
            ← Back to Flashcards
          </Link>
          <h1 className='text-3xl font-bold text-gray-900'>Create New Flashcard</h1>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <FlashCardForm />
        </div>
      </div>
    </div>
  )
}
