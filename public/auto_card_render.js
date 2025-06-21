
// 🔍 제미니 응답 텍스트에서 상품명과 유사한 항목 매칭 후 자동 카드 렌더링
async function renderMatchingProductCard(geminiResponseText) {
  try {
    const res = await fetch('/products_tagged.json');
    const products = await res.json();

    const cleanText = geminiResponseText.replace(/\s+/g, '').toLowerCase();

    // 유사도 기반 느슨한 매칭
    const matched = products.find(p =>
      p.name.replace(/\s+/g, '').toLowerCase().includes(cleanText)
    );

    if (!matched) return;

    const cardHTML = `
      <div class="bubble product" style="border:1px solid #ccc;padding:10px;border-radius:10px;">
          <div class="title"><strong>${matched.name}</strong></div>
          <img src="${matched.thumbnail}" style="max-width:100%; border-radius: 8px; margin-top:8px;">
          <div class="price">${matched.price} / ${matched.pv}</div>
          <a href="${matched.link}" target="_blank" style="color:#007aff;">자세히 보기</a>
      </div>
    `;

    const slot = document.getElementById("auto-card-slot");
    if (slot) {
      slot.innerHTML = cardHTML;
    }

  } catch (err) {
    console.error("상품 카드 렌더링 중 오류:", err);
  }
}
