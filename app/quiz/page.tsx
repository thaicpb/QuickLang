'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface QuizOption {
  label: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  word: string;
  imageUrl?: string;
  example: string;
  options: QuizOption[];
  correctAnswer: string;
  correctMeaning: string;
  category?: string;
  difficulty?: string;
}

interface QuizData {
  questions: QuizQuestion[];
  total: number;
}

export default function QuizPage() {
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selected: string; correct: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFinalResult, setShowFinalResult] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const folderId = urlParams.get('folder_id');
      const folderParam = folderId ? `&folder_id=${folderId}` : '';
      const response = await fetch(`/api/quiz?count=10${folderParam}`);
      if (!response.ok) {
        throw new Error('Không thể tải bài kiểm tra');
      }
      const data = await response.json();
      setQuizData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (label: string) => {
    if (showResult) return;
    setSelectedAnswer(label);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !quizData) return;

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setAnswers([...answers, {
      questionId: currentQuestion.id,
      selected: selectedAnswer,
      correct: isCorrect
    }]);

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (!quizData) return;

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setShowFinalResult(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setShowFinalResult(false);
    fetchQuiz();
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl">Đang tải bài kiểm tra...</div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
          <p className="text-gray-700 mb-4">{error || 'Không thể tải bài kiểm tra'}</p>
          <button
            onClick={fetchQuiz}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (showFinalResult) {
    const percentage = Math.round((score / quizData.total) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-8">Hoàn thành Bài kiểm tra! 🎉</h1>
            
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {score}/{quizData.total}
              </div>
              <div className="text-2xl text-gray-600">
                {percentage}% Chính xác
              </div>
              <div className="mt-4">
                {percentage >= 80 ? (
                  <span className="text-green-600 text-xl">Xuất sắc! 🌟</span>
                ) : percentage >= 60 ? (
                  <span className="text-yellow-600 text-xl">Làm tốt! Tiếp tục luyện tập 📚</span>
                ) : (
                  <span className="text-orange-600 text-xl">Tiếp tục học! Bạn sẽ tiến bộ 💪</span>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-semibold">Kiểm tra Câu trả lời của Bạn:</h3>
              {quizData.questions.map((question, index) => {
                const answer = answers[index];
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">Q{index + 1}: {question.question}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Câu trả lời của bạn: <span className={answer?.correct ? 'text-green-600' : 'text-red-600'}>
                            {answer?.selected}
                          </span>
                        </p>
                        {!answer?.correct && (
                          <p className="text-sm text-green-600 mt-1">
                            Câu trả lời đúng: {question.correctAnswer} - {question.correctMeaning}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        {answer?.correct ? (
                          <span className="text-green-600 text-2xl">✓</span>
                        ) : (
                          <span className="text-red-600 text-2xl">✗</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestartQuiz}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Làm Bài kiểm tra Khác
              </button>
              <Link
                href="/flashcards"
                className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-block"
              >
                Học Thẻ học
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.total) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Bài kiểm tra Ngôn ngữ</h1>
            <Link
              href="/flashcards"
              className="text-blue-600 hover:text-blue-800"
            >
              Quay lại Thẻ học
            </Link>
          </div>
          <div className="bg-white rounded-full h-4 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Câu hỏi {currentQuestionIndex + 1} / {quizData.total}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
            
            {currentQuestion.imageUrl && (
              <div className="mb-4">
                <img 
                  src={currentQuestion.imageUrl} 
                  alt={currentQuestion.word}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Ví dụ:</p>
              <p className="italic">{currentQuestion.example}</p>
            </div>

            {currentQuestion.category && (
              <div className="flex gap-2 mb-4">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                  {currentQuestion.category}
                </span>
                {currentQuestion.difficulty && (
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.label;
              const isCorrect = option.label === currentQuestion.correctAnswer;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={option.label}
                  onClick={() => handleAnswerSelect(option.label)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showCorrect ? 'border-green-500 bg-green-50' :
                    showWrong ? 'border-red-500 bg-red-50' :
                    isSelected ? 'border-blue-500 bg-blue-50' :
                    'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-bold mr-3 text-lg">{option.label}.</span>
                      <span>{option.text}</span>
                    </div>
                    {showResult && (
                      <div>
                        {showCorrect && <span className="text-green-600 text-xl">✓</span>}
                        {showWrong && <span className="text-red-600 text-xl">✗</span>}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className={`p-4 rounded-lg mb-6 ${
              selectedAnswer === currentQuestion.correctAnswer 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <p className="font-semibold">Đúng rồi! Làm tốt! 🎉</p>
              ) : (
                <div>
                  <p className="font-semibold mb-2">Chưa chính xác lắm.</p>
                  <p>Câu trả lời đúng là: <strong>{currentQuestion.correctAnswer}</strong> - {currentQuestion.correctMeaning}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-lg font-medium">
              Điểm: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
            </div>
            
            {!showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  selectedAnswer
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Gửi Câu trả lời
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {currentQuestionIndex < quizData.total - 1 ? 'Câu tiếp theo' : 'Xem Kết quả'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}