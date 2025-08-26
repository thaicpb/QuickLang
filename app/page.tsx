'use client';

import Link from "next/link";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const [hasLocalAuth, setHasLocalAuth] = useState(false);

  useEffect(() => {
    // Kiểm tra cả localStorage token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setHasLocalAuth(!!token);
  }, []);

  const isAuthenticated = session || hasLocalAuth;
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">QuickLang</h1>
          <p className="mt-2 text-gray-600">Chào mừng đến ứng dụng học ngôn ngữ</p>
        </div>
        <div className="mt-8 space-y-4">
          {!isAuthenticated && (
            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Đăng nhập
            </Link>
          )}
          <Link
            href="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Vào bảng điều khiển
          </Link>
          <Link
            href="/folders"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Xem bộ sưu tập
          </Link>
          {isAuthenticated && (
            <Link
              href="/flashcards"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Quản lý thẻ học
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}