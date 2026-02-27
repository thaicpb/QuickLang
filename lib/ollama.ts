const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
const OLLAMA_TIMEOUT_MS = 30_000;

interface OllamaChatResponse {
  message: { content: string };
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
 * JLPT 言葉の意味問題 — 選択肢はすべて日本語。
 * Sinh câu hỏi dạng "ý nghĩa của từ" với tất cả đáp án bằng tiếng Nhật.
 * Trả về: giải thích đúng bằng tiếng Nhật + 3 giải thích sai bằng tiếng Nhật.
 */
export async function generateJLPTMeaningOptions(
  word: string,
  meaning: string
): Promise<{ correctJP: string; distractors: string[] } | null> {
  const prompt = `あなたは日本語能力試験（JLPT）の問題作成の専門家です。
対象の言葉：「${word}」
ベトナム語での意味（参考用）：${meaning}

以下を作成してください：
1. 「${word}」の意味を表す、短くて自然な日本語の説明（正解）
2. 一見もっともらしいが間違っている日本語の説明を3つ（誤答）

注意：すべて日本語で書いてください。

JSONのみ返してください：
{"correct": "正解の日本語説明", "distractors": ["誤答1", "誤答2", "誤答3"]}`;

  try {
    const raw = await chat(prompt);
    const parsed = JSON.parse(raw);
    const correctJP: string = parsed.correct ?? '';
    const distractors: string[] = (parsed.distractors ?? [])
      .filter((w: unknown) => typeof w === 'string' && (w as string).trim())
      .slice(0, 3);

    if (!correctJP.trim() || distractors.length < 3) return null;
    return { correctJP, distractors };
  } catch {
    return null;
  }
}

/**
 * JLPT 穴埋め問題 — 選択肢はすべて日本語の言葉。
 * Sinh câu hỏi điền vào chỗ trống theo chuẩn JLPT.
 * Đáp án sai là từ tiếng Nhật cùng loại, dễ nhầm lẫn.
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
    const parsed = JSON.parse(raw);
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
