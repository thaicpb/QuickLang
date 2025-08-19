import { NextResponse } from 'next/server';
import { flashCardsDB } from '@/lib/flashcards-db';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateWrongAnswers(correctAnswer: string, allCards: any[], count: number = 3): string[] {
  const wrongAnswers = allCards
    .filter(card => card.meaning !== correctAnswer)
    .map(card => card.meaning);
  
  return shuffleArray(wrongAnswers).slice(0, count);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '10');
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
        { error: 'Not enough flashcards to create quiz (minimum 4 required)' },
        { status: 400 }
      );
    }

    const shuffledCards = shuffleArray(allCards);
    const selectedCards = shuffledCards.slice(0, Math.min(count, shuffledCards.length));

    const quizQuestions = selectedCards.map((card, index) => {
      const wrongAnswers = generateWrongAnswers(card.meaning, allCards, 3);
      const allAnswers = shuffleArray([card.meaning, ...wrongAnswers]);
      
      const options = ['A', 'B', 'C', 'D'];
      const answersWithLabels = allAnswers.map((answer, i) => ({
        label: options[i],
        text: answer
      }));

      const correctAnswerLabel = answersWithLabels.find(a => a.text === card.meaning)?.label || 'A';

      return {
        id: `quiz-${index + 1}`,
        question: `What does "${card.word}" mean?`,
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
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}