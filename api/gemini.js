import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = "gemini-2.0-flash";

  try {
    const userMessage = req.body?.message || "";

    // 역할별 프롬프트 불러오기
    const baseDir = process.cwd();
    const companyPrompt = fs.readFileSync(path.join(baseDir, "/company_prompt.txt"), "utf8");
    const productPrompt = fs.readFileSync(path.join(baseDir, "/product_prompt.txt"), "utf8");

    // 메시지 배열로 역할 분리해서 전달
    const messages = [
      { role: "system", content: companyPrompt },
      { role: "system", content: productPrompt },
      { role: "user", content: userMessage }
    ];

    // API 호출
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }), // 메시지 배열 그대로 보냄
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API 호출 실패:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error("서버 에러:", error);
    res.status(500).json({ error: error.message });
  }
}
