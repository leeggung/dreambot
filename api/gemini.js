import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  // Gemini 1.5 Flash 최신 모델명을 사용합니다.
  const modelName = "gemini-2.0-flash"; // 또는 "gemini-1.5-flash"

  try {
    const userMessage = req.body?.message || "";

    // 역할별 프롬프트 불러오기
    const baseDir = process.cwd();
    const companyPrompt = fs.readFileSync(path.join(baseDir, "/company_prompt.txt"), "utf8");
    const productPrompt = fs.readFileSync(path.join(baseDir, "/product_prompt.txt"), "utf8");

    // Gemini API의 generateContent에 맞는 메시지 형식으로 변환
    // 시스템 프롬프트는 user 역할로 전달하거나, 첫 번째 parts에 포함하는 방식이 일반적입니다.
    // 여기서는 'user' 역할의 메시지 내용에 포함하는 방식으로 진행합니다.
    const contents = [
      {
        role: "user",
        parts: [{ text: `회사 정보: ${companyPrompt}\n\n제품 정보: ${productPrompt}\n\n사용자 메시지: ${userMessage}` }],
      },
    ];

    // API 호출 시 보낼 본문 데이터
    const requestBody = {
      contents: contents,
      // Google 검색 도구를 활성화합니다.
      // tools 배열에 GoogleSearch 객체를 포함시켜야 합니다.
      tools: [
        {
          functionDeclarations: [
            {
              name: "googleSearch",
              description: "Perform a Google search and get real-time information.",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query.",
                  },
                },
                required: ["query"],
              },
            },
          ],
        },
      ],
      // 도구 사용을 위한 tool_config (선택적, 자동 호출을 위한 설정)
      tool_config: {
        functionCallingConfig: {
          mode: "AUTO", // 모델이 필요에 따라 자동으로 도구를 호출하도록 설정
        },
      },
    };

    // API 호출
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API 호출 실패:", errorText);
      // 더 상세한 에러 로깅을 위해 JSON 파싱 시도
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Gemini API 에러 JSON:", errorJson);
        return res.status(response.status).json({ error: errorJson });
      } catch (e) {
        return res.status(response.status).json({ error: errorText });
      }
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error("서버 에러:", error);
    res.status(500).json({ error: error.message });
  }
}
