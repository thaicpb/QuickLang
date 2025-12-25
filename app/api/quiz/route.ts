import { NextResponse } from 'next/server';
import { flashCardsDB } from '@/lib/flashcards-db';
import { FlashCard } from '@/lib/types';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateWrongAnswers(correctCard: FlashCard, allCards: FlashCard[], count: number = 3): FlashCard[] {
  const wrongCards = allCards
    .filter(card => card.id !== correctCard.id)
    .filter(card => card.meaning !== correctCard.meaning);
  
  return shuffleArray(wrongCards).slice(0, count);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '50');
    const category = searchParams.get('category') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const folderId = searchParams.get('folder_id') || undefined;

    let allCards = await flashCardsDB.getAll();
    
    if (folderId) {
      allCards = allCards.filter(card => card.folderId === parseInt(folderId));
    }
    
    if (category) {
      allCards = allCards.filter(card => card.category === category);
    }
    
    if (difficulty) {
      allCards = allCards.filter(card => card.difficulty === difficulty);
    }

    if (allCards.length < 4) {
      return NextResponse.json(
        { error: 'Không đủ thẻ ghi nhớ để tạo bài kiểm tra (tối thiểu 4 thẻ)' },
        { status: 400 }
      );
    }

    const shuffledCards = shuffleArray(allCards);
    const selectedCards = shuffledCards.slice(0, Math.min(count, shuffledCards.length));

    const quizQuestions = selectedCards.map((card, index) => {
      const wrongCards = generateWrongAnswers(card, allCards, 3);
      const allCards_answers = shuffleArray([card, ...wrongCards]);
      
      const options = ['A', 'B', 'C', 'D'];
      const answersWithLabels = allCards_answers.map((answerCard, i) => ({
        label: options[i],
        text: answerCard.meaning,
        fullCard: {
          id: answerCard.id,
          word: answerCard.word,
          pronunciation: answerCard.pronunciation,
          meaning: answerCard.meaning,
          example: answerCard.example,
          category: answerCard.category,
          difficulty: answerCard.difficulty,
          imageUrl: answerCard.imageUrl
        }
      }));

      const correctAnswerLabel = answersWithLabels.find(a => a.text === card.meaning)?.label || 'A';

      return {
        id: `quiz-${index + 1}`,
        question: `"${card.word}" nghĩa là gì?`,
        word: card.word,
        imageUrl: card.imageUrl,
        example: card.example,
        options: answersWithLabels,
        correctAnswer: correctAnswerLabel,
        correctMeaning: card.meaning,
        category: card.category,
        difficulty: card.difficulty
      };
    });

    return NextResponse.json({
      questions: quizQuestions,
      total: quizQuestions.length
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Không thể tạo bài kiểm tra' },
      { status: 500 }
    );
  }
}
