'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FlashCard as FlashCardType } from '@/lib/types';
import FlashCardForm from '@/components/FlashCardForm';

export default function EditFlashCardPage() {
  const router = useRouter();
  const params = useParams();
  const [card, setCard] = useState<FlashCardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCard();
  }, [params.id]);

  const fetchCard = async () => {
    try {
      const response = await fetch(`/api/flashcards/${params.id}`);
      if (!response.ok) {
        throw new Error('Không tìm thấy thẻ học');
      }
      const data = await response.json();
      setCard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lấy thông tin thẻ học');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Đang tải thẻ học...</div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/flashcards')}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Quay lại Thẻ học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/flashcards')}
            className="text-indigo-600 hover:text-indigo-500 mb-4"
          >
            ← Quay lại Thẻ học
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Sửa Thẻ học</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <FlashCardForm existingCard={card} />
        </div>
      </div>
    </div>
  );
}