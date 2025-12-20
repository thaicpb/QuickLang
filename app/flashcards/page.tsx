'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FlashCard as FlashCardType, Folder } from '@/lib/types';

export default function FlashCardsPage() {
  const [flashCards, setFlashCards] = useState<FlashCardType[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<{ easy: number; medium: number; hard: number }>({ easy: 0, medium: 0, hard: 0 });
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const searchParams = useSearchParams();
  const folderId = searchParams.get('folder_id');

  useEffect(() => {
    resetAndFetch();
    if (folderId) {
      fetchFolder();
    } else {
      setCurrentFolder(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const resetAndFetch = () => {
    setFlashCards([]);
    setOffset(0);
    setTotal(0);
    setCounts({ easy: 0, medium: 0, hard: 0 });
    setLoading(true);
    fetchFlashCards(0, true);
  };

  const fetchFlashCards = async (startOffset: number, initial = false) => {
    if (loadingMore && !initial) return;
    if (!initial && flashCards.length >= total && total !== 0) return;
    
    try {
      if (initial) setLoading(true);
      setLoadingMore(true);
      const limit = 30;
      
      const url = folderId 
        ? `/api/flashcards?folder_id=${folderId}&limit=${limit}&offset=${startOffset}` 
        : `/api/flashcards?limit=${limit}&offset=${startOffset}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok && data.items) {
        // Paginated response
        if (initial) {
          setFlashCards(data.items);
        } else {
          setFlashCards(prev => [...prev, ...data.items]);
        }
        setTotal(data.total || 0);
        if (data.counts) {
          setCounts({
            easy: data.counts.easy || 0,
            medium: data.counts.medium || 0,
            hard: data.counts.hard || 0,
          });
        }
        setOffset(startOffset + limit);
      } else if (response.ok && Array.isArray(data)) {
        // Fallback for non-paginated response - only on initial load
        if (initial) {
          setFlashCards(data);
          setTotal(data.length);
          const easyCount = data.filter((c: FlashCardType) => c.difficulty === 'easy').length;
          const mediumCount = data.filter((c: FlashCardType) => c.difficulty === 'medium').length;
          const hardCount = data.filter((c: FlashCardType) => c.difficulty === 'hard').length;
          setCounts({ easy: easyCount, medium: mediumCount, hard: hardCount });
        }
      }
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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

  const handleDelete = async (id: number | string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thẻ học này không?')) return;

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFlashCards(flashCards.filter(card => card.id !== Number(id)));
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
        <div className="text-gray-500">Đang tải thẻ học...</div>
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
                ← Quay lại Thư mục
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentFolder ? currentFolder.name : 'Tất cả Thẻ học'}
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
              Nhập CSV
            </Link>
            <Link
              href={folderId ? `/quiz?folder_id=${folderId}` : '/quiz'}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Làm Bài kiểm tra
            </Link>
            <Link
              href="/flashcards/study"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Chế độ học
            </Link>
            <Link
              href={`/flashcards/new${folderId ? `?folder_id=${folderId}` : ''}`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Thêm Thẻ mới
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <span className="px-3 py-2 text-gray-700 font-medium">Độ khó:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Tất cả ({total})
            </button>
            <button
              onClick={() => setFilter('easy')}
              className={`px-4 py-2 rounded-md ${filter === 'easy' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Dễ ({counts.easy})
            </button>
            <button
              onClick={() => setFilter('medium')}
              className={`px-4 py-2 rounded-md ${filter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Trung bình ({counts.medium})
            </button>
            <button
              onClick={() => setFilter('hard')}
              className={`px-4 py-2 rounded-md ${filter === 'hard' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Khó ({counts.hard})
            </button>
          </div>
        </div>

        {filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Không tìm thấy thẻ học nào.</p>
            <Link
              href="/flashcards/new"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Tạo thẻ học đầu tiên của bạn
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map(card => (
                <div key={card.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{card.word}</h3>
                      {card.pronunciation && (
                        <p className="text-sm text-gray-500 mt-1">{card.pronunciation}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(card.difficulty)}`}>
                      {card.difficulty}
                    </span>
                  </div>
                  
                {card.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.imageUrl}
                    alt={card.word}
                    className="w-full h-32 object-cover rounded mb-4"
                  />
                )}
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{card.meaning}</p>
                  
                  {card.category && (
                    <p className="text-sm text-gray-500 mb-4">Danh mục: {card.category}</p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Ôn tập: {card.reviewCount}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/flashcards/${card.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-500 text-sm"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="text-red-600 hover:text-red-500 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {flashCards.length < total && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => fetchFlashCards(offset)}
                  disabled={loadingMore}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loadingMore ? 'Đang tải...' : 'Tải thêm'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
