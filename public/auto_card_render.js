
// auto_card_render_revised.js

import products from "./products_tagged.json";

// 제미니 응답에서 제품 키워드 정제
function cleanGeminiText(text) {
  return text.replace(/\*\*/g, "").replace(/["“”]/g, "").trim().toLowerCase();
}

// 텍스트 기준으로 제품 매칭
function matchProductFromGemini(text) {
  const clean = cleanGeminiText(text);

  return products.find(p => {
    const name = (p["제품명"] || "").toLowerCase();
    const role = (p["역할"] || "").toLowerCase();
    const category = (p["카테고리"] || "").toLowerCase();

    return (
      clean.includes(name) ||
      name.includes(clean) ||
      (clean.includes(role) && clean.includes(category))
    );
  });
}

// 카드 HTML 생성
function createProductCard(product) {
  return `
    <div class="product-card" style="border:1px solid #ccc; padding:10px; margin:10px 0; border-radius:8px;">
      <div class="title"><strong>${product["제품명"]}</strong></div>
      <img src="${product["썸네일"]}" alt="${product["제품명"]}" style="width:100%; border-radius:6px; margin-top:8px;">
      <div class="price">${product["가격"]} / ${product["pv"]}</div>
      <a href="${product["링크"]}" target="_blank" style="display:block; margin-top:10px; color:#007aff;">자세히 보기</a>
    </div>
  `;
}

// 최종 렌더링 함수
export function renderMatchedProductCard(geminiOutputText, targetElementId = "cards-container") {
  const product = matchProductFromGemini(geminiOutputText);

  if (!product) {
    console.warn("❌ 일치하는 제품을 찾지 못했습니다.");
    return;
  }

  const container = document.getElementById(targetElementId);
  if (!container) return;

  container.innerHTML += createProductCard(product);
}
