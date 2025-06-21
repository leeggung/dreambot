
// 🔍 제미니 응답에서 키워드를 추출해, 관련 태그 상품을 자동 렌더링
async function renderProductsByTag(geminiResponseText) {
  try {
    const res = await fetch('/products_tagged.json');
    const products = await res.json();

    const keywords = ['눈 건강', '면역력', '피로회복', '홍삼', '화장품', '보습', '구강', '지성', '탄력', '청결', '친환경', '생활용품'];
    const matchedKeywords = keywords.filter(k => geminiResponseText.includes(k));

    const matchedProducts = products.filter(p =>
      p.tags && matchedKeywords.some(tag => p.tags.join(" ").includes(tag))
    );

    if (!matchedProducts.length) return;

    const slot = document.getElementById("auto-card-slot");
    if (slot) {
      matchedProducts.forEach(product => {
        const cardHTML = `
          <div class="chat-right card-wrapper">
            <div class="bubble product">
              <div class="title"><strong>${product.name}</strong></div>
              <img src="${product.thumbnail}" style="max-width:100%; border-radius: 8px; margin-top:8px;">
              <div class="price">${product.price} / ${product.pv}</div>
              <a href="${product.link}" target="_blank" style="color:#007aff;">자세히 보기</a>
            </div>
          </div>
        `;
        slot.innerHTML += cardHTML;
      });
    }
  } catch (err) {
    console.error("태그 기반 상품 추천 오류:", err);
  }
}
