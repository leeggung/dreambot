import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = "gemini-2.0-flash";

  try {
    const type = req.body?.type || "general";
    const userMessage = req.body?.message || "";

    const promptFile = "/prompt.txt";
    const promptPath = path.join(process.cwd(), promptFile);
    const prompt = fs.readFileSync(promptPath, "utf8");
    console.log('💡 로드된 프롬프트:', prompt);

    const fullPrompt = `${prompt.trim()}\n\n${userMessage.trim()}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: { text: fullPrompt },
          // 혹시 options 등 추가 필요하면 넣기
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 호출 실패:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error('서버 에러:', error);
    res.status(500).json({ error: error.message });
  }
}
