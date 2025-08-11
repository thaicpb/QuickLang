'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import FlashCard from '@/components/FlashCard';
import { FlashCard as FlashCardType } from '@/lib/types';

export default function StudyPage() {
  const [flashCards, setFlashCards] = useState<FlashCardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [studyMode, setStudyMode] = useState<'sequential' | 'random'>('sequential');

  useEffect(() => {
    fetchFlashCards();
  }, []);

  const fetchFlashCards = async () => {
    try {
      const response = await fetch('/api/flashcards');
      const data = await response.json();
      setFlashCards(data);
      
      if (studyMode === 'random' && data.length > 0) {
        setCurrentIndex(Math.floor(Math.random() * data.length));
      }
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (flashCards[currentIndex]) {
      try {
        await fetch(`/api/flashcards/${flashCards[currentIndex].id}/review`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Failed to update review count:', error);
      }
    }
  };

  const goToNext = () => {
    if (studyMode === 'random') {
      const nextIndex = Math.floor(Math.random() * flashCards.length);
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex((prev) => (prev + 1) % flashCards.length);
    }
  };

  const goToPrevious = () => {
    if (studyMode === 'random') {
      const prevIndex = Math.floor(Math.random() * flashCards.length);
      setCurrentIndex(prevIndex);
    } else {
      setCurrentIndex((prev) => (prev - 1 + flashCards.length) % flashCards.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading flashcards...</div>
      </div>
    );
  }

  if (flashCards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No flashcards available to study.</p>
          <Link
            href="/flashcards/new"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Create your first flashcard
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = flashCards[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <Link
            href="/flashcards"
            className="text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Flashcards
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Card {currentIndex + 1} of {flashCards.length}
            </span>
            
            <select
              value={studyMode}
              onChange={(e) => setStudyMode(e.target.value as 'sequential' | 'random')}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="sequential">Sequential</option>
              <option value="random">Random</option>
            </select>
          </div>
        </div>

        <div className="mb-8">
          <FlashCard card={currentCard} onReview={handleReview} />
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={goToPrevious}
            className="bg-white text-gray-700 px-6 py-3 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            {flashCards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="bg-white text-gray-700 px-6 py-3 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            Next →
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Tip: Click on the card to flip and see the meaning and example
          </p>
        </div>
      </div>
    </div>
  );
}