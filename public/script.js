fetch('products.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('product-card-area');
    data.forEach(product => {
      const card = document.createElement('div');
      card.innerHTML = `
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <img src="${product.thumbnail}" alt="${product.name}" width="150"/>
      `;
      container.appendChild(card);
    });
  });
