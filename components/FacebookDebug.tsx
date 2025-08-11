'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function FacebookDebug() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Info (Dev Only)</h3>
      <div className="text-xs text-gray-600 space-y-1">
        <p>Status: {status}</p>
        <p>Has Session: {session ? 'Yes' : 'No'}</p>
        <p>NextAuth URL: Check console for current URL</p>
        <p>Facebook Config: Check .env.local for credentials</p>
        {session && (
          <div>
            <p>User: {session.user?.email || session.user?.name || 'No email/name'}</p>
          </div>
        )}
      </div>
    </div>
  );
}