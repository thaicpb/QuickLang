'use client';

import { useState } from 'react';
import { FlashCard as FlashCardType } from '@/lib/types';

interface FlashCardProps {
  card: FlashCardType;
  onReview?: () => void;
}

export default function FlashCard({ card, onReview }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped && onReview) {
      onReview();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative w-full h-96 perspective-1000">
      <div
        className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-lg bg-white border border-gray-200">
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(card.difficulty)}`}>
                {card.difficulty}
              </span>
              {card.category && (
                <span className="text-sm text-gray-500">{card.category}</span>
              )}
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              {card.imageUrl && (
                <img
                  src={card.imageUrl}
                  alt={card.word}
                  className="w-48 h-48 object-cover rounded-lg mb-6 shadow-md"
                />
              )}
              <h2 className="text-3xl font-bold text-gray-900">{card.word}</h2>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              Click to flip
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white rotate-y-180">
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold">{card.word}</h3>
              <span className="text-sm opacity-75">
                Reviews: {card.reviewCount}
              </span>
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <h4 className="text-sm font-medium opacity-75 mb-2">Meaning:</h4>
                <p className="text-lg">{card.meaning}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium opacity-75 mb-2">Example:</h4>
                <p className="italic">{card.example}</p>
              </div>
            </div>
            
            <div className="text-center text-sm opacity-75">
              Click to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}