'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Folder } from '@/lib/types';

interface ImportResult {
  success: boolean;
  imported: number;
  total: number;
  errors?: string[];
  flashcards?: any[];
}

export default function ImportFlashcardsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [folderId, setFolderId] = useState<string>('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>('');

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
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
        setResult(null);
      } else {
        setError('Please select a valid CSV file');
        setFile(null);
      }
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) {
        formData.append('folderId', folderId);
      }

      const response = await fetch('/api/flashcards/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('csvFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error + (data.details ? '\n' + data.details.join('\n') : ''));
      }
    } catch (error) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `word,meaning,example,category,difficulty,folder_id
hello,xin chào,"Hello, how are you?",greetings,easy,
goodbye,tạm biệt,"Goodbye, see you later!",greetings,easy,
book,sách,"I love reading books",objects,medium,
beautiful,đẹp,"She is very beautiful",adjectives,medium,`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/flashcards" 
              className="text-indigo-600 hover:text-indigo-500"
            >
              ← Back to Flashcards
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Import Flashcards</h1>
          <p className="text-gray-600 mt-2">Import flashcards from a CSV file</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">CSV Format Requirements</h2>
          <div className="space-y-3 text-sm text-gray-600 mb-4">
            <p><strong>Required columns:</strong> word, meaning, example</p>
            <p><strong>Optional columns:</strong> category, difficulty (easy/medium/hard), folder_id</p>
            <p><strong>Note:</strong> First row should contain column headers</p>
          </div>
          
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            📥 Download Template CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleImport} className="space-y-6">
            <div>
              <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File *
              </label>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              {file && (
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div>
              <label htmlFor="folder" className="block text-sm font-medium text-gray-700 mb-2">
                Default Folder (optional)
              </label>
              <select
                id="folder"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">No folder (or use folder_id from CSV)</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                This folder will be used for cards without a folder_id in the CSV
              </p>
            </div>

            <button
              type="submit"
              disabled={!file || isUploading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Importing...' : 'Import Flashcards'}
            </button>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800 text-sm">
                <p className="font-medium">Import failed:</p>
                <pre className="mt-2 whitespace-pre-wrap">{error}</pre>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-green-800">
                <p className="font-medium">Import completed successfully!</p>
                <ul className="mt-2 text-sm">
                  <li>• Total rows processed: {result.total}</li>
                  <li>• Successfully imported: {result.imported}</li>
                  {result.errors && result.errors.length > 0 && (
                    <li>• Failed imports: {result.errors.length}</li>
                  )}
                </ul>
                
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-red-800">Errors:</p>
                    <div className="mt-2 text-sm text-red-700 bg-red-50 p-2 rounded border">
                      {result.errors.map((err, index) => (
                        <div key={index}>• {err}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 space-x-4">
                  <Link
                    href="/flashcards"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    View Imported Cards
                  </Link>
                  {folderId && (
                    <Link
                      href={`/flashcards?folder_id=${folderId}`}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      View in Folder
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}