'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Có vấn đề với cấu hình máy chủ.';
      case 'AccessDenied':
        return 'Truy cập bị từ chối. Bạn không có quyền đăng nhập.';
      case 'Verification':
        return 'Mã xác thực đã hết hạn hoặc đã được sử dụng.';
      case 'Default':
        return 'Đã xảy ra lỗi trong quá trình xác thực.';
      default:
        return 'Đã xảy ra lỗi không xác định trong quá trình xác thực.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Lỗi Xác thực
          </h2>
        </div>
        
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {getErrorMessage(error)}
              </h3>
              {error && (
                <p className="text-xs text-red-600 mt-1">
                  Mã lỗi: {error}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Thử lại
          </Link>
        </div>
      </div>
    </div>
  );
}