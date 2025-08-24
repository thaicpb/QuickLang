'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlashCard as FlashCardType } from '@/lib/types';

interface FlashCardFormProps {
  existingCard?: FlashCardType;
}

export default function FlashCardForm({ existingCard }: FlashCardFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    word: existingCard?.word || '',
    imageUrl: existingCard?.imageUrl || '',
    meaning: existingCard?.meaning || '',
    example: existingCard?.example || '',
    category: existingCard?.category || '',
    difficulty: existingCard?.difficulty || ('medium' as 'easy' | 'medium' | 'hard')
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = existingCard ? `/api/flashcards/${existingCard.id}` : '/api/flashcards';
      const method = existingCard ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${existingCard ? 'update' : 'create'} flashcard`);
      }

      router.push('/flashcards');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label htmlFor="word" className="block text-sm font-medium text-gray-700">
          Từ/Cụm từ *
        </label>
        <input
          type="text"
          name="word"
          id="word"
          required
          value={formData.word}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="Nhập từ cần học"
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
          URL hình ảnh (tùy chọn)
        </label>
        <input
          type="url"
          name="imageUrl"
          id="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="https://example.com/image.jpg"
        />
        {formData.imageUrl && (
          <div className="mt-2">
            <img src={formData.imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded" />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="meaning" className="block text-sm font-medium text-gray-700">
          Nghĩa *
        </label>
        <textarea
          name="meaning"
          id="meaning"
          required
          rows={3}
          value={formData.meaning}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="Nhập nghĩa hoặc định nghĩa"
        />
      </div>

      <div>
        <label htmlFor="example" className="block text-sm font-medium text-gray-700">
          Câu ví dụ *
        </label>
        <textarea
          name="example"
          id="example"
          required
          rows={2}
          value={formData.example}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="Nhập câu ví dụ"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Danh mục (tùy chọn)
          </label>
          <input
            type="text"
            name="category"
            id="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="Ví dụ: Từ vựng, Ngữ pháp"
          />
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
            Độ khó
          </label>
          <select
            name="difficulty"
            id="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (existingCard ? 'Đang cập nhật...' : 'Đang tạo...') : (existingCard ? 'Cập nhật thẻ học' : 'Tạo thẻ học')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/flashcards')}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}