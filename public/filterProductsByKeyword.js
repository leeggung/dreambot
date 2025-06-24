// 제외 대상 키워드 (제품명 또는 카테고리에 포함되면 제거)
const exclusionKeywords = [
  "리플렛", "쇼핑백", "사은품", "세트", "포장", "전단지", "가방", "홍보", "증정"
];

// 키워드로 제품 필터링 (제외 키워드 반영)
function filterProductsByKeyword(keyword) {
  const lowerKeyword = keyword.toLowerCase();

  return products.filter(p => {
    const name = (p["제품명"] || "").toLowerCase();
    const category = (p["카테고리"] || "").toLowerCase();

    const isKeywordMatched = name.includes(lowerKeyword);
    const isExcluded = exclusionKeywords.some(ex => name.includes(ex.toLowerCase()) || category.includes(ex.toLowerCase()));

    return isKeywordMatched && !isExcluded;
  });
}