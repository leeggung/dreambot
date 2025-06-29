import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = "gemini-2.0-flash";

  try {
    const userMessage = req.body?.message || "";

    // 파일이 public 폴더 안에 있을 경우, path.join(process.cwd(), 'public', '파일명')으로 접근합니다.
    // 이는 Vercel 환경에서 public 폴더의 내용이 '/var/task/public'에 위치하는 시나리오를 가정합니다.
    const publicPath = path.join(process.cwd(), 'public'); // public 폴더의 경로를 먼저 정의

    // 1. 챗봇의 역할 및 답변 지침 프롬프트 불러오기
    const atomyQaInstructions = fs.readFileSync(path.join(publicPath, "atomy_qa_instructions.txt"), "utf8");

    // 2. 회사 정보 프롬프트 불러오기
    const companyPrompt = fs.readFileSync(path.join(publicPath, "company_prompt.txt"), "utf8");

    // 4. QA.json (회사 비즈니스 Q&A) 파일 불러오기 및 파싱
    const businessQaRawData = fs.readFileSync(path.join(publicPath, "qa.json"), "utf8"); // <-- 경로 수정
    const businessQaJsonData = JSON.parse(businessQaRawData);

    const formattedBusinessQaData = businessQaJsonData.map(item => {
      return `질문: ${item.question}\n답변: ${item.answer}\n`;
    }).join('\n---\n');

    // 5. products_tagged.json (개별 상품 정보) 파일 불러오기 및 파싱
    const productsTaggedRawData = fs.readFileSync(path.join(publicPath, "products_tagged.json"), "utf8"); // <-- 경로 수정
    const productsTaggedJsonData = JSON.parse(productsTaggedRawData);

    const productNames = productsTaggedJsonData.map(item => item.제품명);
    const formattedProductNames = productNames.length > 0 ? productNames.join(', ') : '애터미 제품 목록 없음';

    const combinedPrompt = `
    ${atomyQaInstructions}

---
애터미 회사 개요 및 철학:
${companyPrompt}
---

애터미 사업 Q&A 참조 데이터 (인터넷 최신 정보 우선):
${formattedBusinessQaData}
---

애터미 쇼핑몰 참조 제품 목록:
${formattedProductNames}
---

❗️ 반드시 다음 규칙을 지켜주세요:
- 사용자가 한국어로 질문하면 한국어로, 영어면 영어로, 중국어면 중국어로 설명합니다.
- **제품 이름(제품명)은 무조건 원래 한글 명칭으로 적으세요! 번역하지 마세요.**
- 제품 설명은 사용자의 언어로, 제품 이름만 한국어로 유지!
- 제품 리스트가 필요한 질문에는 반드시 [제품명(한글)] + (설명/효능은 사용자 언어) 형태로 출력하세요.
- 예시:  
  - Atomy 헤모힘 (60포, 1개월분): [사용자 언어로 효능설명]
  - Atomy 바이탈 메가비타민C 2000: [사용자 언어로 효능설명]
- 제품 이름(한글)이 답변에 꼭 들어가게 출력해야 함.  
---

사용자 질문: ${userMessage}
`;

    const contents = [
      {
        role: "user",
        parts: [
          { text: combinedPrompt }
        ]
      }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API 서버 오류:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error("서버 에러:", error);
    if (error.code === 'ENOENT') {
        // 파일 로드 에러 시 사용자에게 더 명확한 메시지 전달
        res.status(500).json({ error: `파일을 찾을 수 없습니다: ${error.path}. 파일이 프로젝트의 public 폴더에 있는지 확인해주세요.` });
    } else {
        res.status(500).json({ error: error.message });
    }
  }
}
