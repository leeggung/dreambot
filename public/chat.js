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
    `, true);
  }

  function renderBusinessCards(cards) {
    cards.forEach(card => {
      addMessage("bot", `
        <div style="border:1px solid #ccc; padding:10px; border-radius:10px; background:#f9f9f9">
          <b>📌 ${card.title}</b><br><br>
          <img src="${card.image}" style="width:100px;height:auto;margin-bottom:5px;"><br>
          ${card.description}<br>
          <a href="${card.link}" target="_blank">자세히 보기</a>
        </div>
      `, true);
    });
  }

  function matchBusinessCards(userMsg, cards) {
    const lower = userMsg.toLowerCase();
    return cards.filter(c =>
      lower.includes("회원가입") && c.title.includes("회원가입") ||
      lower.includes("질문") && c.title.includes("자주하는")
    );
  }

  function analyzeIntent(text) {
    const safe = (text || "").toLowerCase();
    const productKeywords = ["제품", "성분", "건강", "효과", "피부", "눈", "면역", "보습", "영양"];
    const businessKeywords = ["회원가입", "가입", "수당", "구조", "혜택", "수입", "포인트", "직급", "마케팅", "사업", "후원"];
    const matchedProduct = productKeywords.some(k => safe.includes(k));
    const matchedBusiness = businessKeywords.some(k => safe.includes(k));
    if (matchedBusiness) return "business";
    if (matchedProduct) return "product";
    return "general";
  }

  const businessCards = [
    {
      title: "자주하는 질문",
      description: "애터미 관련 자주 묻는 질문을 확인해보세요.",
      image: "https://postfiles.pstatic.net/MjAyNTA1MTVfMTE3/MDAxNzQ3MjkzMjk5MjM2.L0CfnKh8_xFS_xv33Rq2c14uUaDaKUxZXg4K6lGq-ecg.DbDxWRbA9_l9kenGBn-bgaCfbV5wExVnLwOIAAqCqbQg.PNG",
      link: "https://blog.naver.com/leehyku/223851031151"
    },
    {
      title: "회원가입 안내",
      description: "애터미 회원가입 방법을 확인하세요.",
      image: "https://postfiles.pstatic.net/MjAyNTA1MDhfNDAg/MDAxNzQ2NjkwNTA5NzAy.83qYxNFWgB6Vl3SGGgdlgjaWPxeVBW8D1NmkWRy0ic4g.cNpjp46aJxfVW4ssemgzsgSANmMr-38QBdQurszo34Ig.PNG",
      link: "https://blog.naver.com/leehyku/223859216766"
    }
  ];

  async function handleUserInput() {
    const userMsg = input.value.trim();
    if (!userMsg) return;

    addMessage("user", userMsg);
    input.value = "";

    const intent = analyzeIntent(userMsg);
    let promptText = "";
    let matchedProducts = [];

    if (intent === "business") {
      const matched = matchBusinessCards(userMsg, businessCards);
      renderBusinessCards(matched);
      promptText = `현재 대화 주제: 사업 안내
추천 카드: ${matched.map(c => c.title).join(", ")}
사용자 질문: ${userMsg}`;
    } else if (intent === "product") {
      matchedProducts = matchProduct(userMsg, products);
      if (matchedProducts.length > 0) {
        matchedProducts.forEach(p => renderProductCard(p));
        const contextInfo = `추천 제품: ${matchedProducts.map(p => `${p["제품명"]} (${p["가격"]} / ${p["pv"]})`).join(", ")}`;
        promptText = `현재 대화 주제: 상품 추천
${contextInfo}
사용자 질문: ${userMsg}
→ 위 제품들의 기능이나 성분을 핵심만 간단히 요약해줘. 너무 길게 쓰지 말고 카드용 응답처럼 답변해줘.`;
      } else {
        promptText = `사용자 질문: ${userMsg}
관련된 제품이 없습니다.`;
      }
    } else {
      promptText = `사용자 질문: ${userMsg}`;
    }

    const languageNotice = "※ 현재는 한국어 기준입니다. 해외 사용자는 지역 사이트 또는 글로벌 애터미 사이트를 참조하세요.";
    promptText += `

${languageNotice}`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: promptText }] }]
    };

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
