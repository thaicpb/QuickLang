import { NextResponse } from 'next/server';
import { flashCardsDB } from '@/lib/flashcards-db';
import { FlashCard } from '@/lib/types';
import {
  generateJLPTReadingDistractors,
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
  type: 'reading' | 'fill_blank';
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
 * Chèn đáp án đúng vào vị trí ngẫu nhiên trong mảng 3 distractor.
 * Trả về mảng 4 phần tử và index của đáp án đúng.
 */
function insertCorrectAtRandom(
  distractors: string[],
  correct: string
): { options: string[]; correctIndex: number } {
  const options = [...distractors.slice(0, 3)];
  const correctIndex = Math.floor(Math.random() * 4);
  options.splice(correctIndex, 0, correct);
  return { options, correctIndex };
}

/**
 * JLPT N2 読み方問題
 * Câu hỏi: ＿＿{kanji}＿＿の読み方として正しいものを選んでください。
 * Đáp án đúng = card.pronunciation từ DB.
 * AI chỉ tạo câu ví dụ + 3 distractor hiragana.
 */
async function buildReadingQuestion(
  card: FlashCard,
  allCards: FlashCard[],
  index: number
): Promise<AIQuizQuestion> {
  // Fallback sang fill-blank nếu thẻ không có pronunciation
  if (!card.pronunciation) {
    return buildFillBlankQuestion(card, allCards, index);
  }

  const correctReading = card.pronunciation;
  const result = await generateJLPTReadingDistractors(card.word, correctReading);

  let distractors: string[];
  let sentenceDisplay: string;

  if (result && result.distractors.length >= 3) {
    distractors = result.distractors;
    sentenceDisplay = result.sentence;
  } else {
    // Fallback: lấy pronunciation từ các thẻ khác trong DB
    const fallbackReadings = shuffleArray(
      allCards
        .filter(
          (c) =>
            c.id !== card.id &&
            c.pronunciation &&
            c.pronunciation.trim() !== correctReading.trim()
        )
        .map((c) => c.pronunciation!)
    ).slice(0, 3);

    if (fallbackReadings.length < 3) {
      return buildFillBlankQuestion(card, allCards, index);
    }

    distractors = fallbackReadings;
    sentenceDisplay = `＿＿${card.word}＿＿`;
  }

  // Safety dedup: loại bất kỳ distractor nào trùng đáp án đúng
  const safeDistractors = distractors
    .filter((d) => d.trim() !== correctReading.trim())
    .slice(0, 3);

  if (safeDistractors.length < 3) {
    return buildFillBlankQuestion(card, allCards, index);
  }

  // Chèn đáp án đúng vào vị trí ngẫu nhiên
  const { options: optionTexts, correctIndex } = insertCorrectAtRandom(
    safeDistractors,
    correctReading
  );

  const options: AIQuizOption[] = optionTexts.map((text, i) => ({
    label: LABELS[i],
    text,
    ...(i === correctIndex && {
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

  const correctAnswer = LABELS[correctIndex];

  const question =
    sentenceDisplay === `＿＿${card.word}＿＿`
      ? `「＿＿${card.word}＿＿」の読み方として正しいものを選んでください。`
      : `${sentenceDisplay}\n＿＿${card.word}＿＿の読み方として正しいものを、１・２・３・４から一つ選びなさい。`;

  return {
    id: `ai-quiz-${index + 1}`,
    type: 'reading',
    question,
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
 * Câu hỏi: （　）に入る最も適切な言葉を選んでください。
 * Đáp án đúng = card.word từ DB.
 * AI chỉ tạo câu có blank + 3 distractor.
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
    // Hard fallback: không dùng AI, tạo câu hỏi đơn giản từ DB
    return buildSimpleFallbackQuestion(card, allCards, index);
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

/**
 * Hard fallback khi cả AI và fill-blank đều thất bại.
 * Tạo câu hỏi nghĩa tiếng Việt thuần DB.
 */
function buildSimpleFallbackQuestion(
  card: FlashCard,
  allCards: FlashCard[],
  index: number
): AIQuizQuestion {
  const wrongCards = shuffleArray(
    allCards.filter((c) => c.id !== card.id && c.meaning !== card.meaning)
  ).slice(0, 3);

  const allOptions = shuffleArray([card, ...wrongCards]);

  const options: AIQuizOption[] = allOptions.map((c, i) => ({
    label: LABELS[i],
    text: c.meaning,
    fullCard: {
      id: c.id,
      word: c.word,
      pronunciation: c.pronunciation,
      meaning: c.meaning,
      example: c.example,
      category: c.category,
      difficulty: c.difficulty,
      imageUrl: c.imageUrl,
    },
  }));

  const correctAnswer = options.find((o) => o.text === card.meaning)!.label;

  return {
    id: `ai-quiz-${index + 1}`,
    type: 'fill_blank',
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

    // Xen kẽ: chẵn → 読み方 (reading), lẻ → 穴埋め (fill-blank)
    const questionPromises = selectedCards.map((card, i) =>
      i % 2 === 0
        ? buildReadingQuestion(card, allCards, i)
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
