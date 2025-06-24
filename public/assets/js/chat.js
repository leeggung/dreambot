// /assets/js/chat.js

// 전역 변수 선언
let products = []; // 제품 카드를 위한 데이터

// 비즈니스 카드 데이터
const businessCards = [
    {
        title: "자주하는 질문",
        description: "애터미 관련 자주 묻는 질문을 확인해보세요.",
        image: "/assets/images/faq.png", // 경로 수정
        link: "https://blog.naver.com/leehyku/223851031151"
    },
    {
        title: "회원가입 안내",
        description: "애터미 회원가입 방법을 확인하세요.",
        image: "/assets/images/회원가입.png", // 경로 수정
        link: "https://blog.naver.com/leehyku/223859216766"
    }
];

// 텍스트 정제 함수
function sanitizeGeminiText(text) {
    // Gemini가 HTML 태그를 직접 포함하여 보내는 경우, 이 함수에서 HTML 태그를 제거하지 않습니다.
    // addMessage 호출 시 isHTML: true를 사용하여 HTML로 렌더링되도록 합니다.
    return text.trim();
}

// HTML 특수 문자 이스케이프 함수 (isHTML이 false일 때 사용)
function escapeHtml(text) {
    if (typeof text !== 'string') {
        text = String(text);
    }
    return text.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}

// 메시지를 채팅창에 추가하는 함수 (UI 업데이트)
function addMessage(role, text, isHTML = false) {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) {
        console.error("채팅 박스 요소를 찾을 수 없습니다.");
        return;
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${role}`;

    // 봇 메시지일 경우에만 아바타 추가
    if (role === "bot") {
        const avatar = document.createElement('img');
        avatar.src = "/assets/images/dreami.png"; // 아바타 이미지 경로
        avatar.className = 'avatar';
        avatar.alt = "드림이";
        messageDiv.appendChild(avatar);
    }

    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = "bubble";
    bubbleDiv.innerHTML = isHTML ? text : escapeHtml(text); // HTML 여부에 따라 처리

    messageDiv.appendChild(bubbleDiv);
    chatBox.appendChild(messageDiv);
    // 스크롤 하단으로 이동 (부드러운 스크롤 추가)
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
    });
}

// 제품 매칭 함수
function matchProduct(userMsg, products) {
  const lowered = userMsg.toLowerCase();
  const matched = [];

  const bannedKeywords = ["리플렛", "카탈로그", "쇼핑백", "포장"];

  for (const p of products) {
  const name = (p.제품명 || "").toLowerCase();
  const tagsRaw = p.태그 || "";
  const tags = Array.isArray(tagsRaw) ? tagsRaw.join(",") : tagsRaw;
  const tagsLower = String(tags).toLowerCase();

  if (bannedKeywords.some(b => lowered.includes(b) || name.includes(b) || tagsLower.includes(b))) continue;

  if (lowered.includes(name)) {
    matched.push(p);
    continue;
  }

  const tagList = tagsLower.split(',').map(t => t.trim());
  for (const tag of tagList) {
    if (tag && lowered.includes(tag)) {
      matched.push(p);
      break;
    }
  }
}


  return matched;
}

// 비즈니스 카드 매칭 함수
function matchBusinessCards(userMsg, cards) {
  const lower = userMsg.toLowerCase();
  return cards.filter(c =>
    (lower.includes("회원가입") && c.title.includes("회원가입")) ||
    (lower.includes("질문") && c.title.includes("자주하는"))
  );
}

// 의도 분석 함수
function analyzeIntent(text) {
  const safe = (text || "").toLowerCase();
  const productKeywords = ["제품", "성분", "건강", "효과", "피부", "눈", "면역", "보습", "영양", "샴푸", "치약", "비타민", "헤모힘", "솔루션"];
  const businessKeywords = ["회원가입", "가입", "수당", "구조", "혜택", "수입", "포인트", "직급", "마케팅", "사업", "후원", "수익"];

  const matchedProduct = productKeywords.some(k => safe.includes(k));
  const matchedBusiness = businessKeywords.some(k => safe.includes(k));

  if (matchedBusiness) return "business";
  if (matchedProduct) return "product";
  return "general";
}
// 제품 카드 렌더링 함수
function renderProductCards(matchedProducts) {
    if (!Array.isArray(matchedProducts) || matchedProducts.length === 0) {
        console.error("renderProductCards: 유효한 제품 배열이 아니거나 비어있음!", matchedProducts);
        return;
    }

    const cardsHTML = matchedProducts.map(product => {
        const imageUrl = product.썸네일 || '';
        const productName = escapeHtml(product.제품명 || '상품명 없음');
        const tags = escapeHtml(product.태그 || '');
        const price = escapeHtml(product.가격 || '');
        const pv = escapeHtml(product.pv || '');
        const link = escapeHtml(product.링크 || '#');

        return `
            <div class="product-card">
                <b>👁️ 제품 카드</b><br><br>
                ${imageUrl ? `<img src="${imageUrl}" alt="${productName}">` : ''}<br>
                <b>${productName}</b><br>
                <span>${tags}</span><br>
                <span>${price} / ${pv}</span><br>
                <a href="${link}" target="_blank">상세 보기</a>
            </div>
        `;
    }).join('');

    addMessage("bot", `<div class="card-container">${cardsHTML}</div>`, true);
}

// 비즈니스 카드 렌더링 함수
function renderBusinessCards(cards) {
    cards.forEach(card => {
        addMessage("bot", `
            <div style="border:1px solid #aaa; padding:10px; border-radius:10px; margin:10px 0; background:#f0f0f0; color:#333;">
                <b>📌 ${escapeHtml(card.title)}</b><br><br>
                <img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.title)}" style="width:100px;height:auto;margin-bottom:5px;"><br>
                ${escapeHtml(card.description)}<br>
                <a href="${escapeHtml(card.link)}" target="_blank" style="color:blue;">자세히 보기</a>
            </div>
        `, true);
    });
}

// Gemini API 호출 로직
async function getGeminiResponse(userMessage) {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API 서버 오류:', errorText);
            return `서버에서 오류가 발생했습니다: ${errorText}`;
        }

        const data = await response.json();
        if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error("Gemini 응답 형식 오류:", data);
            return "죄송합니다. 답변을 생성하지 못했습니다. (응답 형식 오류)";
        }

    } catch (error) {
        console.error('Gemini API 호출 중 오류 발생:', error);
        return `오류: AI 응답을 가져오는 데 실패했습니다. ${error.message}`;
    }
}

// === [추가된 필터링 로직 관련 상수 및 함수들] ===
const bannedKeywords = ["쇼핑백", "포장", "리플렛", "사은품", "전단지", "꾸러미"];
const requiredCategory = ["건강기능식품", "홍삼", "면역력", "눈 건강"];

function cleanGPTText(text) {
    // 이 함수는 현재 사용되지 않으며, sanitizeGeminiText가 역할을 대체합니다.
    // HTML 이스케이프 또는 제거 로직이 필요한 경우 이 함수를 다시 활성화할 수 있습니다.
    return text
        .replace(/[\*\"\“\”]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function mentionsOtherBrands(text) {
    const brands = ["암웨이", "뉴스킨", "시셀", "허벌라이프", "다단계", "경쟁사", "타회사"];
    return brands.some(b => text.includes(b));
}
// === [필터링 로직 관련 끝] ===

// 사용자 입력 처리 및 챗봇 응답 생성 핵심 함수
async function handleUserInput() {
    const userInput = document.getElementById("userInput");
    if (!userInput) {
        console.error("userInput 요소를 찾을 수 없습니다.");
        return;
    }

    const userMsg = userInput.value.trim();
    if (!userMsg) return;

    addMessage("user", userMsg); // 사용자 메시지 UI에 추가
    userInput.value = ""; // 입력 필드 초기화

    // --- 1. 클라이언트에서 먼저 의도를 분석하여 카드 렌더링 시도 ---
    const intent = analyzeIntent(userMsg);
    let cardRenderedByIntent = false; // 의도 분석에 의해 카드가 렌더링되었는지 여부

    if (intent === "product") {
        const matches = matchProduct(userMsg, products);
        if (matches.length > 0) {
            renderProductCards(matches); // 여러 제품이 매치될 수 있으므로 한 번에 전달
            cardRenderedByIntent = true;
        }
    } else if (intent === "business") {
        const matches = matchBusinessCards(userMsg, businessCards);
        if (matches.length > 0) {
            renderBusinessCards(matches);
            cardRenderedByIntent = true;
        }
    }

    // --- 2. Gemini API 호출 (카드 렌더링 여부와 관계없이 항상 호출) ---
    // AI 답변 로딩 메시지 추가
    addMessage("bot", "답변을 생성 중입니다...", false); // 로딩 메시지는 HTML이 아니므로 false

    const geminiResponse = await getGeminiResponse(userMsg);
    const sanitizedText = sanitizeGeminiText(geminiResponse);

    // 로딩 메시지를 제거하고 실제 Gemini 응답으로 교체
    const chatBox = document.getElementById("chat-box");
    if (chatBox && chatBox.lastChild) {
        const lastBubble = chatBox.lastChild.querySelector('.bubble');
        if (lastBubble && lastBubble.textContent === "답변을 생성 중입니다...") {
            chatBox.lastChild.remove(); // 로딩 메시지 제거
        }
    }
    
    // Gemini 응답에 HTML 태그가 포함될 수 있으므로 isHTML을 true로 설정
    // 이 방식은 Gemini가 의도치 않은 HTML을 생성할 경우 문제가 될 수 있습니다.
    // 이상적으로는 Gemini에게 순수 텍스트만 요청하는 것이 좋습니다.
    addMessage("bot", sanitizedText, true); 

    // --- 3. Gemini 응답 후 추가 필터링 및 카드 렌더링 로직 ---
    if (mentionsOtherBrands(sanitizedText)) {
        addMessage("bot", "저는 애터미 전용 AI입니다. 애터미 관련 질문만 도와드릴 수 있어요.");
    } else {
        let matchesAfterGemini = products.filter(p => {
            const name = p["제품명"] || "";
            const category = p["카테고리"] || "";

            // Gemini 응답 텍스트를 소문자로 변환하여 일치 여부 확인
            const sanitizedTextLower = sanitizedText.toLowerCase();

            const hasNameInResponse = sanitizedTextLower.includes(name.toLowerCase()); // 제품명 소문자 비교
            const isCategoryValid = requiredCategory.some(rc => category.includes(rc));
            const isExcluded = bannedKeywords.some(bk => name.includes(bk) || category.includes(bk));

            return hasNameInResponse && isCategoryValid && !isExcluded;
        });

        if (intent === "product") {
            matchesAfterGemini = matchProduct(sanitizedText, products);
            if (matchesAfterGemini.length > 0) {
                if (!cardRenderedByIntent) {
                    setTimeout(() => {
                        renderProductCards(matchesAfterGemini);
                    }, 2000); // Gemini 응답 후 2초 지연
                }
            }
        }
    }
} // <== 여기가 handleUserInput 함수 닫는 중괄호!
	
		
		
// DOMContentLoaded 이벤트 리스너: 페이지 로드 후 실행
window.addEventListener("DOMContentLoaded", () => {
    // DOM 요소 참조 (이벤트 리스너 내에서 한 번만 가져옴)
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("send-button");
    const settingsMenuItem = document.getElementById("settings-menu-item");
    const closeSettingsButton = document.getElementById("close-settings-button");
    // const chatContainer = document.querySelector(".chat-container"); // 더 이상 직접 사용하지 않음

    // products_tagged.json 로드
    fetch("/products_tagged.json")
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            products = data; // 전역 products 변수에 할당
            console.log("✅ products_tagged.json 로드 완료", products.length, "개 제품");
        })
        .catch(error => console.error("❌ products_tagged.json 로드 실패:", error));

    // 1. 저장된 폰트 크기 불러오기 (settings.js의 함수 사용)
    const savedFontSize = localStorage.getItem('chat_font_size');
    if (savedFontSize) {
      setFontSize(savedFontSize); // setFontSize 함수는 settings.js에 정의되어 있음
    }

    // 2. 저장된 배경 이미지 불러오기 (settings.js의 함수 사용)
    const savedBgImage = localStorage.getItem('chat_bg_image');
    if (savedBgImage) {
      setChatBackground(savedBgImage); // setChatBackground 함수는 settings.js에 정의되어 있음
    }

    // 3. 입력창 포커스 시 채팅 컨테이너 패딩 조절 (모바일 키보드 대응)
    // 이 부분은 chat.css의 scroll-padding-bottom으로 대체되므로 제거하거나 주석 처리합니다.
    /*
    if (userInput && chatContainer) {
     
      userInput.addEventListener("blur", () => {
        chatContainer.classList.remove("raised");
      });
    }
    */
    // 입력창 포커스 시 스크롤 위치 조절은 CSS의 scroll-padding-bottom과 settings.js의 로직으로 처리됩니다.

    // 4. 설정 메뉴 아이템 클릭 이벤트 연결 (settings.js의 toggleSettings 함수 사용)
    if (settingsMenuItem) {
        settingsMenuItem.addEventListener('click', toggleSettings);
    }

    // 5. 설정 패널 닫기 버튼 클릭 이벤트 연결
    if (closeSettingsButton) {
        closeSettingsButton.addEventListener('click', toggleSettings);
    }
    
    // 6. 배경 이미지 선택 버튼 클릭 이벤트 연결 (settings.js의 setChatBackground 함수 사용)
    document.querySelectorAll('.bg-options img').forEach(img => {
        img.addEventListener('click', (event) => {
            const bgUrl = event.target.dataset.bgUrl;
            if (bgUrl) {
                setChatBackground(bgUrl);
            }
        });
    });

    // 7. 폰트 크기 버튼 클릭 이벤트 연결 (settings.js의 setFontSize 함수 사용)
    document.querySelectorAll('.font-size-buttons button').forEach(button => {
        button.addEventListener('click', (event) => {
            const fontSize = event.target.dataset.fontSize;
            if (fontSize) {
                setFontSize(fontSize);
            }
        });
    });

    // 8. 전송 버튼 클릭 이벤트 연결
    if (sendButton) {
        sendButton.addEventListener("click", handleUserInput);
    }

    // 9. 엔터 키로 메시지 전송
    if (userInput) {
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { // Shift+Enter는 줄 바꿈 허용
                e.preventDefault(); // 기본 엔터 동작 (줄 바꿈) 방지
                handleUserInput();
			}
        });
    }
});