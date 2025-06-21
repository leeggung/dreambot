
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-button");
  const chatBox = document.getElementById("chat-box");

  function addMessage(role, text, isHTML = false) {
    const div = document.createElement("div");
    div.className = role === "user" ? "user-msg" : "bot-msg";
    div.innerHTML = isHTML ? text : escapeHtml(text);
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
  }

  let products = [];
  fetch("/products_tagged.json")
    .then(res => res.json())
    .then(data => { products = data; })
    .catch(() => console.error("❌ products_tagged.json 로드 실패"));

  function matchProduct(userMsg, productsData) {
    const lower = (userMsg || "").toLowerCase();
    return productsData.filter(p => {
      const tags = (p["태그"] || "").toLowerCase();
      return lower.split(/\s+/).some(word =>
        tags.split(",").some(tag => tag.trim() === word)
      );
    });
  }

  function renderProductCard(product) {
    addMessage("bot", `
      <div style="border:1px solid #ccc; padding:10px; border-radius:10px; margin:10px 0; background:#f9f9f9">
        <b>👁️ 눈 건강 추천 제품</b><br><br>
        <img src="${product.썸네일 || ''}" style="width:100px;height:auto;margin-bottom:5px;"><br>
        <b>${product.제품명 || '상품명 없음'}</b><br>
        <span>${product.태그 || ''}</span><br>
        <span>${product.가격 || ''} / ${product.pv || ''}</span><br>
        <a href="${product.링크 || '#'}" target="_blank">상세 보기</a>
      </div>
    \`, true);
  }

  function analyzeIntent(text) {
    const safe = (text || "").toLowerCase();
    const productKeywords = ["제품", "성분", "건강", "효과", "피부", "눈", "면역", "보습", "영양", "추천"];
    const businessKeywords = ["회원가입", "가입", "수당", "구조", "혜택", "수입", "포인트", "직급", "마케팅", "사업", "후원"];
    const matchedProduct = productKeywords.some(k => safe.includes(k));
    const matchedBusiness = businessKeywords.some(k => safe.includes(k));
    if (matchedBusiness) return "business";
    if (matchedProduct) return "product";
    return "general";
  }

  async function handleUserInput() {
    const userMsg = input.value.trim();
    if (!userMsg) return;

    addMessage("user", userMsg);
    input.value = "";

    const intent = analyzeIntent(userMsg);
    let promptText = "";
    let matchedProducts = [];

    if (intent === "product") {
      matchedProducts = matchProduct(userMsg, products);
      if (matchedProducts.length > 0) {
       const contextInfo = matchedProducts.map((p, i) => {
       return `${i + 1}. ${p["제품명"] || "상품명 없음"}\n태그: ${p["태그"] || "정보 없음"}\n`;
        }).join("\n");

        promptText = \`
💬 사용자 질문: ${userMsg}

👉 아래는 추천된 제품입니다:
${contextInfo}
→ 해당 제품들의 성분과 효능을 인터넷에서 참고해서 간단히 요약해줘.
→ 제품명은 반드시 그대로 말하고, 가격/PV/링크는 말하지 마.
→ 카드에 어울리는 간결한 설명으로 답해줘.
        \`.trim();
      } else {
        promptText = \`사용자 질문: ${userMsg}\n→ 관련된 제품이 없습니다.\`;
      }
    } else if (intent === "business") {
      promptText = \`
사용자 질문: ${userMsg}
→ 아래는 애터미 사업 관련 질문입니다. QA 데이터베이스에 기반해 설명해줘.
→ 너무 짧지 않게, 누구나 이해할 수 있게 말해줘.
→ 상품 홍보보다 구조 설명 중심으로 해줘.
      \`.trim();
    } else {
      promptText = \`사용자 질문: ${userMsg}\n→ 친절하고 명확하게 설명해줘.\`;
    }

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: intent, message: promptText })
      });
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "응답이 없어요.";
      addMessage("bot", reply);

      if (intent === "product" && matchedProducts.length > 0) {
        matchedProducts.forEach(p => renderProductCard(p));
      }
    } catch (e) {
      addMessage("bot", "❌ 오류 발생: " + e.message);
    }
  }

  sendBtn.addEventListener("click", handleUserInput);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    }
  });
});
