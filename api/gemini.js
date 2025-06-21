import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = "gemini-2.0-flash";

  try {
    const type = req.body?.type || "general";
    const userMessage = req.body?.message || "";

    let promptFile = "public/prompt.txt";
   
    const promptPath = path.join(process.cwd(), promptFile);
    const prompt = fs.readFileSync(promptPath, "utf8");

    const fullPrompt = `${prompt.trim()}\n\n${userMessage.trim()}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }]
        }),
      }
    );

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
