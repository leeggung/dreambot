let products = [];
let qaData = [];
let chatHistory = [];

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\w가-힣]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');
}
function highlightProductNames(text, products) {
    if (!Array.isArray(products) || products.length === 0) return text;
    let result = text;
    products.forEach(product => {
        const name = product.제품명;
        const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(safeName, 'g'), `<span style="color:red; font-weight:bold;">${name}</span>`);
    });
    return result;
}
function convertNewlinesToBr(text) {
    return text.replace(/\n/g, "<br>");
}
function escapeHtml(text) {
    if (typeof text !== 'string') text = String(text);
    return text.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

 // 비즈니스 카드 데이터 (원하는 만큼 확장 가능)
const businessCards = [
    {
        title: "자주하는 질문",
        description: "애터미 관련 자주 묻는 질문을 확인해보세요.",
        image: "/assets/Thumbnail/faq.png", // 경로 수정
        link: "https://blog.naver.com/leehyku/223851031151"
    },
    {
        title: "회원가입 안내",
        description: "애터미 회원가입 방법을 확인하세요.",
        image: "/assets/Thumbnail/membership.png", // 경로 수정
        link: "https://blog.naver.com/leehyku/223859216766"
    },
	{
        title: "계보도 보는 방법",
        description: "계보도 보는 방법을 확인하세요.",
        image: "/assets/Thumbnail/tree.png", // 경로 수정
        link: "https://blog.naver.com/leehyku/223870972762"
    },
	{
        title: "부업에서 본업까지",
        description: "부업에서 본업까지 가는길.",
        image: "/assets/Thumbnail/sideline.png", // 경로 수정
        link: "https://blog.naver.com/leehyku/223851029151"
    },
	{
        title: "마케팅,플랜",
        description: "마케팅 플랜을 알아보세요.",
        image: "/assets/Thumbnail/flan.png", // 경로 수정
        link: "https://blog.naver.com/leehyku/223859216766"
    },
	{
        title: "소개,마케팅",
        description: "알면쉬워요. 한명의 소개부터 이어지는 마케팅.",
        image: "/assets/Thumbnail/easy,png", // 경로 수정
        link: "https://blog.naver.com/leehyku/223866693358"
    },
	{
        title: "협력사,아자몰",
        description: "협업사 쇼핑몰 아자몰.",
        image: "/assets/Thumbnail/azamall.png", // 경로 수정
        link: "https://atomyaza.co.kr"
    },
	{
        title: "아자몰,PVUP제품",
        description: "아자몰 PV UP 상품관",
        image: "/assets/Thumbnail/azapvup.jpg", // 경로 수정
        link: "https://atomyaza.co.kr/m/shop/plan.display.detail.php?pl_no=503&cate_id=2094"
    },
	{
        title: "GLOBAL, AZA",
        description: "글로벌 아자몰.",
        image: "/assets/Thumbnail/gobalaza.png", // 경로 수정
        link: "https://global.atomyaza.com/"
    },
	{
        title: "변화,계획,구축",
        description: "마트 체인지가 시작됩니다.",
        image: "/assets/Thumbnail/change.png", // 경로 수정
        link: "https://blog.naver.com/leehyku/223851010978"
    },
	{
        title: "회사선택,재무구조",
        description: "회사 선택의 방법",
        image: "/assets/Thumbnail/Select_company.png", // 경로 수정
        link: "https://blog.naver.com/leehyku/223851006454"
    },
	{
        title: "회사소개,애터미회사연혁",
        description: "애터미 회사소개",
        image: "/assets/Thumbnail/company.jpg", // 경로 수정
        link: "https://blog.naver.com/leehyku/223846206345"
    }
	
];

// 🟦 메시지 UI
function showListeningState() {
  addMessage("bot", "👂 드림이가 듣고 있어요...", false);
  const botMessages = document.querySelectorAll(".message.bot .avatar");
  if (botMessages.length > 0) {
    botMessages[botMessages.length - 1].src = "/assets/images/dreami_listening.png";
  }
}
function resetAvatarToDefault() {
  const botMessages = document.querySelectorAll(".message.bot .avatar");
  botMessages.forEach(img => {
    img.src = "/assets/images/dreami.png";
  });
}
function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "ko-KR";
  showListeningState();
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("userInput").value = transcript;
  };
  recognition.onerror = function(e) {
    alert("음성 인식 오류: " + e.error);
    resetAvatarToDefault();
  };
  recognition.start();
}
function addMessage(role, text, isHTML = false) {
    chatHistory.push({ role, text });
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${role}`;
    const avatar = document.createElement('img');
    avatar.className = "avatar";
    avatar.src = (role === "bot") ? "/assets/images/dreami.png" : "/assets/images/user.png";
    avatar.alt = (role === "bot") ? "드림이" : "유저";
    messageDiv.appendChild(avatar);
    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = "bubble";
    bubbleDiv.innerHTML = isHTML ? text : escapeHtml(text);
    messageDiv.appendChild(bubbleDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
}

// 🟦 제품카드 (3개까지)
function renderProductCards(matchedProducts) {
  if (!Array.isArray(matchedProducts) || matchedProducts.length === 0) return;
  const top3 = matchedProducts.slice(0, 3);
  const cardsHTML = top3.map(product => {
    const imageUrl = product.썸네일 || '';
    const productName = escapeHtml(product.제품명 || '상품명 없음');
    const tags = escapeHtml(product.태그 || '');
    const price = escapeHtml(product.가격 || '');
    const pv = escapeHtml(product.pv || '');
    const link = escapeHtml(product.링크 || '#');
    return `
      <div class="product-card">
        ${imageUrl ? `<img src="${imageUrl}" alt="${productName}">` : ''}
        <b>${productName}</b><br>
        <span>${tags}</span><br>
        <span class="pv-point">${price} / ${pv}</span><br>
        <a href="${link}" target="_blank"><button class="view-button">상세 보기</button></a>
      </div>
    `;
  }).join('');
  const chatBox = document.getElementById("chat-box");
  if (!chatBox) return;
  const messageDiv = document.createElement("div");
  messageDiv.className = "message bot product-cards-message";
  const avatar = document.createElement("div");
  avatar.className = "avatar placeholder";
  avatar.style.width = "36px";
  messageDiv.appendChild(avatar);
  const cardsWrapper = document.createElement("div");
  cardsWrapper.className = "product-cards-wrapper";
  cardsWrapper.innerHTML = cardsHTML;
  messageDiv.appendChild(cardsWrapper);
  chatBox.appendChild(messageDiv);
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
}

// 🟦 비즈니스 카드
function renderBusinessCards(cards) {
  if (!cards.length) return;
  const card = cards[0];
  const cardHTML = `
    <div class="business-card">
      <b>📌 ${escapeHtml(card.title)}</b><br><br>
      <img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.title)}"
           style="width:100px; height:auto; display:block; margin: 0 auto 5px;"><br>
      ${escapeHtml(card.description)}<br>
      <a href="${escapeHtml(card.link)}" target="_blank" style="color:blue;">자세히 보기</a>
    </div>
  `;
  const chatBox = document.getElementById("chat-box");
  if (!chatBox) return;
  const container = document.createElement("div");
  container.className = "product-cards-wrapper";
  container.innerHTML = cardHTML;
  chatBox.appendChild(container);
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
}

// 🟦 제품 매칭 함수
function matchProduct(userMsg, products) {
    const lowered = userMsg.toLowerCase();
    const bannedKeywords = ["리플렛", "카탈로그", "쇼핑백", "포장"];
    return products.filter(p => {
        const name = (p.제품명 || "").toLowerCase();
        const tagsRaw = p.태그 || "";
        const tags = Array.isArray(tagsRaw) ? tagsRaw.join(",") : tagsRaw;
        const tagsLower = String(tags).toLowerCase();
        if (bannedKeywords.some(b => lowered.includes(b) || name.includes(b) || tagsLower.includes(b))) return false;
        if (lowered.includes(name)) return true;
        return tagsLower.split(',').some(tag => tag && lowered.includes(tag));
    });
}
// 🟦 비즈니스 카드 매칭
function matchBusinessCards(userMsg, cards) {
    const lower = userMsg.toLowerCase();
    return cards.filter(c =>
      (lower.includes("회원가입") && c.title.includes("회원가입")) ||
      (lower.includes("자주하는") && c.title.includes("질문")) ||
      (lower.includes("재무구조") && c.title.includes("회사선택")) ||
      (lower.includes("변화") && c.title.includes("계획")) ||
      (lower.includes("아자몰") && c.title.includes("협력사")) ||
      (lower.includes("계보도") && c.title.includes("보는")) ||
      (lower.includes("부업") && c.title.includes("본업까지")) ||
      (lower.includes("마케팅") && c.title.includes("플랜")) ||
      (lower.includes("아자몰") && c.title.includes("pvup")) ||
      (lower.includes("글로벌 아자") && c.title.includes("aza")) ||
      (lower.includes("회사소개") && c.title.includes("회사")) || 
      (lower.includes("혜택") && c.title.includes("비지니스"))  
    );
}
// 🟦 의도 분석
function analyzeIntent(text) {
    const safe = (text || "").toLowerCase();
    const productKeywords = ["제품", "성분", "건강", "효과", "피부", "눈", "면역", "보습", "영양", "샴푸", "치약", "비타민", "헤모힘", "소개", "추천", "알려줘", "궁금"];
    const businessKeywords = ["회원가입", "가입", "수당", "구조", "혜택", "수입", "포인트", "직급", "마케팅", "사업", "후원", "수익", "회사", "아자몰"];
    if (businessKeywords.some(k => safe.includes(k))) return "business";
    if (productKeywords.some(k => safe.includes(k))) return "product";
    return "general";
}

// 🟦 Gemini API 호출
async function getGeminiResponse(userMessage) {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: userMessage }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            return `서버에서 오류가 발생했습니다: ${errorText}`;
        }
        const data = await response.json();
        if (data && data.candidates && data.candidates.length > 0 &&
            data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            return data.candidates[0].content.parts[0].text;
        }
        return "죄송합니다. 답변을 생성하지 못했습니다.";
    } catch (error) {
        return `오류: AI 응답을 가져오는 데 실패했습니다. ${error.message}`;
    }
}

// 🟦 Gemini 응답에서 3개만 제품카드
function matchGeminiProducts(geminiText, products) {
    const loweredGemini = (geminiText || "").toLowerCase();
    return products.filter(p => {
        const name = (p.제품명 || "").toLowerCase();
        return loweredGemini.includes(name);
    }).slice(0, 3);
}

// 🟦 QA 답변 추출
function matchQABusinessAnswer(userMsg, qaData) {
    const lower = userMsg.toLowerCase();
    for (const qa of qaData) {
        if (qa.tag && qa.tag.some(tag => lower.includes(tag.toLowerCase()))) {
            return qa.answer;
        }
        if (qa.question && lower.includes(qa.question.replace(/\?/g,"").toLowerCase())) {
            return qa.answer;
        }
    }
    return null;
}

// ==== 진짜 핵심: 사용자 입력 처리 ====
async function handleUserInput() {
  resetAvatarToDefault();
  const userInput = document.getElementById("userInput");
  if (!userInput) return;
  const userMsg = userInput.value.trim();
  if (!userMsg) return;
  addMessage("user", userMsg);
  userInput.value = "";
  const isTranslateToZh = /중국어로 해줘|Chinese|中文/i.test(userInput);
  const isTranslateToEn = /영어로 해줘|English|英文/i.test(userInput);
  if (isTranslateToZh || isTranslateToEn) {
    const lastBotMsg = [...chatHistory].reverse().find(msg => msg.role === "bot" && msg.text.length > 20);
    if (lastBotMsg) {
      const prompt = `${isTranslateToZh ? "아래 텍스트를 중국어로 자연스럽게 번역해줘:\n" : "Please translate the text below into English:\n"}${lastBotMsg.text}`;
      const geminiResponse = await getGeminiResponse(prompt);
      addMessage("bot", geminiResponse, true);
      return;
    }
  }
  const businessMatches = matchBusinessCards(userMsg, businessCards);
  if (businessMatches.length > 0) {
    renderBusinessCards(businessMatches);
    const matchedQAText = matchQABusinessAnswer(userMsg, qaData);
    if (matchedQAText) addMessage("bot", matchedQAText, false);
  }
  addMessage("bot", "답변을 생성 중입니다...", false);
  const geminiResponse = await getGeminiResponse(userMsg);
  let sanitizedText = (geminiResponse || "").trim();
  sanitizedText = highlightProductNames(sanitizedText, products);
  sanitizedText = convertNewlinesToBr(sanitizedText);
  const chatBox = document.getElementById("chat-box");
  if (chatBox && chatBox.lastChild) {
    const lastBubble = chatBox.lastChild.querySelector('.bubble');
    if (lastBubble && lastBubble.textContent === "답변을 생성 중입니다...") {
      chatBox.lastChild.remove();
    }
  }
  addMessage("bot", sanitizedText, true);
  const intent = analyzeIntent(userMsg);
  if (intent === "product") {
    const geminiMatches = matchGeminiProducts(sanitizedText, products);
    if (geminiMatches.length > 0) renderProductCards(geminiMatches);
  }
}

// ==== 초기화 ====
window.addEventListener("DOMContentLoaded", () => {
    fetch("/products_tagged.json")
        .then(res => res.json())
        .then(data => { products = data; });
    fetch("/qa.json")
        .then(res => res.json())
        .then(data => { qaData = data; });
    document.getElementById("send-button").addEventListener("click", handleUserInput);
    document.getElementById("userInput").addEventListener("keydown", (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });
    if (document.getElementById("settings-menu-item")) {
        document.getElementById("settings-menu-item").addEventListener('click', toggleSettings);
    }
    if (document.getElementById("close-settings-button")) {
        document.getElementById("close-settings-button").addEventListener('click', toggleSettings);
    }
});
document.querySelectorAll('.font-size-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
        const size = btn.getAttribute('data-font-size');
        setFontSize(size);
    });
});
