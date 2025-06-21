document.addEventListener('DOMContentLoaded', async () => {
  const panel = document.getElementById('business-resource-panel');
  try {
    const res = await fetch('/data/QA2.txt');
    const text = await res.text();

    const qaPairs = text.split(/\n\s*\n/).filter(Boolean);
    const html = qaPairs.map(pair => {
      const [q, a] = pair.split('\n').map(line => line.replace(/^Q: |^A: /, '').trim());
      return `
        <div class="qa-block">
          <h3>Q. ${q}</h3>
          <p>A. ${a}</p>
        </div>`;
    }).join('');
    panel.innerHTML = `<section class="qa-list">${html}</section>`;
  } catch (err) {
    panel.innerHTML = '<p>❌ Q&A 데이터를 불러오지 못했습니다.</p>';
  }
});
