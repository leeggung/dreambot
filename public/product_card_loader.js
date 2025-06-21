// ✅ 제품 리스트 JSON 불러오기
let products = [];

fetch("/products_tagged.json")
  .then(res => res.json())
  .then(data => { products = data; })
  .catch(() => console.error("❌ products_tagged.json 불러오기 실패"));

function matchProduct(userMsg, productsData) {
  const lower = (userMsg || "").toLowerCase();
  return productsData.filter(p => {
    const tags = (p["태그"] || "").toLowerCase();
    return lower.split(/\s+/).some(word => tags.includes(word));
  });
}

function renderProductCard(product) {
  addMessage("bot", `
    <div style="border:1px solid #ccc; padding:10px; border-radius:10px; margin:10px 0;">
      <img src="${product.썸네일}" style="width:100px;height:auto;margin-bottom:5px;"><br>
      <b>${product.제품명}</b><br>
      ${product.가격} / ${product.pv}<br>
      <a href="${product.링크}" target="_blank">자세히 보기</a>
    </div>
  `, true);
}