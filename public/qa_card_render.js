
// 🧠 비즈니스 Q&A 카드 렌더링 함수
function renderBusinessQA(item) {
  const cardHTML = `
    <div class="bubble product" style="border:1px solid #ccc;padding:10px;border-radius:10px;margin-bottom:10px;">
      <div class="title" style="font-weight:bold; margin-bottom:6px;">💬 ${item.question}</div>
      <div class="answer" style="white-space:pre-line; margin-bottom:8px;">${item.answer}</div>
      ${item.link ? `<a href="${item.link}" target="_blank" style="color:#007aff;">자세히 보기</a>` : ""}
    </div>
  `;
  const slot = document.getElementById("auto-card-slot");
  if (slot) {
    slot.innerHTML = cardHTML;
  }
}
