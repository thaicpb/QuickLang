'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FlashCard as FlashCardType, Folder } from '@/lib/types';

export default function FlashCardsPage() {
  const [flashCards, setFlashCards] = useState<FlashCardType[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const searchParams = useSearchParams();
  const folderId = searchParams.get('folder_id');

  useEffect(() => {
    fetchFlashCards();
    if (folderId) {
      fetchFolder();
    }
  }, [folderId]);

  const fetchFlashCards = async () => {
    try {
      const url = folderId 
        ? `/api/flashcards?folder_id=${folderId}` 
        : '/api/flashcards';
      const response = await fetch(url);
      const data = await response.json();
      setFlashCards(data);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolder = async () => {
    if (!folderId) return;
    try {
      const response = await fetch(`/api/folders/${folderId}`);
      const data = await response.json();
      setCurrentFolder(data);
    } catch (error) {
      console.error('Failed to fetch folder:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return;

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFlashCards(flashCards.filter(card => card.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete flashcard:', error);
    }
  };

  const filteredCards = filter === 'all' 
    ? flashCards 
    : flashCards.filter(card => card.difficulty === filter);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading flashcards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link 
                href="/folders" 
                className="text-indigo-600 hover:text-indigo-800"
              >
                ← Back to Folders
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentFolder ? currentFolder.name : 'All Flashcards'}
            </h1>
            {currentFolder?.description && (
              <p className="text-gray-600 mt-1">{currentFolder.description}</p>
            )}
          </div>
          <div className="flex gap-4">
            <Link
              href="/flashcards/import"
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
            >
              Import CSV
            </Link>
            <Link
              href={folderId ? `/quiz?folder_id=${folderId}` : '/quiz'}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Take Quiz
            </Link>
            <Link
              href="/flashcards/study"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Study Mode
            </Link>
            <Link
              href={`/flashcards/new${folderId ? `?folder_id=${folderId}` : ''}`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Add New Card
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <span className="px-3 py-2 text-gray-700 font-medium">Difficulty:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              All ({flashCards.length})
            </button>
            <button
              onClick={() => setFilter('easy')}
              className={`px-4 py-2 rounded-md ${filter === 'easy' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Easy ({flashCards.filter(c => c.difficulty === 'easy').length})
            </button>
            <button
              onClick={() => setFilter('medium')}
              className={`px-4 py-2 rounded-md ${filter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Medium ({flashCards.filter(c => c.difficulty === 'medium').length})
            </button>
            <button
              onClick={() => setFilter('hard')}
              className={`px-4 py-2 rounded-md ${filter === 'hard' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Hard ({flashCards.filter(c => c.difficulty === 'hard').length})
            </button>
          </div>
        </div>

        {filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No flashcards found.</p>
            <Link
              href="/flashcards/new"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Create your first flashcard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map(card => (
              <div key={card.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{card.word}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(card.difficulty)}`}>
                    {card.difficulty}
                  </span>
                </div>
                
                {card.imageUrl && (
                  <img
                    src={card.imageUrl}
                    alt={card.word}
                    className="w-full h-32 object-cover rounded mb-4"
                  />
                )}
                
                <p className="text-gray-600 mb-4 line-clamp-2">{card.meaning}</p>
                
                {card.category && (
                  <p className="text-sm text-gray-500 mb-4">Category: {card.category}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Reviews: {card.reviewCount}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/flashcards/${card.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-500 text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="text-red-600 hover:text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}