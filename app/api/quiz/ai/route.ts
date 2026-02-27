import { NextResponse } from 'next/server';
import { flashCardsDB } from '@/lib/flashcards-db';
import { FlashCard } from '@/lib/types';
import {
  generateJLPTMeaningOptions,
  generateJLPTFillBlankQuestion,
  OLLAMA_MODEL,
} from '@/lib/ollama';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const LABELS = ['A', 'B', 'C', 'D'];

interface AIQuizOption {
  label: string;
  text: string;
  fullCard?: {
    id: number;
    word: string;
    pronunciation?: string;
    meaning: string;
    example: string;
    category?: string;
    difficulty?: string;
    imageUrl?: string;
  };
}

interface AIQuizQuestion {
  id: string;
  type: 'meaning' | 'fill_blank';
  question: string;
  word: string;
  imageUrl?: string;
  example: string;
  options: AIQuizOption[];
  correctAnswer: string;
  /** Nghĩa tiếng Việt — chỉ hiển thị sau khi công bố đáp án */
  correctMeaning: string;
  category?: string;
  difficulty?: string;
}

/**
 * JLPT 言葉の意味問題
 * Câu hỏi: 「word」の意味として、最も適切なものを選んでください。
 * Tất cả đáp án bằng tiếng Nhật. Nghĩa tiếng Việt chỉ hiện sau khi trả lời.
 */
async function buildMeaningQuestion(
  card: FlashCard,
  allCards: FlashCard[],
  index: number
): Promise<AIQuizQuestion> {
  const result = await generateJLPTMeaningOptions(card.word, card.meaning);

  let optionTexts: string[];
  let correctText: string;

  if (result && result.distractors.length >= 3) {
    correctText = result.correctJP;
    optionTexts = shuffleArray([result.correctJP, ...result.distractors.slice(0, 3)]);
  } else {
    // Fallback: dùng nghĩa tiếng Việt từ DB (không lý tưởng nhưng không crash)
    correctText = card.meaning;
    const fallbackMeanings = shuffleArray(
      allCards.filter((c) => c.id !== card.id).map((c) => c.meaning)
    ).slice(0, 3);
    optionTexts = shuffleArray([card.meaning, ...fallbackMeanings]);
  }

  const options: AIQuizOption[] = optionTexts.map((text, i) => ({
    label: LABELS[i],
    text,
    // fullCard chỉ gán cho đáp án đúng — review sẽ hiện nghĩa tiếng Việt từ đây
    ...(text === correctText && {
      fullCard: {
        id: card.id,
        word: card.word,
        pronunciation: card.pronunciation,
        meaning: card.meaning,
        example: card.example,
        category: card.category,
        difficulty: card.difficulty,
        imageUrl: card.imageUrl,
      },
    }),
  }));

  const correctAnswer = options.find((o) => o.text === correctText)!.label;

  return {
    id: `ai-quiz-${index + 1}`,
    type: 'meaning',
    question: `「${card.word}」の意味として、最も適切なものを選んでください。`,
    word: card.word,
    imageUrl: card.imageUrl,
    example: card.example,
    options,
    correctAnswer,
    correctMeaning: card.meaning,
    category: card.category,
    difficulty: card.difficulty,
  };
}

/**
 * JLPT 穴埋め問題
 * Câu hỏi: （　）に入る最も適切な言葉を選んでください。「sentence with ___」
 * Tất cả đáp án bằng tiếng Nhật. Nghĩa tiếng Việt chỉ hiện sau khi trả lời.
 */
async function buildFillBlankQuestion(
  card: FlashCard,
  allCards: FlashCard[],
  index: number
): Promise<AIQuizQuestion> {
  const result = await generateJLPTFillBlankQuestion(
    card.word,
    card.meaning,
    card.example
  );

  if (!result) {
    return buildMeaningQuestion(card, allCards, index);
  }

  const { sentence, distractors } = result;

  // Fallback thêm từ DB nếu không đủ distractor
  let wrongWords = distractors;
  if (wrongWords.length < 3) {
    const extra = shuffleArray(allCards.filter((c) => c.id !== card.id))
      .slice(0, 3 - wrongWords.length)
      .map((c) => c.word);
    wrongWords = [...wrongWords, ...extra];
  }

  const optionWords = shuffleArray([card.word, ...wrongWords.slice(0, 3)]);

  const options: AIQuizOption[] = optionWords.map((word, i) => {
    const matched = allCards.find(
      (c) => c.word.toLowerCase() === word.toLowerCase()
    );
    return {
      label: LABELS[i],
      text: word,
      fullCard: matched
        ? {
            id: matched.id,
            word: matched.word,
            pronunciation: matched.pronunciation,
            meaning: matched.meaning,
            example: matched.example,
            category: matched.category,
            difficulty: matched.difficulty,
            imageUrl: matched.imageUrl,
          }
        : { id: 0, word, meaning: '', example: '' },
    };
  });

  const correctAnswer = options.find(
    (o) => o.text.toLowerCase() === card.word.toLowerCase()
  )!.label;

  // Hiển thị dấu ___ dạng （　）cho gần với format JLPT thật
  const displaySentence = sentence.replace(/___/g, '（　）');

  return {
    id: `ai-quiz-${index + 1}`,
    type: 'fill_blank',
    question: `（　）に入る最も適切な言葉を選んでください。\n「${displaySentence}」`,
    word: card.word,
    imageUrl: card.imageUrl,
    example: card.example,
    options,
    correctAnswer,
    correctMeaning: card.meaning,
    category: card.category,
    difficulty: card.difficulty,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = Math.min(parseInt(searchParams.get('count') || '10'), 50);
    const folderId = searchParams.get('folder_id') || undefined;
    const category = searchParams.get('category') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;

    let allCards = await flashCardsDB.getAll();

    if (folderId) allCards = allCards.filter((c) => c.folderId === parseInt(folderId));
    if (category) allCards = allCards.filter((c) => c.category === category);
    if (difficulty) allCards = allCards.filter((c) => c.difficulty === difficulty);

    if (allCards.length < 4) {
      return NextResponse.json(
        { error: 'Không đủ thẻ ghi nhớ để tạo bài kiểm tra (tối thiểu 4 thẻ)' },
        { status: 400 }
      );
    }

    const selectedCards = shuffleArray(allCards).slice(0, count);

    // Xen kẽ: chẵn → 言葉の意味, lẻ → 穴埋め
    const questionPromises = selectedCards.map((card, i) =>
      i % 2 === 0
        ? buildMeaningQuestion(card, allCards, i)
        : buildFillBlankQuestion(card, allCards, i)
    );

    const questions = await Promise.all(questionPromises);

    return NextResponse.json({
      questions,
      total: questions.length,
      model: OLLAMA_MODEL,
    });
  } catch (error) {
    console.error('AI quiz generation error:', error);
    return NextResponse.json(
      { error: 'Không thể tạo quiz AI. Đảm bảo Ollama đang chạy.' },
      { status: 500 }
    );
  }
}
