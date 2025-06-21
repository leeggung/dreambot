
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
  let qa = [];

  // Load product data
  fetch("/products_tagged.json")
    .then(res => res.json())
    .then(data => { products = data; })
    .catch(() => console.error("❌ products_tagged.json 로드 실패"));

  // Load QA data
  fetch("/qa.json")
    .then(res => res.json())
    .then(data => { qa = data; })
    .catch(() => console.error("❌ qa.json 로드 실패"));

  function matchProduct(userMsg, productsData) {
    const lower = userMsg.toLowerCase();
    return productsData.filter(p => {
      const tags = (p["태그"] || "").toLowerCase();
      return lower.split(/\s+/).some(word =>
        tags.split(",").some(tag => tag.trim() === word)
      );
    });
  }

  function matchQA(userMsg, qaData) {
    const lower = userMsg.toLowerCase();
    return qaData.filter(entry => {
      const q = entry.question.toLowerCase();
      const a = entry.answer.toLowerCase();
      const tags = (entry.tag || []).map(t => t.trim().toLowerCase());
      return q.includes(lower)
          || a.includes(lower)
          || tags.some(tag => lower.includes(tag));
    });
  }

  function renderProductCard(product) {
    addMessage("bot", `
      <div style="border:1px solid #ccc; padding:10px; border-radius:10px; margin:10px 0; background:#f9f9f9">
        <img src="${product.썸네일 || ''}" style="width:100px;height:auto;margin-bottom:5px;"><br>
        <b>${product.제품명 || '상품명 없음'}</b><br>
        <span>${product.태그 || ''}</span>
      </div>
    `, true);
  }

  function renderQACard(answer) {
    addMessage("bot", `
      <div style="border:1px solid #4A90E2; padding:10px; border-radius:10px; margin:10px 0; background:#EAF5FF">
        ${escapeHtml(answer)}
      </div>
    `, true);
  }

  async function handleUserInput() {
    const userMsg = input.value.trim();
    if (!userMsg) return;

    addMessage("user", userMsg);
    input.value = "";

    // First, try product matching
    const matchedProducts = matchProduct(userMsg, products);
    if (matchedProducts.length > 0) {
      matchedProducts.slice(0,1).forEach(p => renderProductCard(p));
    }

    // Next, try QA matching
    const matchedQA = matchQA(userMsg, qa);
    if (matchedQA.length > 0) {
      renderQACard(matchedQA[0].answer);
      return;
    }

    // Fallback: call Gemini
    const payload = { message: userMsg };
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "응답이 없어요.";
      addMessage("bot", reply);
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
