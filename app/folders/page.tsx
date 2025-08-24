'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Folder } from '@/lib/types';

export default function FoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    color: '#6366f1'
  });

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders');
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFolder),
      });

      if (response.ok) {
        const createdFolder = await response.json();
        setFolders([...folders, { ...createdFolder, flashcardCount: 0 }]);
        setNewFolder({ name: '', description: '', color: '#6366f1' });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleDeleteFolder = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thư mục này không?')) return;

    try {
      const response = await fetch(`/api/folders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFolders(folders.filter(folder => folder.id !== id));
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const colorOptions = [
    { value: '#6366f1', name: 'Chàm', class: 'bg-indigo-500' },
    { value: '#10b981', name: 'Xanh lá', class: 'bg-green-500' },
    { value: '#f59e0b', name: 'Vàng', class: 'bg-yellow-500' },
    { value: '#ef4444', name: 'Đỏ', class: 'bg-red-500' },
    { value: '#8b5cf6', name: 'Tím', class: 'bg-purple-500' },
    { value: '#06b6d4', name: 'Xanh cyan', class: 'bg-cyan-500' },
    { value: '#f97316', name: 'Cam', class: 'bg-orange-500' },
    { value: '#84cc16', name: 'Xanh chanh', class: 'bg-lime-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Đang tải thư mục...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bộ sưu tập Thẻ học của tôi</h1>
            <p className="text-gray-600 mt-2">Sắp xếp thẻ học của bạn vào các thư mục</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              + Thư mục Mới
            </button>
            <Link
              href="/flashcards"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Xem Tất cả Thẻ
            </Link>
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Tạo Thư mục Mới</h2>
              <form onSubmit={handleCreateFolder}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Thư mục *
                  </label>
                  <input
                    type="text"
                    value={newFolder.name}
                    onChange={(e) => setNewFolder({...newFolder, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ví dụ: Từ vựng tiếng Anh"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={newFolder.description}
                    onChange={(e) => setNewFolder({...newFolder, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Mô tả tùy chọn..."
                    rows={3}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màu sắc
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewFolder({...newFolder, color: color.value})}
                        className={`w-full h-10 rounded-md ${color.class} ${
                          newFolder.color === color.value ? 'ring-2 ring-gray-400' : ''
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                  >
                    Tạo Thư mục
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {folders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Không tìm thấy thư mục nào.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Tạo thư mục đầu tiên của bạn
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map(folder => (
              <div key={folder.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div 
                  className="h-32 rounded-t-lg flex items-center justify-center"
                  style={{ backgroundColor: folder.color }}
                >
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">📁</div>
                    <div className="text-sm opacity-90">
                      {folder.flashcardCount || 0} thẻ
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {folder.name}
                  </h3>
                  {folder.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {folder.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/flashcards?folder_id=${folder.id}`}
                      className="flex-1 bg-indigo-600 text-white text-center px-3 py-2 rounded-md hover:bg-indigo-700 text-sm"
                    >
                      Xem Thẻ
                    </Link>
                    <Link
                      href={`/quiz?folder_id=${folder.id}`}
                      className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
                    >
                      Bài kiểm tra
                    </Link>
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm"
                      title="Xóa thư mục"
                    >
                      🗑️
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