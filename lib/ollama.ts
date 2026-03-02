const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
const OLLAMA_TIMEOUT_MS = 30_000;

interface OllamaChatResponse {
  message: { content: string };
}

function extractJSON(raw: string): string {
  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return raw.trim();
}

async function chat(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        format: 'json',
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);

    const data: OllamaChatResponse = await res.json();
    return data.message.content;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * JLPT N2 読み方問題 — AI chỉ tạo distractor, KHÔNG tạo đáp án đúng.
 * Đáp án đúng (correctReading) lấy từ DB, chỉ truyền vào để AI tránh trùng.
 * Trả về: câu ví dụ có ＿＿kanji＿＿ + 3 distractor bằng hiragana.
 */
export async function generateJLPTReadingDistractors(
  kanji: string,
  correctReading: string
): Promise<{ sentence: string; distractors: string[] } | null> {
  const prompt = `あなたはJLPT N2の読み方問題作成の専門家です。
対象の言葉：「${kanji}」
正解の読み方（参考・出力禁止）：${correctReading}

以下を作成してください：
1. 「${kanji}」を自然に含む日本語の文（JLPT N2レベル）。文中で「${kanji}」を ＿＿${kanji}＿＿ の形で示す。
2. 読み方の誤答（distractor）を3つ作成する（ひらがなのみ）。

絶対禁止：
- "${correctReading}" と完全一致するdistractorを作成しないこと
- 正解の読み方を出力に含めないこと

Distractor の条件：
- 音声的に混同しやすいもの（長音・濁音・音読み/訓読みの誤用など）
- モーラ数が正解と大きく異ならないこと
- 3つとも異なるパターンの間違いにすること

JSONのみ返してください：
{"sentence": "＿＿${kanji}＿＿を含む例文", "distractors": ["ひらがな誤答1", "ひらがな誤答2", "ひらがな誤答3"]}`;

  try {
    const raw = await chat(prompt);
    const parsed = JSON.parse(extractJSON(raw));
    const sentence: string = parsed.sentence ?? '';
    const distractors: string[] = (parsed.distractors ?? [])
      .filter((w: unknown) => typeof w === 'string' && (w as string).trim())
      // Safety: loại bỏ bất kỳ distractor nào trùng đáp án đúng
      .filter((w: string) => w.trim() !== correctReading.trim())
      .slice(0, 3);

    const hasBlank =
      sentence.includes(`＿＿${kanji}＿＿`) || sentence.includes('___');
    if (!hasBlank || distractors.length < 3) return null;

    return { sentence, distractors };
  } catch {
    return null;
  }
}

/**
 * JLPT 穴埋め問題 — AI chỉ tạo câu có blank + 3 distractor (từ sai).
 * Đáp án đúng là card.word lấy từ DB.
 */
export async function generateJLPTFillBlankQuestion(
  word: string,
  meaning: string,
  example: string
): Promise<{ sentence: string; distractors: string[] } | null> {
  const prompt = `あなたは日本語能力試験（JLPT）の穴埋め問題作成の専門家です。
対象の言葉：「${word}」（ベトナム語での意味：${meaning}）
例文：「${example}」

以下を作成してください：
1. 例文の中の「${word}」（または活用形・変化形）を「＿＿＿」に置き換えた文
2. 同じ品詞・意味分野で紛らわしい日本語の言葉を3つ（誤答）

注意：
- 文と誤答はすべて日本語で書いてください
- 「＿＿＿」は必ず含めてください

JSONのみ返してください：
{"sentence": "＿＿＿を含む例文", "distractors": ["誤答1", "誤答2", "誤答3"]}`;

  try {
    const raw = await chat(prompt);
    const parsed = JSON.parse(extractJSON(raw));
    const sentence: string = parsed.sentence ?? '';
    const distractors: string[] = (parsed.distractors ?? [])
      .filter((w: unknown) => typeof w === 'string' && (w as string).trim())
      .slice(0, 3);

    // Chấp nhận cả dấu ___ (ASCII) lẫn ＿＿＿ (full-width)
    const hasBlank = sentence.includes('___') || sentence.includes('＿＿＿');
    if (!hasBlank || distractors.length < 3) return null;

    // Chuẩn hoá về dấu ___ để UI xử lý nhất quán
    return { sentence: sentence.replace(/＿＿＿/g, '___'), distractors };
  } catch {
    return null;
  }
}

export { OLLAMA_MODEL };
