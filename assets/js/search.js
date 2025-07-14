document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("search-input");
  const resultsContainer = document.getElementById("search-results");

  fetch("/search_index.json")
    .then(response => response.json())
    .then(data => {
      input.addEventListener("input", function () {
        const query = this.value.toLowerCase();
        const results = data.filter(item =>
          item.keywords.some(keyword => keyword.includes(query))
        );

        resultsContainer.innerHTML = results.length
          ? results.map(item => `
              <div>
                <a href="${item.url}"><strong>${item.title}</strong></a>
                <p>${item.excerpt}</p>
              </div>
            `).join("")
          : "<p>No results found.</p>";
      });
    });
});
